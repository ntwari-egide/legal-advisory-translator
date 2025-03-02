/**
 * @author: Egide Ntwali
 * @description: The home page
 * @returns {JSX.Element} The home page
 */

import AudioPlayer from "@/component/audio-player";
import AudioRecorder from "@/component/audio-recorder";
import Convo from "@/component/convo";
import Seo from "@/component/seo";
import Image from "next/image";
import * as React from "react";
import {
  RiHome2Line,
  RiMic2Line,
  RiMicLine,
  RiMore2Line,
  RiMoreFill,
} from "react-icons/ri";
import CryptoJS from 'crypto-js'; // Import for encryption

// Define a type for our history items
interface HistoryItem {
  id: string;
  adviceContent: string;
  adviceTitle: string;
  language: string;
  audioData: string; // Base64 encoded audio data instead of URL
  timestamp: number;
}

// Secret key for encryption - consider moving this to environment variables
const SECRET_KEY = "your-secret-key";

// Utility functions for encryption and decryption
const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Generate a unique ID based on content hash
const generateId = (content: string, title: string): string => {
  const combinedString = `${content}-${title}`;
  return CryptoJS.SHA256(combinedString).toString().substring(0, 16);
};

// Convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Convert Base64 to Blob
const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const byteCharacters = atob(parts[1]);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

