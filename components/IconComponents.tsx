import React from 'react';
import { SpellIconName } from '../types';

interface IconProps {
  className?: string;
}

export const FireballIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11.71c0-.53.21-1.04.59-1.41L12 6.29l.41.41c.38.38.59.88.59 1.41v3.18c1.5.48 2.52 1.99 2.26 3.62-.23 1.42-1.51 2.5-2.97 2.5s-2.75-1.07-2.97-2.5c-.26-1.63.76-3.14 2.26-3.62V7.29zM12 16c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/>
  </svg>
);

export const IceShardIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L1.5 10.5l3 1.72L12 17l7.5-4.78 3-1.72L12 2zm0 3.47L18.53 10.5 12 14.53 5.47 10.5 12 5.47zM4.5 13.13l3 1.72V18l-3-1.72v-3.15zm15 0v3.15L16.5 18v-3.15l3-1.72z"/>
  </svg>
);

export const LightningBoltIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
  </svg>
);

export const HealIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 13h-3v3h-2v-3H8v-2h3V8h2v3h3v2z"/>
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
  </svg>
);

export const SwordSlashIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14.121 2.869l-1.414 1.414L15.586 7H4v2h11.586l-2.879 2.879 1.414 1.414L20.414 8l-6.293-5.131zM4 15h10v2H4v-2z"/>
  </svg>
);

export const PoisonCloudIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15H11v-2h2v2zm0-4H11V7h2v6z"/>
  </svg>
);

export const ArcaneBlastIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3c-1.96 0-3.73.82-4.95 2.18L5.28 6.8A8.93 8.93 0 0 0 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9a8.93 8.93 0 0 0-2.28-5.2l-1.77-1.62A6.96 6.96 0 0 0 12 3zm0 2c1.1 0 2.11.46 2.83 1.21l-1.42 1.42C13.15 7.38 12.6 7.2 12 7.2s-1.15.18-1.41.43L9.17 6.21C9.89 5.46 10.9 5 12 5zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

export const ShadowBoltIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.67 0-4.96-1.63-5.88-3.91l1.7-.66c.67 1.59 2.21 2.57 3.98 2.57s3.31-.98 3.98-2.57l1.7.66C16.96 15.37 14.67 17 12 17zm4.24-7.46c-.09-.24-.2-.47-.31-.69L12 5.54l-3.93 3.31c-.11.22-.22.45-.31.69C7.17 10.65 7 11.54 7 12.5c0 2.76 2.24 5 5 5s5-2.24 5-5c0-.96-.17-1.85-.76-2.46z"/>
  </svg>
);

export const HolyLightIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z"/>
    <path d="M12 5.5c-3.03 0-5.5 2.47-5.5 5.5s2.47 5.5 5.5 5.5 5.5-2.47 5.5-5.5-2.47-5.5-5.5-5.5zm0 9a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/>
    <circle cx="12" cy="12" r="2.5"/>
  </svg>
);

export const BookIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const ScrollIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm0 0l2.602-3.828m0 0l-5.454-2.138 2.602-3.828m0 0L9.27 2.75l2.51 2.225M7.5 21l3.182-6.364M5.636 5.636L9.27 2.75m0 0L13.684 1.5l2.287 2.25.133.044m6.42 5.941l-2.602 3.828m0 0l-5.454 2.138 2.602 3.828m0 0L14.73 21.25l-2.51-2.225m2.51-2.225l5.227-7.917-3.286.672-2.602 3.828z" />
</svg>
);

export const StarIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.418a.562.562 0 01.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.652 0l-4.725 2.885a.562.562 0 01-.84-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988h5.418a.563.563 0 00.475-.31L11.48 3.5z" />
  </svg>
);


export const UnknownIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const SwordsIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 21L3 17.25V15H2.25V12H3V9.75L6.75 6H11.25l1.125-3H15L16.125 6H20.25l3.75 3.75V12H21v3h.75v2.25L17.25 21H12.75l-1.125-3H9L7.875 21H6.75zM16.5 9.75L15 11.25 13.5 9.75V6h3v3.75zM7.5 9.75L9 11.25 10.5 9.75V6h-3v3.75z" />
</svg>
);

