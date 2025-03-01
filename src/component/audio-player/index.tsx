import React, { useState, useRef, useEffect } from 'react';
import { RiForward15Line, RiPauseLine, RiPlayFill, RiReplay15Line } from 'react-icons/ri';

interface AudioPlayerProps {
  audioUrl: string;
  trackTitle?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, trackTitle }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    // Events
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    // Cleanup
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  // Format time in minutes and seconds
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    
    const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Render waveform visualization
  const renderWaveform = () => {
    // This is a simplified visual representation
    const bars = 20;
    const heightVariation = 4;
    
    return (
      <div className="flex items-center justify-center h-12 gap-1 mx-4 my-2">
        {Array.from({ length: bars }).map((_, i) => {
          const height = 4 + Math.floor(Math.random() * heightVariation); // Random height for illustration
          const isActive = (i / bars) * duration <= currentTime;
          
          return (
            <div
              key={i}
              className={`w-1 rounded-sm ${isActive ? 'bg-[#A9A9A9]' : 'bg-[#D9D9D9]'}`}
              style={{ height: `${height * 4}px` }}
            ></div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl p-[4vw] inter-tight">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Waveform visualization */}
      {renderWaveform()}
      
      {/* Seek slider */}
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={handleSeek}
        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
      />
      
      {/* Time display and controls */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-gray-500">{formatTime(currentTime)}</span>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => skip(-15)} 
            className="p-2 cursor-pointer"
          >
            <RiReplay15Line className='text-[#616161] text-[3vh]' />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="p-4 cursor-pointer hover:scale-[1.04] transition-all rounded-full bg-black text-white flex items-center justify-center w-16 h-16"
          >
            {isPlaying ? <RiPauseLine /> : <RiPlayFill />}
          </button>
          
          <button 
            onClick={() => skip(15)} 
            className="p-2 cursor-pointer"
          >
            <RiForward15Line className='text-[#616161] text-[3vh]' />
          </button>
        </div>
        
        <span className="text-gray-500">{formatTime(duration)}</span>
      </div>
      
      {trackTitle && (
        <div className="mt-2 text-center text-gray-700 font-medium">
          {trackTitle}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;