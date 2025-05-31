import React from 'react';
import { Talent } from '../../../../types'; // Adjusted path, assuming Talent is defined in global types

interface TalentTreeProps {
  treeData: any; // TODO: Replace with actual TalentTree data type
  category: string;
  selectedTalentDetails: Talent | null;
  updateTalentDetailsPanel: (talentData: Talent) => void;
}

const TalentTree: React.FC<TalentTreeProps> = ({
  treeData,
  category,
  selectedTalentDetails,
  updateTalentDetailsPanel,
}) => {
  const talentsInCategory = treeData[category] || [];
  if (talentsInCategory.length === 0) {
    return <p className="text-slate-400 italic">No talents available in this category yet.</p>;
  }

  const tiers: { [key: number]: Talent[] } = {};
  talentsInCategory.forEach((talent: Talent) => {
    if (!tiers[talent.tier]) {
      tiers[talent.tier] = [];
    }
    tiers[talent.tier].push(talent);
  });

  // Placeholder for connections SVG - this would be a more complex implementation
  const generateConnections = (talents: Talent[]): React.ReactNode => {
    return <div className="absolute top-0 left-0 w-full h-full pointer-events-none"> {/* Container for SVG lines */}</div>;
  };

  return (
    <div className="relative">
      {generateConnections(talentsInCategory)}
      <div className="flex space-x-4 overflow-x-auto pb-2 styled-scrollbar-thin">
        {Object.keys(tiers).sort((a,b) => parseInt(a) - parseInt(b)).map(tier => (
          <div key={tier} className="flex-shrink-0 w-36 xs:w-40">
            <h5 className="text-xs sm:text-sm font-semibold text-sky-200 mb-1.5 xs:mb-2 border-b border-slate-600 pb-1">Tier {tier}</h5>
            <div className="space-y-1.5 xs:space-y-2">
              {tiers[parseInt(tier)].map((talent: Talent) => (
                <button
                  key={talent.id}
                  onClick={() => updateTalentDetailsPanel(talent)}
                  className={`w-full p-1.5 xs:p-2 rounded-md shadow text-left transition-colors focus:outline-none focus:ring-1 focus:ring-sky-400
                              ${selectedTalentDetails?.id === talent.id ? 'bg-sky-600 hover:bg-sky-500' : 'bg-slate-600 hover:bg-slate-500'}`}
                >
                  <p className={`text-[0.6rem] xs:text-xs font-semibold ${selectedTalentDetails?.id === talent.id ? 'text-white' : 'text-green-300'}`}>{talent.name}</p>
                  <p className={`text-[0.55rem] xs:text-[0.6rem] ${selectedTalentDetails?.id === talent.id ? 'text-sky-100' : 'text-slate-300'}`}>{talent.type}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TalentTree;
