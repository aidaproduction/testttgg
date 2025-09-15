import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#ffffff", "#f8f9fa", "#e9ecef", "#dee2e6", "#ced4da", "#adb5bd", "#6c757d", "#495057", "#343a40", "#212529",
  "#ff6b6b", "#ee5a52", "#ff8787", "#ffa8a8", "#ffc9c9", "#ffe3e3", "#ffcccb", "#ff9999", "#ff6666", "#ff3333",
  "#4ecdc4", "#45b7b8", "#6c5ce7", "#a29bfe", "#fd79a8", "#fdcb6e", "#e17055", "#00b894", "#00cec9", "#6c5ce7",
  "#74b9ff", "#0984e3", "#a29bfe", "#6c5ce7", "#fd79a8", "#e84393", "#fdcb6e", "#f39c12", "#e17055", "#d63031",
  "#00b894", "#00cec9", "#55a3ff", "#74b9ff", "#81ecec", "#00cec9", "#55efc4", "#00b894", "#fdcb6e", "#f39c12",
  "transparent"
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

export const ColorPicker = ({ value, onChange, onClose }: ColorPickerProps) => {
  const [customColor, setCustomColor] = useState(value.startsWith('#') ? value : '#ffffff');

  const handleColorSelect = (color: string) => {
    onChange(color);
    onClose();
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleCustomColorApply = () => {
    onChange(customColor);
    onClose();
  };

  return (
    <Card className="absolute z-50 bg-engine-panel border-border p-4 w-80">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Escolher Cor</Label>
        </div>
        
        {/* Preset Colors Grid */}
        <div className="grid grid-cols-10 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className={cn(
                "w-8 h-8 rounded border-2 transition-all hover:scale-110 relative",
                value === color ? "border-primary shadow-lg shadow-primary/25" : "border-border hover:border-muted-foreground"
              )}
              style={{ 
                backgroundColor: color === 'transparent' ? 'transparent' : color,
                backgroundImage: color === 'transparent' ? 
                  'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                  : undefined,
                backgroundSize: color === 'transparent' ? '8px 8px' : undefined,
                backgroundPosition: color === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined
              }}
            >
              {color === 'transparent' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Custom Color Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Cor Personalizada</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="w-12 h-10 p-1 bg-engine-panel border-border cursor-pointer"
            />
            <Input
              type="text"
              value={customColor}
              onChange={handleCustomColorChange}
              placeholder="#ffffff"
              className="flex-1 bg-engine-panel border-border"
            />
            <Button 
              onClick={handleCustomColorApply}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              OK
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-engine-toolbar border-border hover:bg-engine-panel-hover"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Card>
  );
};