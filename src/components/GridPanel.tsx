import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, Grid3X3 } from "lucide-react";

interface GridPanelProps {
  showGrid: boolean;
  snapToGrid: boolean;
  onGridToggle: () => void;
  onSnapToggle: () => void;
}

export const GridPanel = ({ showGrid, snapToGrid, onGridToggle, onSnapToggle }: GridPanelProps) => {
  return (
    <Card className="absolute top-16 left-4 z-50 bg-engine-panel border-border p-4 w-72">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2 text-foreground">Grid</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Customize a visibilidade e o ajuste à grade.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Show Grid</Label>
            </div>
            <Switch checked={showGrid} onCheckedChange={onGridToggle} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Snap to Grid</Label>
            </div>
            <Switch checked={snapToGrid} onCheckedChange={onSnapToggle} />
          </div>
        </div>
      </div>
    </Card>
  );
};