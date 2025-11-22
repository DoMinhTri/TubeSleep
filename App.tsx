import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Plus, Youtube, ListMusic, Volume2, VolumeX, Clock } from 'lucide-react';
import { VideoItem } from './types';
import TimerControl from './components/TimerControl';
import Playlist from './components/Playlist';
import AddLinkModal from './components/AddLinkModal';

const App: React.FC = () => {
  // State
  const [playlist, setPlaylist] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('tubesleep_playlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSleepMode, setIsSleepMode] = useState(false);
  
  // Clock State for Sleep Mode
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs
  const playerRef = useRef<ReactPlayer>(null);

  // Save playlist to local storage
  useEffect(() => {
    localStorage.setItem('tubesleep_playlist', JSON.stringify(playlist));
  }, [playlist]);

  // Clock Update Logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer Countdown Logic
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            // Timer Finished
            handleTimerFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleTimerFinished = () => {
    setIsTimerRunning(false);
    setIsPlaying(false);
    setIsSleepMode(true);
  };

  // Handlers
  const handleAddLink = (url: string, title: string) => {
    const newItem: VideoItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      url,
      title,
      addedAt: Date.now(),
    };
    setPlaylist((prev) => [...prev, newItem]);
    
    // Automatically select this video if it's the first one
    if (playlist.length === 0) {
      setCurrentVideo(newItem);
    }
  };

  const handleRemoveLink = (id: string) => {
    setPlaylist((prev) => prev.filter((item) => item.id !== id));
    if (currentVideo?.id === id) {
      setIsPlaying(false);
      setCurrentVideo(null);
    }
  };

  const handlePlay = (video: VideoItem) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    setIsSleepMode(false);
  };

  const handleStartTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
    setIsSleepMode(false);
    
    // LOGIC: User wants to "Play & Count Down"
    // If a video is already selected, play it.
    // If no video is selected but playlist exists, play the first one.
    if (currentVideo) {
      setIsPlaying(true);
    } else if (playlist.length > 0) {
      setCurrentVideo(playlist[0]);
      setIsPlaying(true);
    } else {
      // Try to recover if there's something in the playlist but state was weird
      if (playlist.length > 0) {
          setCurrentVideo(playlist[0]);
          setIsPlaying(true);
      } else {
          alert("Vui lòng thêm bài hát vào danh sách trước khi bắt đầu!");
          setIsTimerRunning(false); // Cancel timer if nothing to play
      }
    }
  };

  const handleVideoEnded = () => {
    if (!currentVideo) return;
    // Find next video
    const currentIndex = playlist.findIndex(v => v.id === currentVideo.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      // Play next
      setCurrentVideo(playlist[currentIndex + 1]);
    } else {
      // Loop to start
      if (playlist.length > 0) {
          setCurrentVideo(playlist[0]);
      }
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const formatTimeClock = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Render
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-10 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sleep Mode Overlay (Night Clock) */}
      {isSleepMode && (
        <div 
          onClick={() => setIsSleepMode(false)}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center flex-col animate-in fade-in duration-1000 cursor-pointer select-none"
        >
          <div className="text-9xl font-bold text-slate-200 font-mono tracking-tighter drop-shadow-2xl opacity-80">
            {formatTimeClock(currentTime)}
          </div>
          <div className="mt-4 flex items-center gap-2 text-slate-600">
            <Clock size={16} />
            <span className="text-sm tracking-widest uppercase">Chạm để đánh thức</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 pt-6 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
              <Youtube size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">TubeSleep</h1>
              <p className="text-xs text-slate-500">Nhạc & Hẹn Giờ</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full font-medium transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Thêm Link</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Player */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group">
              {currentVideo ? (
                <ReactPlayer
                  ref={playerRef}
                  url={currentVideo.url}
                  width="100%"
                  height="100%"
                  playing={isPlaying}
                  controls={true}
                  muted={isMuted}
                  onEnded={handleVideoEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  config={{
                    youtube: {
                      playerVars: { showinfo: 1, playsinline: 1 }
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900/50">
                  <Youtube size={64} className="mb-4 opacity-20" />
                  <p>Danh sách trống hoặc chưa chọn bài</p>
                </div>
              )}
              
              {currentVideo && (
                <button 
                    onClick={toggleMute}
                    className="absolute bottom-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              )}
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 shadow-inner">
              <h2 className="text-lg font-semibold text-white truncate mb-1">
                {currentVideo ? currentVideo.title : 'Đang chờ...'}
              </h2>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                {isPlaying ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> Đang phát
                  </span>
                ) : 'Đã dừng'}
              </p>
            </div>
          </div>

          {/* Right Column: Controls & Playlist */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Timer Control */}
            <TimerControl
              isRunning={isTimerRunning}
              timeLeft={timerSeconds}
              onStartTimer={handleStartTimer}
              onCancelTimer={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
                setIsPlaying(false); 
              }}
            />

            {/* Playlist */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[400px] shadow-xl">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <ListMusic size={20} className="text-indigo-400" />
                  <h3 className="font-semibold">Danh sách phát ({playlist.length})</h3>
                </div>
                {playlist.length > 0 && (
                    <button 
                        onClick={() => {
                            if(confirm('Xóa toàn bộ danh sách?')) {
                                setPlaylist([]);
                                setCurrentVideo(null);
                                setIsPlaying(false);
                            }
                        }}
                        className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                        Xóa tất cả
                    </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <Playlist
                  videos={playlist}
                  currentVideoId={currentVideo?.id || null}
                  onPlay={handlePlay}
                  onRemove={handleRemoveLink}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Link Modal */}
      <AddLinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddLink}
      />
    </div>
  );
};

export default App;