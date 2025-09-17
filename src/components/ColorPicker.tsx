import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  // Primeira linha - tons de cinza e cores básicas
  "#ffffff", "#f0f0f0", "#d0d0d0", "#b0b0b0", "#909090", "#707070", "#505050", "#000000",
  // Segunda linha - cores escuras
  "#808080", "#606060", "#404040", "#202020", "#ff0000", "#ff4000", "#ff8000", "#ffff00",
  // Terceira linha - verdes e azuis
  "#c0ff00", "#80ff00", "#40ff00", "#00ff00", "#00ff40", "#00ff80", "#00ffc0", "#00ffff",
  // Quarta linha - azuis e roxos
  "#00c0ff", "#0080ff", "#0040ff", "#0000ff", "#4000ff", "#8000ff", "#c000ff", "#ff00ff",
  // Quinta linha - magentas e rosas
  "#ff00c0", "#ff0080", "#ff0040", "#ff4080", "#ff80c0", "#ffb0e0", "#ffe0f0", "#fff0f8",
  // Sexta linha - cores pastel
  "#f0fff0", "#f0f8ff", "#e6e6fa", "#ffefd5", "#ffe4e1", "#e0ffff", "#f5f5dc", "transparent"
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="bg-engine-panel border-border p-6 w-96 max-w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Paleta de Cores</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-engine-panel-hover"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block text-muted-foreground">Cores Predefinidas</Label>
            
            {/* Preset Colors Grid */}
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  onClick={() => handleColorSelect(color)}
                  className={cn(
                    "w-8 h-8 rounded border-2 transition-all hover:scale-110 relative",
                    value === color ? "border-primary shadow-md shadow-primary/30" : "border-border hover:border-muted-foreground"
                  )}
                  style={{ 
                    backgroundColor: color === 'transparent' ? 'transparent' : color,
                    backgroundImage: color === 'transparent' ? 
                      'linear-gradient(45deg, #555 25%, transparent 25%), linear-gradient(-45deg, #555 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #555 75%), linear-gradient(-45deg, transparent 75%, #555 75%)'
                      : undefined,
                    backgroundSize: color === 'transparent' ? '6px 6px' : undefined,
                    backgroundPosition: color === 'transparent' ? '0 0, 0 3px, 3px -3px, -3px 0px' : undefined
                  }}
                  title={color === 'transparent' ? 'Transparente' : color}
                >
                  {color === 'transparent' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-0.5 bg-red-500 rotate-45"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">Cor Personalizada</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                placeholder="#ffffff"
                className="flex-1 bg-engine-panel border-border"
              />
              <Button 
                onClick={handleCustomColorApply}
                className="bg-primary hover:bg-primary/90 px-4"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};