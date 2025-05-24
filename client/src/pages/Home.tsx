import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import TransformationWorkspace from "@/components/TransformationWorkspace";
import LoadingOverlay from "@/components/LoadingOverlay";
import ErrorMessage from "@/components/ErrorMessage";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<{ file: File; dataUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleImageUpload = (file: File, dataUrl: string) => {
    setOriginalImage({ file, dataUrl });
  };
  
  const handleError = (message: string) => {
    setError(message);
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);
  };
  
  const resetAll = () => {
    setOriginalImage(null);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Silkify
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform your images into different art styles using AI. Upload an image and choose a style to see the magic happen.
          </p>
        </header>

        <main>
          {!originalImage ? (
            <ImageUploader onImageUpload={handleImageUpload} onError={handleError} />
          ) : (
            <TransformationWorkspace 
              originalImage={originalImage} 
              onReset={resetAll} 
              setIsLoading={setIsLoading}
              onError={handleError}
            />
          )}
          
          <LoadingOverlay isVisible={isLoading} />
          <ErrorMessage message={error} isVisible={!!error} />
        </main>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Powered by AI image style transfer technology. &copy; {new Date().getFullYear()} @Silkify Team</p>
        </footer>
      </div>
    </div>
  );
}
