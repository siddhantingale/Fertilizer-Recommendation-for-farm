import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Plus, 
  MapPin, 
  Crop,
  ArrowRight,
  Calendar,
  TrendingUp,
  Droplets
} from "lucide-react";

export default function Farms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    area: "",
    soilType: "",
    cropType: "",
    ph: "",
    organicMatter: "",
  });

  const { data: farms, isLoading } = useQuery({
    queryKey: ["/api/farms", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/farms?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch farms");
      return await response.json();
    },
    enabled: !!user?.id,
  });

  const createFarmMutation = useMutation({
    mutationFn: async (farmData: any) => {
      const response = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...farmData,
          userId: user?.id,
          // Keep area, ph, and organicMatter as strings since Zod schema expects strings for decimal fields
        }),
      });
      if (!response.ok) throw new Error("Failed to create farm");
      return await response.json();
    },
    onSuccess: (newFarm) => {
      // Optimistically update the cache
      queryClient.setQueryData(["/api/farms", user?.id], (prevFarms: any[]) => {
        return [newFarm, ...(prevFarms || [])];
      });
      
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/farms", user?.id] });
      
      setIsDialogOpen(false);
      setFormData({
        name: "",
        location: "",
        area: "",
        soilType: "",
        cropType: "",
        ph: "",
        organicMatter: "",
      });
      toast({
        title: "Farm Added",
        description: "Your farm has been successfully registered.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add farm. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.area || !formData.soilType || !formData.cropType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createFarmMutation.mutate(formData);
  };

  const soilTypes = [
    "Clay",
    "Sandy",
    "Loamy",
    "Silty",
    "Clay Loam",
    "Sandy Loam",
    "Silty Loam",
  ];

  const cropTypes = [
    "Wheat",
    "Rice",
    "Corn",
    "Soybean",
    "Potato",
    "Cotton",
    "Sugarcane",
    "Tomato",
    "Other",
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your farms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Farms</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your registered farms and track their progress
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Farm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register New Farm</DialogTitle>
              <DialogDescription>
                Add your farm details to get personalized fertilizer recommendations
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Farm Name *</Label>
                  <Input
                    id="name"
                    data-testid="input-farm-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter farm name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    data-testid="input-farm-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State/Province"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Area (acres) *</Label>
                  <Input
                    id="area"
                    data-testid="input-farm-area"
                    type="number"
                    step="0.1"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type *</Label>
                  <Select value={formData.soilType} onValueChange={(value) => setFormData({ ...formData, soilType: value })} data-testid="select-soil-type">
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      {soilTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type *</Label>
                  <Select value={formData.cropType} onValueChange={(value) => setFormData({ ...formData, cropType: value })} data-testid="select-crop-type">
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ph">Soil pH (Optional)</Label>
                  <Input
                    id="ph"
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={formData.ph}
                    onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
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
                    value={formData.organicMatter}
                    onChange={(e) => setFormData({ ...formData, organicMatter: e.target.value })}
                    placeholder="3.5"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createFarmMutation.isPending} className="bg-green-600 hover:bg-green-700" data-testid="button-submit-farm">
                  {createFarmMutation.isPending ? "Adding..." : "Add Farm"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Farms Grid */}
      {farms && Array.isArray(farms) && farms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm: any) => (
            <Link key={farm.id} href={`/farms/${farm.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{farm.name}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{farm.location}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center space-x-1">
                        <Crop className="h-3 w-3" />
                        <span>Crop:</span>
                      </span>
                      <span className="font-medium">{farm.cropType}</span>
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
                        <span className="flex items-center space-x-1">
                          <Droplets className="h-3 w-3" />
                          <span>pH:</span>
                        </span>
                        <span className="font-medium">{farm.ph}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Added:</span>
                      </span>
                      <span>{new Date(farm.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Crop className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No farms registered yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding your first farm to get personalized fertilizer recommendations
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-add-farm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Farm
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}