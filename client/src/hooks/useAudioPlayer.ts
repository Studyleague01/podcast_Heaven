import { RefObject, useCallback } from "react";

interface UseAudioPlayerProps {
  audioRef: RefObject<HTMLAudioElement>;
  progressBarRef: RefObject<HTMLDivElement>;
  volumeSliderRef: RefObject<HTMLDivElement>;
  expandedProgressBarRef: RefObject<HTMLDivElement>;
  isPlaying: boolean;
  onTogglePlay: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
}

export const useAudioPlayer = ({
  audioRef,
  progressBarRef,
  volumeSliderRef,
  expandedProgressBarRef,
  setCurrentTime,
  setDuration,
  volume,
  setVolume,
  isMuted
}: UseAudioPlayerProps) => {
  
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [audioRef, setCurrentTime]);
  
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      
      // Set initial volume
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [audioRef, setDuration, volume, isMuted]);
  
  const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * audioRef.current.duration;
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [progressBarRef, audioRef, setCurrentTime]);
  
  const handleExpandedProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (expandedProgressBarRef.current && audioRef.current) {
      const rect = expandedProgressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * audioRef.current.duration;
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [expandedProgressBarRef, audioRef, setCurrentTime]);
  
  const handleVolumeChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeSliderRef.current && audioRef.current) {
      const rect = volumeSliderRef.current.getBoundingClientRect();
      const newVolume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setVolume(newVolume);
      audioRef.current.volume = newVolume;
    }
  }, [volumeSliderRef, audioRef, setVolume]);
  
  return {
    handleTimeUpdate,
    handleLoadedMetadata,
    handleProgressBarClick,
    handleExpandedProgressBarClick,
    handleVolumeChange
  };
};
