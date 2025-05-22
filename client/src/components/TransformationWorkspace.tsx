import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StyleSelection from "@/components/StyleSelection";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, Download, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TransformationWorkspaceProps {
  originalImage: { file: File; dataUrl: string };
  onReset: () => void;
  setIsLoading: (loading: boolean) => void;
  onError: (message: string) => void;
}

export default function TransformationWorkspace({ 
  originalImage, 
  onReset, 
  setIsLoading,
  onError
}: TransformationWorkspaceProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [transformedImageUrl, setTransformedImageUrl] = useState<string | null>(null);
  
  const transformMutation = useMutation({
    mutationFn: async ({ style, imageBase64 }: { style: string; imageBase64: string }) => {
      const response = await apiRequest("POST", "/api/transform", {
        style,
        imageBase64
      });
      return await response.json();
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data) => {
      setTransformedImageUrl(data.transformedImageUrl);
    },
    onError: (error: any) => {
      onError(error.message || "Failed to transform image");
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });
  
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };
  
  const handleTransform = () => {
    if (!selectedStyle || !originalImage) return;
    
    // Extract base64 data from dataUrl by removing the prefix
    const base64Data = originalImage.dataUrl.split(',')[1];
    
    transformMutation.mutate({
      style: selectedStyle,
      imageBase64: base64Data
    });
  };
  
  const handleDownload = () => {
    if (!transformedImageUrl) return;
    
    const link = document.createElement("a");
    link.href = transformedImageUrl;
    link.download = `artstyler-${selectedStyle}-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const resetTransformation = () => {
    setSelectedStyle(null);
    setTransformedImageUrl(null);
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column - Original Image & Styles */}
      <div className="w-full lg:w-1/2 space-y-6">
        {/* Original Image */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Original Image</h3>
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={originalImage.dataUrl} 
                alt="Original uploaded image" 
                className="w-full h-full object-contain" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Style Selection */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Choose Art Style</h3>
            <StyleSelection 
              selectedStyle={selectedStyle} 
              onStyleSelect={handleStyleSelect} 
            />
          </CardContent>
        </Card>

        {/* Transform Button */}
        <Button 
          onClick={handleTransform}
          className="w-full py-6 bg-primary hover:bg-primary/90 text-white"
          disabled={!selectedStyle || transformMutation.isPending}
        >
          Transform Image
        </Button>
      </div>

      {/* Right Column - Transformed Image & Actions */}
      <div className="w-full lg:w-1/2">
        <Card className="shadow-sm h-full">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Transformed Image</h3>
              {selectedStyle && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Style
                </Badge>
              )}
            </div>

            {/* Transformed Image Container */}
            <div className="relative aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              {!transformedImageUrl ? (
                <div className="text-center p-6">
                  <Image className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Transform your image to see the result here</p>
                </div>
              ) : (
                <img 
                  src={transformedImageUrl} 
                  alt="Transformed image" 
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Actions */}
            {transformedImageUrl && (
              <div className="space-y-3">
                <Button 
                  onClick={handleDownload}
                  className="w-full py-6 bg-dark hover:bg-dark/90 text-white flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download Image
                </Button>

                <Button 
                  onClick={resetTransformation}
                  className="w-full py-6 border border-primary text-primary hover:bg-primary/5"
                  variant="outline"
                >
                  Try Different Style
                </Button>

                <Button 
                  onClick={onReset}
                  className="w-full py-6 border border-gray-300 text-gray-700 hover:bg-gray-50"
                  variant="outline"
                >
                  Upload New Image
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
