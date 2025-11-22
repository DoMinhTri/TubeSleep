import React from 'react';
import { Play, Trash2, Music, ExternalLink } from 'lucide-react';
import { VideoItem } from '../types';

interface PlaylistProps {
  videos: VideoItem[];
  currentVideoId: string | null;
  onPlay: (video: VideoItem) => void;
  onRemove: (id: string) => void;
}

const Playlist: React.FC<PlaylistProps> = ({ videos, currentVideoId, onPlay, onRemove }) => {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
        <Music size={48} className="mb-4 opacity-50" />
        <p>Chưa có bài hát nào.</p>
        <p className="text-sm">Nhấn "Thêm Link" để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
      {videos.map((video) => {
        const isPlaying = currentVideoId === video.id;
        return (
          <div
            key={video.id}
            className={`group flex items-center justify-between p-3 rounded-lg transition-all border ${
              isPlaying
                ? 'bg-indigo-900/30 border-indigo-500/50 shadow-md shadow-indigo-900/20'
                : 'bg-slate-800/40 border-transparent hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            <div 
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              onClick={() => onPlay(video)}
            >
              <div className={`p-2 rounded-full flex-shrink-0 ${isPlaying ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 group-hover:text-white'}`}>
                {isPlaying ? (
                    <div className="w-4 h-4 flex items-center justify-center space-x-0.5">
                        <div className="w-1 h-3 bg-white animate-pulse"></div>
                        <div className="w-1 h-2 bg-white animate-pulse delay-75"></div>
                        <div className="w-1 h-3 bg-white animate-pulse delay-150"></div>
                    </div>
                ) : (
                    <Play size={16} fill="currentColor" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium truncate ${isPlaying ? 'text-indigo-300' : 'text-slate-200'}`}>
                  {video.title}
                </h3>
                <p className="text-xs text-slate-500 truncate">{video.url}</p>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(video.id);
              }}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Xóa khỏi danh sách"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Playlist;