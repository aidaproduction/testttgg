import { useRef, useEffect, useState, useCallback } from "react";
import { GameObject, EngineState } from "./GameEngine";
import { cn } from "@/lib/utils";

interface ViewportProps {
  engineState: EngineState;
  onObjectSelect: (object: GameObject | null) => void;
  onObjectUpdate: (object: GameObject) => void;
  onViewportChange: (changes: Partial<Pick<EngineState, 'zoom' | 'panX' | 'panY'>>) => void;
  physics: any;
}

interface TouchState {
  lastTouchTime: number;
  lastTouchCount: number;
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  initialPinchDistance: number | null;
  initialZoom: number;
  panStartX: number;
  panStartY: number;
}

export const Viewport = ({
  engineState,
  onObjectSelect,
  onObjectUpdate,
  onViewportChange,
  physics
}: ViewportProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchState = useRef<TouchState>({
    lastTouchTime: 0,
    lastTouchCount: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    initialPinchDistance: null,
    initialZoom: 1,
    panStartX: 0,
    panStartY: 0,
  });

  const [draggedObject, setDraggedObject] = useState<GameObject | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Grid size
  const GRID_SIZE = 32;
  
  // Touch interaction state for rotation and scaling
  const [touchInteraction, setTouchInteraction] = useState<{
    mode: 'move' | 'rotate' | 'scale' | null;
    startX: number;
    startY: number;
    startRotation: number;
    startScale: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  // Get touch distance for pinch zoom
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Convert screen coordinates to world coordinates
  const screenToWorld = (screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    const x = (screenX - rect.left - rect.width / 2) / engineState.zoom - engineState.panX;
    const y = (screenY - rect.top - rect.height / 2) / engineState.zoom - engineState.panY;
    
    return { x, y };
  };

  // Find object at world coordinates
  const getObjectAtPosition = (worldX: number, worldY: number): GameObject | null => {
    // Check objects in reverse order (top to bottom)
    for (let i = engineState.objects.length - 1; i >= 0; i--) {
      const obj = engineState.objects[i];
      const objLeft = obj.x - obj.width / 2;
      const objRight = obj.x + obj.width / 2;
      const objTop = obj.y - obj.height / 2;
      const objBottom = obj.y + obj.height / 2;
      
      if (worldX >= objLeft && worldX <= objRight && 
          worldY >= objTop && worldY <= objBottom) {
        return obj;
      }
    }
    return null;
  };

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    // Disable interaction in play mode
    if (engineState.isPlaying) return;
    
    const touches = e.touches;
    const now = Date.now();
    
    if (touches.length === 1) {
      const touch = touches[0];
      const worldPos = screenToWorld(touch.clientX, touch.clientY);
      const hitObject = getObjectAtPosition(worldPos.x, worldPos.y);
      
      // Single tap - select object or interact with selected
      if (hitObject) {
        onObjectSelect(hitObject);
        
        // Determine interaction mode based on selected tool and object area
        if (hitObject === engineState.selectedObject) {
          const objCenterX = hitObject.x;
          const objCenterY = hitObject.y;
          const distanceFromCenter = Math.sqrt(
            Math.pow(worldPos.x - objCenterX, 2) + Math.pow(worldPos.y - objCenterY, 2)
          );
          const objRadius = Math.max(hitObject.width, hitObject.height) / 2;
          
          if (engineState.selectedTool === 'rotate') {
            // Rotation mode - outer area
            setTouchInteraction({
              mode: 'rotate',
              startX: worldPos.x,
              startY: worldPos.y,
              startRotation: hitObject.rotation || 0,
              startScale: hitObject.scale?.x || 1,
              centerX: objCenterX,
              centerY: objCenterY
            });
          } else if (engineState.selectedTool === 'scale') {
            // Scale mode - middle area
            setTouchInteraction({
              mode: 'scale',
              startX: worldPos.x,
              startY: worldPos.y,
              startRotation: hitObject.rotation || 0,
              startScale: hitObject.scale?.x || 1,
              centerX: objCenterX,
              centerY: objCenterY
            });
          } else {
            // Move mode (default)
            setTouchInteraction(null);
            setDraggedObject(hitObject);
            setDragOffset({
              x: worldPos.x - hitObject.x,
              y: worldPos.y - hitObject.y
            });
          }
        }
      } else {
        // Start panning
        onObjectSelect(null);
        touchState.current.panStartX = engineState.panX;
        touchState.current.panStartY = engineState.panY;
        touchState.current.dragStartX = touch.clientX;
        touchState.current.dragStartY = touch.clientY;
      }
      
      touchState.current.isDragging = true;
    } else if (touches.length === 2) {
      // Pinch zoom start
      touchState.current.initialPinchDistance = getTouchDistance(touches);
      touchState.current.initialZoom = engineState.zoom;
    }
    
    touchState.current.lastTouchTime = now;
    touchState.current.lastTouchCount = touches.length;
  }, [engineState, onObjectSelect]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    // Disable interaction in play mode
    if (engineState.isPlaying) return;
    
    const touches = e.touches;
    
    if (touches.length === 1 && touchState.current.isDragging) {
      const touch = touches[0];
      const worldPos = screenToWorld(touch.clientX, touch.clientY);
      
      if (touchInteraction && touchInteraction.mode === 'rotate' && engineState.selectedObject) {
        // Handle rotation
        const angle = Math.atan2(
          worldPos.y - touchInteraction.centerY,
          worldPos.x - touchInteraction.centerX
        );
        const startAngle = Math.atan2(
          touchInteraction.startY - touchInteraction.centerY,
          touchInteraction.startX - touchInteraction.centerX
        );
        const deltaAngle = (angle - startAngle) * (180 / Math.PI);
        const newRotation = touchInteraction.startRotation + deltaAngle;
        
        const updatedObject = { ...engineState.selectedObject, rotation: newRotation };
        onObjectUpdate(updatedObject);
      } else if (touchInteraction && touchInteraction.mode === 'scale' && engineState.selectedObject) {
        // Handle scaling - proportional scaling
        const currentDistance = Math.sqrt(
          Math.pow(worldPos.x - touchInteraction.centerX, 2) + 
          Math.pow(worldPos.y - touchInteraction.centerY, 2)
        );
        const startDistance = Math.sqrt(
          Math.pow(touchInteraction.startX - touchInteraction.centerX, 2) + 
          Math.pow(touchInteraction.startY - touchInteraction.centerY, 2)
        );
        
        if (startDistance > 0) {
          const scaleMultiplier = currentDistance / startDistance;
          const newScale = Math.max(0.1, touchInteraction.startScale * scaleMultiplier);
          
          const updatedObject = { 
            ...engineState.selectedObject, 
            scale: { x: newScale, y: newScale }
          };
          onObjectUpdate(updatedObject);
        }
      } else if (draggedObject) {
        // Drag selected object
        const newX = worldPos.x - dragOffset.x;
        const newY = worldPos.y - dragOffset.y;
        
        // Snap to grid if enabled
        let finalX = newX;
        let finalY = newY;
        
        if (engineState.snapToGrid) {
          finalX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
          finalY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
        }
        
        const updatedObject = { ...draggedObject, x: finalX, y: finalY };
        onObjectUpdate(updatedObject);
        setDraggedObject(updatedObject);
      } else {
        // Pan viewport
        const deltaX = (touch.clientX - touchState.current.dragStartX) / engineState.zoom;
        const deltaY = (touch.clientY - touchState.current.dragStartY) / engineState.zoom;
        
        onViewportChange({
          panX: touchState.current.panStartX + deltaX,
          panY: touchState.current.panStartY + deltaY
        });
      }
    } else if (touches.length === 2 && touchState.current.initialPinchDistance) {
      // Pinch zoom
      const currentDistance = getTouchDistance(touches);
      const scale = currentDistance / touchState.current.initialPinchDistance;
      const newZoom = Math.max(0.25, Math.min(4, touchState.current.initialZoom * scale));
      
      onViewportChange({ zoom: newZoom });
    }
  }, [touchInteraction, draggedObject, dragOffset, engineState, onObjectUpdate, onViewportChange]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    // Disable interaction in play mode
    if (engineState.isPlaying) return;
    
    touchState.current.isDragging = false;
    touchState.current.initialPinchDistance = null;
    setDraggedObject(null);
    setTouchInteraction(null);
  }, [engineState.isPlaying]);

  // Draw functions
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!engineState.showGrid || engineState.isPlaying) return;
    
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)'; // More subtle grid
    ctx.lineWidth = 0.5;
    
    const startX = Math.floor((-engineState.panX - width / 2 / engineState.zoom) / GRID_SIZE) * GRID_SIZE;
    const endX = Math.ceil((-engineState.panX + width / 2 / engineState.zoom) / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor((-engineState.panY - height / 2 / engineState.zoom) / GRID_SIZE) * GRID_SIZE;
    const endY = Math.ceil((-engineState.panY + height / 2 / engineState.zoom) / GRID_SIZE) * GRID_SIZE;
    
    ctx.beginPath();
    for (let x = startX; x <= endX; x += GRID_SIZE) {
      const screenX = (x + engineState.panX) * engineState.zoom + width / 2;
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
    }
    
    for (let y = startY; y <= endY; y += GRID_SIZE) {
      const screenY = (y + engineState.panY) * engineState.zoom + height / 2;
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
    }
    ctx.stroke();
  };


  const drawObject = (ctx: CanvasRenderingContext2D, obj: GameObject, width: number, height: number) => {
    if (!obj.visible) return; // Don't draw invisible objects
    
    const screenX = (obj.x + engineState.panX) * engineState.zoom + width / 2;
    const screenY = (obj.y + engineState.panY) * engineState.zoom + height / 2;
    const screenWidth = obj.width * engineState.zoom * (obj.scale?.x || 1);
    const screenHeight = obj.height * engineState.zoom * (obj.scale?.y || 1);
    
    ctx.save();
    
    // Apply rotation if exists
    if (obj.rotation) {
      ctx.translate(screenX, screenY);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      ctx.translate(-screenX, -screenY);
    }
    
    // Draw object
    if (obj.texture) {
      // Draw texture if available
      const img = new Image();
      img.src = obj.texture;
      if (img.complete) {
        ctx.imageSmoothingEnabled = true;
        // Image quality system: 5-700 range
        const quality = obj.imageQuality || 100;
        if (quality < 50) {
          ctx.imageSmoothingQuality = 'low';
          ctx.filter = `blur(${Math.max(0, (50 - quality) * 0.1)}px)`;
        } else {
          ctx.imageSmoothingQuality = quality > 300 ? 'high' : 'medium';
          ctx.filter = 'none';
        }
        
        ctx.drawImage(
          img,
          screenX - screenWidth / 2,
          screenY - screenHeight / 2,
          screenWidth,
          screenHeight
        );
        ctx.filter = 'none'; // Reset filter
      }
    } else {
      // Draw solid color
      ctx.fillStyle = obj.color;
      ctx.fillRect(
        screenX - screenWidth / 2,
        screenY - screenHeight / 2,
        screenWidth,
        screenHeight
      );
    }
    
    ctx.restore();
    
    // Draw selection outline with soft purple glow that rotates with object
    if (engineState.selectedObject?.id === obj.id && !engineState.isPlaying) {
      ctx.save();
      
      // Apply same rotation for selection effect
      if (obj.rotation) {
        ctx.translate(screenX, screenY);
        ctx.rotate((obj.rotation * Math.PI) / 180);
        ctx.translate(-screenX, -screenY);
      }
      
      // Subtle transparent purple glow - more subtle and professional
      ctx.shadowColor = 'rgba(139, 92, 246, 0.3)';
      ctx.shadowBlur = 4;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      
      ctx.strokeRect(
        screenX - screenWidth / 2 - 2,
        screenY - screenHeight / 2 - 2,
        screenWidth + 4,
        screenHeight + 4
      );
      
      ctx.restore();
    }
  };

  // Render loop with physics integration
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Apply scene resolution scaling
    const resolutionScale = engineState.sceneResolution / 100;
    ctx.save();
    ctx.scale(resolutionScale, resolutionScale);
    
    // Clear canvas
    ctx.fillStyle = 'hsl(225, 12%, 8%)';
    ctx.fillRect(0, 0, width / resolutionScale, height / resolutionScale);
    
    // Draw grid
    drawGrid(ctx, width / resolutionScale, height / resolutionScale);
    
    // Update physics in play mode
    if (engineState.isPlaying) {
      const physicsObjects = physics.step();
      
      // Update object positions from physics
      physicsObjects.forEach((physicsObj: any) => {
        const gameObject = engineState.objects.find(obj => obj.id === physicsObj.id);
        if (gameObject && (gameObject.x !== physicsObj.x || gameObject.y !== physicsObj.y)) {
          onObjectUpdate({
            ...gameObject, 
            x: physicsObj.x, 
            y: physicsObj.y
          });
        }
      });
    }
    
    // Draw objects sorted by zIndex
    const sortedObjects = [...engineState.objects].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    sortedObjects.forEach(obj => {
      drawObject(ctx, obj, width / resolutionScale, height / resolutionScale);
    });
    
    ctx.restore();
  }, [engineState, physics, onObjectUpdate]);

  // Setup canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      render();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Add touch event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, render]);

  // Render when state changes
  useEffect(() => {
    render();
  }, [render]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-engine-viewport relative overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        style={{ touchAction: 'none' }}
      />
      
      {/* Viewport Info - Only in editor mode */}
      {!engineState.isPlaying && (
        <div className="absolute top-4 left-4 bg-engine-panel/80 backdrop-blur-sm rounded px-3 py-1 text-xs text-muted-foreground">
          Zoom: {Math.round(engineState.zoom * 100)}% | 
          Pan: {Math.round(engineState.panX)}, {Math.round(engineState.panY)}
        </div>
      )}
      
      {/* Play Mode Indicator */}
      {engineState.isPlaying && (
        <div className="absolute top-4 right-4 bg-primary/20 text-primary px-3 py-1 rounded text-sm font-medium">
          ▶ PLAYING
        </div>
      )}
    </div>
  );
};