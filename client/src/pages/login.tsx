import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { Leaf, Smartphone, Shield } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [name, setName] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const sendOtpMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      if (!response.ok) throw new Error("Failed to send OTP");
      return await response.json();
    },
    onSuccess: (data) => {
      setStep("otp");
      setDevOtp(data.otpCode || "");
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phoneNumber, otpCode, name }: { phoneNumber: string; otpCode: string; name?: string }) => {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otpCode, name }),
      });
      if (!response.ok) throw new Error("Failed to verify OTP");
      return await response.json();
    },
    onSuccess: (data) => {
      // Clear all queries and set user
      queryClient.clear();
      setUser(data.user);
      
      toast({
        title: "Welcome!",
        description: "Login successful. Redirecting to dashboard...",
      });
      
      // Use replace to prevent back navigation to login
      setLocation("/", { replace: true });
    },
    onError: (error) => {
      toast({
        title: "Invalid OTP",
        description: "Please check your code and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }
    sendOtpMutation.mutate(phoneNumber);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast({
        title: "OTP Required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate({ phoneNumber, otpCode, name });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            FertilizerPro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sustainable fertilizer usage for higher yield
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {step === "phone" ? (
                <>
                  <Smartphone className="h-5 w-5" />
                  <span>Enter Your Phone Number</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Verify Your Number</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {step === "phone"
                ? "We'll send you a verification code to get started"
                : "Enter the 6-digit code sent to your phone"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    data-testid="input-phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={sendOtpMutation.isPending}
                  data-testid="button-send-otp"
                >
                  {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    data-testid="input-otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                  {devOtp && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Development OTP: {devOtp}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name (Optional)</Label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={verifyOtpMutation.isPending}
                  data-testid="button-verify-otp"
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Login"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep("phone");
                    setOtpCode("");
                    setDevOtp("");
                  }}
                >
                  Back to Phone Number
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">Get started with:</p>
          <div className="flex justify-center space-x-6">
            <span>🌱 NPK Calculator</span>
            <span>📊 Soil Analysis</span>
            <span>🚜 Farm Management</span>
          </div>
        </div>
      </div>
    </div>
  );
}