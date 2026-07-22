import type { NPKRequirement, FertilizerOption, CalculationResult } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SoilInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  organicMatter: number;
  cropType: string;
  soilType: string;
  areaAcres: number;
}

export interface MLRecommendation {
  fertilizer: FertilizerOption;
  quantity: number;
  cost: number;
  coverage: number;
  confidenceScore: number;
  reasoning: string;
}

export interface MLResult extends CalculationResult {
  phAdjustment: string;
  organicMatterRating: string;
  deficiencyLevel: { nitrogen: string; phosphorus: string; potassium: string };
  mlConfidence: number;
  insights: string[];
}

const FERTILIZER_DATABASE: FertilizerOption[] = [
  {
    name: "Urea (46-0-0)",
    npkRatio: "46-0-0",
    nitrogen: 46,
    phosphorus: 0,
    potassium: 0,
    price: 25,
    availability: "high",
    sustainability: 5,
    type: "synthetic",
  },
  {
    name: "DAP (18-46-0)",
    npkRatio: "18-46-0",
    nitrogen: 18,
    phosphorus: 46,
    potassium: 0,
    price: 35,
    availability: "high",
    sustainability: 5,
    type: "synthetic",
  },
  {
    name: "MOP – Muriate of Potash (0-0-60)",
    npkRatio: "0-0-60",
    nitrogen: 0,
    phosphorus: 0,
    potassium: 60,
    price: 30,
    availability: "high",
    sustainability: 5,
    type: "synthetic",
  },
  {
    name: "NPK 10-26-26",
    npkRatio: "10-26-26",
    nitrogen: 10,
    phosphorus: 26,
    potassium: 26,
    price: 40,
    availability: "high",
    sustainability: 5,
    type: "synthetic",
  },
  {
    name: "NPK 20-20-20",
    npkRatio: "20-20-20",
    nitrogen: 20,
    phosphorus: 20,
    potassium: 20,
    price: 38,
    availability: "medium",
    sustainability: 6,
    type: "synthetic",
  },
  {
    name: "Ammonium Sulfate (21-0-0)",
    npkRatio: "21-0-0",
    nitrogen: 21,
    phosphorus: 0,
    potassium: 0,
    price: 22,
    availability: "high",
    sustainability: 6,
    type: "synthetic",
  },
  {
    name: "SSP – Single Super Phosphate (0-16-0)",
    npkRatio: "0-16-0",
    nitrogen: 0,
    phosphorus: 16,
    potassium: 0,
    price: 20,
    availability: "high",
    sustainability: 6,
    type: "synthetic",
  },
  {
    name: "Compost",
    npkRatio: "2-1-1",
    nitrogen: 2,
    phosphorus: 1,
    potassium: 1,
    price: 12,
    availability: "medium",
    sustainability: 9,
    type: "organic",
  },
  {
    name: "Vermicompost",
    npkRatio: "3-2-2",
    nitrogen: 3,
    phosphorus: 2,
    potassium: 2,
    price: 18,
    availability: "medium",
    sustainability: 10,
    type: "organic",
  },
  {
    name: "Bone Meal (3-15-0)",
    npkRatio: "3-15-0",
    nitrogen: 3,
    phosphorus: 15,
    potassium: 0,
    price: 28,
    availability: "medium",
    sustainability: 8,
    type: "organic",
  },
  {
    name: "Wood Ash (0-1-10)",
    npkRatio: "0-1-10",
    nitrogen: 0,
    phosphorus: 1,
    potassium: 10,
    price: 8,
    availability: "low",
    sustainability: 8,
    type: "organic",
  },
  {
    name: "Neem Cake (4-1-2)",
    npkRatio: "4-1-2",
    nitrogen: 4,
    phosphorus: 1,
    potassium: 2,
    price: 20,
    availability: "medium",
    sustainability: 9,
    type: "organic",
  },
  {
    name: "Fish Emulsion (5-2-2)",
    npkRatio: "5-2-2",
    nitrogen: 5,
    phosphorus: 2,
    potassium: 2,
    price: 22,
    availability: "low",
    sustainability: 9,
    type: "organic",
  },
];

