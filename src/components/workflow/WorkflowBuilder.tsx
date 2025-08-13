import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workflow, WorkflowStage, FrameworkType, UXTool } from '@/types';
import { frameworkLibrary } from '@/lib/framework-library';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Copy, 
  Trash2, 
  Settings, 
  Plus,
  GripVertical,
  CheckCircle,
  Circle,
  Clock
} from 'lucide-react';

interface WorkflowBuilderProps {
  workflow: Workflow;
  onUpdateWorkflow: (workflow: Workflow) => void;
  onExecuteStage: (stageId: string) => void;
  isExecuting?: boolean;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  onUpdateWorkflow,
  onExecuteStage,
  isExecuting = false
}) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const framework = frameworkLibrary[workflow.frameworkType];

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(workflow.stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedStages = items.map((stage, index) => ({
      ...stage,
      order: index + 1
    }));

    onUpdateWorkflow({
      ...workflow,
      stages: updatedStages
    });
  }, [workflow, onUpdateWorkflow]);

  const duplicateStage = useCallback((stageId: string) => {
    const stage = workflow.stages.find(s => s.id === stageId);
    if (!stage) return;

    const newStage: WorkflowStage = {
      ...stage,
      id: `${stage.id}-copy-${Date.now()}`,
      order: workflow.stages.length + 1,
      isCompleted: false,
      artifact: undefined
    };

    onUpdateWorkflow({
      ...workflow,
      stages: [...workflow.stages, newStage]
    });
  }, [workflow, onUpdateWorkflow]);

  const deleteStage = useCallback((stageId: string) => {
    const updatedStages = workflow.stages
      .filter(s => s.id !== stageId)
      .map((stage, index) => ({ ...stage, order: index + 1 }));

    onUpdateWorkflow({
      ...workflow,
      stages: updatedStages
    });
  }, [workflow, onUpdateWorkflow]);

  const toggleStageSkip = useCallback((stageId: string) => {
    const updatedStages = workflow.stages.map(stage =>
      stage.id === stageId
        ? { ...stage, isSkipped: !stage.isSkipped }
        : stage
    );

    onUpdateWorkflow({
      ...workflow,
      stages: updatedStages
    });
  }, [workflow, onUpdateWorkflow]);

  const addStageFromFramework = useCallback((frameworkStageId: string) => {
    const frameworkStage = framework?.stages.find(s => s.id === frameworkStageId);
    if (!frameworkStage) return;

    const newStage: WorkflowStage = {
      id: `${frameworkStageId}-${Date.now()}`,
      frameworkStageId,
      order: workflow.stages.length + 1,
      isCompleted: false,
      isSkipped: false,
      customizations: {}
    };

    onUpdateWorkflow({
      ...workflow,
      stages: [...workflow.stages, newStage]
    });
  }, [workflow, onUpdateWorkflow, framework]);

  const getStageStatus = (stage: WorkflowStage) => {
    if (stage.isSkipped) return 'skipped';
    if (stage.isCompleted) return 'completed';
    if (isExecuting && selectedStage === stage.id) return 'executing';
    return 'pending';
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'executing': return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'skipped': return <SkipForward className="h-5 w-5 text-gray-400" />;
      default: return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{workflow.name}</h2>
          <p className="text-muted-foreground">{workflow.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{framework?.name}</Badge>
            <Badge variant="secondary">
              {workflow.metadata.completedStages}/{workflow.metadata.totalStages} stages
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSelectedStage(null)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Workflow Settings
          </Button>
        </div>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ 
                  width: `${(workflow.metadata.completedStages / workflow.metadata.totalStages) * 100}%` 
                }}
              />
            </div>
            <span className="text-sm font-medium">
              {Math.round((workflow.metadata.completedStages / workflow.metadata.totalStages) * 100)}%
            </span>
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {workflow.stages.filter(s => s.isCompleted).length} Completed
            </span>
            <span className="flex items-center gap-1">
              <SkipForward className="h-4 w-4 text-gray-400" />
              {workflow.stages.filter(s => s.isSkipped).length} Skipped
            </span>
            <span className="flex items-center gap-1">
              <Circle className="h-4 w-4 text-gray-300" />
              {workflow.stages.filter(s => !s.isCompleted && !s.isSkipped).length} Remaining
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stage Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stages List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workflow Stages</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Open add stage modal */}}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="stages">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {workflow.stages.map((stage, index) => {
                        const frameworkStage = framework?.stages.find(
                          s => s.id === stage.frameworkStageId
                        );
                        const status = getStageStatus(stage);

                        return (
                          <Draggable
                            key={stage.id}
                            draggableId={stage.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`cursor-pointer transition-all ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                } ${
                                  selectedStage === stage.id ? 'ring-2 ring-primary' : ''
                                } ${
                                  status === 'skipped' ? 'opacity-50' : ''
                                }`}
                                onClick={() => setSelectedStage(stage.id)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    
                                    {getStageIcon(status)}
                                    
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium">
                                          {stage.customizations.name || frameworkStage?.name}
                                        </h4>
                                        <Badge variant="outline" className="text-xs">
                                          {stage.order}
                                        </Badge>
                                        {stage.selectedTool && (
                                          <Badge variant="secondary" className="text-xs">
                                            {stage.selectedTool.name}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {stage.customizations.description || frameworkStage?.description}
                                      </p>
                                      {stage.customizations.estimatedTime && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Est. {stage.customizations.estimatedTime}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onExecuteStage(stage.id);
                                        }}
                                        disabled={stage.isSkipped || isExecuting}
                                      >
                                        <Play className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleStageSkip(stage.id);
                                        }}
                                      >
                                        <SkipForward className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          duplicateStage(stage.id);
                                        }}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteStage(stage.id);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </div>

        {/* Stage Details Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Stage Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStage ? (
                <StageDetailsPanel
                  stage={workflow.stages.find(s => s.id === selectedStage)!}
                  frameworkStage={framework?.stages.find(
                    s => s.id === workflow.stages.find(stage => stage.id === selectedStage)?.frameworkStageId
                  )}
                  onUpdateStage={(updatedStage) => {
                    const updatedStages = workflow.stages.map(s =>
                      s.id === selectedStage ? updatedStage : s
                    );
                    onUpdateWorkflow({
                      ...workflow,
                      stages: updatedStages
                    });
                  }}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a stage to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface StageDetailsPanelProps {
  stage: WorkflowStage;
  frameworkStage?: any;
  onUpdateStage: (stage: WorkflowStage) => void;
}

const StageDetailsPanel: React.FC<StageDetailsPanelProps> = ({
  stage,
  frameworkStage,
  onUpdateStage
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">
          {stage.customizations.name || frameworkStage?.name}
        </h4>
        <p className="text-sm text-muted-foreground">
          {stage.customizations.description || frameworkStage?.description}
        </p>
      </div>

      {frameworkStage?.tools && (
        <div>
          <h5 className="font-medium mb-2">Available Tools</h5>
          <div className="space-y-2">
            {frameworkStage.tools.map((tool: UXTool) => (
              <Button
                key={tool.id}
                variant={stage.selectedTool?.id === tool.id ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onUpdateStage({
                    ...stage,
                    selectedTool: tool
                  });
                }}
              >
                {tool.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {stage.selectedTool && (
        <div>
          <h5 className="font-medium mb-2">Selected Tool</h5>
          <Card>
            <CardContent className="p-3">
              <h6 className="font-medium">{stage.selectedTool.name}</h6>
              <p className="text-xs text-muted-foreground mb-2">
                {stage.selectedTool.description}
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {stage.selectedTool.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {stage.selectedTool.estimatedTime}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {stage.artifact && (
        <div>
          <h5 className="font-medium mb-2">Generated Artifact</h5>
          <Card>
            <CardContent className="p-3">
              <p className="text-sm">{stage.artifact.summary}</p>
              <div className="flex justify-between items-center mt-2">
                <Badge variant="outline" className="text-xs">
                  v{stage.artifact.metadata.version}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {stage.artifact.metadata.createdAt.toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};