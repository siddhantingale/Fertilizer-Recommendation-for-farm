import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { 
  Leaf, 
  Calculator, 
  TrendingUp, 
  MapPin, 
  Clock,
  ArrowRight,
  Sprout,
  BarChart3,
  Shield
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  // Use the same query key format as farms page for cache consistency
  const { data: farms } = useQuery({
    queryKey: ["/api/farms", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/farms?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch farms");
      return await response.json();
    },
    enabled: !!user?.id,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["/api/recommendations", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/recommendations?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      return await response.json();
    },
    enabled: !!user?.id,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name || "Farmer"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your farms and optimize fertilizer usage for sustainable agriculture.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farms?.length || 0}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Registered farms
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations?.length || 0}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Fertilizer recommendations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sustainability</CardTitle>
            <Shield className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2/10</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Average score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/calculator">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-green-600" />
                <span>NPK Calculator</span>
              </CardTitle>
              <CardDescription>
                Calculate optimal fertilizer recommendations based on soil analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Start Calculation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/farms">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                <span>Manage Farms</span>
              </CardTitle>
              <CardDescription>
                View and manage your registered farms and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Farms
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Yield Tracking</span>
            </CardTitle>
            <CardDescription>
              Monitor your crop yields and fertilizer effectiveness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Recommendations</span>
            </CardTitle>
            <CardDescription>
              Your latest fertilizer recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.slice(0, 3).map((rec: any) => (
                <div key={rec.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">NPK: {rec.nitrogenReq}/{rec.phosphorusReq}/{rec.potassiumReq}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sustainability Score: {rec.sustainabilityScore}/10
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      +{rec.expectedYieldIncrease}% yield
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Get Started Guide */}
      {(!farms || farms.length === 0) && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <span>Get Started</span>
            </CardTitle>
            <CardDescription>
              Start your sustainable farming journey in 3 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Register Your Farm</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add your farm details including location, crop type, and area
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Conduct Soil Test</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Input your soil analysis data for accurate recommendations
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Get Recommendations</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive personalized fertilizer suggestions for optimal yield
                  </p>
                </div>
              </div>
              <Link href="/farms">
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  Register Your First Farm
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}