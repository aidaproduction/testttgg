import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Settings,
  Plus,
  Code,
  Workflow,
  Eye,
  EyeOff,
  Image,
  Palette,
  Layers,
  ChevronUp,
  ChevronDown as ChevronDownIcon
} from "lucide-react";
import { GameObject, GameComponent } from "./GameEngine";
import { ComponentsDialog } from "./ComponentsDialog";
import { ColorPicker } from "./ColorPicker";
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
  const [expandedSections, setExpandedSections] = useState<string[]>(['transform', 'appearance']);
  const [showComponentsDialog, setShowComponentsDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

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
      case 'width':
      case 'height':
        updatedObject[transform] = value;
        break;
      case 'scaleX':
        updatedObject.scale = { 
          x: value, 
          y: updatedObject.scale?.y || 1 
        };
        break;
      case 'scaleY':
        updatedObject.scale = { 
          x: updatedObject.scale?.x || 1, 
          y: value 
        };
        break;
      case 'rotation':
        updatedObject.rotation = value;
        break;
    }
    
    onObjectUpdate(updatedObject);
  };

  const handleComponentAdd = (componentType: GameComponent['type']) => {
    if (!selectedObject) return;

    const newComponent: GameComponent = {
      id: `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: componentType,
      name: componentType.charAt(0).toUpperCase() + componentType.slice(1),
      enabled: true,
      properties: {}
    };

    const updatedObject = {
      ...selectedObject,
      components: [...(selectedObject.components || []), newComponent]
    };

    onObjectUpdate(updatedObject);
    setShowComponentsDialog(false);
  };

  const handleComponentToggle = (componentId: string, enabled: boolean) => {
    if (!selectedObject) return;

    const updatedObject = {
      ...selectedObject,
      components: selectedObject.components?.map(comp =>
        comp.id === componentId ? { ...comp, enabled } : comp
      ) || []
    };

    onObjectUpdate(updatedObject);
  };

  const handleComponentRemove = (componentId: string) => {
    if (!selectedObject) return;

    const updatedObject = {
      ...selectedObject,
      components: selectedObject.components?.filter(comp => comp.id !== componentId) || []
    };

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
      <ScrollArea className="flex-1">
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
                      "p-2 cursor-pointer bg-engine-panel hover:bg-engine-panel-hover border-border transition-colors",
                      selectedObject?.id === object.id && "ring-2 ring-primary border-primary"
                    )}
                    onClick={() => onObjectSelect(object)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Box className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium">{object.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedObject = { ...object, visible: !object.visible };
                            onObjectUpdate(updatedObject);
                          }}
                        >
                          {object.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onObjectDelete(object.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
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

                    {/* Size */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" />
                        Tamanho
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          value={selectedObject.width}
                          onChange={(e) => handleTransformChange('width', parseFloat(e.target.value) || 1)}
                          className="bg-engine-panel border-border text-sm"
                          min="1"
                        />
                        <Input
                          type="number"
                          value={selectedObject.height}
                          onChange={(e) => handleTransformChange('height', parseFloat(e.target.value) || 1)}
                          className="bg-engine-panel border-border text-sm"
                          min="1"
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
                          min="0.1"
                        />
                        <Input
                          type="number"
                          value={selectedObject.scale?.y || 1}
                          onChange={(e) => handleTransformChange('scaleY', parseFloat(e.target.value) || 1)}
                          className="bg-engine-panel border-border text-sm"
                          step="0.1"
                          min="0.1"
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

{/* Physics Section - Only show if components exist */}
                {selectedObject?.components?.filter(c => c.type === 'rigidbody' || c.type === 'boxCollider').length > 0 && (
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
                    <CollapsibleContent className="space-y-2 pt-2">
                      {selectedObject?.components?.filter(c => c.type === 'rigidbody' || c.type === 'boxCollider').map((component) => (
                        <div key={component.id} className="flex items-center justify-between p-2 bg-engine-toolbar rounded">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-primary" />
                            <span className="text-sm">{component.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={component.enabled}
                              onCheckedChange={(enabled) => handleComponentToggle(component.id, enabled)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleComponentRemove(component.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

{/* Logic Section - Only show if components exist */}
                {selectedObject?.components?.filter(c => c.type === 'script' || c.type === 'visualScript').length > 0 && (
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
                    <CollapsibleContent className="space-y-2 pt-2">
                      {selectedObject?.components?.filter(c => c.type === 'script' || c.type === 'visualScript').map((component) => (
                        <div key={component.id} className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-engine-toolbar rounded">
                            <div className="flex items-center gap-2">
                              {component.type === 'script' ? (
                                <Code className="w-3 h-3 text-primary" />
                              ) : (
                                <Workflow className="w-3 h-3 text-primary" />
                              )}
                              <span className="text-sm">{component.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={component.enabled}
                                onCheckedChange={(enabled) => handleComponentToggle(component.id, enabled)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleComponentRemove(component.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-engine-panel border-border hover:bg-engine-panel-hover"
                              disabled
                            >
                              {component.type === 'script' ? 'Code Editor' : 'Visual Editor'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Appearance Section */}
                <Collapsible open={expandedSections.includes('appearance')}>
                  <CollapsibleTrigger
                    onClick={() => toggleSection('appearance')}
                    className="flex items-center justify-between w-full p-2 hover:bg-engine-panel-hover rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      <span className="font-medium">Appearance</span>
                    </div>
                    {expandedSections.includes('appearance') ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-2">
                     {/* Color */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Cor
                      </Label>
                      <div className="relative">
                        <button
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="w-full h-10 rounded border border-border bg-engine-panel flex items-center px-3 hover:bg-engine-panel-hover transition-colors"
                        >
                          <div 
                            className="w-6 h-6 rounded border border-border mr-3"
                            style={{ backgroundColor: selectedObject.color }}
                          />
                          <span className="text-sm">{selectedObject.color}</span>
                        </button>
                        {showColorPicker && (
                          <div className="absolute top-12 left-0 z-50">
                            <ColorPicker
                              value={selectedObject.color}
                              onChange={(color) => {
                                handlePropertyChange('color', color);
                                setShowColorPicker(false);
                              }}
                              onClose={() => setShowColorPicker(false)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Texture */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Textura
                      </Label>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                handlePropertyChange('texture', e.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="w-full bg-engine-toolbar border-border hover:bg-engine-panel-hover justify-start"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        {selectedObject.texture ? 'Alterar Imagem' : 'Escolher Imagem'}
                      </Button>
                      {selectedObject.texture && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-2">
                            <img 
                              src={selectedObject.texture} 
                              alt="Preview" 
                              className="w-16 h-16 object-cover rounded border border-border"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePropertyChange('texture', '')}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          {/* Image Quality */}
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">
                              Qualidade
                            </Label>
                            <Input
                              type="number"
                              value={selectedObject.imageQuality || 100}
                              onChange={(e) => handlePropertyChange('imageQuality', Math.max(1, Math.min(100, parseInt(e.target.value) || 100)))}
                              className="bg-engine-panel border-border text-sm"
                              min="1"
                              max="100"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Layer Order */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        Ordem das Camadas
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={selectedObject.zIndex || 0}
                          onChange={(e) => handlePropertyChange('zIndex', parseInt(e.target.value) || 0)}
                          className="bg-engine-panel border-border text-sm flex-1"
                        />
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handlePropertyChange('zIndex', (selectedObject.zIndex || 0) + 1)}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handlePropertyChange('zIndex', (selectedObject.zIndex || 0) - 1)}
                          >
                            <ChevronDownIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
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
      </ScrollArea>

      {/* Add Component Button - Fixed at bottom when object is selected */}
      {activeTab === 'properties' && selectedObject && (
        <div className="p-4 border-t border-border bg-engine-panel">
          <Button
            onClick={() => setShowComponentsDialog(true)}
            variant="outline"
            className="w-full justify-start bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Component
          </Button>
        </div>
      )}

      {/* Components Dialog */}
      <ComponentsDialog
        open={showComponentsDialog}
        onClose={() => setShowComponentsDialog(false)}
        onComponentAdd={handleComponentAdd}
        existingComponents={selectedObject?.components || []}
      />
    </div>
  );
};