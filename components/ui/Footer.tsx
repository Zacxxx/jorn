import React, { useState, useRef, useEffect } from 'react';
import ActionButton from '../battle-ui/layout/ActionButton';
import { BookIcon, GearIcon, StarIcon, BagIcon, Bars3Icon, CollectionIcon, ChevronUpIcon, ChevronDownIcon } from '../books/IconComponents';
import useMobileFeatures from '../../hooks/useMobileFeatures';

interface FooterProps {
  onOpenSpellbook: () => void;
  onOpenCraftingHub: () => void;
  onOpenInventory: () => void;
  onOpenTraitsPage: () => void;
  onOpenQuestsPage: () => void;
  onOpenEncyclopedia: () => void;
  onOpenGameMenu: () => void;
}

const Footer: React.FC<FooterProps> = ({ 
    onOpenSpellbook,
    onOpenCraftingHub,
    onOpenInventory,
    onOpenTraitsPage,
    onOpenQuestsPage,
    onOpenEncyclopedia,
    onOpenGameMenu
}) => {
  const { isPortrait, isMobile, isLandscape } = useMobileFeatures();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // Group all actions together
  const allActions = [
    { onClick: onOpenSpellbook, variant: 'primary', icon: BookIcon, label: 'Spells', title: 'Open Spellbook' },
    { onClick: onOpenInventory, variant: 'secondary', icon: BagIcon, label: 'Items', title: 'Open Inventory' },
    { onClick: onOpenCraftingHub, variant: 'info', icon: GearIcon, label: 'Craft', title: 'Open Crafting Hub' },
    { onClick: onOpenTraitsPage, variant: 'success', icon: StarIcon, label: 'Traits', title: 'View/Define Traits' },
    { onClick: onOpenQuestsPage, variant: 'warning', icon: BookIcon, label: 'Quests', title: 'View Quest Log' },
    { onClick: onOpenEncyclopedia, variant: 'secondary', icon: CollectionIcon, label: 'Wiki', title: 'Open Encyclopedia' },
    { onClick: onOpenGameMenu, variant: 'secondary', icon: Bars3Icon, label: 'Menu', title: 'Open Game Menu' },
  ];

  const renderActionButton = (action: typeof allActions[0], isMobile: boolean, isMenuButton: boolean = false) => (
    <ActionButton 
      onClick={action.onClick} 
      variant={action.variant as any} 
      size={isMenuButton ? "sm" : "lg"}
      icon={<action.icon className={isMenuButton ? "w-3.5 h-3.5 sm:w-4 sm:h-4" : "w-6 h-6"}/>}
      className={`shadow-${action.variant}-500/30 hover:shadow-${action.variant}-500/50 
        ${isMenuButton ? 'text-[11px] h-9 min-h-[44px]' : 'text-base h-16 min-h-[64px]'}
        touch-manipulation
        ${isMobile ? 'truncate' : ''}`}
      title={action.title}
    >
      {action.label}
    </ActionButton>
  );

  const toggleFooter = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setShowMenu(false);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Log device information
  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/.test(userAgent);
    const isMobileDevice = /Mobile|Android|iPhone|iPad|iPod/.test(userAgent);
    
    console.log('Device Information:', {
      userAgent,
      isIOS,
      isAndroid,
      isTablet,
      isMobileDevice,
      isPortrait,
      isLandscape,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      touchEnabled: 'ontouchstart' in window
    });
  }, [isPortrait, isLandscape]);

  return (
    <footer className="bg-slate-900/80 border-t-2 border-slate-700/60 backdrop-blur-sm shadow-inner sticky bottom-0 z-[999] safe-area-inset-bottom">
      <div className="container mx-auto px-2 py-1.5 sm:px-3 sm:py-2.5 max-w-6xl">
        {/* Mobile Layout */}
        <div className="sm:hidden">
          {/* Toggle Button */}
          <button
            onClick={toggleFooter}
            className="w-full flex justify-center items-center py-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronUpIcon className="w-4 h-4" />
            )}
          </button>

          {isExpanded && (
            <div className="relative">
              {/* Menu Button */}
              <div className="mt-1.5">
                <ActionButton
                  onClick={toggleMenu}
                  variant="secondary"
                  size="sm"
                  icon={<Bars3Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>}
                  className="w-full shadow-slate-500/30 hover:shadow-slate-500/50 text-[11px] h-9 min-h-[44px] touch-manipulation"
                  title="Menu"
                >
                  Menu
                </ActionButton>

                {/* Menu Dropdown */}
                {showMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-slate-800/90 rounded-lg shadow-lg border border-slate-700/50 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      {allActions.map((action, index) => (
                        <div key={index} className="w-full">
                          {renderActionButton(action, true, false)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex flex-col sm:flex-row justify-end items-center">
          <div className="flex flex-wrap justify-center sm:justify-end gap-2">
            {allActions.map((action, index) => (
              <div key={index} className="debug-flex-item">
                {renderActionButton(action, false, true)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;