export default function HomePage() {
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [adviceContent, setAdviceContent] = React.useState<string | null>();
  const [adviceTitle, setAdviceTitle] = React.useState<string | null>();
  const [language, setLanguage] = React.useState<string | null>();
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [currentItemId, setCurrentItemId] = React.useState<string | null>(null);
  const [isNewRecording, setIsNewRecording] = React.useState<boolean>(false);

  // Load history from localStorage on component mount
  React.useEffect(() => {
    try {
      const encryptedHistory = localStorage.getItem('adviceHistory');
      if (encryptedHistory) {
        const decryptedHistory = decryptData(encryptedHistory);
        setHistory(decryptedHistory);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, []);

  // Function to save history to localStorage
  const saveHistory = (updatedHistory: HistoryItem[]) => {
    try {
      const encryptedHistory = encryptData(updatedHistory);
      localStorage.setItem('adviceHistory', encryptedHistory);
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  // Track when new recording happens
  const handleRecordingComplete = (audioUrl: string, audioBlob: Blob) => {
    console.log("Recording completed:", audioUrl);
    setAudioBlob(audioBlob);
    setIsNewRecording(true);
  };

  // Function to add current advice to history
  const addToHistory = async (audioData: string) => {
    if (!adviceContent || !adviceTitle || !language) return;
    
    // Generate a unique ID for this advice
    const id = generateId(adviceContent, adviceTitle);
    setCurrentItemId(id);
    
    // Only add to history if it's a new recording
    if (!isNewRecording) return;
    
    // Check if this item already exists in history
    const existingItemIndex = history.findIndex(item => item.id === id);
    
    // If item exists, move it to the top (most recent) and update its data
    if (existingItemIndex !== -1) {
      const updatedItem: HistoryItem = {
        ...history[existingItemIndex],
        audioData: audioData,
        timestamp: Date.now()
      };
      
      const updatedHistory = [
        updatedItem,
        ...history.filter(item => item.id !== id)
      ];
      
      saveHistory(updatedHistory);
    } else {
      // Create new history item
      const newHistoryItem: HistoryItem = {
        id: id,
        adviceContent: adviceContent,
        adviceTitle: adviceTitle,
        language: language,
        audioData: audioData,
        timestamp: Date.now()
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 50); // Keep only latest 50 items
      saveHistory(updatedHistory);
    }
    
    // Reset the new recording flag after saving
    setIsNewRecording(false);
  };

  // Function to download the audio from the API
  const downloadAudio = async () => {
    try {
      const response = await fetch(
        "https://immigration-and-refugee-support.onrender.com/download-audio"
      );
      if (!response.ok) {
        throw new Error("Failed to download the audio");
      }

      const audioBlob = await response.blob(); // Get the audio as a Blob
      setAudioBlob(audioBlob);
      
      // Convert to Base64 for storage
      const audioBase64 = await blobToBase64(audioBlob);
      
      // Create object URL for playback
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      
      // Add current advice to history when new audio is downloaded
      if (adviceContent && adviceTitle && language) {
        addToHistory(audioBase64);
      }
    } catch (error) {
      console.error("Error downloading the audio:", error);
    }
  };

  // Function to format timestamp to "X min ago" or "X hours ago"
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
  };

  // Load history item when clicked
  const handleHistoryItemClick = async (item: HistoryItem) => {
    // Set current item ID to prevent this from being saved as a new item
    setCurrentItemId(item.id);
    setIsNewRecording(false);
    
    // Convert stored Base64 audio data back to a playable URL
    try {
      const blob = base64ToBlob(item.audioData);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioBlob(blob);
    } catch (error) {
      console.error("Error converting stored audio data:", error);
    }
    
    // Update the UI with the selected history item
    setAdviceContent(item.adviceContent);
    setAdviceTitle(item.adviceTitle);
    setLanguage(item.language);
  };

  // Call the function on component mount to download the audio
  React.useEffect(() => {
    if (isNewRecording) {
      downloadAudio();
    }
  }, [adviceContent, isNewRecording]);

  return (
    <>
      <Seo title="Home" />
      <div className="flex flex-row p-4 h-screen space-x-8 inter-tight">
        <div className="w-[8%] bg-[#6629FF] h-full justify-between rounded-md flex flex-col py-8">
          <div className="w-full flex justify-center">
            <svg
              width="30"
              height="30"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M42.1667 25.5C44.5122 23.1545 45.8299 19.9733 45.8299 16.6562C45.8299 13.3392 44.5122 10.158 42.1667 7.81249C39.8211 5.46698 36.64 4.14929 33.3229 4.14929C30.0059 4.14929 26.8247 5.46698 24.4792 7.81249L10.4167 21.875V39.5833H28.125L42.1667 25.5Z"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M33.3333 16.6667L4.16666 45.8333"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M36.4583 31.25H18.75"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col justify-center items-center space-y-8">
            <RiHome2Line className="text-[#C2B6E1] cursor-pointer hover:scale-[1.07] transition-all text-xl" />
            <RiMic2Line className="text-[#C2B6E1] cursor-pointer hover:scale-[1.07] transition-all text-xl" />
          </div>
          <div className="w-full flex justify-center cursor-pointer hover:scale-[1.07] transition-all text-xl">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23 4V10H17"
                stroke="#D9D9D9"
                stroke-opacity="0.8"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M1 20V14H7"
                stroke="#D9D9D9"
                stroke-opacity="0.8"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3.51 8.99995C4.01717 7.56674 4.87913 6.28536 6.01547 5.27537C7.1518 4.26539 8.52547 3.55972 10.0083 3.22421C11.4911 2.8887 13.0348 2.93429 14.4952 3.35673C15.9556 3.77916 17.2853 4.56467 18.36 5.63995L23 9.99995M1 14L5.64 18.36C6.71475 19.4352 8.04437 20.2207 9.50481 20.6432C10.9652 21.0656 12.5089 21.1112 13.9917 20.7757C15.4745 20.4402 16.8482 19.7345 17.9845 18.7245C19.1209 17.7145 19.9828 16.4332 20.49 15"
                stroke="#D9D9D9"
                stroke-opacity="0.8"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="w-[52%] flex-col space-y-8">
          <div className="container mx-auto p-4">
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              onChange={(content) => {
                setAdviceContent(content);
                setIsNewRecording(true);
              }}
              onChangeTitle={(title) => {
                setAdviceTitle(title);
                setIsNewRecording(true);
              }}
              onChangeLanguage={(lang) => {
                setLanguage(lang);
                setIsNewRecording(true);
              }}
            />
          </div>

          {
            audioUrl && adviceContent ? (<>
            <div className="h-[45vh] overflow-y-auto">
            <h1 className="text-[3.7vh] font-medium">{adviceContent}</h1>
          </div>
            </>) : (<>
              <div className="flex flex-col justify-center items-center text-center">
  <h1 className="text-[3vh] text-[#494949] font-semibold">No transcripts available</h1>
  <p className="w-[80%] text-[2vh] font-medium text-[#616161]">
    Transcripts will appear here once your audio is processed. Tap the <span className="text-[#494949]">recording button above</span> to get started and receive a transcript!
  </p>
</div>
            </>)
          }
        </div>

        <div className="w-[40%] inter-tight">
          <div className="flex flex-row justify-between">
            <h1 className="text-[2.3vh] font-medium">Recent Conversations</h1>
            <p className="text-[2vh] font-medium text-[#A9A9A9] cursor-pointer hover:scale-[1.07] transition-all">
              See all
            </p>
          </div>
          <div className="flex flex-col space-y-4 mt-[3vh] h-[43vh] overflow-y-auto">
            {/* Display history items */}
            {history.map((item, index) => (
              <div 
                key={item.id} 
                onClick={() => handleHistoryItemClick(item)}
                className={`cursor-pointer ${currentItemId === item.id ? 'bg-[#F8F4FF] rounded-md' : ''}`}
              >
                <Convo
                  content={item.adviceTitle}
                  timeAgo={formatTimeAgo(item.timestamp)}
                />
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-center text-gray-400">No conversation history yet</p>
            )}
          </div>

          <div className="bg-[#F2F2F2] flex-col w-full h-[45vh] rounded-md p-4 items-start flex">
            {
              audioUrl && adviceContent ? (
                <><div className="flex-row flex space-x-4 justify-center items-center">
                <div className="bg-[#FE9EC6] h-24 w-24 rounded-full items-center justify-center flex">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M42.1667 25.5C44.5122 23.1545 45.8299 19.9733 45.8299 16.6562C45.8299 13.3392 44.5122 10.158 42.1667 7.81249C39.8211 5.46698 36.64 4.14929 33.3229 4.14929C30.0059 4.14929 26.8247 5.46698 24.4792 7.81249L10.4167 21.875V39.5833H28.125L42.1667 25.5Z"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M33.3333 16.6667L4.16666 45.8333"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M36.4583 31.25H18.75"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
  
                <div className="flex flex-col w-[70%]">
                  <h1 className="font-medium text-[#333333] text-[3.3vh]">
                    {adviceTitle}
                  </h1>
                  <h1 className="text-[#B2B2B2] text-[1.6vh] font-medium">
                    {language}
                  </h1>
                </div>
              </div>
  
              {/* Audio Player */}
              {audioUrl && adviceContent ? (
                <AudioPlayer audioUrl={audioUrl} />
              ) : (
                <p className="text-center">Record yourself!</p>
              )}</>
              ) : <>
                <div className="w-full h-full flex justify-center items-center">
                <div className="flex flex-col justify-center items-center text-center">
                  <h1 className="text-[3vh] text-[#494949] font-semibold">No audio advice available</h1>
                  <p className="w-[80%] text-[2vh] font-medium text-[#616161]">
                    It looks quiet here! Tap the <span className="text-[#494949]">recording button above</span> to ask your question, and we'll deliver expert advice straight to you.
                  </p>
                </div>
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </>
  );
}