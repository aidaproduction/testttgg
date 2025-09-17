import { useState } from "react";
import { Toolbar } from "./Toolbar";
import { Sidebar } from "./Sidebar";
import { Viewport } from "./Viewport";
import { SpriteDialog } from "./SpriteDialog";
import { GridPanel } from "./GridPanel";

export interface GameObject {
  id: string;
  name: string;
  type: "sprite";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation?: number;
  scale?: { x: number; y: number };
  texture?: string;
  components?: GameComponent[];
  visible?: boolean;
  zIndex?: number;
  imageQuality?: number;
}

export interface GameComponent {
  id: string;
  type: 'rigidbody' | 'boxCollider' | 'script' | 'visualScript';
  name: string;
  enabled: boolean;
  properties?: Record<string, any>;
}

export interface EngineState {
  isPlaying: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  selectedObject: GameObject | null;
  objects: GameObject[];
  zoom: number;
  panX: number;
  panY: number;
}

export const GameEngine = () => {
  const [engineState, setEngineState] = useState<EngineState>({
    isPlaying: false,
    showGrid: true,
    snapToGrid: true,
    selectedObject: null,
    objects: [],
    zoom: 1,
    panX: 0,
    panY: 0,
  });

  const [showSpriteDialog, setShowSpriteDialog] = useState(false);
  const [showGridPanel, setShowGridPanel] = useState(false);

  const handlePlay = () => {
    setEngineState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleCreateSprite = () => {
    setShowSpriteDialog(true);
  };

  const handleSpriteCreated = (sprite: GameObject) => {
    setEngineState(prev => ({
      ...prev,
      objects: [...prev.objects, sprite]
    }));
    setShowSpriteDialog(false);
  };

  const handleObjectSelect = (object: GameObject | null) => {
    setEngineState(prev => ({ ...prev, selectedObject: object }));
  };

  const handleObjectUpdate = (updatedObject: GameObject) => {
    setEngineState(prev => ({
      ...prev,
      objects: prev.objects.map(obj => 
        obj.id === updatedObject.id ? updatedObject : obj
      ),
      selectedObject: updatedObject
    }));
  };

  const handleObjectDelete = (objectId: string) => {
    setEngineState(prev => ({
      ...prev,
      objects: prev.objects.filter(obj => obj.id !== objectId),
      selectedObject: prev.selectedObject?.id === objectId ? null : prev.selectedObject
    }));
  };

  const handleViewportChange = (changes: Partial<Pick<EngineState, 'zoom' | 'panX' | 'panY'>>) => {
    setEngineState(prev => ({ ...prev, ...changes }));
  };

  const handleGridToggle = () => {
    setEngineState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  };

  const handleSnapToggle = () => {
    setEngineState(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }));
  };

  const handleGridPanelToggle = () => {
    setShowGridPanel(!showGridPanel);
  };

  return (
    <div className="h-screen bg-engine-bg text-foreground overflow-hidden">
      {/* Top Toolbar */}
      {!engineState.isPlaying && (
        <Toolbar 
          isPlaying={engineState.isPlaying}
          showGrid={engineState.showGrid}
          snapToGrid={engineState.snapToGrid}
          onPlay={handlePlay}
          onCreateSprite={handleCreateSprite}
          onGridToggle={handleGridToggle}
          onSnapToggle={handleSnapToggle}
          onGridPanelToggle={handleGridPanelToggle}
          showGridPanel={showGridPanel}
          onViewportReset={() => handleViewportChange({ zoom: 1, panX: 0, panY: 0 })}
        />
      )}
      
      {/* Play Mode Toolbar - minimal */}
      {engineState.isPlaying && (
        <div className="h-16 bg-engine-toolbar border-b border-border flex items-center px-4">
          <button
            onClick={handlePlay}
            className="bg-engine-panel hover:bg-engine-panel-hover rounded p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao Editor
          </button>
        </div>
      )}
      
      {/* Grid Panel - Only in editor mode */}
      {showGridPanel && !engineState.isPlaying && (
        <GridPanel
          showGrid={engineState.showGrid}
          snapToGrid={engineState.snapToGrid}
          onGridToggle={handleGridToggle}
          onSnapToggle={handleSnapToggle}
        />
      )}
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Only in editor mode */}
        {!engineState.isPlaying && (
          <Sidebar 
            objects={engineState.objects}
            selectedObject={engineState.selectedObject}
            onObjectSelect={handleObjectSelect}
            onObjectUpdate={handleObjectUpdate}
            onObjectDelete={handleObjectDelete}
          />
        )}
        
        {/* Viewport */}
        <Viewport 
          engineState={engineState}
          onObjectSelect={handleObjectSelect}
          onObjectUpdate={handleObjectUpdate}
          onViewportChange={handleViewportChange}
        />
      </div>

      {/* Sprite Creation Dialog */}
      <SpriteDialog 
        open={showSpriteDialog}
        onClose={() => setShowSpriteDialog(false)}
        onSpriteCreate={handleSpriteCreated}
      />
    </div>
  );
};