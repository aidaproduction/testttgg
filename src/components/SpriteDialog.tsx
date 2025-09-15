import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Sparkles, Image, Palette } from "lucide-react";
import { GameObject } from "./GameEngine";
import { ColorPicker } from "./ColorPicker";
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
  const [selectedTexture, setSelectedTexture] = useState<string>("");
  const [showColorPicker, setShowColorPicker] = useState(false);

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
      texture: selectedTexture,
      components: [],
    };

    onSpriteCreate(newSprite);
    setSpriteName("");
    setSelectedColor(SPRITE_COLORS[0]);
    setSelectedTexture("");
    setShowColorPicker(false);
  };

  const handleClose = () => {
    setSpriteName("");
    setSelectedColor(SPRITE_COLORS[0]);
    setSelectedTexture("");
    setShowColorPicker(false);
    onClose();
  };

  const handleTextureSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedTexture(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-engine-panel border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-primary" />
            Criar Objeto
          </DialogTitle>
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

          {/* Texture Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Textura</Label>
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                onClick={handleTextureSelect}
                className="flex-1 bg-engine-toolbar border-border hover:bg-engine-panel-hover"
              >
                <Image className="w-4 h-4 mr-2" />
                Escolher Imagem
              </Button>
            </div>
            {selectedTexture && (
              <div className="mb-4">
                <img 
                  src={selectedTexture} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded border border-border"
                />
              </div>
            )}
          </div>

          {/* Color Selection */}
          <div className="relative">
            <Label className="text-sm font-medium mb-3 block">Cor</Label>
            <Button
              variant="outline"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full bg-engine-toolbar border-border hover:bg-engine-panel-hover justify-start"
            >
              <div 
                className="w-6 h-6 rounded mr-2 border border-border"
                style={{ backgroundColor: selectedColor }}
              />
              <Palette className="w-4 h-4 mr-2" />
              Escolher Cor
            </Button>
            
            {showColorPicker && (
              <div className="mt-2">
                <ColorPicker
                  value={selectedColor}
                  onChange={setSelectedColor}
                  onClose={() => setShowColorPicker(false)}
                />
              </div>
            )}
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