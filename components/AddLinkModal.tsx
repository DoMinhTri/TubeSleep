import React, { useState, useEffect, useRef } from 'react';
import { X, Link as LinkIcon, Sparkles, Loader2, Plus, Search, Type } from 'lucide-react';
import { searchMusicWithGemini, SuggestedVideo } from '../services/geminiService';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, title: string) => void;
}

const AddLinkModal: React.FC<AddLinkModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedVideo[]>([]);
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && mode === 'manual') {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }
  }, [isOpen, mode]);

  // Auto-fetch title when URL changes
  useEffect(() => {
    const fetchTitle = async () => {
        // Simple regex to check if it looks like a youtube url
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        
        if (!url || !youtubeRegex.test(url)) return;

        setIsLoadingTitle(true);
        try {
            // Use noembed.com to avoid CORS issues on client-side
            const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            if (data.title) {
                setTitle(data.title);
            }
        } catch (err) {
            console.error("Failed to fetch video title", err);
        } finally {
            setIsLoadingTitle(false);
        }
    };

    // Debounce the fetch
    const timeoutId = setTimeout(() => {
        fetchTitle();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [url]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onAdd(url, title || url);
      handleClose();
    }
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');
    setSuggestions([]);

    try {
      const results = await searchMusicWithGemini(searchQuery);
      if (results.length === 0) {
          setError("Không tìm thấy kết quả phù hợp hoặc thiếu API Key.");
      }
      setSuggestions(results);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tìm kiếm.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setTitle('');
    setSearchQuery('');
    setSuggestions([]);
    setError('');
    setMode('manual');
    setIsLoadingTitle(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex gap-4">
            <button
              onClick={() => setMode('manual')}
              className={`text-sm font-medium px-3 py-1 rounded-full transition-all ${
                mode === 'manual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nhập Link
            </button>
            <button
              onClick={() => setMode('ai')}
              className={`text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1 transition-all ${
                mode === 'ai' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-purple-400'
              }`}
            >
              <Sparkles size={14} />
              AI Gợi Ý
            </button>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {mode === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">YouTube URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    ref={inputRef}
                    type="url"
                    required
                    placeholder="https://youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Tiêu đề</label>
                <div className="relative">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder={isLoadingTitle ? "Đang lấy tên bài hát..." : "Tự động điền hoặc nhập tay..."}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {isLoadingTitle && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 size={18} className="animate-spin text-indigo-400" />
                        </div>
                    )}
                </div>
              </div>
              <button
                type="submit"
                disabled={!url}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-all mt-2"
              >
                Thêm Vào Danh Sách
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleAiSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="VD: Nhạc piano dễ ngủ, Lofi hiphop..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
                >
                  {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                </button>
              </form>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2 mt-4">
                {suggestions.map((video, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-purple-500/50 transition-colors">
                    <div className="flex-1 min-w-0 mr-2">
                        <h4 className="text-sm font-medium text-slate-200 truncate">{video.title}</h4>
                        <p className="text-xs text-slate-500 truncate">{video.url}</p>
                    </div>
                    <button
                      onClick={() => {
                        onAdd(video.url, video.title);
                        // Optional: Don't close immediately to allow adding multiple
                      }}
                      className="p-2 bg-slate-700 hover:bg-purple-600 text-slate-300 hover:text-white rounded-full transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
                {!isSearching && suggestions.length === 0 && !error && (
                    <div className="text-center text-slate-500 text-sm py-8">
                        Nhập tâm trạng hoặc thể loại nhạc để AI tìm giúp bạn.
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLinkModal;