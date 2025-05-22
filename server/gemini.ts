import { GoogleGenerativeAI } from "@google/generative-ai";
import { STYLE_PROMPTS } from "@shared/types";
import OpenAI from "openai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("Missing GEMINI_API_KEY environment variable");
}

// Initialize the Gemini API
console.log("Gemini API Key is configured (first few chars):", process.env.GEMINI_API_KEY?.substring(0, 5) + "...");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Initialize OpenAI for image generation (we'll still use DALL-E for the final generation)
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Transforms an image using Gemini for vision analysis and DALL-E for image generation
 */
export async function transformImageWithGemini(
  imageBase64: string, 
  style: 'lego' | 'anime' | 'ghibli' | 'futuristic' | 'vintage'
): Promise<string> {
  try {
    const prompt = STYLE_PROMPTS[style];
    
    // Get Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    // Create image parts for the model
    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ];
    
    // Generate a detailed description of the image with Gemini
    const result = await model.generateContent([
      prompt,
      ...imageParts,
    ]);
    const description = result.response.text();
    console.log("Gemini generated description:", description.substring(0, 100) + "...");
    
    // Use the description to generate an image with DALL-E
    const generatedImage = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${description}\n\nUsing the style: ${prompt}`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    // Safely access the URL with null coalescing
    const imageUrl = generatedImage.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("Failed to generate image URL");
    }
    
    return imageUrl;
  } catch (error: any) {
    console.error("Error transforming image with Gemini:", error.message);
    throw new Error(`Failed to transform image with Gemini: ${error.message}`);
  }
}