import './ControlPanel.css';

interface ControlPanelProps {
  isPlaying: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentStep: number;
  totalSteps: number;
  stepDescription: string;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
}

export default function ControlPanel({
  isPlaying,
  canGoPrevious,
  canGoNext,
  currentStep,
  totalSteps,
  stepDescription,
  playbackSpeed,
  onSpeedChange,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onReset,
}: ControlPanelProps) {
  return (
    <div className="control-panel">
      <button
        className="control-button reset-button"
        onClick={onReset}
        title="重置 (R)"
      >
        ⟲ 重置
        <span className="keyboard-hint">[R]</span>
      </button>

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

      <label className="speed-control">
        速度
        <select aria-label="播放速度" value={playbackSpeed} onChange={(event) => onSpeedChange(Number(event.target.value))}>
          <option value={1500}>0.75x</option>
          <option value={1000}>1x</option>
          <option value={500}>2x</option>
          <option value={333}>3x</option>
        </select>
      </label>

      <div className="step-indicator">
        步骤 <span className="step-current">{currentStep + 1}</span> / {totalSteps}
      </div>

      <div className="step-description" title={stepDescription}>
        {stepDescription}
      </div>
    </div>
  );
}
