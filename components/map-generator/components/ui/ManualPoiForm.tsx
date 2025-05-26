
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
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center p-4 z-40" // z-40 to be below help modal
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manualPoiFormTitle"
    >
      <div 
        className="bg-amber-50 text-stone-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-amber-300 custom-scrollbar-thin"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="manualPoiFormTitle" className="text-xl sm:text-2xl font-bold text-amber-700 font-serif">Add New Point of Interest</h2>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="p-2 text-stone-500 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-full disabled:opacity-50"
            aria-label="Close form"
          >
            <span className="icon-close w-6 h-6 block"></span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="poiName" className="block text-sm font-medium text-stone-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="poiName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full p-2 border border-amber-400 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white placeholder-stone-400"
              placeholder="e.g., The Whispering Idol"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="poiDescription" className="block text-sm font-medium text-stone-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              id="poiDescription"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full p-2 border border-amber-400 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white placeholder-stone-400"
              placeholder="A brief overview of the POI."
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="poiSignificance" className="block text-sm font-medium text-stone-700 mb-1">Significance (Optional)</label>
            <textarea
              id="poiSignificance"
              rows={2}
              value={significance}
              onChange={(e) => setSignificance(e.target.value)}
              className="block w-full p-2 border border-amber-400 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white placeholder-stone-400"
              placeholder="Why is this place important?"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="poiRumors" className="block text-sm font-medium text-stone-700 mb-1">Rumors & Legends (Optional)</label>
            <textarea
              id="poiRumors"
              rows={2}
              value={rumorsLegends}
              onChange={(e) => setRumorsLegends(e.target.value)}
              className="block w-full p-2 border border-amber-400 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white placeholder-stone-400"
              placeholder="What stories are told about this place?"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="poiDiscoveries" className="block text-sm font-medium text-stone-700 mb-1">Potential Discoveries (Optional)</label>
            <textarea
              id="poiDiscoveries"
              rows={2}
              value={potentialDiscoveries}
              onChange={(e) => setPotentialDiscoveries(e.target.value)}
              className="block w-full p-2 border border-amber-400 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white placeholder-stone-400"
              placeholder="What might be found here?"
              disabled={isLoading}
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600" role="alert">{formError}</p>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-amber-400 disabled:opacity-70"
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