export const WandIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.543L9.457 20.677a2.625 2.625 0 01-3.712-3.712L11.888 10.82a11.223 11.223 0 013.702 3.723z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M14.176 8.823L12 6.646l-4.95 4.95a2.625 2.625 0 000 3.712l.177.177 4.95-4.95 2.176-2.177a1.876 1.876 0 00-.102-3.058l-1.928-1.001a1.875 1.875 0 00-2.333.575l-.906.906M19.5 7.5c0 1.381-1.119 2.5-2.5 2.5S14.5 8.881 14.5 7.5 15.619 5 17 5s2.5 1.119 2.5 2.5z" />
</svg>
);

export const SkullIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a5.25 5.25 0 015.25 5.25H6.75a5.25 5.25 0 015.25-5.25zm0 0V4.5m0 2.25c-1.03 0-1.9.691-2.178 1.619M12 6.75c1.03 0 1.9.691 2.178 1.619m0 0A5.23 5.23 0 0116.5 12H7.5a5.23 5.23 0 012.322-3.631M15 12a3 3 0 01-6 0m6 0H9m3.75 3.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM12.75 12.75V15S12 15.75 11.25 15.75 10.5 15 10.5 15v-2.25m2.25 0H10.5m2.25 0a.375.375 0 00-.375-.375H12a.375.375 0 00-.375.375m.75 0V15m-3 0V12.75m0 .375a.375.375 0 01.375-.375H12A.375.375 0 0112.375 12.75m0 0V15m0 0v2.25A2.25 2.25 0 0014.25 19.5h-1.5M12 4.5A5.25 5.25 0 006.75 9.75v.048c0 .087.01.173.023.258M9.75 15.75A2.25 2.25 0 017.5 13.5V12c0-2.899 2.351-5.25 5.25-5.25s5.25 2.351 5.25 5.25v1.5a2.25 2.25 0 01-2.25 2.25h-3m-3.707-3.707A5.25 5.25 0 0112 6.75v0M12 6.75a5.25 5.25 0 00-5.25 5.25m10.5 0a5.25 5.25 0 01-5.25 5.25m0 0a5.25 5.25 0 01-5.25-5.25m5.25 5.25V18" />
  </svg>
);

export const StatusPoisonIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V6.75a.75.75 0 011.5 0v7.19l1.72-1.72a.75.75 0 111.06 1.06l-3 3zM8.016 3.25A2.25 2.25 0 005.75 5.516v2.198c0 .513.188 1 .53 1.343l.796.797a2.25 2.25 0 003.182 0l.796-.797a1.75 1.75 0 00.53-1.343V5.516A2.25 2.25 0 008.016 3.25zm0 1.5c.14 0 .274.026.398.078A.75.75 0 019.25 5.516v2.198a.25.25 0 01-.075.177L8.38 8.687a.75.75 0 01-1.06 0l-.796-.796A.25.25 0 016.25 7.714V5.516a.75.75 0 01.838-.738A.752.752 0 018.015 4.75zM15.985 3.25A2.25 2.25 0 0013.75 5.516v2.198c0 .513.188 1 .53 1.343l.796.797a2.25 2.25 0 003.182 0l.796-.797a1.75 1.75 0 00.53-1.343V5.516A2.25 2.25 0 0015.985 3.25zm0 1.5c.14 0 .274.026.398.078A.75.75 0 0117.25 5.516v2.198a.25.25 0 01-.075.177l-.796.796a.75.75 0 01-1.06 0l-.796-.796A.25.25 0 0114.25 7.714V5.516a.75.75 0 01.838-.738.752.752 0 01.897-.028z" clipRule="evenodd" />
  </svg>
);


