import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { transformImage } from "./openai";
import { transformImageWithGemini } from "./gemini";
import multer from "multer";
import { styleTransformSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { STYLES } from "@shared/types";

// Configure multer for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    // Only allow these image types
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return cb(new Error("Please upload a valid image (JPG, PNG, WEBP)"));
    }
    cb(null, true);
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HttpServer
  const httpServer = createServer(app);

  // Endpoint to get the available styles
  app.get("/api/styles", (_req: Request, res: Response) => {
    return res.json(STYLES);
  });

  // Endpoint to upload an image
  app.post("/api/upload", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }

      // Convert image to base64
      const imageBase64 = req.file.buffer.toString("base64");

      // Return the base64 image for client-side display
      return res.status(200).json({ 
        imageBase64,
        originalName: req.file.originalname 
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      return res.status(500).json({ message: error.message || "Failed to upload image" });
    }
  });

  // Endpoint to transform an image
  app.post("/api/transform", async (req: Request, res: Response) => {
    try {
      const { style, imageBase64 } = req.body;

      // Validate style
      const validationResult = styleTransformSchema.safeParse({ style });
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid style selected" });
      }

      if (!imageBase64) {
        return res.status(400).json({ message: "No image data provided" });
      }

      // Perform the image transformation using Gemini instead of OpenAI
      console.log(`Starting image transformation with style: ${style}`);
      const transformedImageUrl = await transformImageWithGemini(imageBase64, style);
      console.log("Image transformation completed successfully");

      // Return the transformed image URL
      return res.status(200).json({ transformedImageUrl });
    } catch (error: any) {
      console.error("Error transforming image:", error);
      return res.status(500).json({ 
        message: error.message || "Failed to transform image"
      });
    }
  });

  return httpServer;
}
