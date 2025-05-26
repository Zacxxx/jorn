import React from 'react';
import { HelpModalProps } from '../../types';

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center p-4 z-[100]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="helpModalTitle"
    >
      <div 
        className="bg-slate-800 text-slate-200 p-6 sm:p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-700 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-750"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="helpModalTitle" className="text-2xl sm:text-3xl font-bold text-emerald-400 font-['Inter_Tight',_sans-serif]">Help & Guidance</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full"
            aria-label="Close help modal"
          >
            <span className="icon-close w-6 h-6 block"></span>
          </button>
        </div>

        <div className="space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed">
          <section>
            <h3 className="text-lg font-semibold text-emerald-300 font-['Inter_Tight',_sans-serif] mb-2">Welcome to the AI Fantasy Map Generator!</h3>
            <p>
              This tool uses AI to guide you through creating detailed fantasy areas, points of interest, and unique map images.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-emerald-300 font-['Inter_Tight',_sans-serif] mb-2">Map Generation: A Step-by-Step Process</h3>
            <ol className="list-decimal list-outside ml-6 space-y-4">
              <li>
                <strong className="font-semibold text-slate-100">Step 1: Generate Area Details</strong>
                <ul className="list-disc list-outside ml-6 mt-1 space-y-1 text-slate-400">
                  <li>
                    <strong>Describe Your Theme:</strong> In the "Define Your Area" section, provide a rich description of the world or area you want to map.
                  </li>
                  <li>
                    <strong>Add Custom Lore (Optional):</strong> Check "Add Custom Lore" to input specific background details or history. This influences the area's characteristics.
                  </li>
                  <li>
                    <strong>Click "Generate Area Details":</strong> The AI will create:
                    <ul className="list-circle list-outside ml-6 mt-1">
                        <li>A name for your area.</li>
                        <li>Descriptions of its geography, climate, inhabitants, mood, etc.</li>
                        <li>Overarching lore for the area.</li>
                        <li>A list of suggested names for Points of Interest (POIs).</li>
                    </ul>
                    This information will appear in the "Area Information" section.
                  </li>
                </ul>
              </li>
              <li>
                <strong className="font-semibold text-slate-100">Step 2: Generate Points of Interest (POIs)</strong>
                 <ul className="list-disc list-outside ml-6 mt-1 space-y-1 text-slate-400">
                  <li>
                    Once Area Details are generated, the "Generate Points of Interest" button in its section becomes active.
                  </li>
                  <li>
                    <strong>Click this button:</strong> The AI uses the Area Information (including suggested names and lore) to generate detailed POIs. Each POI will include:
                     <ul className="list-circle list-outside ml-6 mt-1">
                        <li>Name, Description, Significance</li>
                        <li>Rumors & Legends, Potential Discoveries</li>
                    </ul>
                  </li>
                   <li>These POIs will be listed, ready for the next step.</li>
                </ul>
              </li>
              <li>
                <strong className="font-semibold text-slate-100">Step 3: Generate Map Image</strong>
                 <ul className="list-disc list-outside ml-6 mt-1 space-y-1 text-slate-400">
                  <li>
                    After POIs are generated, the "Generate Map Image" button becomes active.
                  </li>
                  <li>
                    <strong>Click this button:</strong> The AI will:
                     <ul className="list-circle list-outside ml-6 mt-1">
                        <li>Analyze your Area Information and POIs.</li>
                        <li><strong>Automatically determine the most suitable Map Type</strong> (e.g., Region, City, Archipelago).</li>
                        <li>Generate a unique map image based on all gathered details.</li>
                    </ul>
                  </li>
                   <li>The map image and its interactive pixel grid will appear.</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-emerald-300 font-['Inter_Tight',_sans-serif] mb-2">Interacting with Your Map & POIs:</h3>
            <ul className="list-disc list-outside ml-6 space-y-2 text-slate-400">
              <li>
                <strong>Placing POIs:</strong> After the map image is generated, POIs from the list can be placed. Click a POI, then click on the map grid.
              </li>
              <li>
                <strong>Viewing POI Details:</strong> Click a placed POI marker or a POI in the list to see its full details.
              </li>
              <li>
                <strong>Sub-Maps (Coming Soon):</strong> Soon, you'll be able to select a placed POI and generate a new, detailed sub-map for that specific location!
              </li>
              <li>
                <strong>Display Options & Navigation:</strong> Use panel collapse/expand buttons and map display options as before.
              </li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold text-emerald-300 font-['Inter_Tight',_sans-serif] mb-2">Exporting & Importing:</h3>
             <ul className="list-disc list-outside ml-6 space-y-2 text-slate-400">
                <li>
                  <strong>Export:</strong> After all steps are complete (Area Info, POIs, Map Image, Pixel Grid), "Export Map" saves your entire creation (including Area Info) to a JSON file.
                </li>
                <li>
                  <strong>Import:</strong> Load a previously exported JSON file.
                </li>
            </ul>
          </section>

           <section>
            <h3 className="text-lg font-semibold text-emerald-300 font-['Inter_Tight',_sans-serif] mb-2">Tips for Best Results:</h3>
            <ul className="list-disc list-outside ml-6 space-y-2 text-slate-400">
              <li>
                <strong>Be specific with your initial theme.</strong> This heavily influences the Area Details.
              </li>
              <li>
                <strong>Use Custom Lore</strong> for the Area generation to align the world with your vision.
              </li>
              <li>
                Review the generated Area Information carefully before generating POIs, as it sets the stage for everything that follows.
              </li>
            </ul>
          </section>

          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
            >
              Got it, let's create!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
