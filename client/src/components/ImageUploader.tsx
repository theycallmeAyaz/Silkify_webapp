/**
 * ImageUploader Component
 * 
 * Provides a user interface for uploading images via drag-and-drop or file selection.
 * Validates image files and uploads them to the server.
 */

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

/**
 * Props for the ImageUploader component
 */
interface ImageUploaderProps {
  onImageUpload: (file: File, dataUrl: string) => void;  // Called when image upload is successful
  onError: (message: string) => void;                    // Called when an error occurs during upload
}

export default function ImageUploader({ onImageUpload, onError }: ImageUploaderProps) {
  // Track if user is currently dragging a file over the dropzone
  const [isDragging, setIsDragging] = useState(false);
  
  /**
   * Mutation hook for handling the image upload process
   * Sends the image to the server and handles the response
   */
  const uploadMutation = useMutation({
    // Function to perform the actual upload
    mutationFn: async (file: File) => {
      // Create form data with the image file
      const formData = new FormData();
      formData.append("image", file);
      
      // Send the image to the server
      const response = await apiRequest("POST", "/api/upload", undefined, formData);
      return await response.json();
    },
    // Handle successful upload
    onSuccess: (data, file) => {
      // Create a data URL with the base64 data returned from server
      onImageUpload(file, `data:${file.type};base64,${data.imageBase64}`);
    },
    // Handle upload errors
    onError: (error: any) => {
      onError(error.message || "Failed to upload image");
    }
  });
  
  /**
   * Validates that the uploaded file meets requirements
   * 
   * @param file - The file to validate
   * @returns Error message if invalid, null if valid
   */
  const validateFile = (file: File): string | null => {
    // Check file type is an accepted image format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image (JPG, PNG, WEBP)';
    }
    
    // Check file size doesn't exceed 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return 'Image size should not exceed 5MB';
    }
    
    // File is valid
    return null;
  };
  
  /**
   * Callback function for when files are dropped or selected
   * Validates the file and triggers the upload if valid
   */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Exit if no files were accepted
    if (acceptedFiles.length === 0) return;
    
    // Get the first file (we only accept one file at a time)
    const file = acceptedFiles[0];
    // Validate the file
    const error = validateFile(file);
    
    // Show error and don't upload if validation failed
    if (error) {
      onError(error);
      return;
    }
    
    // Upload the file if it's valid
    uploadMutation.mutate(file);
  }, [onError, uploadMutation]);
  
  /**
   * Set up the react-dropzone hook with our configuration and callbacks
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,                  // Handle dropped files
    accept: {                // Only accept these image types
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1              // Only allow one file at a time
  });
  
  /**
   * Render the file upload interface
   * 
   * Creates a drag-and-drop area with visual feedback and file selection button
   */
  return (
    <div className="mb-10">
      {/* Dropzone container - receives all the props from react-dropzone */}
      <div 
        {...getRootProps()} 
        className={`upload-area rounded-xl p-8 text-center bg-white cursor-pointer shadow-sm transition-all ${
          // Change styles when user is dragging a file over the area
          isDragActive || isDragging ? "border-primary bg-primary/5" : "border-dashed border-2 border-gray-300"
        }`}
        // Track drag state for visual feedback
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={() => setIsDragging(false)}
      >
        {/* Upload UI elements */}
        <div className="upload-placeholder">
          {/* Upload icon */}
          <Upload className="h-16 w-16 mx-auto text-gray-400" />
          
          {/* Instructions text */}
          <h3 className="mt-4 text-lg font-medium">Drag & drop an image here</h3>
          <p className="mt-2 text-sm text-gray-500">or</p>
          
          {/* File browser button */}
          <Button 
            className="mt-4 bg-primary hover:bg-primary/90 text-white"
            disabled={uploadMutation.isPending} // Disable during upload
          >
            {/* Change text based on upload state */}
            {uploadMutation.isPending ? "Uploading..." : "Browse files"}
          </Button>
          
          {/* Hidden file input - controlled by react-dropzone */}
          <input {...getInputProps()} data-testid="file-input" />
          
          {/* File requirements information */}
          <p className="mt-4 text-xs text-gray-500">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
        </div>
      </div>
    </div>
  );
}
