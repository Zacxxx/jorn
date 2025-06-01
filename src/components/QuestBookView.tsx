import React, { useState, useMemo } from 'react';
import { Player, Quest } from '../../types';
import ActionButton from '../../ui/ActionButton';
import { 
  BookIcon, 
  StarIcon, 
  CheckmarkCircleIcon, 
  FilterListIcon, 
  SearchIcon,
  UserIcon,
  MapIcon,
  GearIcon,
  FlaskIcon,
  SkullIcon,
  CollectionIcon,
  HeroBackIcon,
  GetSpellIcon
} from './IconComponents';

interface QuestBookViewProps {
  player: Player;
  onReturnHome: () => void;
  onShowMessage: (title: string, message: string) => void;
}

type QuestFilter = 'all' | 'active' | 'completed' | 'available' | 'failed';
type QuestCategory = 'all' | 'main' | 'side' | 'daily' | 'guild' | 'exploration' | 'crafting' | 'combat' | 'social';
type QuestSort = 'title' | 'level' | 'difficulty' | 'category' | 'dateAccepted' | 'progress';

const QuestBookView: React.FC<QuestBookViewProps> = ({
  player,
  onReturnHome,
  onShowMessage
}) => {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [filter, setFilter] = useState<QuestFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<QuestCategory>('all');
  const [sortBy, setSortBy] = useState<QuestSort>('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort quests
  const filteredQuests = useMemo(() => {
    let filtered = player.quests;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(quest => quest.status === filter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(quest => quest.category === categoryFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(quest => 
        quest.title.toLowerCase().includes(term) ||
        quest.description.toLowerCase().includes(term) ||
        quest.questGiver?.toLowerCase().includes(term) ||
        quest.location?.toLowerCase().includes(term)
      );
    }

    // Sort quests
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'level':
          return (a.level || 0) - (b.level || 0);
        case 'difficulty':
          const difficultyOrder = ['trivial', 'easy', 'normal', 'hard', 'epic', 'legendary'];
          return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'dateAccepted':
          return new Date(a.dateAccepted || 0).getTime() - new Date(b.dateAccepted || 0).getTime();
        case 'progress':
          const aProgress = a.progress ? (a.progress.current / a.progress.total) : 0;
          const bProgress = b.progress ? (b.progress.current / b.progress.total) : 0;
          return bProgress - aProgress;
        default:
          return 0;
      }
    });

    return filtered;
  }, [player.quests, filter, categoryFilter, searchTerm, sortBy]);

  // Quest statistics
  const questStats = useMemo(() => {
    const stats = {
      total: player.quests.length,
      active: player.quests.filter(q => q.status === 'active').length,
      completed: player.quests.filter(q => q.status === 'completed').length,
      available: player.quests.filter(q => q.status === 'available').length,
      failed: player.quests.filter(q => q.status === 'failed').length,
      mainQuests: player.quests.filter(q => q.isMainQuest).length,
      sideQuests: player.quests.filter(q => !q.isMainQuest).length,
    };
    return stats;
  }, [player.quests]);

  const getDifficultyColor = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'trivial': return 'text-gray-400';
      case 'easy': return 'text-green-400';
      case 'normal': return 'text-blue-400';
      case 'hard': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusColor = (status: Quest['status']) => {
    switch (status) {
      case 'active': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'available': return 'text-yellow-400';
      case 'locked': return 'text-gray-400';
      default: return 'text-slate-400';
    }
  };

  const getCategoryIcon = (category: Quest['category']) => {
    switch (category) {
      case 'main': return <StarIcon className="w-4 h-4" />;
      case 'side': return <BookIcon className="w-4 h-4" />;
      case 'daily': return <GetSpellIcon iconName="Default" className="w-4 h-4" />;
      case 'guild': return <UserIcon className="w-4 h-4" />;
      case 'exploration': return <MapIcon className="w-4 h-4" />;
      case 'crafting': return <GearIcon className="w-4 h-4" />;
      case 'combat': return <SkullIcon className="w-4 h-4" />;
      case 'social': return <UserIcon className="w-4 h-4" />;
      default: return <BookIcon className="w-4 h-4" />;
    }
  };

  const formatProgress = (quest: Quest) => {
    if (!quest.progress) return null;
    const percentage = Math.round((quest.progress.current / quest.progress.total) * 100);
    return `${quest.progress.current}/${quest.progress.total} (${percentage}%)`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-b border-amber-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-xl flex items-center justify-center">
              <BookIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-300">Quest Book</h1>
              <p className="text-sm text-slate-300">Track your adventures and progress</p>
            </div>
          </div>
          <ActionButton
            onClick={onReturnHome}
            variant="secondary"
            icon={<HeroBackIcon />}
          >
            Return Home
          </ActionButton>
        </div>

        {/* Quest Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-slate-200">{questStats.total}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
          <div className="bg-blue-500/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-300">{questStats.active}</div>
            <div className="text-xs text-slate-400">Active</div>
          </div>
          <div className="bg-green-500/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-300">{questStats.completed}</div>
            <div className="text-xs text-slate-400">Completed</div>
          </div>
          <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-300">{questStats.available}</div>
            <div className="text-xs text-slate-400">Available</div>
          </div>
          <div className="bg-red-500/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-300">{questStats.failed}</div>
            <div className="text-xs text-slate-400">Failed</div>
          </div>
          <div className="bg-purple-500/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-300">{questStats.mainQuests}</div>
            <div className="text-xs text-slate-400">Main</div>
          </div>
          <div className="bg-slate-500/20 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-slate-300">{questStats.sideQuests}</div>
            <div className="text-xs text-slate-400">Side</div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Quest List Panel */}
        <div className="w-1/2 border-r border-slate-700 flex flex-col">
          {/* Search and Filters */}
          <div className="p-4 border-b border-slate-700 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search quests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <ActionButton
                onClick={() => setShowFilters(!showFilters)}
                variant="secondary"
                size="sm"
                icon={<FilterListIcon />}
              >
                Filters
              </ActionButton>
              <div className="text-sm text-slate-400">
                {filteredQuests.length} quest{filteredQuests.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as QuestFilter)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="available">Available</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as QuestCategory)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                  >
                    <option value="all">All Categories</option>
                    <option value="main">Main Story</option>
                    <option value="side">Side Quests</option>
                    <option value="daily">Daily Quests</option>
                    <option value="guild">Guild Quests</option>
                    <option value="exploration">Exploration</option>
                    <option value="crafting">Crafting</option>
                    <option value="combat">Combat</option>
                    <option value="social">Social</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as QuestSort)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
                  >
                    <option value="title">Title</option>
                    <option value="level">Level</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="category">Category</option>
                    <option value="dateAccepted">Date Accepted</option>
                    <option value="progress">Progress</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Quest List */}
          <div className="flex-1 overflow-y-auto styled-scrollbar">
            {filteredQuests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <BookIcon className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">No Quests Found</h3>
                <p className="text-sm text-slate-500">
                  {searchTerm || filter !== 'all' || categoryFilter !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Your adventure awaits! Complete activities to discover new quests.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredQuests.map((quest) => (
                  <div
                    key={quest.id}
                    onClick={() => setSelectedQuest(quest)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedQuest?.id === quest.id
                        ? 'bg-amber-500/20 border-amber-500/50'
                        : 'bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(quest.category)}
                        <h3 className={`font-semibold ${quest.isMainQuest ? 'text-yellow-300' : 'text-slate-200'}`}>
                          {quest.title}
                        </h3>
                        {quest.isMainQuest && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded font-medium">
                            MAIN
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-medium ${getStatusColor(quest.status)}`}>
                          {quest.status.toUpperCase()}
                        </span>
                        {quest.level && (
                          <span className="text-xs text-slate-400">Lv.{quest.level}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 mb-2 line-clamp-2">{quest.description}</p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className={`capitalize ${getDifficultyColor(quest.difficulty)}`}>
                          {quest.difficulty}
                        </span>
                        <span className="text-slate-500 capitalize">{quest.category}</span>
                        {quest.location && (
                          <span className="text-slate-500">{quest.location}</span>
                        )}
                      </div>
                      {quest.progress && (
                        <div className="text-slate-400">
                          {formatProgress(quest)}
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {quest.progress && (
                      <div className="mt-2">
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (quest.progress.current / quest.progress.total) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quest Details Panel */}
        <div className="w-1/2 flex flex-col">
          {selectedQuest ? (
            <div className="flex-1 overflow-y-auto styled-scrollbar">
              {/* Quest Header */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <GetSpellIcon iconName={selectedQuest.iconName} className="w-8 h-8 text-amber-400" />
                    <div>
                      <h2 className={`text-xl font-bold ${selectedQuest.isMainQuest ? 'text-yellow-300' : 'text-slate-200'}`}>
                        {selectedQuest.title}
                      </h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-sm font-medium ${getStatusColor(selectedQuest.status)}`}>
                          {selectedQuest.status.toUpperCase()}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className={`text-sm capitalize ${getDifficultyColor(selectedQuest.difficulty)}`}>
                          {selectedQuest.difficulty}
                        </span>
                        {selectedQuest.level && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="text-sm text-slate-400">Level {selectedQuest.level}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedQuest.isMainQuest && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full font-medium">
                      Main Quest
                    </span>
                  )}
                </div>

                {/* Quest Meta Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <span className="ml-2 text-slate-200 capitalize">{selectedQuest.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Estimated Time:</span>
                    <span className="ml-2 text-slate-200">{selectedQuest.estimatedTime}</span>
                  </div>
                  {selectedQuest.location && (
                    <div>
                      <span className="text-slate-400">Location:</span>
                      <span className="ml-2 text-slate-200">{selectedQuest.location}</span>
                    </div>
                  )}
                  {selectedQuest.questGiver && (
                    <div>
                      <span className="text-slate-400">Quest Giver:</span>
                      <span className="ml-2 text-slate-200">{selectedQuest.questGiver}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quest Description */}
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Description</h3>
                <p className="text-slate-300 leading-relaxed">{selectedQuest.description}</p>
              </div>

              {/* Objectives */}
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Objectives</h3>
                <ul className="space-y-2">
                  {selectedQuest.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckmarkCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Progress */}
              {selectedQuest.progress && (
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-200 mb-3">Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">{selectedQuest.progress.description || 'Quest Progress'}</span>
                      <span className="text-slate-400">{formatProgress(selectedQuest)}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (selectedQuest.progress.current / selectedQuest.progress.total) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rewards */}
              {selectedQuest.rewards && (
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-200 mb-3">Rewards</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedQuest.rewards.xp && (
                      <div className="flex items-center space-x-2">
                        <StarIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300">{selectedQuest.rewards.xp.toLocaleString()} XP</span>
                      </div>
                    )}
                    {selectedQuest.rewards.gold && (
                      <div className="flex items-center space-x-2">
                        <GetSpellIcon iconName="GoldCoinIcon" className="w-4 h-4 text-yellow-400" />
                        <span className="text-slate-300">{selectedQuest.rewards.gold.toLocaleString()} Gold</span>
                      </div>
                    )}
                    {selectedQuest.rewards.essence && (
                      <div className="flex items-center space-x-2">
                        <GetSpellIcon iconName="EssenceIcon" className="w-4 h-4 text-purple-400" />
                        <span className="text-slate-300">{selectedQuest.rewards.essence.toLocaleString()} Essence</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quest Chain Information */}
              {selectedQuest.chainId && (
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-200 mb-3">Quest Chain</h3>
                  <div className="text-slate-300">
                    Part {selectedQuest.chainPosition} of {selectedQuest.chainTotal}
                  </div>
                </div>
              )}

              {/* Journal Entries */}
              {selectedQuest.journalEntries && selectedQuest.journalEntries.length > 0 && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-200 mb-3">Journal Entries</h3>
                  <div className="space-y-3">
                    {selectedQuest.journalEntries.map((entry, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            entry.type === 'completion' ? 'bg-green-500/20 text-green-300' :
                            entry.type === 'progress' ? 'bg-blue-500/20 text-blue-300' :
                            entry.type === 'discovery' ? 'bg-purple-500/20 text-purple-300' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>
                            {entry.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{entry.entry}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <BookIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">Select a Quest</h3>
                <p className="text-sm text-slate-500">
                  Choose a quest from the list to view its details, objectives, and progress.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestBookView; 