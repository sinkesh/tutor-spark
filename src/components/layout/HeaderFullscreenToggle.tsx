import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function getFullscreenElement(doc: FullscreenDocument) {
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export default function HeaderFullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const syncFullscreenState = () => {
      const doc = document as FullscreenDocument;
      setIsFullscreen(Boolean(getFullscreenElement(doc)));
    };

    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("webkitfullscreenchange", syncFullscreenState as EventListener);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      document.removeEventListener("webkitfullscreenchange", syncFullscreenState as EventListener);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (typeof document === "undefined") {
      return;
    }

    const doc = document as FullscreenDocument;
    const rootElement = document.documentElement as FullscreenElement;

    try {
      if (getFullscreenElement(doc)) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
          return;
        }

        await doc.webkitExitFullscreen?.();
        return;
      }

      if (rootElement.requestFullscreen) {
        await rootElement.requestFullscreen();
        return;
      }

      await rootElement.webkitRequestFullscreen?.();
    } catch (error) {
      console.error("Failed to toggle fullscreen:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFullscreen}
      className="header-action"
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </Button>
  );
}
