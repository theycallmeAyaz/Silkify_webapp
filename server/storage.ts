import { 
  users, type User, type InsertUser,
  images, type Image, type InsertImage,
  transformations, type Transformation, type InsertTransformation
} from "@shared/schema";

// Storage interface
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Images
  getImage(id: number): Promise<Image | undefined>;
  createImage(image: InsertImage): Promise<Image>;
  
  // Transformations
  getTransformation(id: number): Promise<Transformation | undefined>;
  getTransformationsByImageId(imageId: number): Promise<Transformation[]>;
  createTransformation(transformation: InsertTransformation): Promise<Transformation>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private images: Map<number, Image>;
  private transformations: Map<number, Transformation>;
  private userIdCounter: number;
  private imageIdCounter: number;
  private transformationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.images = new Map();
    this.transformations = new Map();
    this.userIdCounter = 1;
    this.imageIdCounter = 1;
    this.transformationIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Image methods
  async getImage(id: number): Promise<Image | undefined> {
    return this.images.get(id);
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.imageIdCounter++;
    const image: Image = { 
      ...insertImage, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.images.set(id, image);
    return image;
  }

  // Transformation methods
  async getTransformation(id: number): Promise<Transformation | undefined> {
    return this.transformations.get(id);
  }

  async getTransformationsByImageId(imageId: number): Promise<Transformation[]> {
    return Array.from(this.transformations.values()).filter(
      (transformation) => transformation.imageId === imageId
    );
  }

  async createTransformation(insertTransformation: InsertTransformation): Promise<Transformation> {
    const id = this.transformationIdCounter++;
    const transformation: Transformation = { 
      ...insertTransformation, 
      id,
      createdAt: new Date().toISOString() 
    };
    this.transformations.set(id, transformation);
    return transformation;
  }
}

export const storage = new MemStorage();
