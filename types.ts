
export interface Cocktail {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  glassType: string; // e.g., "Rocks", "Coupe"
  method: string; // e.g., "Shake", "Stir", "Build"
  flavorProfile: string; // e.g., "Sour", "Bitter", "Sweet", "Smoky"
  colorHex: string; // approximate color of the drink
  type: 'classic' | 'ai';
  mixologistReasoning?: string; // Professional explanation of the flavor balance
}

export interface MixologyResponse {
  classics: Cocktail[];
  aiCreations: Cocktail[];
}

export interface IngredientPillProps {
  name: string;
  onRemove: (name: string) => void;
}
