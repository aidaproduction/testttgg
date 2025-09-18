import { useState } from "react";
import { Toolbar, GizmoTool } from "./Toolbar";
import { Sidebar } from "./Sidebar";
import { Viewport } from "./Viewport";
import { SpriteDialog } from "./SpriteDialog";
import { GridPanel } from "./GridPanel";
import { SettingsDialog } from "./SettingsDialog";
import { usePhysics } from "@/hooks/usePhysics";

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
  selectedTool: GizmoTool;
  sceneResolution: number;
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
    selectedTool: 'move',
    sceneResolution: 100,
  });

  const [showSpriteDialog, setShowSpriteDialog] = useState(false);
  const [showGridPanel, setShowGridPanel] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const physics = usePhysics();

  const handlePlay = async () => {
    if (!engineState.isPlaying) {
      // Initialize physics when entering play mode
      await physics.reset();
      for (const obj of engineState.objects) {
        if (obj.components?.some(c => (c.type === 'rigidbody' || c.type === 'boxCollider') && c.enabled)) {
          await physics.addPhysicsObject(obj, obj.components);
        }
      }
    } else {
      // Clean up physics when exiting play mode
      await physics.reset();
    }
    
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

  const handleViewportChange = (changes: Partial<Pick<EngineState, 'zoom' | 'panX' | 'panY' | 'selectedTool'>>) => {
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

  const handleToolSelect = (tool: GizmoTool) => {
    setEngineState(prev => ({ ...prev, selectedTool: tool }));
  };

  const handleSettingsOpen = () => {
    setShowSettingsDialog(true);
  };

  const handleSceneResolutionChange = (resolution: number) => {
    setEngineState(prev => ({ ...prev, sceneResolution: resolution }));
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
          selectedTool={engineState.selectedTool}
          onToolSelect={handleToolSelect}
          onSettingsOpen={handleSettingsOpen}
        />
      )}
      
      {/* Play Mode: no top bar, only floating back button */}
      {engineState.isPlaying && null}
      
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
      <div className={`flex ${engineState.isPlaying ? 'h-screen' : 'h-[calc(100vh-64px)]'} relative`}>
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
          physics={physics}
        />
        {engineState.isPlaying && (
          <button
            onClick={handlePlay}
            className="absolute top-4 left-4 bg-engine-panel hover:bg-engine-panel-hover border border-border text-foreground/90 rounded px-3 py-1 text-sm shadow"
            title="Voltar ao Editor"
          >
            Voltar
          </button>
        )}
      </div>
 
      {/* Sprite Creation Dialog */}
      <SpriteDialog 
        open={showSpriteDialog}
        onClose={() => setShowSpriteDialog(false)}
        onSpriteCreate={handleSpriteCreated}
      />
      
      {/* Settings Dialog */}
      <SettingsDialog 
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        sceneResolution={engineState.sceneResolution}
        onSceneResolutionChange={handleSceneResolutionChange}
      />
    </div>
  );
};