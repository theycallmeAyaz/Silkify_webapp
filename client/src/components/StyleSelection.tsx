import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { STYLES } from "@shared/types";

interface StyleSelectionProps {
  selectedStyle: string | null;
  onStyleSelect: (styleId: string) => void;
}

interface StyleCardProps {
  id: string;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

function StyleCard({ id, name, isSelected, onSelect }: StyleCardProps) {
  return (
    <div 
      className={`style-card rounded-lg border-2 overflow-hidden cursor-pointer ${
        isSelected ? 'border-primary shadow-md' : 'border-gray-200'
      }`}
      onClick={onSelect}
    >
      <div className={`w-full aspect-square bg-${id} bg-cover bg-center`}>
        {/* Style placeholder image, using different colored backgrounds for each style */}
        <div className={`w-full h-full bg-gradient-to-br ${getStyleGradient(id)}`}></div>
      </div>
      <div className="p-2 text-center bg-white">
        <span className="text-sm font-medium">{name}</span>
      </div>
    </div>
  );
}

function getStyleGradient(styleId: string): string {
  const gradients = {
    lego: 'from-yellow-500 to-red-500',
    anime: 'from-blue-400 to-purple-500',
    ghibli: 'from-green-400 to-teal-500',
    futuristic: 'from-blue-600 to-indigo-700',
    vintage: 'from-amber-300 to-orange-400',
  };
  
  return gradients[styleId as keyof typeof gradients] || 'from-gray-400 to-gray-600';
}

export default function StyleSelection({ selectedStyle, onStyleSelect }: StyleSelectionProps) {
  const { data: styles, isLoading } = useQuery({
    queryKey: ['/api/styles'],
    initialData: STYLES, // Use the predefined styles as initial data
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-lg border-2 border-gray-200 animate-pulse">
            <div className="w-full aspect-square bg-gray-200"></div>
            <div className="p-2 text-center bg-white">
              <div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {styles.map((style) => (
        <StyleCard
          key={style.id}
          id={style.id}
          name={style.name}
          isSelected={selectedStyle === style.id}
          onSelect={() => onStyleSelect(style.id)}
        />
      ))}
    </div>
  );
}
