import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextSelectionPopupProps {
  selectedText: string;
  position: { x: number; y: number };
  onExplain: (text: string) => void;
  onSummarize: (text: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

export default function TextSelectionPopup({
  selectedText,
  position,
  onExplain,
  onSummarize,
  onClose,
  isVisible
}: TextSelectionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (popupRef.current && isVisible) {
      const popup = popupRef.current;
      const rect = popup.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      // Adjust horizontal position if popup goes off screen
      if (position.x + rect.width > viewportWidth) {
        newX = viewportWidth - rect.width - 10;
      }
      if (position.x < 10) {
        newX = 10;
      }

      // Adjust vertical position if popup goes off screen
      if (position.y + rect.height > viewportHeight) {
        newY = position.y - rect.height - 10;
      }
      if (position.y < 10) {
        newY = 10;
      }

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [position, isVisible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !selectedText.trim()) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      className={cn(
        "fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200",
        "shadow-lg border border-border rounded-lg"
      )}
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      <Card className="p-3 bg-background/95 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex flex-col gap-2 min-w-[180px]">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Text Actions
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onExplain(selectedText)}
              className="flex-1 gap-1 h-8 text-xs"
            >
              <Sparkles className="w-3 h-3" />
              Explain
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSummarize(selectedText)}
              className="flex-1 gap-1 h-8 text-xs"
            >
              <FileText className="w-3 h-3" />
              Summarize
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
