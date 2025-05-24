import React from 'react';
import Modal from '../../Modal';
import ActionButton from '../../ActionButton';
import { JornBattleConfig } from '../../../types';

interface LayoutManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: JornBattleConfig;
  setCurrentConfig: React.Dispatch<React.SetStateAction<JornBattleConfig>>;
  saveLayoutToStorage: (layoutName: string) => void;
  loadLayoutFromStorage: (layoutName: string) => void;
  exportLayout: () => void;
  importLayout: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetLayout: () => void;
  applyPresetLayout: (preset: string) => void;
}

export const LayoutManagerModal: React.FC<LayoutManagerModalProps> = ({
  isOpen,
  onClose,
  config,
  setCurrentConfig,
  saveLayoutToStorage,
  loadLayoutFromStorage,
  exportLayout,
  importLayout,
  resetLayout,
  applyPresetLayout,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Layout Manager" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <ActionButton onClick={resetLayout} variant="warning" className="w-full !py-2 !text-sm">
                Reset to Default
              </ActionButton>
              <ActionButton onClick={exportLayout} variant="secondary" className="w-full !py-2 !text-sm">
                Export Layout
              </ActionButton>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={importLayout}
                  className="hidden"
                  id="layout-import"
                />
                <ActionButton
                  onClick={() => document.getElementById('layout-import')?.click()}
                  variant="secondary"
                  className="w-full !py-2 !text-sm"
                >
                  Import Layout
                </ActionButton>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Presets</h4>
            <div className="space-y-2">
              <ActionButton
                onClick={() => applyPresetLayout('classic')}
                variant="secondary"
                className="w-full !py-2 !text-sm"
              >
                Classic Layout
              </ActionButton>
              <ActionButton
                onClick={() => applyPresetLayout('wide')}
                variant="secondary"
                className="w-full !py-2 !text-sm"
              >
                Wide Layout
              </ActionButton>
              <ActionButton
                onClick={() => applyPresetLayout('mobile')}
                variant="secondary"
                className="w-full !py-2 !text-sm"
              >
                Mobile Layout
              </ActionButton>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Layout Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Full Height</span>
                <input
                  type="checkbox"
                  checked={config.useFullHeight}
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, useFullHeight: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Show Grid</span>
                <input
                  type="checkbox"
                  checked={config.editMode?.showGrid || false}
                  onChange={(e) => setCurrentConfig(prev => ({
                    ...prev,
                    editMode: { ...prev.editMode!, showGrid: e.target.checked }
                  }))}
                  className="rounded border-slate-600 bg-slate-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Snap to Grid</span>
                <input
                  type="checkbox"
                  checked={config.editMode?.snapToGrid || false}
                  onChange={(e) => setCurrentConfig(prev => ({
                    ...prev,
                    editMode: { ...prev.editMode!, snapToGrid: e.target.checked }
                  }))}
                  className="rounded border-slate-600 bg-slate-800"
                />
              </div>

              {/* Canvas Size Controls */}
              <div className="border-t border-slate-600 pt-3 mt-3">
                <h5 className="text-xs font-semibold text-slate-300 mb-2">Canvas Size</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Width (%)</span>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={config.canvasWidth}
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, canvasWidth: parseInt(e.target.value) }))}
                      className="w-20"
                    />
                    <span className="text-xs text-slate-300 w-12">{config.canvasWidth}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Min Width (px)</span>
                    <input
                      type="number"
                      min="600"
                      max="1600"
                      value={config.canvasMinWidth}
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, canvasMinWidth: parseInt(e.target.value) }))}
                      className="w-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-slate-200 text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Min Height (px)</span>
                    <input
                      type="number"
                      min="400"
                      max="1200"
                      value={config.canvasMinHeight}
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, canvasMinHeight: parseInt(e.target.value) }))}
                      className="w-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Font Size Controls */}
              <div className="border-t border-slate-600 pt-3 mt-3">
                <h5 className="text-xs font-semibold text-slate-300 mb-2">Font Sizes</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Base Size</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={config.fontSizes?.base || 1}
                      onChange={(e) => setCurrentConfig(prev => ({
                        ...prev,
                        fontSizes: { ...prev.fontSizes!, base: parseFloat(e.target.value) }
                      }))}
                      className="w-20"
                    />
                    <span className="text-xs text-slate-300 w-12">{(config.fontSizes?.base || 1).toFixed(1)}rem</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">UI Size</span>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={config.fontSizes?.ui || 0.875}
                      onChange={(e) => setCurrentConfig(prev => ({
                        ...prev,
                        fontSizes: { ...prev.fontSizes!, ui: parseFloat(e.target.value) }
                      }))}
                      className="w-20"
                    />
                    <span className="text-xs text-slate-300 w-12">{(config.fontSizes?.ui || 0.875).toFixed(2)}rem</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Save/Load Layouts</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Layout name..."
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-200 text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    saveLayoutToStorage(target.value.trim());
                    target.value = '';
                  }
                }
              }}
            />
            <ActionButton
              onClick={() => {
                const input = document.querySelector('input[placeholder="Layout name..."]') as HTMLInputElement;
                if (input?.value.trim()) {
                  saveLayoutToStorage(input.value.trim());
                  input.value = '';
                }
              }}
              variant="primary"
              className="!py-2 !text-sm"
            >
              Save
            </ActionButton>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Press Enter or click Save to store current layout
          </div>
        </div>

        <div className="flex justify-end">
          <ActionButton onClick={onClose} variant="primary">
            Close
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
}; 