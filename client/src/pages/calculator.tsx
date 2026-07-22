import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calculator as CalcIcon,
  Leaf,
  Target,
  TrendingUp,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  FlaskConical,
  Save,
  ChevronRight,
  BarChart2,
} from "lucide-react";

const CROP_TYPES = [
  "Wheat", "Rice", "Corn", "Maize", "Soybean", "Potato", "Cotton",
  "Sugarcane", "Tomato", "Onion", "Carrot", "Cabbage", "Groundnut",
  "Chickpea", "Other",
];

const SOIL_TYPES = [
  "Clay", "Sandy", "Loamy", "Silty", "Clay Loam", "Sandy Loam", "Silty Loam",
];

interface CalcResult {
  requirements: { nitrogen: number; phosphorus: number; potassium: number };
  recommendedFertilizers: Array<{
    fertilizer: {
      name: string; npkRatio: string; type: string;
      availability: string; sustainability: number;
    };
    quantity: number; cost: number; coverage: number;
    confidenceScore?: number; reasoning?: string;
  }>;
  sustainabilityScore: number;
  expectedYieldIncrease: number;
  applicationTiming: string;
  phAdjustment?: string;
  organicMatterRating?: string;
  deficiencyLevel?: { nitrogen: string; phosphorus: string; potassium: string };
  mlConfidence?: number;
  insights?: string[];
}

