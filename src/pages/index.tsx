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

export default function HomePage() {
  const handleRecordingComplete = (audioUrl: string, audioBlob: Blob) => {
    console.log("Recording completed:", audioUrl);
  };

  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [adviceContent, setAdviceContent] = React.useState<string | null>();
  const [adviceTitle, setAdviceTitle] = React.useState<string | null>();

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
      const audioUrl = URL.createObjectURL(audioBlob); // Create a URL for the Blob
      setAudioUrl(audioUrl); // Set the audio URL in state
    } catch (error) {
      console.error("Error downloading the audio:", error);
    }
  };

  // Call the function on component mount to download the audio
  React.useEffect(() => {
    downloadAudio();
  }, [adviceContent]);

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
              onChange={setAdviceContent}
              onChangeTitle={setAdviceTitle}
            />
          </div>

          {/* <h1 className="text-[3.7vh] font-medium">
            <span className="text-[#BFBFBF]">
              As an F-1 student in the United States, you are allowed to work{" "}
            </span>{" "}
            under specific conditions and with certain restrictions. Here’s a
            breakdown of your options: You can work up to 20 hours per week
            during the academic year and full-time (40 hours) during school
            breaks{" "}
            <span className="text-[#E0E0E0]">
              {" "}
              (like summer vacation). Would you like more details on a specific
              work authorization, or help navigating the application process?
            </span>
          </h1> */}

          <h1 className="text-[3.7vh] font-medium">{adviceContent}</h1>
        </div>

        <div className="w-[40%] inter-tight">
          <div className="flex flex-row justify-between">
            <h1 className="text-[2.3vh] font-medium">Recent Conversations</h1>
            <p className="text-[2vh] font-medium text-[#A9A9A9] cursor-pointer hover:scale-[1.07] transition-all">
              See all
            </p>
          </div>
          <div className="flex flex-col space-y-4 mt-[3vh] h-[43vh]">
            <Convo
              content="F1 legal working advice - internship"
              timeAgo="4 min ago"
            />
            <Convo
              content="F1 legal working advice - internship"
              timeAgo="4 min ago"
            />
            <Convo
              content="F1 legal working advice - internship"
              timeAgo="4 min ago"
            />
            <Convo
              content="F1 legal working advice - internship"
              timeAgo="4 min ago"
            />
            <Convo
              content="F1 legal working advice - internship"
              timeAgo="4 min ago"
            />
          </div>

          <div className="bg-[#F2F2F2] flex-col w-full h-[45vh] rounded-md p-4 items-start flex">
            <div className="flex-row flex space-x-4 justify-center items-center">
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

              <div className="flex flex-col">
                <h1 className="font-medium text-[#333333] text-[3.3vh]">
                  {adviceTitle}
                </h1>
                <h1 className="text-[#B2B2B2] text-[1.6vh] font-medium">
                  Spanish
                </h1>
              </div>
            </div>

            {/* <AudioPlayer audioUrl="https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3" /> */}
            {/* Audio Player */}
            {audioUrl && adviceContent ? (
              <AudioPlayer audioUrl={audioUrl} />
            ) : (
              <p className=" text-center">Record yourself!</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
