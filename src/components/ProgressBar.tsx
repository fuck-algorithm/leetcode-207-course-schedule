import { useCallback, useRef, useState } from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onSeek: (step: number) => void;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  onSeek,
}: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  const calculateStep = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return currentStep;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(percent * (totalSteps - 1));
    },
    [totalSteps, currentStep]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      onSeek(calculateStep(e.clientX));
    },
    [calculateStep, onSeek]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        onSeek(calculateStep(e.clientX));
      }
    },
    [isDragging, calculateStep, onSeek]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse listeners when dragging
  useState(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  return (
    <div
      className="progress-bar"
      ref={trackRef}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => isDragging && onSeek(calculateStep(e.clientX))}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
        <div
          className="progress-thumb"
          style={{ left: `${progress}%` }}
        />
      </div>
    </div>
  );
}
