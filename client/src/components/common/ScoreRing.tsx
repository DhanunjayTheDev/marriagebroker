import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  className?: string;
}

const SIZES = {
  sm: { ring: 'w-12 h-12', stroke: 3, r: 18, fontSize: 'text-[10px]' },
  md: { ring: 'w-20 h-20', stroke: 4, r: 32, fontSize: 'text-sm' },
  lg: { ring: 'w-28 h-28', stroke: 5, r: 44, fontSize: 'text-lg' },
};

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 'md',
  label,
  sublabel,
  showValue = true,
  className,
}) => {
  const { ring, stroke, r, fontSize } = SIZES[size];
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? '#10b981' : score >= 40 ? '#d97706' : '#8b1538';

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className={cn('relative', ring)}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${(r + stroke + 2) * 2} ${(r + stroke + 2) * 2}`}>
          {/* Background ring */}
          <circle
            cx={r + stroke + 2}
            cy={r + stroke + 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted"
          />
          {/* Score ring */}
          <motion.circle
            cx={r + stroke + 2}
            cy={r + stroke + 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('font-bold', fontSize)} style={{ color }}>
              {score}%
            </span>
          </div>
        )}
      </div>
      {label && <span className="text-xs font-medium text-foreground">{label}</span>}
      {sublabel && <span className="text-[10px] text-slate-500">{sublabel}</span>}
    </div>
  );
};

