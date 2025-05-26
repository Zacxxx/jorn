import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => (
  <div className="p-0" role="alert">
    <p className="font-bold">Oops! Something went wrong.</p>
    <p>{message}</p>
  </div>
);
