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
        bg-primary text-primary-foreground border border-border rounded-md 
        text-sm font-medium cursor-pointer 
        transition-all duration-200 ease-in-out
        shadow-md hover:brightness-110 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </button>
  );
};
