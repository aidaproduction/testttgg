import { useRef, useEffect, useState, useCallback } from "react";
import { GameObject, EngineState } from "./GameEngine";
import { cn } from "@/lib/utils";

interface ViewportProps {
  engineState: EngineState;
  onObjectSelect: (object: GameObject | null) => void;
  onObjectUpdate: (object: GameObject) => void;
  onViewportChange: (changes: Partial<Pick<EngineState, 'zoom' | 'panX' | 'panY'>>) => void;
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
  onViewportChange
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
    const touches = e.touches;
    const now = Date.now();
    
    if (touches.length === 1) {
      const touch = touches[0];
      const worldPos = screenToWorld(touch.clientX, touch.clientY);
      const hitObject = getObjectAtPosition(worldPos.x, worldPos.y);
      
      // Check for double tap (fast double click)
      if (now - touchState.current.lastTouchTime < 250 && touchState.current.lastTouchCount === 1) {
        // Double tap - select/deselect object
        if (hitObject) {
          onObjectSelect(hitObject);
          setDraggedObject(hitObject);
          setDragOffset({
            x: worldPos.x - hitObject.x,
            y: worldPos.y - hitObject.y
          });
        } else {
          onObjectSelect(null);
          setDraggedObject(null);
        }
      } else {
        // Single tap - start potential drag
        if (hitObject && hitObject === engineState.selectedObject) {
          setDraggedObject(hitObject);
          setDragOffset({
            x: worldPos.x - hitObject.x,
            y: worldPos.y - hitObject.y
          });
        } else {
          // Start panning
          touchState.current.panStartX = engineState.panX;
          touchState.current.panStartY = engineState.panY;
          touchState.current.dragStartX = touch.clientX;
          touchState.current.dragStartY = touch.clientY;
        }
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
    const touches = e.touches;
    
    if (touches.length === 1 && touchState.current.isDragging) {
      const touch = touches[0];
      const worldPos = screenToWorld(touch.clientX, touch.clientY);
      
      if (draggedObject) {
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
  }, [draggedObject, dragOffset, engineState, onObjectUpdate, onViewportChange]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    touchState.current.isDragging = false;
    touchState.current.initialPinchDistance = null;
    setDraggedObject(null);
  }, []);

  // Draw functions
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!engineState.showGrid) return;
    
    ctx.strokeStyle = 'hsl(220, 10%, 25%)';
    ctx.lineWidth = 1;
    
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
    const screenWidth = obj.width * engineState.zoom;
    const screenHeight = obj.height * engineState.zoom;
    
    // Draw object
    if (obj.texture) {
      // Draw texture if available
      const img = new Image();
      img.src = obj.texture;
      if (img.complete) {
        ctx.drawImage(
          img,
          screenX - screenWidth / 2,
          screenY - screenHeight / 2,
          screenWidth,
          screenHeight
        );
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
    
    // Draw selection outline with soft purple glow
    if (engineState.selectedObject?.id === obj.id) {
      ctx.save();
      
      // Outer glow
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      
      // Draw multiple layers for soft glow effect
      for (let i = 0; i < 3; i++) {
        ctx.strokeRect(
          screenX - screenWidth / 2 - (i * 2),
          screenY - screenHeight / 2 - (i * 2),
          screenWidth + (i * 4),
          screenHeight + (i * 4)
        );
      }
      
      ctx.restore();
    }
  };

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = 'hsl(225, 12%, 8%)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    drawGrid(ctx, width, height);
    
    // Draw objects
    engineState.objects.forEach(obj => {
      drawObject(ctx, obj, width, height);
    });
    
  }, [engineState]);

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
      
      {/* Viewport Info */}
      <div className="absolute top-4 left-4 bg-engine-panel/80 backdrop-blur-sm rounded px-3 py-1 text-xs text-muted-foreground">
        Zoom: {Math.round(engineState.zoom * 100)}% | 
        Pan: {Math.round(engineState.panX)}, {Math.round(engineState.panY)}
      </div>
      
      {/* Play Mode Indicator */}
      {engineState.isPlaying && (
        <div className="absolute top-4 right-4 bg-primary/20 text-primary px-3 py-1 rounded text-sm font-medium">
          ▶ PLAYING
        </div>
      )}
    </div>
  );
};