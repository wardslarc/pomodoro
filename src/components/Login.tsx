import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToSignup: () => void;
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup, isLoading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ 
    email: false, 
    password: false 
  });
  
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/");
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, field === "email" ? email : password);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);
    
    const newErrors = {
      email: emailError,
      password: passwordError
    };
    
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    
    return !emailError && !passwordError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ general: '' }); // Clear previous general errors
    
    if (validateForm()) {
      try {
        await onLogin(email, password);
        // Success - the Auth component will handle 2FA flow and redirection
      } catch (error: any) {
        setErrors({ 
          general: error.message || "Login failed. Please try again.",
          email: '',
          password: ''
        });
      }
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      const error = validateField("email", value);
      setErrors(prev => ({ ...prev, email: error }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      const error = validateField("password", value);
      setErrors(prev => ({ ...prev, password: error }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4 relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 hidden sm:block"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 hidden sm:block"></div>
      
      <Card className="w-full max-w-md bg-white shadow-2xl border border-blue-100/50 rounded-2xl sm:rounded-3xl relative z-10">
        <CardHeader className="text-center space-y-3 sm:space-y-4 pb-6 sm:pb-8 border-b border-blue-100 px-4 sm:px-8 pt-4 sm:pt-8">
          {/* Go Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="absolute left-3 sm:left-6 top-3 sm:top-6 text-slate-600 hover:text-slate-800 hover:bg-blue-50/50 rounded-lg transition-all h-9 w-9 sm:h-10 sm:w-10"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 sm:mt-2">Sign in to access your Pomodoro sessions</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 sm:space-y-6 pt-6 sm:pt-8 px-4 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-slate-700">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`pl-10 sm:pl-12 py-2.5 sm:py-3 text-sm bg-blue-50/50 border rounded-lg sm:rounded-xl transition-all ${
                    errors.email ? "border-red-400 focus:border-red-500" : "border-blue-200 focus:border-blue-500"
                  } focus:bg-white text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/20`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 animate-in fade-in-50 flex items-center gap-1">✕ {errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-slate-700">
                  Password
                </Label>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  type="button"
                  disabled={isLoading}
                >
                  Forgot?
                </Button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className={`pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm bg-blue-50/50 border rounded-lg sm:rounded-xl transition-all ${
                    errors.password ? "border-red-400 focus:border-red-500" : "border-blue-200 focus:border-blue-500"
                  } focus:bg-white text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/20`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-blue-100 rounded-lg transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 animate-in fade-in-50 flex items-center gap-1">✕ {errors.password}</p>
              )}
            </div>

            {errors.general && (
              <div className="p-3 sm:p-4 bg-red-50/80 border border-red-200 rounded-lg sm:rounded-xl">
                <p className="text-xs sm:text-sm text-red-700 text-center font-medium">{errors.general}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 mt-4 sm:mt-6 min-h-[40px] sm:min-h-[48px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-blue-100 pt-4 sm:pt-6 mt-4 sm:mt-6 px-4 sm:px-8 pb-4 sm:pb-8">
          <p className="text-xs sm:text-sm text-slate-600 text-center">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              onClick={onSwitchToSignup}
              disabled={isLoading}
            >
              Create one
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;