export const StatusStunIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M11.102 3.003a.75.75 0 01.796.001 10.452 10.452 0 014.334 2.145c.368.301.691.633.966.992a.75.75 0 01-.877 1.206A9.017 9.017 0 0015.05 5.28a8.954 8.954 0 00-3.841-1.516.75.75 0 01-.107-1.488zM17.628 6.323a.75.75 0 01.877-1.206 10.452 10.452 0 012.145 4.334c.09.378.134.766.131 1.155a.75.75 0 01-1.499.107 8.952 8.952 0 00-.113-.991 8.954 8.954 0 00-1.516-3.841zM3.645 11.102a.75.75 0 01.107 1.499 8.952 8.952 0 00.113.991 8.954 8.954 0 001.516 3.841.75.75 0 01-.877 1.206A10.452 10.452 0 012.355 14.3c-.301-.368-.633-.691-.992-.966a.75.75 0 011.206-.877c.23.188.45.388.66.6.21.212.43.412.66.6zM12.898 20.997a.75.75 0 01-.796-.001 10.452 10.452 0 01-4.334-2.145c-.368-.301-.691-.633-.966-.992a.75.75 0 01.877-1.206 9.017 9.017 0 001.273 2.067 8.954 8.954 0 003.841 1.516.75.75 0 01.107 1.488zM6.372 17.677a.75.75 0 01-.877 1.206A10.452 10.452 0 013.35 14.55a10.403 10.403 0 01-.13-1.155.75.75 0 011.5-.107 8.952 8.952 0 00.113.991 8.954 8.954 0 001.516 3.841zM20.355 12.898a.75.75 0 01-.107-1.499 8.952 8.952 0 00-.113-.991 8.954 8.954 0 00-1.516-3.841.75.75 0 11.877-1.206 10.452 10.452 0 012.145 4.334c.09.378.134.766.131 1.155a.75.75 0 01-1.499.107 8.952 8.952 0 00.113-.991 8.954 8.954 0 00-1.516-3.841zM10.56 10.56a.75.75 0 011.063.063l2.437 3.25a.75.75 0 01-.937 1.188l-1.563-2.083v4.5a.75.75 0 01-1.5 0v-4.5L8.437 15.06a.75.75 0 01-.937-1.188l2.438-3.25a.75.75 0 01.625-.062zM8.437 8.94a.75.75 0 01.938-1.188l1.563 2.084V5.336a.75.75 0 011.5 0v4.5l1.563-2.083a.75.75 0 01.937 1.188l-2.437 3.25a.75.75 0 01-1.063-.063L8.437 8.94z" clipRule="evenodd" />
  </svg>
);

export const GemIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

export const PlantIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zM7 18V6h10v12H7zm4-14c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
  </svg>
);

export const DustIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.5 16.5c-.59 0-1.14.16-1.62.43L12 10.9V7.5c0-1.11-.9-2-2-2s-2 .89-2 2v3.4l-6.88 6.43c-.48-.27-1.03-.43-1.62-.43C2.02 16.5 1 17.52 1 18.75S2.02 21 3.25 21s2.25-1.02 2.25-2.25c0-.59-.16-1.14-.43-1.62L9 13.19V9.5c0-.28.22-.5.5-.5s.5.22.5.5v3.69l4.19 3.94c-.27.48-.43 1.03-.43 1.62 0 1.23 1.02 2.25 2.25 2.25s2.25-1.02 2.25-2.25c0-.59-.16-1.14-.43-1.62L18.95 16H19c1.1 0 2-.9 2-2s-.9-2-2-2h-.5zm-15 0c-.59 0-1.14.16-1.62.43L7 13.19V9.5c0-.28.22-.5.5-.5s.5.22.5.5v3.69l3.12 2.93c-.27.48-.43 1.03-.43 1.62 0 1.23 1.02 2.25 2.25 2.25s2.25-1.02 2.25-2.25c0-.59-.16-1.14-.43-1.62L12 10.9V7.5c0-1.11-.9-2-2-2s-2 .89-2 2v3.4L3.12 16.93c-.27.48-.43 1.03-.43 1.62 0 1.23 1.02 2.25 2.25 2.25s2.25-1.02 2.25-2.25c0-.59-.16-1.14-.43-1.62z"/>
  </svg>
);

export const ThreadIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9.43 15.83L4.17 11.57l1.41-1.41L11 14.17l-1.57 1.66M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h8v-2h-8c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8v8h2v-8c0-5.52-4.48-10-10-10zm5.83 12.43l-1.66 1.57L12 11.83l1.57-1.66 4.26 4.26z"/>
  </svg>
);

export const PotionHpIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 3.07C12.13 2.4 11.63 2 11 2c-1.66 0-3 1.34-3 3v1H5v2h3v10c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V9h3V7h-3V6c0-1.66-1.34-3-3-3-.37 0-.7.07-1 .2V3.07zM11 18H9V9h2v9zm2-5h-2V9h2v4z"/>
  </svg>
);

