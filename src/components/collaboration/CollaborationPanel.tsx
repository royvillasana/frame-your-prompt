import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Collaborator, 
  CollaboratorRole, 
  ProjectComment, 
  ProjectVersion 
} from '@/types';
import { 
  UserPlus, 
  Send, 
  MessageCircle, 
  Users, 
  History, 
  Settings,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Reply,
  Trash2,
  Edit,
  Crown,
  Shield,
  Eye,
  MessageSquare
} from 'lucide-react';

interface CollaborationPanelProps {
  projectId: string;
  collaborators: Collaborator[];
  comments: ProjectComment[];
  versions: ProjectVersion[];
  currentUserRole: CollaboratorRole;
  onInviteCollaborator: (email: string, role: CollaboratorRole) => void;
  onUpdateCollaboratorRole: (collaboratorId: string, role: CollaboratorRole) => void;
  onRemoveCollaborator: (collaboratorId: string) => void;
  onAddComment: (comment: Omit<ProjectComment, 'id' | 'createdAt'>) => void;
  onResolveComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  projectId,
  collaborators,
  comments,
  versions,
  currentUserRole,
  onInviteCollaborator,
  onUpdateCollaboratorRole,
  onRemoveCollaborator,
  onAddComment,
  onResolveComment,
  onDeleteComment
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>('viewer');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('team');

  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'editor';
  const canComment = currentUserRole !== 'viewer';

  const getRoleIcon = (role: CollaboratorRole) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'editor': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'commenter': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: CollaboratorRole) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-700';
      case 'editor': return 'bg-blue-100 text-blue-700';
      case 'commenter': return 'bg-green-100 text-green-700';
      case 'viewer': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleInviteCollaborator = () => {
    if (inviteEmail.trim()) {
      onInviteCollaborator(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setInviteRole('viewer');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment({
        projectId,
        author: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com'
        },
        content: newComment.trim(),
        resolved: false,
        ...(replyingTo && { replies: [] })
      });
      setNewComment('');
      setReplyingTo(null);
    }
  };

  const unresolvedComments = comments.filter(c => !c.resolved);
  const resolvedComments = comments.filter(c => c.resolved);

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <TabsList>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comments
              {unresolvedComments.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {unresolvedComments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Team Tab */}
        <TabsContent value="team" className="flex-1 flex flex-col p-4 space-y-4">
          {/* Invite Section */}
          {canManageTeam && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Invite Collaborator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: CollaboratorRole) => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer - Can view project</SelectItem>
                      <SelectItem value="commenter">Commenter - Can add comments</SelectItem>
                      <SelectItem value="editor">Editor - Can edit project</SelectItem>
                      {currentUserRole === 'owner' && (
                        <SelectItem value="owner">Owner - Full control</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleInviteCollaborator} className="w-full">
                  Send Invitation
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Team Members */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({collaborators.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {collaborators.map(collaborator => (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${collaborator.email}`}
                            alt={collaborator.name || collaborator.email}
                          />
                          <AvatarFallback>
                            {(collaborator.name || collaborator.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <p className="font-medium">
                            {collaborator.name || collaborator.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {collaborator.email}
                          </p>
                          {collaborator.lastActiveAt && (
                            <p className="text-xs text-muted-foreground">
                              Last active: {new Date(collaborator.lastActiveAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor(collaborator.role)}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(collaborator.role)}
                            {collaborator.role}
                          </div>
                        </Badge>
                        
                        {canManageTeam && collaborator.role !== 'owner' && (
                          <div className="flex gap-1">
                            <Select
                              value={collaborator.role}
                              onValueChange={(role: CollaboratorRole) => 
                                onUpdateCollaboratorRole(collaborator.id, role)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="commenter">Commenter</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                {currentUserRole === 'owner' && (
                                  <SelectItem value="owner">Owner</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveCollaborator(collaborator.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="flex-1 flex flex-col p-4 space-y-4">
          {/* Add Comment */}
          {canComment && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {replyingTo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Reply className="h-4 w-4" />
                      Replying to comment
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  
                  <div className="flex justify-end">
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      {replyingTo ? 'Reply' : 'Comment'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="flex-1 space-y-4">
            {/* Unresolved Comments */}
            {unresolvedComments.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Open Comments ({unresolvedComments.length})
                </h4>
                <div className="space-y-3">
                  {unresolvedComments.map(comment => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      canManage={canManageTeam}
                      onResolve={() => onResolveComment(comment.id)}
                      onDelete={() => onDeleteComment(comment.id)}
                      onReply={() => setReplyingTo(comment.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Resolved Comments */}
            {resolvedComments.length > 0 && (
              <div>
                <Separator />
                <h4 className="font-medium mb-3 mt-4 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Resolved Comments ({resolvedComments.length})
                </h4>
                <div className="space-y-3">
                  {resolvedComments.map(comment => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      canManage={canManageTeam}
                      onDelete={() => onDeleteComment(comment.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {comments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                <p>No comments yet</p>
                <p className="text-sm">Start a conversation about this project</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 flex flex-col p-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Project History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {versions.length > 0 ? (
                  <div className="space-y-4">
                    {versions.map(version => (
                      <div key={version.id} className="flex gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                            v{version.version}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-medium">{version.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(version.createdAt).toLocaleString()}
                          </p>
                          {version.changes.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {version.changes.map((change, index) => (
                                <div key={index} className="text-xs text-muted-foreground">
                                  • {change.description}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4" />
                    <p>No version history available</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface CommentCardProps {
  comment: ProjectComment;
  canManage: boolean;
  onResolve?: () => void;
  onDelete: () => void;
  onReply?: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  canManage,
  onResolve,
  onDelete,
  onReply
}) => {
  return (
    <Card className={comment.resolved ? 'opacity-75' : ''}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.email}`}
                  alt={comment.author.name}
                />
                <AvatarFallback>
                  {comment.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <p className="font-medium text-sm">{comment.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {comment.resolved && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
              
              {!comment.resolved && onResolve && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResolve}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              
              {onReply && !comment.resolved && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReply}
                >
                  <Reply className="h-4 w-4" />
                </Button>
              )}
              
              {canManage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-sm">{comment.content}</p>
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-4 pl-4 border-l space-y-2">
              {comment.replies.map(reply => (
                <div key={reply.id} className="text-sm">
                  <p className="font-medium">{reply.author.name}</p>
                  <p>{reply.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reply.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};