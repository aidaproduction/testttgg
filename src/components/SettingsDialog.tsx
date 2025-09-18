import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  sceneResolution: number;
  onSceneResolutionChange: (resolution: number) => void;
}

export const SettingsDialog = ({
  open,
  onClose,
  sceneResolution,
  onSceneResolutionChange
}: SettingsDialogProps) => {
  const [resolution, setResolution] = useState<string>(String(sceneResolution));
 
  const handleSave = () => {
    const parsed = parseFloat(resolution);
    const finalResolution = Number.isFinite(parsed) ? Math.max(1, parsed) : 100;
    onSceneResolutionChange(finalResolution);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* prevent auto focus to avoid mobile keyboard popping up */}
      <DialogContent className="sm:max-w-md bg-engine-panel border-border" onOpenAutoFocus={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} >
        <DialogHeader>
          <DialogTitle className="text-foreground">Configurações</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="resolution" className="text-sm font-medium mb-2 block">
              Resolução da Cena
            </Label>
            <Input
              id="resolution"
              type="text"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="bg-engine-toolbar border-border"
              placeholder="100"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Valores baixos: pixelado (5-50) | Valores altos: nítido (100-700)
              <br />
              Afeta apenas o modo de play, não o editor
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-engine-toolbar border-border hover:bg-engine-panel-hover"
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};