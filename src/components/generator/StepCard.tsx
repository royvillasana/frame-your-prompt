import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface StepCardProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  children: ReactNode;
  isActive?: boolean;
}

export const StepCard = ({ step, totalSteps, title, description, children, isActive = true }: StepCardProps) => {
  return (
    <Card className={`transition-all duration-300 ${isActive ? 'bg-gradient-card shadow-medium' : 'bg-muted/50'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={isActive ? "default" : "secondary"} className="text-sm">
              Step {step} of {totalSteps}
            </Badge>
            {!isActive && <Badge variant="outline">Completed</Badge>}
          </div>
        </div>
        <CardTitle className={`text-xl ${!isActive && 'text-muted-foreground'}`}>{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};