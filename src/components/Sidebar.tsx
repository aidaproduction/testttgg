import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Box, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Move3D,
  Maximize2,
  RotateCw,
  Zap,
  Settings
} from "lucide-react";
import { GameObject } from "./GameEngine";
import { cn } from "@/lib/utils";

interface SidebarProps {
  objects: GameObject[];
  selectedObject: GameObject | null;
  onObjectSelect: (object: GameObject | null) => void;
  onObjectUpdate: (object: GameObject) => void;
  onObjectDelete: (objectId: string) => void;
}

export const Sidebar = ({
  objects,
  selectedObject,
  onObjectSelect,
  onObjectUpdate,
  onObjectDelete
}: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<'objects' | 'properties'>('objects');
  const [expandedSections, setExpandedSections] = useState<string[]>(['transform']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedObject) return;
    
    const updatedObject = { ...selectedObject, [property]: value };
    onObjectUpdate(updatedObject);
  };

  const handleTransformChange = (transform: string, value: number) => {
    if (!selectedObject) return;
    
    let updatedObject = { ...selectedObject };
    
    switch (transform) {
      case 'x':
      case 'y':
        updatedObject[transform] = value;
        break;
      case 'scaleX':
        updatedObject.scale = { ...updatedObject.scale, x: value } as any;
        break;
      case 'scaleY':
        updatedObject.scale = { ...updatedObject.scale, y: value } as any;
        break;
      case 'rotation':
        updatedObject.rotation = value;
        break;
    }
    
    onObjectUpdate(updatedObject);
  };

  return (
    <div className="w-80 bg-engine-panel border-r border-border flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <Button
          variant="ghost"
          className={cn(
            "flex-1 rounded-none border-b-2 border-transparent",
            activeTab === 'objects' && "border-primary bg-primary/5"
          )}
          onClick={() => setActiveTab('objects')}
        >
          Objetos
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex-1 rounded-none border-b-2 border-transparent",
            activeTab === 'properties' && "border-primary bg-primary/5"
          )}
          onClick={() => setActiveTab('properties')}
        >
          Propriedades
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'objects' ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="w-2 h-2 rounded-full bg-muted"></div>
              </div>
            </div>
            
            {objects.length === 0 ? (
              <div className="text-center py-12">
                <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Nenhum objeto</p>
                <p className="text-sm text-muted-foreground">
                  Clique em "+ Sprite" para começar
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {objects.map((object) => (
                  <Card
                    key={object.id}
                    className={cn(
                      "p-3 cursor-pointer bg-engine-panel hover:bg-engine-panel-hover border-border transition-colors",
                      selectedObject?.id === object.id && "ring-2 ring-primary border-primary"
                    )}
                    onClick={() => onObjectSelect(object)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{object.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onObjectDelete(object.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            {selectedObject ? (
              <div className="space-y-4">
                {/* Object Name */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={selectedObject.name}
                    onChange={(e) => handlePropertyChange('name', e.target.value)}
                    className="bg-engine-panel border-border"
                  />
                </div>

                {/* Transform Section */}
                <Collapsible open={expandedSections.includes('transform')}>
                  <CollapsibleTrigger
                    onClick={() => toggleSection('transform')}
                    className="flex items-center justify-between w-full p-2 hover:bg-engine-panel-hover rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Move3D className="w-4 h-4" />
                      <span className="font-medium">Transform</span>
                    </div>
                    {expandedSections.includes('transform') ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-2">
                    {/* Position */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Move3D className="w-3 h-3" />
                        Posição
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          value={selectedObject.x}
                          onChange={(e) => handleTransformChange('x', parseFloat(e.target.value) || 0)}
                          className="bg-engine-panel border-border text-sm"
                        />
                        <Input
                          type="number"
                          value={selectedObject.y}
                          onChange={(e) => handleTransformChange('y', parseFloat(e.target.value) || 0)}
                          className="bg-engine-panel border-border text-sm"
                        />
                      </div>
                    </div>

                    {/* Scale */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" />
                        Escala
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          value={selectedObject.scale?.x || 1}
                          onChange={(e) => handleTransformChange('scaleX', parseFloat(e.target.value) || 1)}
                          className="bg-engine-panel border-border text-sm"
                          step="0.1"
                        />
                        <Input
                          type="number"
                          value={selectedObject.scale?.y || 1}
                          onChange={(e) => handleTransformChange('scaleY', parseFloat(e.target.value) || 1)}
                          className="bg-engine-panel border-border text-sm"
                          step="0.1"
                        />
                      </div>
                    </div>

                    {/* Rotation */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <RotateCw className="w-3 h-3" />
                        Rotação
                      </Label>
                      <Input
                        type="number"
                        value={selectedObject.rotation || 0}
                        onChange={(e) => handleTransformChange('rotation', parseFloat(e.target.value) || 0)}
                        className="bg-engine-panel border-border text-sm"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Physics Section */}
                <Collapsible open={expandedSections.includes('physics')}>
                  <CollapsibleTrigger
                    onClick={() => toggleSection('physics')}
                    className="flex items-center justify-between w-full p-2 hover:bg-engine-panel-hover rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">Physics</span>
                    </div>
                    {expandedSections.includes('physics') ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rigidbody</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Box Collider</span>
                        <Switch />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Logic Section */}
                <Collapsible open={expandedSections.includes('logic')}>
                  <CollapsibleTrigger
                    onClick={() => toggleSection('logic')}
                    className="flex items-center justify-between w-full p-2 hover:bg-engine-panel-hover rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span className="font-medium">Logic</span>
                    </div>
                    {expandedSections.includes('logic') ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-engine-panel border-border hover:bg-engine-panel-hover"
                      >
                        Script
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-engine-panel border-border hover:bg-engine-panel-hover"
                      >
                        Visual Script
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione um objeto para ver suas propriedades
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};