import React, { useState } from 'react';
import { Timer, Power, Moon, Play, ChevronUp, ChevronDown } from 'lucide-react';

interface TimerControlProps {
  onStartTimer: (minutes: number) => void;
  onCancelTimer: () => void;
  timeLeft: number;
  isRunning: boolean;
}

const TimerControl: React.FC<TimerControlProps> = ({ onStartTimer, onCancelTimer, timeLeft, isRunning }) => {
  const [inputMinutes, setInputMinutes] = useState<number>(30);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
      
      <div className="flex items-center gap-2 mb-6 text-indigo-400">
        <Moon size={20} />
        <h2 className="text-lg font-semibold uppercase tracking-wider">Hẹn Giờ Tắt</h2>
      </div>

      {isRunning ? (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300 py-4">
          <div className="relative">
             <div className="absolute -inset-4 bg-indigo-500/20 blur-xl rounded-full"></div>
             <div className="text-6xl font-mono font-bold text-white mb-2 tabular-nums tracking-widest relative z-10 drop-shadow-lg">
                {formatTime(timeLeft)}
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-8 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Đang đếm ngược & phát nhạc
          </p>
          <button
            onClick={onCancelTimer}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-xl transition-all active:scale-95 border border-slate-600 hover:border-red-500/50"
          >
            <Power size={18} />
            Dừng Nhạc & Hủy Hẹn Giờ
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Time Selector */}
          <div className="flex items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
             <button 
              onClick={() => setInputMinutes(Math.max(5, inputMinutes - 5))}
              className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors active:scale-95"
            >
              <ChevronDown size={24} />
            </button>
            
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-white tabular-nums">{inputMinutes}</span>
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-widest">Phút</span>
            </div>

            <button 
              onClick={() => setInputMinutes(inputMinutes + 5)}
              className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors active:scale-95"
            >
              <ChevronUp size={24} />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-2">
             {[15, 30, 45, 60].map(m => (
                 <button 
                    key={m}
                    onClick={() => setInputMinutes(m)} 
                    className={`text-xs font-medium py-2 rounded-lg transition-colors border ${inputMinutes === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                 >
                    {m}p
                 </button>
             ))}
          </div>

          {/* Action Button */}
          <button
            onClick={() => onStartTimer(inputMinutes)}
            className="mt-2 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-900/30 active:scale-95 group"
          >
            <Play size={24} className="fill-current" />
            <span>Bắt Đầu & Phát Nhạc</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TimerControl;