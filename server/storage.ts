import { type User, type InsertUser, type LambCalculation, type InsertLambCalculation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveLambCalculation(calculation: InsertLambCalculation): Promise<LambCalculation>;
  getLambCalculation(id: string): Promise<LambCalculation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private lambCalculations: Map<string, LambCalculation>;

  constructor() {
    this.users = new Map();
    this.lambCalculations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveLambCalculation(insertCalculation: InsertLambCalculation): Promise<LambCalculation> {
    const id = randomUUID();
    const calculation: LambCalculation = { ...insertCalculation, id };
    this.lambCalculations.set(id, calculation);
    return calculation;
  }

  async getLambCalculation(id: string): Promise<LambCalculation | undefined> {
    return this.lambCalculations.get(id);
  }
}

export const storage = new MemStorage();
