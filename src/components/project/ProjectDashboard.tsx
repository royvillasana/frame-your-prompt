import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Project, ProjectStatus, Collaborator } from '@/types';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Users, 
  Calendar, 
  Clock,
  TrendingUp,
  FolderOpen,
  Star,
  Share2,
  Download,
  Settings,
  Archive,
  Trash2
} from 'lucide-react';

interface ProjectDashboardProps {
  projects: Project[];
  onCreateProject: () => void;
  onOpenProject: (projectId: string) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  onCreateProject,
  onOpenProject,
  onUpdateProject,
  onDeleteProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'created' | 'progress'>('modified');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
        case 'modified':
          return new Date(b.metadata.modifiedAt).getTime() - new Date(a.metadata.modifiedAt).getTime();
        case 'progress':
          const progressA = (a.metadata.completedWorkflows / a.metadata.totalWorkflows) * 100;
          const progressB = (b.metadata.completedWorkflows / b.metadata.totalWorkflows) * 100;
          return progressB - progressA;
        default:
          return 0;
      }
    });
  }, [projects, searchQuery, statusFilter, sortBy]);

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in-progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalPrompts = projects.reduce((sum, p) => sum + p.metadata.totalPromptsGenerated, 0);
    
    return { totalProjects, activeProjects, completedProjects, totalPrompts };
  }, [projects]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'archived': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your UX design projects and workflows</p>
        </div>
        <Button onClick={onCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{dashboardStats.totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{dashboardStats.activeProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{dashboardStats.completedProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Prompts</p>
                <p className="text-2xl font-bold">{dashboardStats.totalPrompts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: ProjectStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modified">Last Modified</SelectItem>
                <SelectItem value="created">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            viewMode={viewMode}
            onOpen={() => onOpenProject(project.id)}
            onUpdate={onUpdateProject}
            onDelete={() => onDeleteProject(project.id)}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={onCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onOpen: () => void;
  onUpdate: (project: Project) => void;
  onDelete: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  onOpen,
  onUpdate,
  onDelete
}) => {
  const progress = (project.metadata.completedWorkflows / project.metadata.totalWorkflows) * 100;
  
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'archived': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpen}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{project.name}</h3>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{Math.round(progress)}% Complete</p>
                <Progress value={progress} className="w-24 mt-1" />
              </div>
              
              <div className="flex items-center gap-2">
                {project.collaborators.slice(0, 3).map(collaborator => (
                  <Avatar key={collaborator.id} className="h-6 w-6">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${collaborator.email}`} />
                    <AvatarFallback className="text-xs">
                      {collaborator.name?.charAt(0) || collaborator.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project.collaborators.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{project.collaborators.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="text-right text-sm text-muted-foreground">
                <p>{new Date(project.metadata.modifiedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpen}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Open project menu
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FolderOpen className="h-3 w-3" />
            {project.metadata.totalWorkflows} workflows
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {project.collaborators.length} members
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {project.collaborators.slice(0, 3).map(collaborator => (
              <Avatar key={collaborator.id} className="h-6 w-6">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${collaborator.email}`} />
                <AvatarFallback className="text-xs">
                  {collaborator.name?.charAt(0) || collaborator.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.collaborators.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.collaborators.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            {project.metadata.frameworksUsed.map(framework => (
              <Badge key={framework} variant="secondary" className="text-xs">
                {framework.replace('-', ' ')}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Modified {new Date(project.metadata.modifiedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};