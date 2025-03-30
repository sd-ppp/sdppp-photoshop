import i18n from "../../../../../src/common/i18n.mts";
interface ModeSelectProps {
  mode: 'manual' | 'auto';
  setMode: (mode: 'manual' | 'auto') => void;
}

export default function ModeSelect({ mode, setMode }: ModeSelectProps) {
  const handleModeChange = (mode: 'manual' | 'auto') => {
    setMode(mode);
  };

  return (
    <div className="widget-mode-selection">
      <button
        className={`widget-mode-selection-button ${mode === 'manual' ? 'selected' : ''}`}
        onClick={() => handleModeChange('manual')}
      >
        {i18n('Manual')}
      </button>
      <button
        className={`widget-mode-selection-button ${mode === 'auto' ? 'selected' : ''}`}
        onClick={() => handleModeChange('auto')}
      >
        {i18n('Auto')}
      </button>
    </div>
  );
}