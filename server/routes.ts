/**
 * API Routes Configuration
 * 
 * This file defines all the API endpoints for the Silkify application,
 * handling image uploads, style retrieval, and image transformations.
 */

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { transformImageWithGemini } from "./gemini";
import { transformImage } from "./openai";
import multer from "multer";
import { styleTransformSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { STYLES } from "@shared/types";

/**
 * Configure multer middleware for handling file uploads
 * 
 * This setup:
 * - Uses in-memory storage instead of writing to disk
 * - Limits file size to 5MB to prevent large uploads
 * - Validates file types to ensure only allowed image formats are accepted
 */
const upload = multer({
  // Store files in memory rather than on disk
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size
  },
  // File type validation function
  fileFilter: (_req, file, cb) => {
    // Verify the file is an image
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    // Only accept specific image formats (JPEG, PNG, WEBP)
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return cb(new Error("Please upload a valid image (JPG, PNG, WEBP)"));
    }
    // Accept the file if it passes all checks
    cb(null, true);
  },
});

/**
 * Register all API routes for the application
 * 
 * @param app - Express application instance
 * @returns HTTP server instance
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Create an HTTP server with the Express app
  const httpServer = createServer(app);

  /**
   * GET /api/styles
   * 
   * Returns a list of all available art styles that can be applied to images
   * Used by the frontend to populate the style selection UI
   */
  app.get("/api/styles", (_req: Request, res: Response) => {
    // Return the predefined styles array from shared types
    return res.json(STYLES);
  });

  /**
   * POST /api/upload
   * 
   * Handles image upload from the client
   * Processes and validates the image using multer middleware
   * Returns the base64-encoded image data to the client
   */
  app.post("/api/upload", upload.single("image"), async (req: Request, res: Response) => {
    try {
      // Verify that an image file was included in the request
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }

      // Convert the uploaded image buffer to base64 for easier processing
      const imageBase64 = req.file.buffer.toString("base64");

      // Return the base64 image data and original filename to the client
      return res.status(200).json({ 
        imageBase64,
        originalName: req.file.originalname 
      });
    } catch (error: any) {
      // Log and return any errors that occur during upload
      console.error("Error uploading image:", error);
      return res.status(500).json({ message: error.message || "Failed to upload image" });
    }
  });

  /**
   * POST /api/transform
   * 
   * Transforms an uploaded image into the selected art style
   * Uses Gemini AI for image analysis and description generation
   * Returns a URL to the transformed image
   */
  app.post("/api/transform", async (req: Request, res: Response) => {
    try {
      // Extract style and image data from request body
      const { style, imageBase64 } = req.body;

      // Validate that the selected style is one of the supported options
      const validationResult = styleTransformSchema.safeParse({ style });
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid style selected" });
      }

      // Ensure image data was provided in the request
      if (!imageBase64) {
        return res.status(400).json({ message: "No image data provided" });
      }

      // Log the start of transformation for debugging
      console.log(`Starting image transformation with style: ${style}`);
      
      // Process the image using OpenAI instead of Gemini AI
      // This uses OpenAI's DALL-E 3 for more reliable image transformations
      const transformedImageUrl = await transformImage(imageBase64, style);
      console.log("Image transformation completed successfully");

      // Return the URL of the transformed image to the client
      return res.status(200).json({ transformedImageUrl });
    } catch (error: any) {
      // Log and return any errors that occur during transformation
      console.error("Error transforming image:", error);
      return res.status(500).json({ 
        message: error.message || "Failed to transform image"
      });
    }
  });

  // Return the configured HTTP server
  return httpServer;
}
