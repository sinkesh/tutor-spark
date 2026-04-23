import React from 'react';

interface SpeakerIconProps {
  className?: string;
  size?: number;
}

export const SpeakerIcon: React.FC<SpeakerIconProps> = ({ className = "", size = 14 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Speaker cone/circle */}
      <circle
        cx="8"
        cy="12"
        r="3"
        fill="currentColor"
      />
      
      {/* Sound waves */}
      <path
        d="M12 9C12.5 9 13 9.5 13 10.5C13 11.5 12.5 12 12 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      
      <path
        d="M14 7C15 7 16 8 16 10.5C16 13 15 14 14 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      
      <path
        d="M16 5C17.5 5 19 6.5 19 10.5C19 14.5 17.5 16 16 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export const StopIcon: React.FC<SpeakerIconProps> = ({ className = "", size = 14 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circle background */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* X in center */}
      <path
        d="M9 9L15 15M15 9L9 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
