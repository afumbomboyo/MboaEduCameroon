import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';

export type MascotMood = 'idle' | 'reading' | 'celebrating' | 'thinking' | 'encouraging';

interface MascotCoachProps {
  mood: MascotMood;
  speechText?: string;
  size?: 'sm' | 'md' | 'lg';
  onTap?: () => void;
}

export const MascotCoach: React.FC<MascotCoachProps> = ({
  mood,
  speechText,
  size = 'md',
  onTap,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Animated Mascot Body */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: [-2, 2, -1, 1, 0] }}
        whileTap={{ scale: 0.95 }}
        onClick={onTap}
        className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-0.5 shadow-md cursor-pointer shrink-0`}
      >
        <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center relative overflow-hidden">
          {/* Background subtle animated glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />

          {/* Expressions */}
          {mood === 'reading' && (
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-2xl select-none"
            >
              🎧
            </motion.div>
          )}

          {mood === 'celebrating' && (
            <motion.div
              animate={{ scale: [1, 1.25, 1], rotate: [-8, 8, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-2xl select-none"
            >
              🎉
            </motion.div>
          )}

          {mood === 'thinking' && (
            <motion.div
              animate={{ rotate: [-6, 6, -6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-2xl select-none"
            >
              🤔
            </motion.div>
          )}

          {mood === 'encouraging' && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-2xl select-none"
            >
              💪
            </motion.div>
          )}

          {mood === 'idle' && (
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-2xl select-none"
            >
              🦁
            </motion.div>
          )}

          {/* Small status indicator corner */}
          {mood === 'celebrating' && (
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="absolute -top-1 -right-1 text-amber-300 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
            </motion.div>
          )}
          {mood === 'reading' && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute -top-1 -right-1 text-sky-300 text-[10px]"
            >
              🎵
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Speech Bubble */}
      {speechText && (
        <motion.div
          initial={{ opacity: 0, x: -10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          className="relative bg-white rounded-2xl border-2 border-emerald-200 px-4 py-2.5 shadow-sm text-xs text-slate-800 max-w-sm sm:max-w-md"
        >
          {/* Arrow pointing to mascot */}
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-emerald-200" />
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[7px] border-r-white" />

          <p className="font-medium leading-relaxed">{speechText}</p>
        </motion.div>
      )}
    </div>
  );
};
