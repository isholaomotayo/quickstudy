import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";

import { AskTutorisButton } from "./tutoris.styles";
import { useTextSelectionToAskTutoris } from "./hooks/use-text-selection-to-ask-tutoris";

interface AskTutorisSelectableTextProps {
  children: React.ReactNode;
  onAskTutoris: (selectedText: string, context: string) => void;
  highlightColor?: string; // Custom highlight color
}

export const TUTORIS_IDS = {
  CONTAINER: "ask-tutoris-selectable-text-container",
  BUTTON_CONTAINER: "ask-tutoris-button-container",
  BUTTON: "ask-tutoris-button",
};

const createButtonContainer = (parent: HTMLElement | null) => {
  if (!parent) return;
  removeButtonContainer();

  const container = document.createElement("div");
  container.id = TUTORIS_IDS.BUTTON_CONTAINER;
  container.setAttribute("data-testid", TUTORIS_IDS.BUTTON_CONTAINER);
  parent.append(container);
  return container;
};

const removeButtonContainer = () => {
  const container = document.getElementById(TUTORIS_IDS.BUTTON_CONTAINER);
  if (container) {
    container.remove();
  }
};

export const AskTutorisSelectableText: React.FC<
  AskTutorisSelectableTextProps
> = ({
  children,
  onAskTutoris,
  highlightColor = "#dcfce7", // Default light green color
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const { selectedText, clearSelection } = useTextSelectionToAskTutoris(
    ref.current,
    highlightColor
  );

  const [buttonContainer, setButtonContainer] = useState<Element | null>(null);

  useEffect(() => {
    const container = createButtonContainer(ref.current);
    setButtonContainer(container ?? null);

    return () => {
      removeButtonContainer();
      setButtonContainer(null);
    };
  }, []);

  const buttonElement = selectedText && selectedText.text && (
    <div
      style={{
        position: "fixed",
        left: selectedText.x,
        top: selectedText.y,
        transform: "translate(-50%, -100%)",
        zIndex: 1000,
      }}
    >
      <AskTutorisButton
        onClick={() => {
          onAskTutoris(selectedText.text, selectedText.context);
          clearSelection();
        }}
        data-testid={TUTORIS_IDS.BUTTON}
      >
        <Sparkles className="h-4 w-4" />
        <span>Ask Tutoris</span>
      </AskTutorisButton>
    </div>
  );

  return (
    <>
      <div ref={ref} data-testid={TUTORIS_IDS.CONTAINER}>
        {children}
      </div>
      {buttonElement &&
        buttonContainer &&
        createPortal(buttonElement, buttonContainer)}
    </>
  );
};
