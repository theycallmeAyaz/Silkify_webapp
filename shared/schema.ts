import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Image schema
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  originalFilename: text("original_filename").notNull(),
  originalUrl: text("original_url").notNull(),
  userId: integer("user_id"),
  createdAt: text("created_at").notNull().default("NOW()"),
});

export const insertImageSchema = createInsertSchema(images).pick({
  originalFilename: true,
  originalUrl: true,
  userId: true,
});

// Transformation schema
export const transformations = pgTable("transformations", {
  id: serial("id").primaryKey(),
  imageId: integer("image_id").notNull(),
  style: text("style").notNull(),
  transformedUrl: text("transformed_url").notNull(),
  createdAt: text("created_at").notNull().default("NOW()"),
});

export const insertTransformationSchema = createInsertSchema(transformations).pick({
  imageId: true,
  style: true,
  transformedUrl: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;

export type InsertTransformation = z.infer<typeof insertTransformationSchema>;
export type Transformation = typeof transformations.$inferSelect;

// Validation schemas
export const imageUploadSchema = z.object({
  image: z.instanceof(File).refine(
    (file) => file.size < 5 * 1024 * 1024, 
    "Image size should not exceed 5MB"
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    "Please upload a valid image (JPG, PNG, WEBP)"
  ),
});

export const styleTransformSchema = z.object({
  style: z.enum(['lego', 'anime', 'ghibli', 'futuristic', 'vintage']),
});