export const PotionMpIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 3.07C12.13 2.4 11.63 2 11 2c-1.66 0-3 1.34-3 3v1H5v2h3v10c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V9h3V7h-3V6c0-1.66-1.34-3-3-3-.37 0-.7.07-1 .2V3.07zM11 18H9V9h2v9zm2-3h-2V9h2v6z"/>
  </svg>
);

export const PotionGenericIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 3.07C12.13 2.4 11.63 2 11 2c-1.66 0-3 1.34-3 3v1H5v2h3v10c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V9h3V7h-3V6c0-1.66-1.34-3-3-3-.37 0-.7.07-1 .2V3.07zM12 16c-.83 0-1.5-.67-1.5-1.5S11.17 13 12 13s1.5.67 1.5 1.5S12.83 16 12 16z"/>
  </svg>
);

export const SwordHiltIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18 2l-5 5h3v4h-3l5 5L23 11v- proteína-4h-3L18 2zM6 22l5-5H8v-4h3l-5-5L1 13v4h3l-2 5h4zM14.5 10c-.83 0-1.5-.67-1.5-1.5S13.67 7 14.5 7s1.5.67 1.5 1.5S15.33 10 14.5 10zm-5 0c-.83 0-1.5-.67-1.5-1.5S8.67 7 9.5 7s1.5.67 1.5 1.5S10.33 10 9.5 10z"/>
  </svg>
);

export const BreastplateIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 1L3 5v7c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5L12 1zm0 2.24L19 6.3V12c0 3.96-2.98 7.65-7 8.73V4.24zM5 6.3L12 4.24v16.49C7.98 19.65 5 15.96 5 12V6.3zM12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
  </svg>
);

export const AmuletIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-3-8.5c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5zM12 13c.83 0 1.5-.67 1.5-1.5S12.83 10 12 10s-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/>
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export const HeroBackIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
 </svg>
);


export const BagIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export const GearIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.486a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 1.655c.007.379.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.485c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.486a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 010-1.655c-.007-.379-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.485c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const MindIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75c.062.062.062.164 0 .226l-1.293 1.293c-.062.062-.164.062-.226 0L5.293 6.976c-.062-.062-.062-.164 0-.226l1.293-1.293c.062-.062.164-.062.226 0L8.25 6.75zM10.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a8.25 8.25 0 008.25-8.25c0-4.555-3.695-8.25-8.25-8.25S3.75 8.195 3.75 12.75A8.25 8.25 0 0012 21zm0-13.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0112 7.5zM14.25 11.25c.062.062.062.164 0 .226l-1.293 1.293c-.062.062-.164.062-.226 0L11.293 11.476c-.062-.062-.062-.164 0-.226l1.293-1.293c.062-.062.164-.062.226 0L14.25 11.25zM16.5 13.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25c.062.062.062.164 0 .226l-1.293 1.293c-.062.062-.164.062-.226 0L12.793 17.476c-.062-.062-.062-.164 0-.226l1.293-1.293c.062-.062.164-.062.226 0L15.75 17.25zM8.25 15.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

export const BodyIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h9M12 7.5v9" />
    </svg>
);
  
export const ReflexIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6H18v2.25M15.75 18H18v-2.25M8.25 6H6v2.25M8.25 18H6v-2.25" />
    </svg>
);

export const SpeedIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <LightningBoltIcon className={className} />
);


export const CheckmarkCircleIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const FilterListIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 12h9.75m-9.75 6h9.75M3.75 6H7.5m3 6H7.5m3 6H7.5m-3.75 0h.008v.008H3.75v-.008zm0-6h.008v.008H3.75v-.008zm0-6h.008v.008H3.75v-.008z" />
  </svg>
);

export const SortAlphaIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m10.5-3.75L14.25 21m0 0L10.5 17.25m3.75 3.75V3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.75H10.5" />
  </svg>
);