function loadDataset(): any[] {
  try {
    const datasetPath = path.join(__dirname, "data", "agricultural-npk-dataset.json");
    const raw = fs.readFileSync(datasetPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function getCropRequirements(cropType: string, soilType: string): NPKRequirement {
  const dataset = loadDataset();
  const crop = dataset.find(
    (c: any) => c.crop.toLowerCase() === cropType.toLowerCase()
  );

  if (crop) {
    const modifier = crop.soilTypeModifiers?.[soilType] ||
      crop.soilTypeModifiers?.["Loamy"] || { nitrogen: 1, phosphorus: 1, potassium: 1 };
    return {
      nitrogen: Math.round(crop.nitrogenBase * modifier.nitrogen),
      phosphorus: Math.round(crop.phosphorusBase * modifier.phosphorus),
      potassium: Math.round(crop.potassiumBase * modifier.potassium),
    };
  }

  const fallback: Record<string, NPKRequirement> = {
    wheat: { nitrogen: 120, phosphorus: 60, potassium: 40 },
    rice: { nitrogen: 90, phosphorus: 45, potassium: 40 },
    corn: { nitrogen: 140, phosphorus: 50, potassium: 50 },
    maize: { nitrogen: 140, phosphorus: 50, potassium: 50 },
    soybean: { nitrogen: 25, phosphorus: 80, potassium: 70 },
    potato: { nitrogen: 120, phosphorus: 80, potassium: 160 },
    cotton: { nitrogen: 110, phosphorus: 55, potassium: 60 },
    sugarcane: { nitrogen: 150, phosphorus: 60, potassium: 100 },
    tomato: { nitrogen: 180, phosphorus: 90, potassium: 200 },
    onion: { nitrogen: 100, phosphorus: 50, potassium: 80 },
    carrot: { nitrogen: 80, phosphorus: 60, potassium: 100 },
    cabbage: { nitrogen: 150, phosphorus: 70, potassium: 120 },
    groundnut: { nitrogen: 25, phosphorus: 60, potassium: 75 },
    chickpea: { nitrogen: 20, phosphorus: 60, potassium: 40 },
    default: { nitrogen: 100, phosphorus: 50, potassium: 75 },
  };

  return fallback[cropType.toLowerCase()] || fallback.default;
}

function getOptimalPH(cropType: string): number {
  const dataset = loadDataset();
  const crop = dataset.find(
    (c: any) => c.crop.toLowerCase() === cropType.toLowerCase()
  );
  return crop?.optimalPH ?? 6.5;
}

function classifyDeficiency(current: number, required: number): string {
  const ratio = current / required;
  if (ratio >= 0.9) return "Adequate";
  if (ratio >= 0.6) return "Moderate";
  if (ratio >= 0.3) return "Deficient";
  return "Severely Deficient";
}

function phAdjustmentAdvice(ph: number, cropType: string): string {
  const optimal = getOptimalPH(cropType);
  const diff = ph - optimal;
  if (Math.abs(diff) < 0.5) return "Soil pH is optimal for this crop.";
  if (diff < -1) return "Soil is too acidic. Apply agricultural lime (2–3 t/ha) to raise pH.";
  if (diff < 0) return "Soil is slightly acidic. Light lime application (1 t/ha) recommended.";
  if (diff > 1) return "Soil is too alkaline. Apply sulfur (200–300 kg/ha) to lower pH.";
  return "Soil is slightly alkaline. Monitor pH and consider elemental sulfur.";
}

function organicMatterRating(om: number): string {
  if (om >= 5) return "Excellent – high biological activity";
  if (om >= 3) return "Good – adequate for most crops";
  if (om >= 1.5) return "Fair – add compost or green manure";
  return "Poor – urgent organic matter amendment needed";
}

function scoreAndSelectFertilizers(
  requirements: NPKRequirement,
  ph: number,
  organicMatter: number,
  areaAcres: number
): MLRecommendation[] {
  const results: MLRecommendation[] = [];
  let remainN = requirements.nitrogen;
  let remainP = requirements.phosphorus;
  let remainK = requirements.potassium;

  const totalRequired = requirements.nitrogen + requirements.phosphorus + requirements.potassium;
  if (totalRequired <= 0) return results;

  const preferOrganic = organicMatter < 2;
  const acidicSoil = ph < 6.0;

  function scoreFertilizer(f: FertilizerOption): number {
    let score = 0;
    const nWeight = remainN > 0 && f.nitrogen > 0 ? (f.nitrogen * remainN) / 100 : 0;
    const pWeight = remainP > 0 && f.phosphorus > 0 ? (f.phosphorus * remainP) / 100 : 0;
    const kWeight = remainK > 0 && f.potassium > 0 ? (f.potassium * remainK) / 100 : 0;
    score += nWeight + pWeight + kWeight;
    score += f.sustainability * 3;
    if (preferOrganic && f.type === "organic") score += 20;
    if (f.availability === "high") score += 10;
    if (f.availability === "medium") score += 5;
    if (acidicSoil && f.name.includes("Ammonium Sulfate")) score += 10;
    if (acidicSoil && f.name.includes("Urea")) score -= 5;
    return score;
  }

  const scored = FERTILIZER_DATABASE.map((f) => ({ f, score: scoreFertilizer(f) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  for (const { f, score } of scored) {
    if (remainN <= 2 && remainP <= 2 && remainK <= 2) break;
    if (results.length >= 4) break;

    const nPer100kg = f.nitrogen;
    const pPer100kg = f.phosphorus;
    const kPer100kg = f.potassium;

    let qtyPer100kgNeeded = 0;
    if (nPer100kg > 0 && remainN > 0) qtyPer100kgNeeded = Math.max(qtyPer100kgNeeded, remainN / (nPer100kg / 100));
    if (pPer100kg > 0 && remainP > 0) qtyPer100kgNeeded = Math.max(qtyPer100kgNeeded, remainP / (pPer100kg / 100));
    if (kPer100kg > 0 && remainK > 0) qtyPer100kgNeeded = Math.max(qtyPer100kgNeeded, remainK / (kPer100kg / 100));

    if (qtyPer100kgNeeded <= 0) continue;

    const qtyPerHa = Math.ceil(qtyPer100kgNeeded * 10) / 10;
    const areaHa = areaAcres * 0.4047;
    const totalQty = Math.ceil(qtyPerHa * areaHa * 10) / 10;

    const nSupplied = (totalQty * nPer100kg) / (100 * areaHa);
    const pSupplied = (totalQty * pPer100kg) / (100 * areaHa);
    const kSupplied = (totalQty * kPer100kg) / (100 * areaHa);

    remainN = Math.max(0, remainN - nSupplied);
    remainP = Math.max(0, remainP - pSupplied);
    remainK = Math.max(0, remainK - kSupplied);

    const metN = requirements.nitrogen - remainN;
    const metP = requirements.phosphorus - remainP;
    const metK = requirements.potassium - remainK;
    const totalMet = metN + metP + metK;
    const coverage = Math.min(100, Math.round((totalMet / totalRequired) * 100));

    const confidence = Math.min(98, Math.round((score / 200) * 100));

    let reasoning = "";
    if (f.type === "organic") reasoning = `Organic source improving soil health; `;
    if (f.nitrogen > 0) reasoning += `provides ${f.nitrogen}% N; `;
    if (f.phosphorus > 0) reasoning += `provides ${f.phosphorus}% P₂O₅; `;
    if (f.potassium > 0) reasoning += `provides ${f.potassium}% K₂O; `;
    reasoning += `sustainability score ${f.sustainability}/10.`;

    results.push({
      fertilizer: f,
      quantity: totalQty,
      cost: totalQty * f.price,
      coverage,
      confidenceScore: confidence,
      reasoning: reasoning.trim(),
    });
  }

  return results;
}

function getApplicationTiming(cropType: string): string {
  const timings: Record<string, string> = {
    wheat: "Apply ⅓ N at sowing, ⅓ at tillering (CRI stage), ⅓ at heading. Full P & K at sowing.",
    rice: "Apply ½ N at transplanting, ¼ at active tillering, ¼ at panicle initiation. Full P & K as basal.",
    corn: "Apply ⅓ N at planting as starter, ⅔ as side-dress at V6 (6-leaf). Full P & K at planting.",
    maize: "Apply ⅓ N at planting as starter, ⅔ as side-dress at V6 (6-leaf). Full P & K at planting.",
    soybean: "Apply P & K at planting. Minimal N needed due to nitrogen fixation; inoculate with Rhizobium.",
    potato: "Apply ½ N & full P & K at planting. Remaining ½ N as side-dress at hilling.",
    cotton: "Apply ½ N at planting, ½ at square formation. Full P & K at planting.",
    sugarcane: "Apply ⅓ N at planting, ⅓ at 45 days, ⅓ at 90 days. Full P & K at planting.",
    tomato: "Apply ¼ N as starter, then weekly fertigation. Apply P & K in 2 splits (planting + fruiting).",
    onion: "Apply ½ N & full P & K at planting. Remaining N as top-dress at bulb initiation.",
    groundnut: "Apply full P & K at planting. Light N at planting; crop fixes its own N.",
    chickpea: "Minimal N – crop is leguminous. Apply P & K at sowing.",
    default: "Apply ½ basal dose at planting, ½ as top-dress after 30 days. Consult local extension services.",
  };
  return timings[cropType.toLowerCase()] || timings.default;
}

function generateInsights(
  input: SoilInput,
  requirements: NPKRequirement,
  deficiency: { nitrogen: string; phosphorus: string; potassium: string }
): string[] {
  const insights: string[] = [];
  const optimal = getOptimalPH(input.cropType);

  if (Math.abs(input.ph - optimal) > 0.5)
    insights.push(`pH ${input.ph} deviates from optimal (${optimal}) for ${input.cropType} — correct pH before fertilizing for best nutrient uptake.`);

  if (input.organicMatter < 1.5)
    insights.push("Low organic matter detected. Add 5 t/ha of compost or farm yard manure to improve soil structure and microbial activity.");

  if (deficiency.nitrogen === "Severely Deficient")
    insights.push(`Severe nitrogen deficiency — split nitrogen doses to prevent leaching and maximize efficiency.`);

  if (deficiency.phosphorus === "Severely Deficient")
    insights.push("Critical phosphorus shortage — apply phosphorus close to seed for better root uptake.");

  if (deficiency.potassium === "Severely Deficient")
    insights.push("Severe potassium deficiency — correct this to improve drought resistance and disease tolerance.");

  if (input.soilType === "Sandy")
    insights.push("Sandy soil detected — use split applications and slow-release fertilizers to reduce nutrient leaching.");

  if (input.soilType === "Clay")
    insights.push("Clay soil can restrict drainage — avoid over-application of K which can cause soil compaction.");

  if (requirements.nitrogen === 0 && requirements.phosphorus === 0 && requirements.potassium === 0)
    insights.push("Soil nutrient levels are already at or above crop requirements. Avoid over-fertilization to protect the environment.");

  return insights;
}

export function runMLEngine(input: SoilInput): MLResult {
  const cropRequirements = getCropRequirements(input.cropType, input.soilType);

  const requirements: NPKRequirement = {
    nitrogen: Math.max(0, cropRequirements.nitrogen - input.nitrogen),
    phosphorus: Math.max(0, cropRequirements.phosphorus - input.phosphorus),
    potassium: Math.max(0, cropRequirements.potassium - input.potassium),
  };

  const deficiency = {
    nitrogen: classifyDeficiency(input.nitrogen, cropRequirements.nitrogen),
    phosphorus: classifyDeficiency(input.phosphorus, cropRequirements.phosphorus),
    potassium: classifyDeficiency(input.potassium, cropRequirements.potassium),
  };

  const mlRecs = scoreAndSelectFertilizers(
    requirements,
    input.ph,
    input.organicMatter,
    input.areaAcres
  );

  const recommendedFertilizers = mlRecs.map((r) => ({
    fertilizer: r.fertilizer,
    quantity: r.quantity,
    cost: r.cost,
    coverage: r.coverage,
    confidenceScore: r.confidenceScore,
    reasoning: r.reasoning,
  }));

  const organicWeight = recommendedFertilizers.reduce(
    (s, r) => s + (r.fertilizer.type === "organic" ? r.quantity : 0), 0
  );
  const totalWeight = recommendedFertilizers.reduce((s, r) => s + r.quantity, 0);
  const organicRatio = totalWeight > 0 ? organicWeight / totalWeight : 0;
  const avgSustainability =
    recommendedFertilizers.length > 0
      ? recommendedFertilizers.reduce((s, r) => s + r.fertilizer.sustainability, 0) /
        recommendedFertilizers.length
      : 5;
  const sustainabilityScore = Math.min(10, Math.round(organicRatio * 4 + avgSustainability));

  const totalDeficiency =
    (requirements.nitrogen + requirements.phosphorus + requirements.potassium) / 3;
  const phPenalty = Math.abs(input.ph - getOptimalPH(input.cropType)) * 2;
  const expectedYieldIncrease = Math.max(0, Math.min(35, totalDeficiency * 0.4 - phPenalty + 5));

  const avgConfidence =
    mlRecs.length > 0
      ? mlRecs.reduce((s, r) => s + r.confidenceScore, 0) / mlRecs.length
      : 50;

  const insights = generateInsights(input, requirements, deficiency);

  return {
    requirements,
    recommendedFertilizers,
    sustainabilityScore,
    expectedYieldIncrease: Math.round(expectedYieldIncrease * 10) / 10,
    applicationTiming: getApplicationTiming(input.cropType),
    phAdjustment: phAdjustmentAdvice(input.ph, input.cropType),
    organicMatterRating: organicMatterRating(input.organicMatter),
    deficiencyLevel: deficiency,
    mlConfidence: Math.round(avgConfidence),
    insights,
  };
}
