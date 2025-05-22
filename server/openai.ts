import OpenAI from "openai";
import fs from "fs";
import { STYLE_PROMPTS } from "@shared/types";

if (!process.env.OPENAI_API_KEY) {
  console.warn("Missing OPENAI_API_KEY environment variable");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// Make sure we're using the API key correctly
console.log("OpenAI API Key is configured (first few chars):", process.env.OPENAI_API_KEY?.substring(0, 5) + "...");
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Transforms an image using OpenAI's image generation capabilities
 */
export async function transformImage(
  imageBase64: string, 
  style: 'lego' | 'anime' | 'ghibli' | 'futuristic' | 'vintage'
): Promise<string> {
  try {
    const prompt = STYLE_PROMPTS[style];
    
    // Use GPT-4o for image transformation
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ],
        },
      ],
    });

    // Generate new image with DALL-E based on the description
    const description = response.choices[0].message.content;
    const generatedImage = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${description}\n\nUsing the style: ${prompt}`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return generatedImage.data[0].url;
  } catch (error: any) {
    console.error("Error transforming image:", error.message);
    throw new Error(`Failed to transform image: ${error.message}`);
  }
}
