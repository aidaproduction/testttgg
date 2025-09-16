import { Button } from "@/components/ui/button";
import { 
  Move, 
  RotateCw, 
  Maximize2,
  Grid3X3, 
  Plus, 
  Play, 
  Pause,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  isPlaying: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  onPlay: () => void;
  onCreateSprite: () => void;
  onGridToggle: () => void;
  onSnapToggle: () => void;
  onGridPanelToggle: () => void;
  showGridPanel: boolean;
  onViewportReset: () => void;
}

export const Toolbar = ({
  isPlaying,
  showGrid,
  snapToGrid,
  onPlay,
  onCreateSprite,
  onGridToggle,
  onSnapToggle,
  onGridPanelToggle,
  showGridPanel,
  onViewportReset
}: ToolbarProps) => {
  return (
    <div className="h-16 bg-engine-toolbar border-b border-border flex items-center justify-between px-4">
      {/* Left Tools */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-engine-panel rounded-lg p-1">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Move className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "text-muted-foreground hover:text-foreground",
              showGridPanel && "text-primary bg-primary/10"
            )}
            onClick={onGridPanelToggle}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={onViewportReset}
            title="Resetar Viewport"
          >
            <Home className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <Button 
          onClick={onCreateSprite}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Sprite
        </Button>
        
        <Button 
          onClick={onPlay}
          variant="outline"
          className={cn(
            "border-border bg-engine-panel hover:bg-engine-panel-hover",
            isPlaying && "bg-primary/10 border-primary text-primary"
          )}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>
    </div>
  );
};