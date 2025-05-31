import React from 'react';
import ActionButton from '../../ui/ActionButton';
import { HeroBackIcon, GearIcon, LayoutIcon, ToggleIcon } from './IconComponents';

interface ParametersViewProps {
  onReturnHome: () => void;
  useLegacyFooter: boolean;
  onToggleLegacyFooter: (value: boolean) => void;
  // Add more parameters as needed
  debugMode?: boolean;
  onToggleDebugMode?: (value: boolean) => void;
  autoSave?: boolean;
  onToggleAutoSave?: (value: boolean) => void;
}

const ParametersView: React.FC<ParametersViewProps> = ({
  onReturnHome,
  useLegacyFooter,
  onToggleLegacyFooter,
  debugMode = false,
  onToggleDebugMode,
  autoSave = true,
  onToggleAutoSave,
}) => {
  return (
    <div className="space-y-4 p-4 max-h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="text-center p-4 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <ActionButton
            onClick={onReturnHome}
            variant="secondary"
            size="sm"
            icon={<HeroBackIcon />}
            className="text-xs"
          >
            <span className="hidden sm:inline">Return Home</span>
            <span className="sm:hidden">Home</span>
          </ActionButton>
          
          <h2 className="text-2xl font-bold text-blue-300 flex items-center justify-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
            <GearIcon className="w-6 h-6 mr-2 text-blue-400" />
            Parameters
          </h2>
          
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>
        <p className="text-slate-300 text-sm">Configure application settings and preferences</p>
      </div>

      {/* Parameters Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Interface Settings */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-4">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
            <LayoutIcon className="w-5 h-5 mr-2 text-purple-400" />
            Interface Settings
          </h3>
          
          <div className="space-y-4">
            {/* Footer Layout Setting */}
            <div className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg border border-slate-600/50">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-100 mb-1">Footer Layout</h4>
                <p className="text-xs text-slate-400">Choose between compact mobile layout or legacy desktop layout</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-xs ${!useLegacyFooter ? 'text-green-400 font-medium' : 'text-slate-400'}`}>
                  Mobile
                </span>
                <button
                  onClick={() => onToggleLegacyFooter(!useLegacyFooter)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                    useLegacyFooter ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useLegacyFooter ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-xs ${useLegacyFooter ? 'text-blue-400 font-medium' : 'text-slate-400'}`}>
                  Legacy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-4">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
            <GearIcon className="w-5 h-5 mr-2 text-green-400" />
            Application Settings
          </h3>
          
          <div className="space-y-4">
            {/* Auto Save Setting */}
            {onToggleAutoSave && (
              <div className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg border border-slate-600/50">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-100 mb-1">Auto Save</h4>
                  <p className="text-xs text-slate-400">Automatically save game progress</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs ${!autoSave ? 'text-slate-400' : 'text-green-400 font-medium'}`}>
                    Off
                  </span>
                  <button
                    onClick={() => onToggleAutoSave(!autoSave)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                      autoSave ? 'bg-green-600' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs ${autoSave ? 'text-green-400 font-medium' : 'text-slate-400'}`}>
                    On
                  </span>
                </div>
              </div>
            )}

            {/* Debug Mode Setting */}
            {onToggleDebugMode && (
              <div className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg border border-slate-600/50">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-100 mb-1">Debug Mode</h4>
                  <p className="text-xs text-slate-400">Show additional debugging information</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs ${!debugMode ? 'text-slate-400' : 'text-orange-400 font-medium'}`}>
                    Off
                  </span>
                  <button
                    onClick={() => onToggleDebugMode(!debugMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                      debugMode ? 'bg-orange-600' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        debugMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs ${debugMode ? 'text-orange-400 font-medium' : 'text-slate-400'}`}>
                    On
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-4">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
            <ToggleIcon className="w-5 h-5 mr-2 text-cyan-400" />
            Information
          </h3>
          
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>Application Version:</span>
              <span className="text-cyan-400">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build Date:</span>
              <span className="text-cyan-400">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Footer Layout:</span>
              <span className={useLegacyFooter ? 'text-blue-400' : 'text-green-400'}>
                {useLegacyFooter ? 'Legacy Desktop' : 'Mobile Compact'}
              </span>
            </div>
          </div>
        </div>

        {/* Reset Section */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-red-700/60 p-4">
          <h3 className="text-lg font-semibold text-red-300 mb-4">Reset Settings</h3>
          <p className="text-sm text-slate-400 mb-4">Reset all parameters to their default values</p>
          <ActionButton
            onClick={() => {
              onToggleLegacyFooter(false);
              onToggleAutoSave?.(true);
              onToggleDebugMode?.(false);
            }}
            variant="danger"
            size="sm"
            className="w-full"
          >
            Reset to Defaults
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default ParametersView; 