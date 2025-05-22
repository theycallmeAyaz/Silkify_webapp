interface LoadingOverlayProps {
  isVisible: boolean;
}

export default function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="loader h-10 w-10 rounded-full border-4 border-gray-200 border-t-primary"></div>
          <div>
            <h3 className="text-lg font-medium">Transforming Your Image</h3>
            <p className="text-gray-500 text-sm">This may take a moment...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
