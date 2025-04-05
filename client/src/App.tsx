import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import AudioPlayer from "@/components/AudioPlayer";
import Home from "@/pages/Home";
import PodcastDetail from "@/pages/PodcastDetail";
import ChannelView from "@/pages/ChannelView";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { Podcast, AudioStream } from "@/types/podcast";

function App() {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [audioStream, setAudioStream] = useState<AudioStream | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handlePlayPodcast = (podcast: Podcast, stream: AudioStream) => {
    setCurrentPodcast(podcast);
    setAudioStream(stream);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <Header />
      
      <Switch>
        <Route path="/" component={() => <Home onPlayPodcast={handlePlayPodcast} />} />
        <Route path="/podcast/:id" component={(params) => 
          <PodcastDetail id={params.id} onPlayPodcast={handlePlayPodcast} />
        } />
        <Route path="/channel/:id" component={(params) => 
          <ChannelView id={params.id} onPlayPodcast={handlePlayPodcast} />
        } />
        <Route component={NotFound} />
      </Switch>
      
      {currentPodcast && (
        <AudioPlayer 
          podcast={currentPodcast}
          audioStream={audioStream}
          isPlaying={isPlaying}
          onTogglePlay={(state) => setIsPlaying(state)}
        />
      )}
      
      <Toaster />
    </div>
  );
}

export default App;
