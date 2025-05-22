import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string | null;
  isVisible: boolean;
}

export default function ErrorMessage({ message, isVisible }: ErrorMessageProps) {
  if (!isVisible || !message) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-destructive text-white p-4 rounded-lg shadow-lg max-w-xs animate-in fade-in slide-in-from-right-10 z-50">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-6 w-6 flex-shrink-0" />
        <div>
          <h4 className="font-medium">Error</h4>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
}
