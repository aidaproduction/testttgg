import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { GameObject } from "./GameEngine";

interface SpriteDialogProps {
  open: boolean;
  onClose: () => void;
  onSpriteCreate: (sprite: GameObject) => void;
}

export const SpriteDialog = ({ open, onClose, onSpriteCreate }: SpriteDialogProps) => {
  const [spriteName, setSpriteName] = useState("");

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
      color: "#ffffff",
      rotation: 0,
      scale: { x: 1, y: 1 },
      texture: "",
      components: [],
      visible: true,
    };

    onSpriteCreate(newSprite);
    setSpriteName("");
  };

  const handleClose = () => {
    setSpriteName("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-engine-panel border-border max-w-md" onOpenAutoFocus={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
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
              autoComplete="off"
            />
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