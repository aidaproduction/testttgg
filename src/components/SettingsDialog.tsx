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
  const [resolution, setResolution] = useState(sceneResolution);

  const handleSave = () => {
    onSceneResolutionChange(Math.max(10, Math.min(200, resolution)));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-engine-panel border-border">
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
              type="number"
              value={resolution}
              onChange={(e) => setResolution(parseInt(e.target.value) || 100)}
              className="bg-engine-toolbar border-border"
              min="10"
              max="200"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Valores baixos: melhor performance, pior qualidade (10-50)
              <br />
              Valores altos: melhor qualidade, pior performance (100-200)
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