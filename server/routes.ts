import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import type { CalculationRequest, CalculationResult, LambCut } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Lamb calculator endpoint
  app.post("/api/calculate-lamb", async (req, res) => {
    try {
      const requestSchema = z.object({
        people: z.number().min(1).max(50),
        hungerLevel: z.enum(['snacky', 'hungry', 'starving'])
      });

      const { people, hungerLevel } = requestSchema.parse(req.body);

      // Calculate lamb requirements
      const result = calculateLambRequirements(people, hungerLevel);

      // Optionally save calculation to storage
      await storage.saveLambCalculation({
        people,
        hungerLevel,
        totalWeight: result.totalWeight.split('-')[0], // Store the minimum weight
        recommendations: JSON.stringify(result.cuts)
      });

      res.json(result);
    } catch (error) {
      console.error('Calculation error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid calculation request" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateLambRequirements(people: number, hungerLevel: string): CalculationResult {
  // Base serving sizes (in ounces)
  const servingSizes = {
    snacky: 5,   // 4-6oz
    hungry: 7,   // 6-8oz 
    starving: 9  // 8-10oz
  };

  const baseServing = servingSizes[hungerLevel as keyof typeof servingSizes];
  const totalOunces = people * baseServing;
  const totalPounds = Math.ceil(totalOunces / 16 * 10) / 10; // Round to nearest 0.1 lb

  // Calculate weight range
  const minWeight = Math.max(1, Math.floor(totalPounds - 0.5));
  const maxWeight = Math.ceil(totalPounds + 0.5);
  const totalWeight = `${minWeight}-${maxWeight} lbs`;

  // Generate description
  const hungerText = hungerLevel.charAt(0).toUpperCase() + hungerLevel.slice(1);
  const peopleText = people === 1 ? 'person' : 'people';
  const totalDescription = `For ${people} ${hungerText.toLowerCase()} ${peopleText}`;

  // Generate cut recommendations based on group size
  const cuts = generateCutRecommendations(people, hungerLevel);

  // Generate serving tips
  const servingTips = [
    "Allow 30 minutes resting time before serving",
    "Consider sides: roasted vegetables, potatoes",
    "Order 10% extra for leftovers",
    "Use a meat thermometer for perfect doneness"
  ];

  return {
    totalWeight,
    totalDescription,
    cuts,
    servingTips
  };
}

function generateCutRecommendations(people: number, hungerLevel: string): LambCut[] {
  if (people <= 2) {
    return [
      { name: 'Lamb Chops', amount: `${people * 2}-${people * 3} pieces`, icon: 'utensils' },
      { name: 'Rack of Lamb', amount: '1 rack (8 ribs)', icon: 'drumstick-bite' }
    ];
  } else if (people <= 6) {
    return [
      { name: 'Leg of Lamb', amount: '1 whole leg (5-7 lbs)', icon: 'drumstick-bite' },
      { name: 'Lamb Shoulder', amount: '1 shoulder roast (3-4 lbs)', icon: 'beef' },
      { name: 'Lamb Chops', amount: `${people * 2} pieces`, icon: 'utensils' }
    ];
  } else {
    return [
      { name: 'Whole Lamb Leg', amount: '1-2 legs (10-14 lbs total)', icon: 'drumstick-bite' },
      { name: 'Lamb Shoulder Roast', amount: '2 roasts (6-8 lbs total)', icon: 'beef' },
      { name: 'Lamb Shanks', amount: `${people} pieces`, icon: 'utensils' }
    ];
  }
}