function DeficiencyBadge({ level }: { level: string }) {
  const cls = {
    "Adequate": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "Moderate": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "Deficient": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "Severely Deficient": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return <Badge className={cls[level as keyof typeof cls] || cls["Moderate"]}>{level}</Badge>;
}

function TypeBadge({ type }: { type: string }) {
  return (
    <Badge className={
      type === "organic"
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }>
      {type}
    </Badge>
  );
}

function AvailabilityBadge({ availability }: { availability: string }) {
  const cls = {
    high: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-red-100 text-red-800",
  };
  return <Badge className={cls[availability as keyof typeof cls] || cls.medium}>{availability} availability</Badge>;
}

export default function Calculator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [saveAsSoilTest, setSaveAsSoilTest] = useState(false);
  const [result, setResult] = useState<CalcResult | null>(null);

  const [form, setForm] = useState({
    cropType: "",
    soilType: "",
    areaAcres: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "6.5",
    organicMatter: "2.5",
  });

  const { data: farms } = useQuery<any[]>({
    queryKey: ["/api/farms", user?.id],
    queryFn: async () => {
      const r = await fetch(`/api/farms?userId=${user?.id}`);
      if (!r.ok) throw new Error("Failed to fetch farms");
      return r.json();
    },
    enabled: !!user?.id,
  });

  // When user selects a farm, auto-fill crop/soil/area
  const handleFarmSelect = (farmId: string) => {
    setSelectedFarmId(farmId);
    if (!farmId) return;
    const farm = farms?.find((f: any) => f.id === farmId);
    if (farm) {
      setForm((prev) => ({
        ...prev,
        cropType: farm.cropType || prev.cropType,
        soilType: farm.soilType || prev.soilType,
        areaAcres: farm.area || prev.areaAcres,
        ph: farm.ph || prev.ph,
        organicMatter: farm.organicMatter || prev.organicMatter,
      }));
    }
  };

  const calcMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        cropType: form.cropType,
        soilType: form.soilType,
        areaAcres: parseFloat(form.areaAcres),
        nitrogen: parseFloat(form.nitrogen) || 0,
        phosphorus: parseFloat(form.phosphorus) || 0,
        potassium: parseFloat(form.potassium) || 0,
        ph: parseFloat(form.ph) || 6.5,
        organicMatter: parseFloat(form.organicMatter) || 2.5,
        farmId: selectedFarmId || undefined,
        saveAsSoilTest: saveAsSoilTest && !!selectedFarmId,
      };
      const r = await fetch("/api/calculate-npk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.message || "Calculation failed");
      }
      return r.json() as Promise<CalcResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      if (saveAsSoilTest && selectedFarmId) {
        queryClient.invalidateQueries({ queryKey: ["/api/recommendations", user?.id] });
      }
      toast({ title: "Analysis Complete", description: "ML-powered fertilizer recommendations ready." });
    },
    onError: (err: any) => {
      toast({ title: "Calculation Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleCalculate = () => {
    if (!form.cropType || !form.soilType || !form.areaAcres) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Crop Type, Soil Type, and Farm Area.",
        variant: "destructive",
      });
      return;
    }
    calcMutation.mutate();
  };

  const totalCost = result?.recommendedFertilizers.reduce((s, r) => s + r.cost, 0) ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CalcIcon className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NPK Calculator</h1>
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            ML-Powered
          </Badge>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your soil analysis values to get AI-driven fertilizer recommendations tailored to your crop and conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Input Panel ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Optional farm selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Farm (Optional)
              </CardTitle>
              <CardDescription>Select a farm to auto-fill its details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedFarmId} onValueChange={handleFarmSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a farm (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— No farm selected —</SelectItem>
                  {farms?.map((f: any) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({f.cropType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedFarmId && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={saveAsSoilTest}
                    onChange={(e) => setSaveAsSoilTest(e.target.checked)}
                  />
                  <Save className="h-3 w-3" />
                  Save results as soil test record
                </label>
              )}
            </CardContent>
          </Card>

          {/* Crop & Soil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Leaf className="h-4 w-4" />
                Crop & Soil Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Crop Type *</Label>
                <Select value={form.cropType} onValueChange={(v) => setForm({ ...form, cropType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                  <SelectContent>
                    {CROP_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Soil Type *</Label>
                <Select value={form.soilType} onValueChange={(v) => setForm({ ...form, soilType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
                  <SelectContent>
                    {SOIL_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Farm Area (acres) *</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 5.0"
                  value={form.areaAcres}
                  onChange={(e) => setForm({ ...form, areaAcres: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Soil Test Values */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="h-4 w-4" />
                Current Soil Test Values
              </CardTitle>
              <CardDescription>Enter 0 if nutrient is unknown or not yet tested</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">N – Nitrogen (kg/ha)</Label>
                  <Input type="number" min="0" placeholder="0"
                    value={form.nitrogen}
                    onChange={(e) => setForm({ ...form, nitrogen: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">P – Phosphorus (kg/ha)</Label>
                  <Input type="number" min="0" placeholder="0"
                    value={form.phosphorus}
                    onChange={(e) => setForm({ ...form, phosphorus: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">K – Potassium (kg/ha)</Label>
                  <Input type="number" min="0" placeholder="0"
                    value={form.potassium}
                    onChange={(e) => setForm({ ...form, potassium: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Soil pH</Label>
                  <Input type="number" min="0" max="14" step="0.1" placeholder="6.5"
                    value={form.ph}
                    onChange={(e) => setForm({ ...form, ph: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Organic Matter (%)</Label>
                  <Input type="number" min="0" step="0.1" placeholder="2.5"
                    value={form.organicMatter}
                    onChange={(e) => setForm({ ...form, organicMatter: e.target.value })} />
                </div>
              </div>

              <Button
                onClick={handleCalculate}
                disabled={calcMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {calcMutation.isPending ? (
                  <><CalcIcon className="h-4 w-4 mr-2 animate-spin" />Analysing...</>
                ) : (
                  <><CalcIcon className="h-4 w-4 mr-2" />Calculate & Recommend</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Results Panel ───────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {result ? (
            <>
              {/* Summary strip */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    ML Analysis Results
                    {result.mlConfidence !== undefined && (
                      <Badge className="ml-auto bg-purple-100 text-purple-800">
                        {result.mlConfidence}% confidence
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-green-600">+{result.expectedYieldIncrease}%</div>
                      <div className="text-xs text-gray-500">Yield Increase</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <Shield className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-emerald-600">{result.sustainabilityScore}/10</div>
                      <div className="text-xs text-gray-500">Sustainability</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-blue-600">${totalCost.toFixed(0)}</div>
                      <div className="text-xs text-gray-500">Total Cost</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <BarChart2 className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-purple-600">
                        {result.recommendedFertilizers.length}
                      </div>
                      <div className="text-xs text-gray-500">Products</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NPK Requirements & Deficiency */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nutrient Requirements & Deficiency Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {(["nitrogen", "phosphorus", "potassium"] as const).map((nutrient) => (
                      <div key={nutrient} className="text-center space-y-2">
                        <div className="text-sm font-medium capitalize">{nutrient}</div>
                        <div className="text-3xl font-bold">{result.requirements[nutrient]}</div>
                        <div className="text-xs text-gray-500">kg/ha needed</div>
                        {result.deficiencyLevel && (
                          <DeficiencyBadge level={result.deficiencyLevel[nutrient]} />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Soil Health */}
              {(result.phAdjustment || result.organicMatterRating) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Soil Health Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.phAdjustment && (
                      <div className="flex items-start gap-2 text-sm">
                        <div className="font-medium w-24 shrink-0">pH Advice:</div>
                        <div className="text-gray-700 dark:text-gray-300">{result.phAdjustment}</div>
                      </div>
                    )}
                    {result.organicMatterRating && (
                      <div className="flex items-start gap-2 text-sm">
                        <div className="font-medium w-24 shrink-0">Organic Matter:</div>
                        <div className="text-gray-700 dark:text-gray-300">{result.organicMatterRating}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Recommended Fertilizers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Leaf className="h-4 w-4" />
                    Recommended Fertilizers
                  </CardTitle>
                  <CardDescription>Ranked by ML scoring — organic options prioritized where beneficial</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.recommendedFertilizers.map((rec, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold">{rec.fertilizer.name}</div>
                          <div className="text-sm text-gray-500">NPK: {rec.fertilizer.npkRatio}</div>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          <TypeBadge type={rec.fertilizer.type} />
                          <AvailabilityBadge availability={rec.fertilizer.availability} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500">Total Quantity</div>
                          <div className="font-medium">{rec.quantity} kg</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Cost</div>
                          <div className="font-medium">${rec.cost.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">NPK Coverage</div>
                          <div className="font-medium">{rec.coverage}%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Sustainability</div>
                          <div className="font-medium">{rec.fertilizer.sustainability}/10</div>
                        </div>
                      </div>

                      {rec.confidenceScore !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500">ML Confidence:</div>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${rec.confidenceScore}%` }}
                            />
                          </div>
                          <div className="text-xs font-medium">{rec.confidenceScore}%</div>
                        </div>
                      )}

                      {rec.reasoning && (
                        <div className="text-xs text-gray-500 italic border-t pt-2">{rec.reasoning}</div>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-medium">Total Investment</span>
                    <span className="text-xl font-bold text-green-600">${totalCost.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Application Timing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    Application Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{result.applicationTiming}</p>
                </CardContent>
              </Card>

              {/* Insights */}
              {result.insights && result.insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Expert Insights & Warnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <ChevronRight className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <CalcIcon className="h-10 w-10 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ready to Analyse</h3>
                  <p className="text-gray-500 max-w-xs">
                    Fill in your crop details and current soil nutrient levels, then click <strong>Calculate & Recommend</strong> to get ML-powered fertilizer advice.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-xs text-gray-400 pt-2">
                    <div className="flex flex-col items-center gap-1">
                      <Leaf className="h-4 w-4" />22 crops
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <FlaskConical className="h-4 w-4" />13 fertilizers
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Shield className="h-4 w-4" />Organic-first
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