// New Icons for Equipment Slots
export const HelmetIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25S15.25 15 12 15s-3.75 2.25-3.75 2.25M9 12.75s.636-1.286 3-1.286c2.364 0 3 1.286 3 1.286M12 12v2.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM5.25 9.75A6.75 6.75 0 0112 3a6.75 6.75 0 016.75 6.75c0 1.867-.753 3.568-1.979 4.82L12 21l-4.771-6.43A6.728 6.728 0 015.25 9.75z" />
  </svg>
);
export const NecklaceIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => ( <AmuletIcon className={className} /> ); // Reuse Amulet
export const RingIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => ( <GemIcon className={className} /> ); // Reuse Gem
export const BeltIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5h10.5a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-3A2.25 2.25 0 016.75 7.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 7.5V6a2.25 2.25 0 012.25-2.25h.01A2.25 2.25 0 0114.25 6v1.5" />
  </svg>
);
export const BootsIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 13.5L9 12m0 0l1.5-1.5M9 12l-1.5 1.5M9 12l1.5 1.5M7.5 17.25l1.5-1.5M9 15.75L6 12.75v-1.5a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 11.25v1.5L15 15.75M9 15.75l1.5 1.5M13.5 13.5L15 12m0 0l-1.5-1.5m1.5 1.5l1.5 1.5m-1.5-1.5l-1.5 1.5M13.5 17.25l-1.5-1.5M15 15.75l3-3v-1.5A2.25 2.25 0 0015.75 9h-7.5A2.25 2.25 0 006 11.25v1.5l3 3M9 21h6" />
  </svg>
);
export const GlovesIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m0-4.875c-.208-.133-.433-.244-.67-.333a7.454 7.454 0 00-2.9-.495h-2.86c-.98 0-1.911.386-2.602 1.076-.69.69-.945 1.621-.714 2.496a13.43 13.43 0 003.318 4.002 12.088 12.088 0 007.33 2.883c.728.094 1.426-.222 1.857-.791.43-.569.496-1.33.15-1.942a11.39 11.39 0 00-2.83-3.558 11.643 11.643 0 00-3.926-2.33M3.75 9.75h.008v.008H3.75v-.008zm0 0A2.25 2.25 0 016 7.5h1.5V6a2.25 2.25 0 012.25-2.25h4.5A2.25 2.25 0 0116.5 6v1.5h1.5a2.25 2.25 0 012.25 2.25v1.5" />
  </svg>
);
export const ShoulderArmorIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => ( <ShieldIcon className={className} /> ); // Reuse Shield
export const CloakIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75A2.25 2.25 0 005.25 6v13.5a2.25 2.25 0 002.25 2.25h9.75a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H15M12 12.75h.008v.008H12v-.008zm0-2.25h.008v.008H12V10.5zm0 4.5h.008v.008H12v-.008zm0 2.25h.008V19.5H12V17.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75C7.5 5.121 8.828 6.25 10.5 6.25S13.5 5.121 13.5 3.75M10.5 6.25V21" />
  </svg>
);
export const BackpackIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => ( <BagIcon className={className} /> ); // Reuse Bag

export const Bars3Icon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

export const CollectionIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const FleeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 3.75zM7.5 6.375a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zM12 15.75a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM7.5 18.375a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zM4.875 8.25a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.625a.75.75 0 01-.75-.75zm0 7.5a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.625a.75.75 0 01-.75-.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.375 2.25L18 4.875M18.75 15.375L16.125 18M8.625 2.25L6 4.875M5.25 15.375L7.875 18" />
  </svg>
);

// --- Icons for CampView ---
export const SunIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

export const ArrowUturnLeftIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

export const UserGroupIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.94-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const ArchiveBoxIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 3H20.25M3.75 3H3.75C2.784 3 2.003 3.785 2.003 4.755V14.25c0 .97.781 1.755 1.747 1.755h16.5c.966 0 1.747-.785 1.747-1.755V4.755c0-.97-.781-1.755-1.747-1.755H3.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3M10.5 9h3M10.5 12h3" />
  </svg>
);
// --- End Icons for CampView ---

