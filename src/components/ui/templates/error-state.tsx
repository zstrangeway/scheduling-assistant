import { AlertCircle } from "lucide-react";
import { Button } from "../atoms/button";
import { Card, CardContent } from "../molecules/card";

interface ErrorStateProps {
  error: string;
  title?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorState({ 
  error, 
  title = "Something went wrong", 
  onRetry,
  retryText = "Try Again"
}: ErrorStateProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          {onRetry && (
            <Button onClick={onRetry}>
              {retryText}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}