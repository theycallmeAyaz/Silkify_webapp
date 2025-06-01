// Common types shared between client and server

export interface ImageTransformationRequest {
  style: 'lego' | 'anime' | 'ghibli' | 'futuristic' | 'vintage';
  imageBase64: string;
}

export interface ImageTransformationResponse {
  transformedImageUrl: string;
}

export interface ErrorResponse {
  message: string;
}

export const STYLES = [
  { id: 'lego', name: 'Lego', description: 'Transform into Lego brick style art' },
  { id: 'anime', name: 'Anime', description: 'Transform into Japanese anime style' },
  { id: 'ghibli', name: 'Ghibli', description: 'Transform into Studio Ghibli style' },
  { id: 'futuristic', name: 'Futuristic', description: 'Transform into sci-fi futuristic style' },
  { id: 'vintage', name: 'Vintage', description: 'Transform into vintage/retro style' }
];

export const STYLE_PROMPTS = {
  lego: "Transform this image into a LEGO brick style artwork, with clear plastic brick textures, vibrant primary colors, and the characteristic blocky LEGO aesthetic. Make it look like it was built with actual LEGO bricks.",
  anime: "Transform this image into a Japanese anime style illustration with vibrant colors, distinctive facial features like large expressive eyes, simplified details, and smooth outlines. Use the style commonly seen in popular anime.",
  ghibli: "Transform this image into a Studio Ghibli style illustration with soft watercolor-like textures, muted pastel colors, delicate details in nature elements, and the dreamlike quality characteristic of Hayao Miyazaki's films.",
  futuristic: "Transform this image into a sci-fi futuristic style with holographic elements, neon lighting, sleek metallic surfaces, advanced technology aesthetics, and a high-contrast color scheme dominated by blues and purples.",
  vintage: "Transform this image into a vintage/retro style with faded colors, subtle film grain, slightly washed-out contrast, and the aged aesthetic of photographs from the 1960s-70s."
};
