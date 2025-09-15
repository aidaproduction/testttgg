import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Box, 
  Code, 
  Workflow, 
  Plus,
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface GameComponent {
  id: string;
  type: 'rigidbody' | 'boxCollider' | 'script' | 'visualScript';
  name: string;
  enabled: boolean;
  properties?: Record<string, any>;
}

interface ComponentsDialogProps {
  open: boolean;
  onClose: () => void;
  onComponentAdd: (componentType: GameComponent['type']) => void;
  existingComponents: GameComponent[];
}

const AVAILABLE_COMPONENTS = [
  {
    type: 'rigidbody' as const,
    name: 'Rigidbody',
    description: 'Adiciona física ao objeto',
    icon: Zap,
    category: 'Physics'
  },
  {
    type: 'boxCollider' as const,
    name: 'Box Collider',
    description: 'Detecta colisões com outros objetos',
    icon: Box,
    category: 'Physics'
  },
  {
    type: 'script' as const,
    name: 'Script',
    description: 'Adiciona lógica personalizada em código',
    icon: Code,
    category: 'Logic'
  },
  {
    type: 'visualScript' as const,
    name: 'Visual Script',
    description: 'Cria lógica usando interface visual',
    icon: Workflow,
    category: 'Logic'
  }
];

export const ComponentsDialog = ({ 
  open, 
  onClose, 
  onComponentAdd, 
  existingComponents 
}: ComponentsDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Physics');
  
  const categories = [...new Set(AVAILABLE_COMPONENTS.map(c => c.category))];
  const filteredComponents = AVAILABLE_COMPONENTS.filter(c => c.category === selectedCategory);
  
  const isComponentAdded = (type: string) => 
    existingComponents.some(c => c.type === type);

  const handleAddComponent = (type: GameComponent['type']) => {
    if (!isComponentAdded(type)) {
      onComponentAdd(type);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-engine-panel border-border max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Plus className="w-5 h-5 text-primary" />
              Adicionar Componente
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full",
                  selectedCategory === category 
                    ? "bg-primary/10 text-primary border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Components Grid */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredComponents.map((component) => {
              const Icon = component.icon;
              const isAdded = isComponentAdded(component.type);
              
              return (
                <Card
                  key={component.type}
                  className={cn(
                    "p-3 cursor-pointer bg-engine-toolbar border-border hover:bg-engine-panel-hover transition-colors",
                    isAdded && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !isAdded && handleAddComponent(component.type)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{component.name}</span>
                          {isAdded && (
                            <Badge variant="secondary" className="text-xs">
                              Adicionado
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {component.description}
                        </p>
                      </div>
                    </div>
                    {!isAdded && (
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};