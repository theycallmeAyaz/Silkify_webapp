import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ImageUploaderProps {
  onImageUpload: (file: File, dataUrl: string) => void;
  onError: (message: string) => void;
}

export default function ImageUploader({ onImageUpload, onError }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await apiRequest("POST", "/api/upload", undefined, formData);
      return await response.json();
    },
    onSuccess: (data, file) => {
      onImageUpload(file, `data:${file.type};base64,${data.imageBase64}`);
    },
    onError: (error: any) => {
      onError(error.message || "Failed to upload image");
    }
  });
  
  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image (JPG, PNG, WEBP)';
    }
    
    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'Image size should not exceed 5MB';
    }
    
    return null;
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const error = validateFile(file);
    
    if (error) {
      onError(error);
      return;
    }
    
    uploadMutation.mutate(file);
  }, [onError, uploadMutation]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1
  });
  
  return (
    <div className="mb-10">
      <div 
        {...getRootProps()} 
        className={`upload-area rounded-xl p-8 text-center bg-white cursor-pointer shadow-sm transition-all ${
          isDragActive || isDragging ? "border-primary bg-primary/5" : "border-dashed border-2 border-gray-300"
        }`}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={() => setIsDragging(false)}
      >
        <div className="upload-placeholder">
          <Upload className="h-16 w-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Drag & drop an image here</h3>
          <p className="mt-2 text-sm text-gray-500">or</p>
          <Button 
            className="mt-4 bg-primary hover:bg-primary/90 text-white"
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Browse files"}
          </Button>
          <input {...getInputProps()} data-testid="file-input" />
          <p className="mt-4 text-xs text-gray-500">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
        </div>
      </div>
    </div>
  );
}
