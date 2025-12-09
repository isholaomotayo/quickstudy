import { useCallback, useState, useEffect } from 'react';

type SelectedTextContext = {
  selectedText: string;
  fullContext: string;
};

type TextPosition = {
  text: string;
  x: number;
  y: number;
  context: string;
};

// Helper function to extract text with context
const extractTextWithContext = (htmlDivElement: HTMLDivElement, range: Range): SelectedTextContext | null => {
  try {
    const selectedText = range.toString().trim();
    if (!selectedText || selectedText.length < 3) {
      return null;
    }

    // Get the full context from the container
    const fullContext = htmlDivElement.textContent || '';
    
    return {
      selectedText,
      fullContext,
    };
  } catch (error) {
    console.error('Error extracting text with context:', error);
    return null;
  }
};

// Helper function to highlight selected text with custom color
const highlightSelectedText = (range: Range, highlightColor: string = '#dcfce7') => {
  try {
    // Create a span element to wrap the selected text
    const span = document.createElement('span');
    span.style.backgroundColor = highlightColor;
    span.style.borderRadius = '3px';
    span.style.padding = '2px 3px';
    span.style.boxShadow = '0 0 0 1px rgba(34, 197, 94, 0.2)';
    span.style.transition = 'all 0.2s ease';
    span.className = 'tutoris-text-highlight';
    
    // Extract the range content and wrap it in the span
    range.surroundContents(span);
    
    return span;
  } catch (error) {
    console.error('Error highlighting text:', error);
    return null;
  }
};

// Helper function to remove highlighting
const removeHighlighting = (container: HTMLDivElement) => {
  try {
    const highlightedSpans = container.querySelectorAll('.tutoris-text-highlight');
    highlightedSpans.forEach((span) => {
      const parent = span.parentNode;
      if (parent) {
        // Replace the span with its text content
        parent.replaceChild(document.createTextNode(span.textContent || ''), span);
        parent.normalize(); // Merge adjacent text nodes
      }
    });
  } catch (error) {
    console.error('Error removing highlighting:', error);
  }
};

export const useTextSelectionToAskTutoris = (htmlDivElement: HTMLDivElement | null, highlightColor: string = '#dcfce7') => {
  const [selectedTextState, setSelectedTextState] = useState<TextPosition | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedTextState(null);
    
    // Remove highlighting
    if (htmlDivElement && highlightedElement) {
      removeHighlighting(htmlDivElement);
      setHighlightedElement(null);
    }
    
    window.getSelection()?.removeAllRanges();
  }, [htmlDivElement, highlightedElement]);

  const onSelectStart = useCallback(() => {
    setSelectedTextState(null);
    
    // Remove any existing highlighting when starting a new selection
    if (htmlDivElement && highlightedElement) {
      removeHighlighting(htmlDivElement);
      setHighlightedElement(null);
    }
  }, [htmlDivElement, highlightedElement]);

  const onSelectEnd = useCallback(() => {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
      clearSelection();
      return;
    }

    if (!htmlDivElement) {
      clearSelection();
      return;
    }

    if (!selection.rangeCount) {
      return;
    }

    let range: Range | null = null;
    let context: SelectedTextContext | null = null;

    try {
      range = selection.getRangeAt(0);
      context = extractTextWithContext(htmlDivElement, range);
      if (!context) return;
    } catch (error) {
      console.error('Error in text selection:', error);
      return;
    }

    const { selectedText, fullContext } = context;
    const rect = range.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 50; // Position above selection

    // Highlight the selected text with custom color
    const highlightedSpan = highlightSelectedText(range, highlightColor);
    if (highlightedSpan) {
      setHighlightedElement(highlightedSpan);
    }

    setSelectedTextState({
      text: selectedText,
      x,
      y,
      context: fullContext,
    });
  }, [clearSelection, htmlDivElement, highlightColor]);

  const onSelectedTextClick = useCallback(
    (e: MouseEvent) => {
      // context menu is opened when right-clicking
      if (e.button === 2) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        clearSelection();
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          clearSelection();
        }
      } catch (error) {
        console.error('Error in selected text click:', error);
      }
    },
    [clearSelection],
  );

  // Set up event listeners
  useEffect(() => {
    if (!htmlDivElement) return;

    const container = htmlDivElement;

    // Storing the selected text in state
    container.addEventListener('selectstart', onSelectStart);

    // This is necessary to handle the case where the user selects text and then drags the mouse outside the container
    const handleGlobalMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || !htmlDivElement || !selection.rangeCount) return;

      try {
        const range = selection.getRangeAt(0);
        const containerRange = document.createRange();
        containerRange.selectNode(htmlDivElement);

        // Check if both the start and end containers are within our container
        const isStartInContainer = container.contains(range.startContainer);
        const isEndInContainer = container.contains(range.endContainer);

        if (selection.toString() && isStartInContainer && isEndInContainer) {
          onSelectEnd();
        }
      } catch (error) {
        console.error('Error in global mouse up:', error);
        clearSelection();
      }
    };

    // Hiding the button when clicking in the selected text
    container.addEventListener('mousedown', onSelectedTextClick);

    document.addEventListener('mouseup', handleGlobalMouseUp);

    // Handle clicks outside container
    const handleOutsideClick = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        clearSelection();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    const handleSelectionChange = () => {
      if (selectedTextState && selectedTextState.text) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.toString() === '') {
          clearSelection();
        }
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      container.removeEventListener('selectstart', onSelectStart);
      container.removeEventListener('mousedown', onSelectedTextClick);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [onSelectEnd, onSelectStart, onSelectedTextClick, clearSelection, selectedTextState, htmlDivElement]);

  return {
    selectedText: selectedTextState,
    clearSelection,
  };
};
