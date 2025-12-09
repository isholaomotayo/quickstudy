import React from "react";

interface AskTutorisButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const AskTutorisButton: React.FC<AskTutorisButtonProps> = ({
  onClick,
  children,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 
        bg-gray-800 text-white border-none rounded-md 
        text-sm font-medium cursor-pointer 
        transition-all duration-200 ease-in-out
        shadow-md hover:bg-gray-700 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </button>
  );
};
