
import React, {useState} from 'react';
import { Quest } from '../../types';
import Modal from '../../ui/Modal';
import { GetSpellIcon, BookIcon } from './IconComponents';

interface QuestLogDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
}

const QuestLogDisplay: React.FC<QuestLogDisplayProps> = ({ isOpen, onClose, quests }) => {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');
  const failedQuests = quests.filter(q => q.status === 'failed');

  const renderQuestList = (questList: Quest[], title: string) => (
    <div className="mb-4">
      <h4 className="text-lg font-semibold text-sky-300 mb-2">{title} ({questList.length})</h4>
      {questList.length === 0 ? (
        <p className="text-sm text-slate-500 italic">No quests in this category.</p>
      ) : (
        <ul className="space-y-2">
          {questList.map(quest => (
            <li
              key={quest.id}
              onClick={() => setSelectedQuest(quest)}
              className="p-2 bg-slate-700 rounded-md hover:bg-slate-600 cursor-pointer transition-colors shadow"
            >
              <div className="flex items-center">
                <GetSpellIcon iconName={quest.iconName || 'Book'} className="w-5 h-5 mr-2 text-yellow-400" />
                <span className={`font-medium ${quest.isMainQuest ? 'text-yellow-400' : 'text-slate-200'}`}>{quest.title}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); setSelectedQuest(null); }} title="Quest Log" size="xl">
      <div className="max-h-[70vh] grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="pr-2 overflow-y-auto styled-scrollbar">
          {renderQuestList(activeQuests, "Active Quests")}
          {renderQuestList(completedQuests, "Completed Quests")}
          {renderQuestList(failedQuests, "Failed Quests")}
           {quests.length === 0 && <p className="text-slate-400 italic">Your adventure is yet to begin... No quests recorded.</p>}
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 overflow-y-auto styled-scrollbar">
          {selectedQuest ? (
            <>
              <div className="flex items-center mb-2">
                 <GetSpellIcon iconName={selectedQuest.iconName || 'Book'} className="w-6 h-6 mr-2 text-yellow-400" />
                <h3 className={`text-xl font-bold ${selectedQuest.isMainQuest ? 'text-yellow-300' : 'text-sky-300'}`}>{selectedQuest.title}</h3>
              </div>
              {selectedQuest.isMainQuest && <p className="text-xs text-yellow-500 mb-1 uppercase tracking-wider">Main Story Quest</p>}
              <p className="text-sm text-slate-300 mb-3 leading-relaxed">{selectedQuest.description}</p>
              <h5 className="text-md font-semibold text-slate-200 mb-1">Objectives:</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-400 pl-2">
                {selectedQuest.objectives.map((obj, index) => (
                  <li key={index}>{obj}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">Status: <span className={`font-semibold ${
                selectedQuest.status === 'active' ? 'text-blue-400' :
                selectedQuest.status === 'completed' ? 'text-green-400' :
                'text-red-400'
              }`}>{selectedQuest.status}</span></p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BookIcon className="w-16 h-16 text-slate-600 mb-3"/>
              <p className="text-slate-500">Select a quest to view its details.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QuestLogDisplay;
