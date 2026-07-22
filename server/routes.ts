import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { runMLEngine, type SoilInput } from "./ml-engine";
import {
  insertUserSchema,
  insertFarmSchema,
  insertSoilTestSchema,
  insertFertilizerRecommendationSchema,
  insertFertilizerUsageSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  // ─── Auth ───────────────────────────────────────────────────────────────────
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) return res.status(400).json({ message: "Phone number is required" });

      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await storage.createOtp({ phoneNumber, otpCode, expiresAt });

      let smsSent = false;
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const { default: twilio } = await import("twilio");
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          await client.messages.create({
            body: `Your FertilizerPro verification code is: ${otpCode}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
          });
          smsSent = true;
          console.log(`SMS sent to ${phoneNumber}`);
        } catch (err) {
          console.error("Failed to send SMS:", err);
        }
      } else {
        console.log(`[DEV] OTP for ${phoneNumber}: ${otpCode}`);
      }

      res.json({
        message: "OTP sent successfully",
        smsSent,
        otpCode: process.env.NODE_ENV === "development" ? otpCode : undefined,
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, otpCode, name } = req.body;
      if (!phoneNumber || !otpCode)
        return res.status(400).json({ message: "Phone number and OTP are required" });

      const validOtp = await storage.getValidOtp(phoneNumber, otpCode);
      if (!validOtp) return res.status(400).json({ message: "Invalid or expired OTP" });

      await storage.markOtpAsUsed(validOtp.id);

      let user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        user = await storage.createUser({ phoneNumber, name: name || null, isVerified: true });
      } else {
        user = await storage.updateUser(user.id, {
          isVerified: true,
          lastLoginAt: new Date(),
          name: name || user.name,
        });
      }

      res.json({
        message: "Login successful",
        user: { id: user!.id, phoneNumber: user!.phoneNumber, name: user!.name, isVerified: user!.isVerified },
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // ─── Users ──────────────────────────────────────────────────────────────────
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(req.params.id, updates);
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // ─── Farms ──────────────────────────────────────────────────────────────────
  app.get("/api/farms", async (req, res) => {
    try {
      const { userId } = req.query;
      const farms = userId
        ? await storage.getFarmsByUser(userId as string)
        : await storage.getFarms();
      res.json(farms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch farms" });
    }
  });

  app.get("/api/farms/:id", async (req, res) => {
    try {
      const { details } = req.query;
      if (details === "true") {
        const farm = await storage.getFarmWithDetails(req.params.id);
        if (!farm) return res.status(404).json({ message: "Farm not found" });
        return res.json(farm);
      }
      const farm = await storage.getFarm(req.params.id);
      if (!farm) return res.status(404).json({ message: "Farm not found" });
      res.json(farm);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch farm" });
    }
  });

  app.post("/api/farms", async (req, res) => {
    try {
      const farmData = insertFarmSchema.parse(req.body);
      const newFarm = await storage.createFarm(farmData);
      res.status(201).json(newFarm);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res.status(400).json({ message: "Invalid farm data", errors: error.errors });
      res.status(500).json({ message: "Failed to create farm" });
    }
  });

  app.put("/api/farms/:id", async (req, res) => {
    try {
      const updates = insertFarmSchema.partial().parse(req.body);
      const updatedFarm = await storage.updateFarm(req.params.id, updates);
      if (!updatedFarm) return res.status(404).json({ message: "Farm not found" });
      res.json(updatedFarm);
    } catch (error) {
      res.status(500).json({ message: "Failed to update farm" });
    }
  });

  // ─── Soil Tests ─────────────────────────────────────────────────────────────
  app.get("/api/soil-tests", async (req, res) => {
    try {
      const { userId, farmId } = req.query;
      let soilTests;
      if (farmId) {
        soilTests = await storage.getSoilTestsByFarm(farmId as string);
      } else {
        soilTests = await storage.getSoilTests();
        if (userId) {
          const userFarms = await storage.getFarmsByUser(userId as string);
          const farmIds = new Set(userFarms.map((f) => f.id));
          soilTests = soilTests.filter((st) => farmIds.has(st.farmId));
        }
      }
      res.json(soilTests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch soil tests" });
    }
  });

  app.get("/api/soil-tests/:id", async (req, res) => {
    try {
      const { details } = req.query;
      if (details === "true") {
        const st = await storage.getSoilTestWithRecommendation(req.params.id);
        if (!st) return res.status(404).json({ message: "Soil test not found" });
        return res.json(st);
      }
      const st = await storage.getSoilTest(req.params.id);
      if (!st) return res.status(404).json({ message: "Soil test not found" });
      res.json(st);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch soil test" });
    }
  });

  app.post("/api/soil-tests", async (req, res) => {
    try {
      const soilTestData = insertSoilTestSchema.parse(req.body);
      const newSoilTest = await storage.createSoilTest(soilTestData);

      const farm = await storage.getFarm(soilTestData.farmId);
      if (!farm) return res.status(404).json({ message: "Farm not found" });

      const soilInput: SoilInput = {
        nitrogen: Number(newSoilTest.nitrogen) || 0,
        phosphorus: Number(newSoilTest.phosphorus) || 0,
        potassium: Number(newSoilTest.potassium) || 0,
        ph: Number(newSoilTest.ph) || Number(farm.ph) || 6.5,
        organicMatter: Number(newSoilTest.organicMatter) || Number(farm.organicMatter) || 2.5,
        cropType: farm.cropType,
        soilType: farm.soilType,
        areaAcres: Number(farm.area),
      };

      const mlResult = runMLEngine(soilInput);

      const recommendation = await storage.createRecommendation({
        farmId: soilTestData.farmId,
        userId: farm.userId,
        soilTestId: newSoilTest.id,
        nitrogenReq: mlResult.requirements.nitrogen.toString(),
        phosphorusReq: mlResult.requirements.phosphorus.toString(),
        potassiumReq: mlResult.requirements.potassium.toString(),
        recommendedFertilizers: mlResult.recommendedFertilizers,
        applicationTiming: mlResult.applicationTiming,
        expectedYieldIncrease: mlResult.expectedYieldIncrease.toString(),
        sustainabilityScore: mlResult.sustainabilityScore,
      });

      res.status(201).json({ soilTest: newSoilTest, recommendation, mlResult });
    } catch (error) {
      console.error("Error creating soil test:", error);
      if (error instanceof z.ZodError)
        return res.status(400).json({ message: "Invalid soil test data", errors: error.errors });
      res.status(500).json({ message: "Failed to create soil test" });
    }
  });

  // ─── ML-Powered NPK Calculator ──────────────────────────────────────────────
  // Direct calculation (no soil test record required)
  app.post("/api/calculate-npk", async (req, res) => {
    try {
      const schema = z.object({
        farmId: z.string().optional(),
        cropType: z.string(),
        soilType: z.string(),
        areaAcres: z.number().positive(),
        nitrogen: z.number().min(0),
        phosphorus: z.number().min(0),
        potassium: z.number().min(0),
        ph: z.number().min(0).max(14),
        organicMatter: z.number().min(0),
        saveAsSoilTest: z.boolean().optional().default(false),
      });

      const input = schema.parse(req.body);
      const soilInput: SoilInput = {
        cropType: input.cropType,
        soilType: input.soilType,
        areaAcres: input.areaAcres,
        nitrogen: input.nitrogen,
        phosphorus: input.phosphorus,
        potassium: input.potassium,
        ph: input.ph,
        organicMatter: input.organicMatter,
      };

      const mlResult = runMLEngine(soilInput);

      // Optionally save as soil test + recommendation
      if (input.saveAsSoilTest && input.farmId) {
        const farm = await storage.getFarm(input.farmId);
        if (farm) {
          const soilTest = await storage.createSoilTest({
            farmId: input.farmId,
            nitrogen: input.nitrogen.toString(),
            phosphorus: input.phosphorus.toString(),
            potassium: input.potassium.toString(),
            ph: input.ph.toString(),
            organicMatter: input.organicMatter.toString(),
            testDate: new Date(),
          });

          await storage.createRecommendation({
            farmId: input.farmId,
            userId: farm.userId,
            soilTestId: soilTest.id,
            nitrogenReq: mlResult.requirements.nitrogen.toString(),
            phosphorusReq: mlResult.requirements.phosphorus.toString(),
            potassiumReq: mlResult.requirements.potassium.toString(),
            recommendedFertilizers: mlResult.recommendedFertilizers,
            applicationTiming: mlResult.applicationTiming,
            expectedYieldIncrease: mlResult.expectedYieldIncrease.toString(),
            sustainabilityScore: mlResult.sustainabilityScore,
          });
        }
      }

      res.json(mlResult);
    } catch (error) {
      console.error("NPK calculation error:", error);
      if (error instanceof z.ZodError)
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      res.status(500).json({ message: "Failed to calculate NPK requirements" });
    }
  });

  // ─── Recommendations ────────────────────────────────────────────────────────
  app.get("/api/recommendations", async (req, res) => {
    try {
      const { userId } = req.query;
      const recs = userId
        ? await storage.getRecommendationsByUser(userId as string)
        : await storage.getRecommendations();
      res.json(recs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.get("/api/recommendations/:id", async (req, res) => {
    try {
      const rec = await storage.getRecommendationWithDetails(req.params.id);
      if (!rec) return res.status(404).json({ message: "Recommendation not found" });
      res.json(rec);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendation" });
    }
  });

  app.post("/api/recommendations", async (req, res) => {
    try {
      const data = insertFertilizerRecommendationSchema.parse(req.body);
      const newRec = await storage.createRecommendation(data);
      res.status(201).json(newRec);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to create recommendation" });
    }
  });

  // ─── Fertilizer Usage ───────────────────────────────────────────────────────
  app.get("/api/usage", async (req, res) => {
    try {
      const { farmId } = req.query;
      const records = farmId
        ? await storage.getUsageByFarm(farmId as string)
        : await storage.getUsageRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch usage records" });
    }
  });

  app.get("/api/usage/:id", async (req, res) => {
    try {
      const record = await storage.getUsageRecord(req.params.id);
      if (!record) return res.status(404).json({ message: "Usage record not found" });
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch usage record" });
    }
  });

  app.post("/api/usage", async (req, res) => {
    try {
      const data = insertFertilizerUsageSchema.parse(req.body);
      const newUsage = await storage.createUsageRecord(data);
      res.status(201).json(newUsage);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to create usage record" });
    }
  });

  // ─── Health ─────────────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "FertilizerPro API running" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
