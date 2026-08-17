import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react';
import { VietnameseTTS, cn } from '../../lib/utils';

export interface TTSReaderProps {
  textToRead?: string;
  text?: string;
  className?: string;
}

export const TTSReader: React.FC<TTSReaderProps> = ({ textToRead, text, className }) => {
  const content = textToRead || text || '';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(1.0);

  useEffect(() => {
    return () => {
      VietnameseTTS.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (isPaused) {
        VietnameseTTS.resume();
        setIsPaused(false);
      } else {
        VietnameseTTS.pause();
        setIsPaused(true);
      }
    } else {
      VietnameseTTS.speak(
        content,
        () => {
          setIsPlaying(false);
          setIsPaused(false);
        },
        rate
      );
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    VietnameseTTS.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleSpeedChange = () => {
    const nextRate = rate === 1.0 ? 1.25 : rate === 1.25 ? 1.5 : 1.0;
    setRate(nextRate);
    if (isPlaying && !isPaused) {
      VietnameseTTS.speak(
        content,
        () => {
          setIsPlaying(false);
          setIsPaused(false);
        },
        nextRate
      );
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-950 shadow-xs select-none',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
            isPlaying && !isPaused ? 'bg-emerald-600 text-white animate-pulse' : 'bg-emerald-200 text-emerald-800'
          )}
        >
          <Volume2 className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold block leading-tight">Đọc bài viết (Giọng đọc AI)</span>
          <span className="text-[11px] text-emerald-700">Tiện ích trợ năng đọc nội dung tự động</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          {isPlaying && !isPaused ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Tạm dừng</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPaused ? 'Tiếp tục' : 'Nghe đọc'}</span>
            </>
          )}
        </button>

        {/* Speed toggle */}
        <button
          onClick={handleSpeedChange}
          className="px-2 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold cursor-pointer transition-colors"
          title="Tốc độ đọc"
        >
          {rate}x
        </button>

        {/* Stop button */}
        {isPlaying && (
          <button
            onClick={handleStop}
            className="p-1.5 rounded-lg bg-white border border-emerald-300 text-slate-600 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors"
            title="Dừng phát"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
