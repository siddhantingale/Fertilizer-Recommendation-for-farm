import {
  type User,
  type InsertUser,
  type OtpVerification,
  type InsertOtp,
  type Farm,
  type InsertFarm,
  type SoilTest,
  type InsertSoilTest,
  type FertilizerRecommendation,
  type InsertFertilizerRecommendation,
  type FertilizerUsage,
  type InsertFertilizerUsage,
  type FarmWithDetails,
  type SoilTestWithRecommendation,
  type RecommendationWithDetails,
  type NPKRequirement,
  type FertilizerOption,
  type CalculationResult,
} from "@shared/schema";
import { db } from "./db";
import { users, otpVerifications, farms, soilTests, fertilizerRecommendations, fertilizerUsage } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // OTP Verification
  createOtp(otp: InsertOtp): Promise<OtpVerification>;
  getValidOtp(phoneNumber: string, otpCode: string): Promise<OtpVerification | undefined>;
  markOtpAsUsed(id: string): Promise<void>;
  
  // Farms
  getFarms(): Promise<Farm[]>;
  getFarm(id: string): Promise<Farm | undefined>;
  getFarmsByUser(userId: string): Promise<Farm[]>;
  getFarmWithDetails(id: string): Promise<FarmWithDetails | undefined>;
  createFarm(farm: InsertFarm): Promise<Farm>;
  updateFarm(id: string, updates: Partial<InsertFarm>): Promise<Farm | undefined>;
  
  // Soil Tests
  getSoilTests(): Promise<SoilTest[]>;
  getSoilTest(id: string): Promise<SoilTest | undefined>;
  getSoilTestsByFarm(farmId: string): Promise<SoilTest[]>;
  getSoilTestWithRecommendation(id: string): Promise<SoilTestWithRecommendation | undefined>;
  createSoilTest(soilTest: InsertSoilTest): Promise<SoilTest>;
  
  // Fertilizer Recommendations
  getRecommendations(): Promise<FertilizerRecommendation[]>;
  getRecommendation(id: string): Promise<FertilizerRecommendation | undefined>;
  getRecommendationsByUser(userId: string): Promise<FertilizerRecommendation[]>;
  getRecommendationWithDetails(id: string): Promise<RecommendationWithDetails | undefined>;
  createRecommendation(recommendation: InsertFertilizerRecommendation): Promise<FertilizerRecommendation>;
  
  // Fertilizer Usage
  getUsageRecords(): Promise<FertilizerUsage[]>;
  getUsageRecord(id: string): Promise<FertilizerUsage | undefined>;
  getUsageByFarm(farmId: string): Promise<FertilizerUsage[]>;
  createUsageRecord(usage: InsertFertilizerUsage): Promise<FertilizerUsage>;
  
  // NPK Calculator
  calculateNPKRequirements(soilTest: SoilTest, farm: Farm): Promise<CalculationResult>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // OTP Verification
  async createOtp(otp: InsertOtp): Promise<OtpVerification> {
    const [newOtp] = await db.insert(otpVerifications).values(otp).returning();
    return newOtp;
  }

  async getValidOtp(phoneNumber: string, otpCode: string): Promise<OtpVerification | undefined> {
    const [otp] = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.phoneNumber, phoneNumber),
          eq(otpVerifications.otpCode, otpCode),
          eq(otpVerifications.isUsed, false)
        )
      );
    
    // Check if OTP is not expired
    if (otp && new Date() < new Date(otp.expiresAt)) {
      return otp;
    }
    return undefined;
  }

  async markOtpAsUsed(id: string): Promise<void> {
    await db
      .update(otpVerifications)
      .set({ isUsed: true })
      .where(eq(otpVerifications.id, id));
  }

  // Farms
  async getFarms(): Promise<Farm[]> {
    return await db.select().from(farms);
  }

  async getFarm(id: string): Promise<Farm | undefined> {
    const [farm] = await db.select().from(farms).where(eq(farms.id, id));
    return farm;
  }

  async getFarmsByUser(userId: string): Promise<Farm[]> {
    return await db.select().from(farms).where(eq(farms.userId, userId));
  }

  async getFarmWithDetails(id: string): Promise<FarmWithDetails | undefined> {
    const [farm] = await db.select().from(farms).where(eq(farms.id, id));
    if (!farm) return undefined;

    const farmSoilTests = await db
      .select()
      .from(soilTests)
      .where(eq(soilTests.farmId, id))
      .orderBy(desc(soilTests.testDate));

    const [latestRecommendation] = await db
      .select()
      .from(fertilizerRecommendations)
      .where(eq(fertilizerRecommendations.farmId, id))
      .orderBy(desc(fertilizerRecommendations.createdAt))
      .limit(1);

    const usageRecords = await db
      .select()
      .from(fertilizerUsage)
      .where(eq(fertilizerUsage.farmId, id));

    const totalUsage = usageRecords.reduce((sum, record) => sum + Number(record.quantityApplied), 0);

    return {
      ...farm,
      soilTests: farmSoilTests,
      latestRecommendation,
      totalUsage,
    };
  }

  async createFarm(farm: InsertFarm): Promise<Farm> {
    const [newFarm] = await db.insert(farms).values(farm).returning();
    return newFarm;
  }

  async updateFarm(id: string, updates: Partial<InsertFarm>): Promise<Farm | undefined> {
    const [updatedFarm] = await db
      .update(farms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(farms.id, id))
      .returning();
    return updatedFarm;
  }

  // Soil Tests
  async getSoilTests(): Promise<SoilTest[]> {
    return await db.select().from(soilTests);
  }

  async getSoilTest(id: string): Promise<SoilTest | undefined> {
    const [soilTest] = await db.select().from(soilTests).where(eq(soilTests.id, id));
    return soilTest;
  }

  async getSoilTestsByFarm(farmId: string): Promise<SoilTest[]> {
    return await db
      .select()
      .from(soilTests)
      .where(eq(soilTests.farmId, farmId))
      .orderBy(desc(soilTests.testDate));
  }

  async getSoilTestWithRecommendation(id: string): Promise<SoilTestWithRecommendation | undefined> {
    const [soilTest] = await db.select().from(soilTests).where(eq(soilTests.id, id));
    if (!soilTest) return undefined;

    const [recommendation] = await db
      .select()
      .from(fertilizerRecommendations)
      .where(eq(fertilizerRecommendations.soilTestId, id));

    const [farm] = await db.select().from(farms).where(eq(farms.id, soilTest.farmId));

    return {
      ...soilTest,
      recommendation,
      farm,
    };
  }

  async createSoilTest(soilTest: InsertSoilTest): Promise<SoilTest> {
    const [newSoilTest] = await db.insert(soilTests).values(soilTest).returning();
    return newSoilTest;
  }

  // Fertilizer Recommendations
  async getRecommendations(): Promise<FertilizerRecommendation[]> {
    return await db.select().from(fertilizerRecommendations);
  }

  async getRecommendation(id: string): Promise<FertilizerRecommendation | undefined> {
    const [recommendation] = await db
      .select()
      .from(fertilizerRecommendations)
      .where(eq(fertilizerRecommendations.id, id));
    return recommendation;
  }

  async getRecommendationsByUser(userId: string): Promise<FertilizerRecommendation[]> {
    return await db
      .select()
      .from(fertilizerRecommendations)
      .where(eq(fertilizerRecommendations.userId, userId))
      .orderBy(desc(fertilizerRecommendations.createdAt));
  }

  async getRecommendationWithDetails(id: string): Promise<RecommendationWithDetails | undefined> {
    const [recommendation] = await db
      .select()
      .from(fertilizerRecommendations)
      .where(eq(fertilizerRecommendations.id, id));
    
    if (!recommendation) return undefined;

    const [soilTest] = await db
      .select()
      .from(soilTests)
      .where(eq(soilTests.id, recommendation.soilTestId));

    const [farm] = await db.select().from(farms).where(eq(farms.id, recommendation.farmId));

    const usage = await db
      .select()
      .from(fertilizerUsage)
      .where(eq(fertilizerUsage.recommendationId, id));

    return {
      ...recommendation,
      soilTest,
      farm,
      usage,
    };
  }

  async createRecommendation(recommendation: InsertFertilizerRecommendation): Promise<FertilizerRecommendation> {
    const [newRecommendation] = await db
      .insert(fertilizerRecommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  // Fertilizer Usage
  async getUsageRecords(): Promise<FertilizerUsage[]> {
    return await db.select().from(fertilizerUsage);
  }

  async getUsageRecord(id: string): Promise<FertilizerUsage | undefined> {
    const [usage] = await db.select().from(fertilizerUsage).where(eq(fertilizerUsage.id, id));
    return usage;
  }

  async getUsageByFarm(farmId: string): Promise<FertilizerUsage[]> {
    return await db
      .select()
      .from(fertilizerUsage)
      .where(eq(fertilizerUsage.farmId, farmId))
      .orderBy(desc(fertilizerUsage.applicationDate));
  }

  async createUsageRecord(usage: InsertFertilizerUsage): Promise<FertilizerUsage> {
    const [newUsage] = await db.insert(fertilizerUsage).values(usage).returning();
    return newUsage;
  }

  // NPK Calculator
  async calculateNPKRequirements(soilTest: SoilTest, farm: Farm): Promise<CalculationResult> {
    // Standard fertilizer options database
    const fertilizerOptions: FertilizerOption[] = [
      {
        name: "Urea",
        npkRatio: "46-0-0",
        nitrogen: 46,
        phosphorus: 0,
        potassium: 0,
        price: 25,
        availability: 'high',
        sustainability: 6,
        type: 'synthetic'
      },
      {
        name: "DAP (Diammonium Phosphate)",
        npkRatio: "18-46-0",
        nitrogen: 18,
        phosphorus: 46,
        potassium: 0,
        price: 35,
        availability: 'high',
        sustainability: 5,
        type: 'synthetic'
      },
      {
        name: "Muriate of Potash",
        npkRatio: "0-0-60",
        nitrogen: 0,
        phosphorus: 0,
        potassium: 60,
        price: 30,
        availability: 'high',
        sustainability: 5,
        type: 'synthetic'
      },
      {
        name: "Compost",
        npkRatio: "2-1-1",
        nitrogen: 2,
        phosphorus: 1,
        potassium: 1,
        price: 15,
        availability: 'medium',
        sustainability: 9,
        type: 'organic'
      },
      {
        name: "Bone Meal",
        npkRatio: "3-15-0",
        nitrogen: 3,
        phosphorus: 15,
        potassium: 0,
        price: 28,
        availability: 'medium',
        sustainability: 8,
        type: 'organic'
      },
      {
        name: "Wood Ash",
        npkRatio: "0-1-10",
        nitrogen: 0,
        phosphorus: 1,
        potassium: 10,
        price: 10,
        availability: 'low',
        sustainability: 8,
        type: 'organic'
      }
    ];

    // Calculate NPK requirements based on crop type and current soil levels using Kaggle dataset
    const cropRequirements = this.getCropRequirements(farm.cropType, farm.soilType);
    const currentN = Number(soilTest.nitrogen) || 0;
    const currentP = Number(soilTest.phosphorus) || 0;
    const currentK = Number(soilTest.potassium) || 0;

    const requirements: NPKRequirement = {
      nitrogen: Math.max(0, cropRequirements.nitrogen - currentN),
      phosphorus: Math.max(0, cropRequirements.phosphorus - currentP),
      potassium: Math.max(0, cropRequirements.potassium - currentK),
    };

    // Find best fertilizer combinations
    const recommendedFertilizers = this.findOptimalFertilizerCombination(
      requirements,
      fertilizerOptions,
      Number(farm.area)
    );

    // Calculate sustainability score based on organic vs synthetic ratio
    const organicWeight = recommendedFertilizers.reduce((sum, rec) => 
      sum + (rec.fertilizer.type === 'organic' ? rec.quantity : 0), 0
    );
    const totalWeight = recommendedFertilizers.reduce((sum, rec) => sum + rec.quantity, 0);
    const sustainabilityScore = Math.round(
      (organicWeight / totalWeight) * 3 + 
      recommendedFertilizers.reduce((sum, rec) => sum + rec.fertilizer.sustainability, 0) / recommendedFertilizers.length
    );

    // Calculate expected yield increase (simplified formula)
    const nutrientDeficiency = (requirements.nitrogen + requirements.phosphorus + requirements.potassium) / 3;
    const expectedYieldIncrease = Math.min(25, nutrientDeficiency * 0.5);

    return {
      requirements,
      recommendedFertilizers,
      sustainabilityScore: Math.min(10, sustainabilityScore),
      expectedYieldIncrease,
      applicationTiming: this.getApplicationTiming(farm.cropType),
    };
  }

  private getCropRequirements(cropType: string, soilType: string = 'Loamy'): NPKRequirement {
    // Load agricultural dataset from Kaggle-based NPK research
    const fs = require('fs');
    const path = require('path');
    
    try {
      const datasetPath = path.join(__dirname, 'data', 'agricultural-npk-dataset.json');
      const agriculturalData = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
      
      const cropInfo = agriculturalData.find((crop: any) => 
        crop.crop.toLowerCase() === cropType.toLowerCase()
      );
      
      if (cropInfo) {
        const soilModifier = cropInfo.soilTypeModifiers[soilType] || cropInfo.soilTypeModifiers['Loamy'];
        
        return {
          nitrogen: Math.round(cropInfo.nitrogenBase * soilModifier.nitrogen),
          phosphorus: Math.round(cropInfo.phosphorusBase * soilModifier.phosphorus),
          potassium: Math.round(cropInfo.potassiumBase * soilModifier.potassium)
        };
      }
    } catch (error) {
      console.warn('Failed to load agricultural dataset, using fallback values:', error);
    }
    
    // Fallback to default values if dataset unavailable
    const fallbackData: { [key: string]: NPKRequirement } = {
      'wheat': { nitrogen: 120, phosphorus: 60, potassium: 40 },
      'rice': { nitrogen: 90, phosphorus: 45, potassium: 40 },
      'corn': { nitrogen: 140, phosphorus: 50, potassium: 50 },
      'soybean': { nitrogen: 25, phosphorus: 80, potassium: 70 },
      'potato': { nitrogen: 120, phosphorus: 80, potassium: 160 },
      'cotton': { nitrogen: 110, phosphorus: 55, potassium: 60 },
      'tomato': { nitrogen: 180, phosphorus: 90, potassium: 200 },
      'onion': { nitrogen: 100, phosphorus: 50, potassium: 80 },
      'carrot': { nitrogen: 80, phosphorus: 60, potassium: 100 },
      'cabbage': { nitrogen: 150, phosphorus: 70, potassium: 120 },
      'default': { nitrogen: 100, phosphorus: 50, potassium: 75 },
    };
    return fallbackData[cropType.toLowerCase()] || fallbackData.default;
  }

  private findOptimalFertilizerCombination(
    requirements: NPKRequirement,
    options: FertilizerOption[],
    areaAcres: number
  ) {
    const recommendations = [];
    let remainingN = requirements.nitrogen;
    let remainingP = requirements.phosphorus;
    let remainingK = requirements.potassium;

    // Sort fertilizers by sustainability score (prefer organic)
    const sortedOptions = [...options].sort((a, b) => b.sustainability - a.sustainability);

    for (const fertilizer of sortedOptions) {
      if (remainingN <= 0 && remainingP <= 0 && remainingK <= 0) break;

      const nContribution = (fertilizer.nitrogen / 100) * 100;
      const pContribution = (fertilizer.phosphorus / 100) * 100;
      const kContribution = (fertilizer.potassium / 100) * 100;

      let quantityNeeded = 0;

      // Calculate quantity based on the most limiting nutrient this fertilizer can provide
      if (nContribution > 0 && remainingN > 0) {
        quantityNeeded = Math.max(quantityNeeded, remainingN / nContribution * areaAcres);
      }
      if (pContribution > 0 && remainingP > 0) {
        quantityNeeded = Math.max(quantityNeeded, remainingP / pContribution * areaAcres);
      }
      if (kContribution > 0 && remainingK > 0) {
        quantityNeeded = Math.max(quantityNeeded, remainingK / kContribution * areaAcres);
      }

      if (quantityNeeded > 0) {
        quantityNeeded = Math.ceil(quantityNeeded * 10) / 10; // Round to 1 decimal place
        
        const nSupplied = (quantityNeeded * nContribution) / areaAcres;
        const pSupplied = (quantityNeeded * pContribution) / areaAcres;
        const kSupplied = (quantityNeeded * kContribution) / areaAcres;

        remainingN = Math.max(0, remainingN - nSupplied);
        remainingP = Math.max(0, remainingP - pSupplied);
        remainingK = Math.max(0, remainingK - kSupplied);

        const totalCoverage = ((requirements.nitrogen - remainingN) + 
                              (requirements.phosphorus - remainingP) + 
                              (requirements.potassium - remainingK)) / 
                             (requirements.nitrogen + requirements.phosphorus + requirements.potassium) * 100;

        recommendations.push({
          fertilizer,
          quantity: quantityNeeded,
          cost: quantityNeeded * fertilizer.price,
          coverage: Math.round(totalCoverage),
        });
      }
    }

    return recommendations;
  }

  private getApplicationTiming(cropType: string): string {
    const timingData: { [key: string]: string } = {
      'wheat': 'Apply 1/3 at sowing, 1/3 at tillering, 1/3 at heading stage',
      'rice': 'Apply 1/2 at transplanting, 1/4 at tillering, 1/4 at panicle initiation',
      'corn': 'Apply 1/3 at planting, 2/3 as side-dress at 6-leaf stage',
      'soybean': 'Apply full dose at planting or early vegetative stage',
      'potato': 'Apply full dose at planting, side-dress with K during tuber formation',
      'cotton': 'Apply 1/2 at planting, 1/2 at square formation',
      'default': 'Apply according to crop growth stages - consult local extension services',
    };
    return timingData[cropType.toLowerCase()] || timingData.default;
  }
}

// Temporary in-memory storage to bypass database issues
class InMemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private otps: Map<string, OtpVerification> = new Map();
  private farms: Map<string, Farm> = new Map();
  private soilTests: Map<string, SoilTest> = new Map();
  private recommendations: Map<string, FertilizerRecommendation> = new Map();
  private usageRecords: Map<string, FertilizerUsage> = new Map();

  // Generate UUID helper
  private generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.phoneNumber === phoneNumber);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.generateId(),
      phoneNumber: user.phoneNumber,
      name: user.name || null,
      isVerified: user.isVerified || null,
      lastLoginAt: user.lastLoginAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // OTP Verification
  async createOtp(otp: InsertOtp): Promise<OtpVerification> {
    const newOtp: OtpVerification = {
      id: this.generateId(),
      phoneNumber: otp.phoneNumber,
      otpCode: otp.otpCode,
      expiresAt: otp.expiresAt,
      isUsed: otp.isUsed || null,
      createdAt: new Date(),
    };
    this.otps.set(newOtp.id, newOtp);
    return newOtp;
  }

  async getValidOtp(phoneNumber: string, otpCode: string): Promise<OtpVerification | undefined> {
    const otpRecord = Array.from(this.otps.values()).find(otp => 
      otp.phoneNumber === phoneNumber && 
      otp.otpCode === otpCode && 
      !otp.isUsed
    );
    
    if (otpRecord && new Date() < new Date(otpRecord.expiresAt)) {
      return otpRecord;
    }
    return undefined;
  }

  async markOtpAsUsed(id: string): Promise<void> {
    const otp = this.otps.get(id);
    if (otp) {
      otp.isUsed = true;
      this.otps.set(id, otp);
    }
  }

  // Farms
  async getFarms(): Promise<Farm[]> {
    return Array.from(this.farms.values());
  }

  async getFarm(id: string): Promise<Farm | undefined> {
    return this.farms.get(id);
  }

  async getFarmsByUser(userId: string): Promise<Farm[]> {
    return Array.from(this.farms.values()).filter(f => f.userId === userId);
  }

  async getFarmWithDetails(id: string): Promise<FarmWithDetails | undefined> {
    const farm = this.farms.get(id);
    if (!farm) return undefined;

    const farmSoilTests = Array.from(this.soilTests.values()).filter(s => s.farmId === id);
    const latestRecommendation = Array.from(this.recommendations.values())
      .filter(r => r.farmId === id)
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())[0];
    
    const usageRecords = Array.from(this.usageRecords.values()).filter(u => u.farmId === id);
    const totalUsage = usageRecords.reduce((sum, record) => sum + Number(record.quantityApplied), 0);

    return {
      ...farm,
      soilTests: farmSoilTests,
      latestRecommendation,
      totalUsage,
    };
  }

  async createFarm(farm: InsertFarm): Promise<Farm> {
    const newFarm: Farm = {
      id: this.generateId(),
      name: farm.name,
      userId: farm.userId,
      location: farm.location,
      area: farm.area,
      soilType: farm.soilType,
      cropType: farm.cropType,
      ph: farm.ph || null,
      organicMatter: farm.organicMatter || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.farms.set(newFarm.id, newFarm);
    return newFarm;
  }

  async updateFarm(id: string, updates: Partial<InsertFarm>): Promise<Farm | undefined> {
    const farm = this.farms.get(id);
    if (!farm) return undefined;
    
    const updatedFarm = {
      ...farm,
      ...updates,
      updatedAt: new Date(),
    };
    this.farms.set(id, updatedFarm);
    return updatedFarm;
  }

  // Soil Tests (simplified implementations)
  async getSoilTests(): Promise<SoilTest[]> {
    return Array.from(this.soilTests.values());
  }

  async getSoilTest(id: string): Promise<SoilTest | undefined> {
    return this.soilTests.get(id);
  }

  async getSoilTestsByFarm(farmId: string): Promise<SoilTest[]> {
    return Array.from(this.soilTests.values()).filter(s => s.farmId === farmId);
  }

  async getSoilTestWithRecommendation(id: string): Promise<SoilTestWithRecommendation | undefined> {
    const soilTest = this.soilTests.get(id);
    if (!soilTest) return undefined;
    
    const recommendation = Array.from(this.recommendations.values()).find(r => r.soilTestId === id);
    const farm = this.farms.get(soilTest.farmId);
    
    return { ...soilTest, recommendation, farm };
  }

  async createSoilTest(soilTest: InsertSoilTest): Promise<SoilTest> {
    const newSoilTest: SoilTest = {
      id: this.generateId(),
      farmId: soilTest.farmId,
      nitrogen: soilTest.nitrogen || null,
      phosphorus: soilTest.phosphorus || null,
      potassium: soilTest.potassium || null,
      ph: soilTest.ph || null,
      organicMatter: soilTest.organicMatter || null,
      testDate: soilTest.testDate || null,
      createdAt: new Date(),
    };
    this.soilTests.set(newSoilTest.id, newSoilTest);
    return newSoilTest;
  }

  // Remaining methods (simplified)
  async getRecommendations(): Promise<FertilizerRecommendation[]> {
    return Array.from(this.recommendations.values());
  }

  async getRecommendation(id: string): Promise<FertilizerRecommendation | undefined> {
    return this.recommendations.get(id);
  }

  async getRecommendationsByUser(userId: string): Promise<FertilizerRecommendation[]> {
    return Array.from(this.recommendations.values()).filter(r => r.userId === userId);
  }

  async getRecommendationWithDetails(id: string): Promise<RecommendationWithDetails | undefined> {
    const rec = this.recommendations.get(id);
    if (!rec) return undefined;
    
    return { 
      ...rec, 
      soilTest: this.soilTests.get(rec.soilTestId),
      farm: this.farms.get(rec.farmId),
      usage: Array.from(this.usageRecords.values()).filter(u => u.recommendationId === id)
    };
  }

  async createRecommendation(recommendation: InsertFertilizerRecommendation): Promise<FertilizerRecommendation> {
    const newRec: FertilizerRecommendation = {
      id: this.generateId(),
      soilTestId: recommendation.soilTestId,
      userId: recommendation.userId,
      farmId: recommendation.farmId,
      nitrogenReq: recommendation.nitrogenReq,
      phosphorusReq: recommendation.phosphorusReq,
      potassiumReq: recommendation.potassiumReq,
      recommendedFertilizers: recommendation.recommendedFertilizers,
      applicationRate: recommendation.applicationRate || null,
      applicationTiming: recommendation.applicationTiming || null,
      expectedYieldIncrease: recommendation.expectedYieldIncrease || null,
      sustainabilityScore: recommendation.sustainabilityScore || null,
      createdAt: new Date(),
    };
    this.recommendations.set(newRec.id, newRec);
    return newRec;
  }

  async getUsageRecords(): Promise<FertilizerUsage[]> {
    return Array.from(this.usageRecords.values());
  }

  async getUsageRecord(id: string): Promise<FertilizerUsage | undefined> {
    return this.usageRecords.get(id);
  }

  async getUsageByFarm(farmId: string): Promise<FertilizerUsage[]> {
    return Array.from(this.usageRecords.values()).filter(u => u.farmId === farmId);
  }

  async createUsageRecord(usage: InsertFertilizerUsage): Promise<FertilizerUsage> {
    const newUsage: FertilizerUsage = {
      id: this.generateId(),
      farmId: usage.farmId,
      userId: usage.userId,
      recommendationId: usage.recommendationId || null,
      fertilizerName: usage.fertilizerName,
      npkRatio: usage.npkRatio || null,
      quantityApplied: usage.quantityApplied,
      applicationDate: usage.applicationDate,
      cost: usage.cost || null,
      notes: usage.notes || null,
      createdAt: new Date(),
    };
    this.usageRecords.set(newUsage.id, newUsage);
    return newUsage;
  }

  // NPK Calculator - delegate to database implementation
  async calculateNPKRequirements(soilTest: SoilTest, farm: Farm): Promise<CalculationResult> {
    const dbStorage = new DatabaseStorage();
    return dbStorage.calculateNPKRequirements(soilTest, farm);
  }
}

// Use PostgreSQL database storage
export const storage = new DatabaseStorage();