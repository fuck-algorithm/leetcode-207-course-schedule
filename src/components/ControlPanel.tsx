import './ControlPanel.css';

interface ControlPanelProps {
  isPlaying: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentStep: number;
  totalSteps: number;
  stepDescription: string;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function ControlPanel({
  isPlaying,
  canGoPrevious,
  canGoNext,
  currentStep,
  totalSteps,
  stepDescription,
  onPlay,
  onPause,
  onPrevious,
  onNext,
}: ControlPanelProps) {
  return (
    <div className="control-panel">
      <button
        className="control-button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        title="上一步 (←)"
      >
        ◀ 上一步
        <span className="keyboard-hint">[←]</span>
      </button>

      <button
        className="control-button play-pause"
        onClick={isPlaying ? onPause : onPlay}
        title={isPlaying ? '暂停 (空格)' : '播放 (空格)'}
      >
        {isPlaying ? '⏸ 暂停' : '▶ 播放'}
        <span className="keyboard-hint">[空格]</span>
      </button>

      <button
        className="control-button"
        onClick={onNext}
        disabled={!canGoNext}
        title="下一步 (→)"
      >
        下一步 ▶
        <span className="keyboard-hint">[→]</span>
      </button>

      <div className="step-indicator">
        步骤 <span className="step-current">{currentStep + 1}</span> / {totalSteps}
      </div>

      <div className="step-description" title={stepDescription}>
        {stepDescription}
      </div>
    </div>
  );
}
