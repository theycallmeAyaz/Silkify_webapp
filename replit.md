# ArtStyler Image Transformation Application

## Overview

ArtStyler is a web application for transforming images into different art styles using AI. Users can upload images and convert them into various styles like Lego, Anime, Ghibli, Futuristic, or Vintage using OpenAI's image generation capabilities. The application features a React frontend with a modern UI using shadcn/ui components and an Express backend that handles image processing through OpenAI's API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- Built with React using Vite as the build tool
- Uses shadcn/ui components library for UI elements
- State management with React Query for API interactions
- Written in TypeScript for type safety
- Styled with Tailwind CSS for responsive design

### Backend
- Express.js server handling API requests
- OpenAI integration for image transformations
- File upload handling with multer

### Data Persistence
- PostgreSQL database accessed through Drizzle ORM
- Schema defined for users, images, and transformations

### API Structure
- RESTful API endpoints for image upload and transformation
- Shared type definitions between frontend and backend

## Key Components

### Frontend Components
1. **ImageUploader**: Handles image selection, validation, and upload
2. **StyleSelection**: Displays available transformation styles
3. **TransformationWorkspace**: Shows original and transformed images
4. **UI Components**: shadcn/ui library provides consistent styling

### Backend Services
1. **OpenAI Integration**: Transforms images using AI models
2. **Storage Service**: Manages database operations for users and images
3. **Express Routes**: Defines API endpoints and request handling

### Database Schema
1. **Users**: Stores user information
2. **Images**: Tracks uploaded images
3. **Transformations**: Records image transformations with style and URL info

## Data Flow

1. **Image Upload**:
   - User selects an image through the ImageUploader component
   - Frontend validates the image (format, size) and sends to backend
   - Backend stores the original image and returns the image data

2. **Style Selection**:
   - User selects a transformation style from available options
   - Frontend displays a preview of style options

3. **Image Transformation**:
   - User triggers transformation with selected style
   - Request sent to backend with image and style information
   - Backend calls OpenAI API to transform the image
   - Transformed image URL returned to frontend and displayed

4. **Result Management**:
   - Transformed images are stored in the database
   - User can download the transformed image

## External Dependencies

### Frontend
- React and React DOM for UI rendering
- React Query for API state management
- shadcn/ui and Radix UI for UI components
- Tailwind CSS for styling

### Backend
- Express for server and routing
- OpenAI SDK for AI image transformations
- Multer for file upload handling
- Drizzle ORM for database access
- PostgreSQL (via Neon Database serverless connector)

### Development Tools
- TypeScript for type checking
- Vite for frontend development and building
- ESBuild for server bundling

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Build Process**:
   - Vite builds the frontend into static assets
   - ESBuild bundles the server code

2. **Runtime Configuration**:
   - Environment variables for API keys and database connections
   - Production mode optimizations

3. **Database**:
   - PostgreSQL database connection through environment variables
   - Drizzle ORM for database schema management and migrations

4. **Scaling**:
   - Configured for autoscaling deployment on Replit
   - Ports properly exposed for web access