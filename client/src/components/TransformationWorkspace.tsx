/**
 * TransformationWorkspace Component
 * 
 * This component is the main workspace for image transformation.
 * It shows the original image, style selection options, and the transformed result.
 * Handles the image transformation process through API calls to the backend.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StyleSelection from "@/components/StyleSelection";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, Download, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Props interface for the TransformationWorkspace component
 */
interface TransformationWorkspaceProps {
  originalImage: { file: File; dataUrl: string }; // The uploaded image data
  onReset: () => void;                            // Function to reset the entire workspace
  setIsLoading: (loading: boolean) => void;       // Function to control loading state
  onError: (message: string) => void;             // Function to handle errors
}

export default function TransformationWorkspace({ 
  originalImage, 
  onReset, 
  setIsLoading,
  onError
}: TransformationWorkspaceProps) {
  // State to track the selected art style
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  // State to store the URL of the transformed image
  const [transformedImageUrl, setTransformedImageUrl] = useState<string | null>(null);
  
  /**
   * Mutation hook for making API requests to transform the image
   * Handles loading states, success, and error conditions
   */
  const transformMutation = useMutation({
    // Function that makes the actual API request
    mutationFn: async ({ style, imageBase64 }: { style: string; imageBase64: string }) => {
      const response = await apiRequest("POST", "/api/transform", {
        style,
        imageBase64
      });
      return await response.json();
    },
    // Set loading state to true when the mutation starts
    onMutate: () => {
      setIsLoading(true);
    },
    // Handle successful response by setting the transformed image URL
    onSuccess: (data) => {
      setTransformedImageUrl(data.transformedImageUrl);
    },
    // Handle errors by showing error messages
    onError: (error: any) => {
      onError(error.message || "Failed to transform image");
    },
    // Reset loading state when the mutation is complete (success or error)
    onSettled: () => {
      setIsLoading(false);
    }
  });
  
  /**
   * Updates the selected style when a user clicks on a style option
   * @param styleId - The ID of the selected style
   */
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };
  
  /**
   * Initiates the image transformation process
   * Extracts the base64 data and sends it to the API
   */
  const handleTransform = () => {
    // Don't proceed if no style is selected or no image is available
    if (!selectedStyle || !originalImage) return;
    
    // Extract base64 data from dataUrl by removing the prefix
    // dataUrl format is like: "data:image/jpeg;base64,/9j/4AAQS..."
    const base64Data = originalImage.dataUrl.split(',')[1];
    
    // Call the mutation to transform the image
    transformMutation.mutate({
      style: selectedStyle,
      imageBase64: base64Data
    });
  };
  
  /**
   * Handles downloading the transformed image
   * Creates a temporary link and triggers a download
   */
  const handleDownload = () => {
    if (!transformedImageUrl) return;
    
    // Create a virtual link element
    const link = document.createElement("a");
    link.href = transformedImageUrl;
    // Generate a filename with the style and timestamp
    link.download = `Silkify-${selectedStyle}-${new Date().getTime()}.png`;
    // Add to DOM, click it, then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  /**
   * Resets the transformation state to try a different style
   * Keeps the original image but clears style selection and result
   */
  const resetTransformation = () => {
    setSelectedStyle(null);
    setTransformedImageUrl(null);
  };
  
  /**
   * Component render function
   * 
   * The UI is divided into two main columns:
   * 1. Left column: Original image, style selection, and transform button
   * 2. Right column: Transformed image result and action buttons
   */
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column - Shows the original image and style selection options */}
      <div className="w-full lg:w-1/2 space-y-6">
        {/* Original Image Card - Displays the uploaded image */}
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

        {/* Style Selection Card - Shows available art styles to choose from */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Choose Art Style</h3>
            <StyleSelection 
              selectedStyle={selectedStyle} 
              onStyleSelect={handleStyleSelect} 
            />
          </CardContent>
        </Card>

        {/* Transform Button - Triggers the image transformation process */}
        <Button 
          onClick={handleTransform}
          className="w-full py-6 bg-primary hover:bg-primary/90 text-white"
          // Disable button if no style selected or transformation is in progress
          disabled={!selectedStyle || transformMutation.isPending}
        >
          Transform Image
        </Button>
      </div>

      {/* Right Column - Shows transformation results and action buttons */}
      <div className="w-full lg:w-1/2">
        <Card className="shadow-sm h-full">
          <CardContent className="p-4">
            {/* Header with title and style badge */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Transformed Image</h3>
              {/* Display the selected style name as a badge */}
              {selectedStyle && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Style
                </Badge>
              )}
            </div>

            {/* Transformed Image Container - Shows placeholder or result */}
            <div className="relative aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              {/* Show placeholder if no transformed image yet */}
              {!transformedImageUrl ? (
                <div className="text-center p-6">
                  <Image className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Transform your image to see the result here</p>
                </div>
              ) : (
                /* Show the transformed image when available */
                <img 
                  src={transformedImageUrl} 
                  alt="Transformed image" 
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Action Buttons - Only shown when there's a transformed image */}
            {transformedImageUrl && (
              <div className="space-y-3">
                {/* Download Button - Save the transformed image */}
                <Button 
                  onClick={handleDownload}
                  className="w-full py-6 bg-dark hover:bg-dark/90 text-white flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download Image
                </Button>

                {/* Try Different Style Button - Reset style but keep original image */}
                <Button 
                  onClick={resetTransformation}
                  className="w-full py-6 border border-primary text-primary hover:bg-primary/5"
                  variant="outline"
                >
                  Try Different Style
                </Button>

                {/* Upload New Image Button - Complete reset of the workspace */}
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
