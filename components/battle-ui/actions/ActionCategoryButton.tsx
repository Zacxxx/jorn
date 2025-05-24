import React from 'react';
import ActionButton from '../../ActionButton';
import { DynamicAreaView } from '../../../types';

interface IconProps {
  className?: string;
  title?: string;
}

interface ActionCategoryButtonProps {
  label: string;
  icon: React.ReactNode;
  view: DynamicAreaView;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const ActionCategoryButton: React.FC<ActionCategoryButtonProps> = ({ label, icon, view, isActive, onClick, disabled }) => (
  <ActionButton
    onClick={onClick}
    variant={isActive ? 'primary' : 'secondary'}
    className={`w-full !justify-start !text-xs sm:!text-sm !py-2 sm:!py-2.5 
                ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-sky-500' : ''}`}
    icon={React.cloneElement(icon as React.ReactElement<IconProps>, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
    disabled={disabled}
    title={label}
  >
    {label}
  </ActionButton>
); 