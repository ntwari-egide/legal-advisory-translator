import React, { useState, useRef } from "react";
import {
  RiMicLine,
  RiStopFill,
  RiPlayFill,
  RiPauseLine,
  RiUploadCloud2Line,
} from "react-icons/ri";
import axios from "axios";

interface AudioRecorderProps {
  onRecordingComplete?: (audioUrl: string, audioBlob: Blob) => void;
  onAdviceReceived?: (advice: any) => void;
  onChange?: (newAdviceContent: string) => void;  // New prop for onChange handler
  onChangeTitle?: (newTitle: string) => void;  // New prop for onChange handler
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onAdviceReceived,
  onChange,
  onChangeTitle
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);


  const startRecording = async () => {
    try {
      // Clear previous recording if any
      setAudioUrl(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm", // Using webm for broader compatibility
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Create a Blob from all the chunks with the proper MIME type
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        audioBlobRef.current = audioBlob;
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        if (onRecordingComplete) {
          onRecordingComplete(url, audioBlob);
        }

        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      // Request data every 1 second to get more frequent chunks
      mediaRecorder.start(1000);
      setIsRecording(true);

      // Start a timer to show recording duration
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Unable to access your microphone. Please check your browser permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear the timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      setRecordingTime(0);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const togglePlayback = () => {
    if (!audioUrl || !audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const uploadAudioForAdvice = async () => {
    if (!audioBlobRef.current) return;
  
    try {
      setIsUploading(true);
      setUploadProgress(0);
  
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", audioBlobRef.current, "recording.webm"); // Change "audio" to "file"
  
      // Updated API URL
      const apiUrl = "https://immigration-and-refugee-support.onrender.com/process-audio/";
  
      // Upload the audio file with progress tracking
      const response = await axios.post(apiUrl, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setUploadProgress(percentCompleted);
        },
      });
  
      // Handle successful response
      if (response.status === 200 && response.data) {
        // Extract the advice content from response.data.gpt_response
        const adviceContent = response.data.gpt_response;
        const adviceTitle = response.data.query_text;

        // Pass the advice content to the parent component using onAdviceReceived
        if (onAdviceReceived) {
          onAdviceReceived(adviceContent);
        }

        // Update the advice content in the parent component via onChange (if provided)
        if (onChange) {
          onChange(adviceContent);  // Calling onChange to update the parent
        }

        if(onChangeTitle){
            onChangeTitle(adviceTitle);  // Calling onChangeTitle to update the parent
        }
  
        // Pass the advice data to the parent component if callback exists
        if (onAdviceReceived) {
          onAdviceReceived(response.data);
        }
  
        // Show success message
        alert("Advice generated successfully!");
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("Failed to upload audio. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadRecording = () => {
    if (!audioUrl) return;

    // Create a unique filename for the recording
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `recording-${timestamp}.webm`;

    // Create a download link and trigger it
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = audioUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  };

  // Format recording time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle playback ended
  const handlePlaybackEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-[#F2F2F2] w-full h-[40vh] flex items-center justify-center rounded-md">
      <audio
        ref={audioPlayerRef}
        src={audioUrl || ""}
        onEnded={handlePlaybackEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      <div className="flex flex-col justify-center items-center justify-items-center space-y-8">
        <h1 className="text-center font-medium text-[2.7vh]">
          {isRecording
            ? `Recording... ${formatTime(recordingTime)}`
            : isUploading
            ? `Processing... ${uploadProgress}%`
            : audioUrl
            ? "Recording complete"
            : "Click to record"}
        </h1>

        {!audioUrl ? (
          // Record button
          <div
            onClick={toggleRecording}
            className={`h-20 w-20 cursor-pointer hover:scale-[1.07] transition-all ${
              isRecording ? "bg-[#FE9EC6]" : "bg-[#FE4A22]"
            } rounded-full flex justify-items-center items-center justify-center`}
          >
            {isRecording ? (
              <RiStopFill className="text-white text-3xl" />
            ) : (
              <RiMicLine className="text-white text-2xl" />
            )}
          </div>
        ) : (
          // Playback and upload controls
          <div className="flex flex-col items-center space-y-4">
            <div
              onClick={togglePlayback}
              className="h-20 w-20 cursor-pointer hover:scale-[1.07] transition-all bg-[#FE4A22] rounded-full flex justify-items-center items-center justify-center"
            >
              {isPlaying ? (
                <RiPauseLine className="text-white text-3xl" />
              ) : (
                <RiPlayFill className="text-white text-2xl" />
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={uploadAudioForAdvice}
                disabled={isUploading}
                className={`px-4 py-2 ${
                  isUploading ? "bg-gray-400" : "bg-[#6629FF]"
                } text-[1.5vh] rounded-full text-white hover:scale-[1.04] transition-all flex items-center gap-2`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    processing...
                  </>
                ) : (
                  <>
                    <RiUploadCloud2Line className="text-white" />
                    Advise me!
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  // Clear recording and start over
                  setAudioUrl(null);
                  audioChunksRef.current = [];
                  audioBlobRef.current = null;
                }}
                disabled={isUploading}
                className={`px-4 py-2 ${
                  isUploading ? "bg-gray-400" : "bg-[#FE9EC6]"
                } text-[1.5vh] rounded-full text-white hover:scale-[1.04] transition-all`}
              >
                Record New
              </button>
            </div>
          </div>
        )}

        {isRecording && (
          <div className="animate-pulse flex space-x-1">
            <div className="w-2 h-2 bg-[#FE9EC6] rounded-full"></div>
            <div className="w-2 h-2 bg-[#FE9EC6] rounded-full"></div>
            <div className="w-2 h-2 bg-[#FE9EC6] rounded-full"></div>
          </div>
        )}

        {isUploading && (
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#6629FF] h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
