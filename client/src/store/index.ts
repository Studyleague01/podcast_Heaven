import { create } from 'zustand';
import { Podcast, AudioStream } from '@/types/podcast';

interface AudioPlayerState {
  currentPodcast: Podcast | null;
  audioStream: AudioStream | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isExpanded: boolean;
  setCurrentPodcast: (podcast: Podcast | null) => void;
  setAudioStream: (stream: AudioStream | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleExpanded: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set) => ({
  currentPodcast: null,
  audioStream: null,
  isPlaying: false,
  volume: 1,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isExpanded: false,
  setCurrentPodcast: (podcast) => set({ currentPodcast: podcast }),
  setAudioStream: (stream) => set({ audioStream: stream }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
}));

interface SearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
