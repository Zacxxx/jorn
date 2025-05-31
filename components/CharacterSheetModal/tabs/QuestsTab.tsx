import React, { useState } from 'react';
import { Player, Quest } from '../../../types';
import Modal from '../../../ui/Modal'; // Adjusted import path
import { GetSpellIcon } from '../../IconComponents'; // Adjusted import path

interface QuestsTabProps {
  player: Player;
}

const QuestsTab: React.FC<QuestsTabProps> = ({ player }) => {
  const [selectedQuestDetail, setSelectedQuestDetail] = useState<Quest | null>(null);

  return (
    <div className="p-1 xs:p-2">
      <h3 className="text-lg font-semibold text-orange-200 mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Active Quests</h3>
      {player.quests.filter(q => q.status === 'active').length === 0 ? (
        <p className="text-slate-400 italic">No active quests.</p>
      ) : (
        <ul className="space-y-1.5">
          {player.quests.filter(q => q.status === 'active').map(q => (
            <li key={q.id} onClick={() => setSelectedQuestDetail(q)} className="p-1.5 xs:p-2 bg-slate-700/80 rounded-md hover:bg-slate-600/80 cursor-pointer shadow border border-slate-600/70">
              <div className="flex items-center">
                <GetSpellIcon iconName={q.iconName} className="w-4 h-4 mr-2 text-yellow-400" />
                <span className={`text-sm font-medium ${q.isMainQuest ? 'text-yellow-300' : 'text-slate-100'}`}>{q.title}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedQuestDetail && (
        <Modal isOpen={true} onClose={() => setSelectedQuestDetail(null)} title={selectedQuestDetail.title} size="lg">
          <div className="p-2 xs:p-3 sm:p-4">
            <div className="flex items-center mb-2">
              <GetSpellIcon iconName={selectedQuestDetail.iconName} className="w-5 h-5 xs:w-6 xs:h-6 mr-2 text-yellow-400" />
              <h3 className={`text-lg xs:text-xl font-bold ${selectedQuestDetail.isMainQuest ? 'text-yellow-300' : 'text-sky-300'}`}>{selectedQuestDetail.title}</h3>
            </div>
            {selectedQuestDetail.isMainQuest && <p className="text-[0.65rem] xs:text-xs text-yellow-500 mb-1 uppercase tracking-wider">Main Story Quest</p>}
            <p className="text-xs sm:text-sm text-slate-300 mb-2 xs:mb-3 leading-relaxed">{selectedQuestDetail.description}</p>
            <h5 className="text-sm sm:text-base font-semibold text-slate-200 mb-1">Objectives:</h5>
            <ul className="list-disc list-inside space-y-0.5 xs:space-y-1 text-xs sm:text-sm text-slate-400 pl-2">
              {selectedQuestDetail.objectives.map((obj, index) => <li key={index}>{obj}</li>)}
            </ul>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default QuestsTab;
