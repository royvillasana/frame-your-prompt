import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UX_FRAMEWORKS } from "@/types/project";
import { ArrowRight, FolderPlus } from "lucide-react";
interface ProjectConfigStepProps {
  onNext: (projectName: string, description: string, framework: string) => void;
}
export const ProjectConfigStep = ({
  onNext
}: ProjectConfigStepProps) => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const handleNext = () => {
    if (!projectName.trim() || !selectedFramework) return;
    onNext(projectName.trim(), description.trim(), selectedFramework);
  };
  return <Card className="bg-gradient-card shadow-medium">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FolderPlus className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Configurar Proyecto</CardTitle>
        </div>
        <CardDescription>
          Primero configura tu proyecto para organizar tus prompts de UX
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="project-name">Nombre del Proyecto*</Label>
          <Input id="project-name" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="ej. App Móvil de Fintech" className="text-lg" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción (Opcional)</Label>
          <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descripción de tu proyecto..." rows={3} />
        </div>

        

        <div className="flex justify-end pt-4">
          <Button onClick={handleNext} disabled={!projectName.trim() || !selectedFramework} className="gap-2">
            Continuar con Contexto
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>;
};