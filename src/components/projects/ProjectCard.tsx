import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Settings, Trash2, Eye } from "lucide-react";
import { Project, getFrameworkById } from "@/types/project";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
  project: Project;
  promptCount: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProjectCard = ({ project, promptCount, onView, onEdit, onDelete }: ProjectCardProps) => {
  const framework = getFrameworkById(project.selected_framework);
  const timeAgo = formatDistanceToNow(new Date(project.updated_at), { addSuffix: true });

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={onView}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground truncate">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {framework?.name || project.selected_framework}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {promptCount} prompt{promptCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {project.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Updated {timeAgo}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};