export const GetSpellIcon: React.FC<{ iconName?: SpellIconName, className?: string }> = ({ iconName, className }) => {
  switch (iconName) {
    case 'Fireball': return <FireballIcon className={className} />;
    case 'IceShard': return <IceShardIcon className={className} />;
    case 'LightningBolt': return <LightningBoltIcon className={className} />;
    case 'Heal': return <HealIcon className={className} />;
    case 'Shield': return <ShieldIcon className={className} />;
    case 'SwordSlash': return <SwordSlashIcon className={className} />;
    case 'PoisonCloud': return <PoisonCloudIcon className={className} />;
    case 'ArcaneBlast': return <ArcaneBlastIcon className={className} />;
    case 'ShadowBolt': return <ShadowBoltIcon className={className} />;
    case 'HolyLight': return <HolyLightIcon className={className} />;
    case 'Book': return <BookIcon className={className} />;
    case 'Scroll': return <ScrollIcon className={className} />;
    case 'Star': return <StarIcon className={className} />;
    case 'StatusPoison': return <StatusPoisonIcon className={className} />;
    case 'StatusStun': return <StatusStunIcon className={className} />;
    case 'Gem': return <GemIcon className={className} />;
    case 'Plant': return <PlantIcon className={className} />;
    case 'Dust': return <DustIcon className={className} />;
    case 'Thread': return <ThreadIcon className={className} />;
    case 'PotionHP': return <PotionHpIcon className={className} />;
    case 'PotionMP': return <PotionMpIcon className={className} />;
    case 'PotionGeneric': return <PotionGenericIcon className={className} />;
    case 'SwordHilt': return <SwordHiltIcon className={className} />;
    case 'Breastplate': return <BreastplateIcon className={className} />;
    case 'Amulet': return <AmuletIcon className={className} />;
    case 'WandIcon': return <WandIcon className={className} />;
    case 'UserIcon': return <UserIcon className={className} />;
    case 'HeroBackIcon': return <HeroBackIcon className={className} />;
    case 'BagIcon': return <BagIcon className={className} />;
    case 'GearIcon': return <GearIcon className={className} />;
    case 'MindIcon': return <MindIcon className={className}/>;
    case 'BodyIcon': return <BodyIcon className={className}/>;
    case 'ReflexIcon': return <ReflexIcon className={className}/>;
    case 'SpeedIcon': return <SpeedIcon className={className}/>;
    case 'CheckmarkCircleIcon': return <CheckmarkCircleIcon className={className} />;
    case 'FilterListIcon': return <FilterListIcon className={className} />;
    case 'SortAlphaIcon': return <SortAlphaIcon className={className} />;
    case 'SkullIcon': return <SkullIcon className={className} />;
    case 'HelmetIcon': return <HelmetIcon className={className} />;
    case 'NecklaceIcon': return <NecklaceIcon className={className} />;
    case 'RingIcon': return <RingIcon className={className} />;
    case 'BeltIcon': return <BeltIcon className={className} />;
    case 'BootsIcon': return <BootsIcon className={className} />;
    case 'GlovesIcon': return <GlovesIcon className={className} />;
    case 'ShoulderArmorIcon': return <ShoulderArmorIcon className={className} />;
    case 'CloakIcon': return <CloakIcon className={className} />;
    case 'BackpackIcon': return <BackpackIcon className={className} />;
    case 'Bars3Icon': return <Bars3Icon className={className} />;
    case 'SearchIcon': return <SearchIcon className={className} />;
    case 'CollectionIcon': return <CollectionIcon className={className} />;
    case 'FleeIcon': return <FleeIcon className={className} />;
    case 'SunIcon': return <SunIcon className={className} />;
    case 'MoonIcon': return <MoonIcon className={className} />;
    case 'ArrowUturnLeftIcon': return <ArrowUturnLeftIcon className={className} />;
    case 'UserGroupIcon': return <UserGroupIcon className={className} />;
    case 'BookOpenIcon': return <BookOpenIcon className={className} />;
    case 'Default':
    default: return <UnknownIcon className={className} />;
  }
};

export const SparklesIcon: React.FC<IconProps> = ({ className = "w-5 h-5", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} {...props}>
    <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1h1a1 1 0 010 2H4v1a1 1 0 001 1h2a1 1 0 011 1v2a1 1 0 001 1h1a1 1 0 001-1V9a1 1 0 011-1h2a1 1 0 001-1V6h-1a1 1 0 110-2h1a1 1 0 001-1V3a1 1 0 00-1-1H5zM2 5a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V5zm3-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" />
    <path d="M10 7.25a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0V8a.75.75 0 01.75-.75zM12.25 10a.75.75 0 000-1.5H9.75a.75.75 0 000 1.5h2.5z" />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className = "w-6 h-6", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);