import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onGoogleLogin: () => void;
  onSwitchToSignup: () => void;
  isLoading?: boolean;
  googleLoading?: boolean;
}

const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  onGoogleLogin,
  onSwitchToSignup, 
  isLoading = false,
  googleLoading = false
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ 
    email: false, 
    password: false 
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    
    if (validateForm()) {
      onLogin(email, password);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600 text-sm">Sign in to your Pomodoro account</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={onGoogleLogin}
            disabled={googleLoading || isLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? "Signing in with Google..." : "Continue with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`pl-10 transition-colors ${
                    errors.email ? "border-red-500 focus:border-red-500" : "border-gray-300"
                  }`}
                  disabled={isLoading || googleLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 animate-in fade-in-50">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700"
                  type="button"
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className={`pl-10 pr-10 transition-colors ${
                    errors.password ? "border-red-500 focus:border-red-500" : "border-gray-300"
                  }`}
                  disabled={isLoading || googleLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || googleLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 animate-in fade-in-50">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 text-center">{errors.general}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
              disabled={isLoading || googleLoading}
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

        <CardFooter className="flex justify-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 hover:text-blue-700 font-medium"
              onClick={onSwitchToSignup}
              disabled={isLoading || googleLoading}
            >
              Sign up
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;