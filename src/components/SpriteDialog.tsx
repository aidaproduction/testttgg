import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Sparkles } from "lucide-react";
import { GameObject } from "./GameEngine";
import { cn } from "@/lib/utils";

interface SpriteDialogProps {
  open: boolean;
  onClose: () => void;
  onSpriteCreate: (sprite: GameObject) => void;
}

const SPRITE_COLORS = [
  "#ffffff", // White
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#6b7280", // Gray
];

export const SpriteDialog = ({ open, onClose, onSpriteCreate }: SpriteDialogProps) => {
  const [spriteName, setSpriteName] = useState("");
  const [selectedColor, setSelectedColor] = useState(SPRITE_COLORS[0]);

  const handleCreate = () => {
    if (!spriteName.trim()) return;

    const newSprite: GameObject = {
      id: `sprite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: spriteName.trim(),
      type: "sprite",
      x: 0,
      y: 0,
      width: 64,
      height: 64,
      color: selectedColor,
      rotation: 0,
      scale: { x: 1, y: 1 },
    };

    onSpriteCreate(newSprite);
    setSpriteName("");
    setSelectedColor(SPRITE_COLORS[0]);
  };

  const handleClose = () => {
    setSpriteName("");
    setSelectedColor(SPRITE_COLORS[0]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-engine-panel border-border max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              Criar Objeto
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Object Name */}
          <div>
            <Label htmlFor="sprite-name" className="text-sm font-medium mb-2 block">
              Nome do Objeto
            </Label>
            <Input
              id="sprite-name"
              value={spriteName}
              onChange={(e) => setSpriteName(e.target.value)}
              placeholder="Ex: Player, Inimigo, Moeda..."
              className="bg-engine-toolbar border-border"
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Cor</Label>
            <div className="grid grid-cols-5 gap-2">
              {SPRITE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-12 h-12 rounded-lg border-2 transition-all hover:scale-105",
                    selectedColor === color
                      ? "border-primary shadow-lg shadow-primary/25"
                      : "border-border hover:border-muted-foreground"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-engine-toolbar border-border hover:bg-engine-panel-hover"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!spriteName.trim()}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Criar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};