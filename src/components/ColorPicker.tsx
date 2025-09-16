import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  // Cores básicas para jogos
  "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
  "#808080", "#800000", "#008000", "#000080", "#808000", "#800080", "#008080", "#c0c0c0",
  "#ffa500", "#ffc0cb", "#add8e6", "#f0e68c", "#dda0dd", "#98fb98", "#f5deb3", "#d3d3d3",
  "#ff6347", "#40e0d0", "#ee82ee", "#90ee90", "#f4a460", "#da70d6", "#b0c4de", "#ffd700",
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
        <div className="grid grid-cols-8 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 relative shadow-sm",
                value === color ? "border-primary shadow-lg shadow-primary/25 ring-2 ring-primary/30" : "border-border hover:border-muted-foreground"
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