import React, { useState, useEffect } from 'react';
import { ManualPoiFormProps, ManualPoiFormData } from '../../types';

export const ManualPoiForm: React.FC<ManualPoiFormProps> = ({ isOpen, onSave, onClose, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [significance, setSignificance] = useState('');
  const [rumorsLegends, setRumorsLegends] = useState('');
  const [potentialDiscoveries, setPotentialDiscoveries] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form when opened
      setName('');
      setDescription('');
      setSignificance('');
      setRumorsLegends('');
      setPotentialDiscoveries('');
      setFormError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setFormError('Name and Description are required.');
      return;
    }
    setFormError(null);
    onSave({
      name,
      description,
      significance,
      rumors_legends: rumorsLegends,
      potential_discoveries: potentialDiscoveries,
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center p-4 z-[90]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manualPoiFormTitle"
    >
      <div 
        className="bg-slate-800 text-slate-200 p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-slate-700 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-750"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="manualPoiFormTitle" className="text-xl sm:text-2xl font-bold text-emerald-400 font-['Inter_Tight',_sans-serif]">Add New Point of Interest</h2>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full disabled:opacity-50"
            aria-label="Close form"
          >
            <span className="icon-close w-6 h-6 block"></span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="poiName" className="block text-sm font-medium text-slate-300 mb-1">Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              id="poiName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full p-2 border border-slate-500 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-700 text-slate-100 placeholder-slate-400 disabled:opacity-70 disabled:bg-slate-600"
              placeholder="e.g., The Whispering Idol"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="poiDescription" className="block text-sm font-medium text-slate-300 mb-1">Description <span className="text-red-400">*</span></label>
            <textarea
              id="poiDescription"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full p-2 border border-slate-500 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-700 text-slate-100 placeholder-slate-400 disabled:opacity-70 disabled:bg-slate-600"
              placeholder="A brief overview of the POI."
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="poiSignificance" className="block text-sm font-medium text-slate-300 mb-1">Significance (Optional)</label>
            <textarea
              id="poiSignificance"
              rows={2}
              value={significance}
              onChange={(e) => setSignificance(e.target.value)}
              className="block w-full p-2 border border-slate-500 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-700 text-slate-100 placeholder-slate-400 disabled:opacity-70 disabled:bg-slate-600"
              placeholder="Why is this place important?"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="poiRumors" className="block text-sm font-medium text-slate-300 mb-1">Rumors & Legends (Optional)</label>
            <textarea
              id="poiRumors"
              rows={2}
              value={rumorsLegends}
              onChange={(e) => setRumorsLegends(e.target.value)}
              className="block w-full p-2 border border-slate-500 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-700 text-slate-100 placeholder-slate-400 disabled:opacity-70 disabled:bg-slate-600"
              placeholder="What stories are told about this place?"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="poiDiscoveries" className="block text-sm font-medium text-slate-300 mb-1">Potential Discoveries (Optional)</label>
            <textarea
              id="poiDiscoveries"
              rows={2}
              value={potentialDiscoveries}
              onChange={(e) => setPotentialDiscoveries(e.target.value)}
              className="block w-full p-2 border border-slate-500 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-slate-700 text-slate-100 placeholder-slate-400 disabled:opacity-70 disabled:bg-slate-600"
              placeholder="What might be found here?"
              disabled={isLoading}
            />
          </div>

          {formError && (
            <p className="text-sm text-red-400" role="alert">{formError}</p>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:bg-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-emerald-500/70 disabled:opacity-70"
            >
              {isLoading ? (
                <><span className="icon-spinner w-4 h-4 mr-2 inline-block"></span>Saving...</>
              ) : (
                'Save POI'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
