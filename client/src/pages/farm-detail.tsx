import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { FarmWithDetails, SoilTest } from "@shared/schema";
import {
  ArrowLeft,
  Plus,
  FlaskConical,
  Calculator,
  MapPin,
  Crop,
  Droplets,
  Calendar,
  TrendingUp,
  Target,
} from "lucide-react";

export default function FarmDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [soilTestData, setSoilTestData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    organicMatter: "",
  });

  const { data: farm, isLoading } = useQuery<FarmWithDetails>({
    queryKey: ["/api/farms", id, { details: "true" }],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${id}?details=true`);
      if (!r.ok) throw new Error("Failed to fetch farm");
      return r.json();
    },
    enabled: !!id,
  });

  const { data: soilTests } = useQuery<SoilTest[]>({
    queryKey: ["/api/soil-tests", id],
    queryFn: async () => {
      const r = await fetch(`/api/soil-tests?farmId=${id}`);
      if (!r.ok) throw new Error("Failed to fetch soil tests");
      return r.json();
    },
    enabled: !!id,
  });

  const createSoilTestMutation = useMutation({
    mutationFn: async (testData: typeof soilTestData) => {
      const response = await fetch("/api/soil-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: id,
          nitrogen: parseFloat(testData.nitrogen),
          phosphorus: parseFloat(testData.phosphorus),
          potassium: parseFloat(testData.potassium),
          ph: testData.ph ? parseFloat(testData.ph) : null,
          organicMatter: testData.organicMatter ? parseFloat(testData.organicMatter) : null,
          testDate: new Date(),
        }),
      });
      if (!response.ok) throw new Error("Failed to create soil test");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/soil-tests", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/farms", id] });
      setIsDialogOpen(false);
      setSoilTestData({ nitrogen: "", phosphorus: "", potassium: "", ph: "", organicMatter: "" });
      toast({ title: "Soil Test Added", description: "Results recorded and recommendation generated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add soil test. Please try again.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soilTestData.nitrogen || !soilTestData.phosphorus || !soilTestData.potassium) {
      toast({ title: "Missing Information", description: "Please fill in N, P, and K values.", variant: "destructive" });
      return;
    }
    createSoilTestMutation.mutate(soilTestData);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading farm details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Farm not found</h1>
          <Link href="/farms">
            <Button className="mt-4" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Farms
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/farms">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farms
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{farm.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {farm.location}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            {/* Add Soil Test Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Soil Test
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Soil Test Results</DialogTitle>
                  <DialogDescription>
                    Enter your latest soil analysis data. We will auto-generate fertilizer recommendations.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {(["nitrogen", "phosphorus", "potassium"] as const).map((key, i) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)"][i]} *</Label>
                        <Input
                          id={key}
                          type="number"
                          step="0.1"
                          value={soilTestData[key]}
                          onChange={(e) => setSoilTestData({ ...soilTestData, [key]: e.target.value })}
                          placeholder="kg/ha"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ph">Soil pH (Optional)</Label>
                      <Input
                        id="ph"
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={soilTestData.ph}
                        onChange={(e) => setSoilTestData({ ...soilTestData, ph: e.target.value })}
                        placeholder="7.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organicMatter">Organic Matter % (Optional)</Label>
                      <Input
                        id="organicMatter"
                        type="number"
                        step="0.1"
                        min="0"
                        value={soilTestData.organicMatter}
                        onChange={(e) => setSoilTestData({ ...soilTestData, organicMatter: e.target.value })}
                        placeholder="3.5"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createSoilTestMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createSoilTestMutation.isPending ? "Saving..." : "Save & Analyse"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Go to calculator */}
            <Link href={`/calculator`}>
              <Button className="bg-green-600 hover:bg-green-700">
                <Calculator className="h-4 w-4 mr-2" />
                NPK Calculator
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Farm Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-sm">
                  <Crop className="h-4 w-4" />
                  <span>Crop Type:</span>
                </span>
                <span className="font-medium text-sm">{farm.cropType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Area:</span>
                <span className="font-medium">{farm.area} acres</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Soil Type:</span>
                <span className="font-medium">{farm.soilType}</span>
              </div>
              {farm.ph && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4" />
                    <span>pH:</span>
                  </span>
                  <span className="font-medium">{farm.ph}</span>
                </div>
              )}
              {farm.organicMatter && (
                <div className="flex items-center justify-between text-sm">
                  <span>Organic Matter:</span>
                  <span className="font-medium">{farm.organicMatter}%</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created:</span>
                </span>
                <span>{farm.createdAt ? new Date(farm.createdAt).toLocaleDateString() : "N/A"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Latest Recommendation Stats */}
          {farm.latestRecommendation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Latest Recommendation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Expected Yield Increase:</span>
                  <span className="font-medium text-green-600">
                    +{farm.latestRecommendation.expectedYieldIncrease}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Sustainability Score:</span>
                  <span className="font-medium">
                    {farm.latestRecommendation.sustainabilityScore}/10
                  </span>
                </div>
                {farm.totalUsage !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Fertilizer Used:</span>
                    <span className="font-medium">{Number(farm.totalUsage).toFixed(1)} kg</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Soil Tests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FlaskConical className="h-5 w-5" />
                <span>Soil Test History</span>
              </CardTitle>
              <CardDescription>Track your soil analysis results over time</CardDescription>
            </CardHeader>
            <CardContent>
              {soilTests && soilTests.length > 0 ? (
                <div className="space-y-4">
                  {soilTests.map((test) => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">
                          Test Date:{" "}
                          {test.testDate ? new Date(test.testDate).toLocaleDateString() : "N/A"}
                        </h4>
                        <Link href="/calculator">
                          <Button size="sm" variant="outline">
                            <Target className="h-3 w-3 mr-1" />
                            Calculate
                          </Button>
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Nitrogen:</span>
                          <p className="font-medium">{test.nitrogen} kg/ha</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Phosphorus:</span>
                          <p className="font-medium">{test.phosphorus} kg/ha</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Potassium:</span>
                          <p className="font-medium">{test.potassium} kg/ha</p>
                        </div>
                        {test.ph && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">pH:</span>
                            <p className="font-medium">{test.ph}</p>
                          </div>
                        )}
                        {test.organicMatter && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Organic Matter:</span>
                            <p className="font-medium">{test.organicMatter}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FlaskConical className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No soil tests yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Add soil test results to get automated fertilizer recommendations
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
