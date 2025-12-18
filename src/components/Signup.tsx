import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SignupProps {
  onSignup: (name: string, email: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
}

const Signup: React.FC<SignupProps> = ({ 
  onSignup, 
  onSwitchToLogin, 
  isLoading 
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
    general?: string;
  }>({});
  const [touched, setTouched] = useState<{ 
    name: boolean; 
    email: boolean; 
    password: boolean; 
    confirmPassword: boolean; 
  }>({ 
    name: false, 
    email: false, 
    password: false, 
    confirmPassword: false 
  });

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/");
  };

  const validateField = (name: string, value: string, compareValue?: string) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        if (value.trim().length > 50) return "Name must be less than 50 characters";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value)) return "Password must contain both uppercase and lowercase letters";
        if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== compareValue) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(
      field, 
      field === "name" ? name : 
      field === "email" ? email : 
      field === "password" ? password : confirmPassword,
      field === "confirmPassword" ? password : undefined
    );
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const nameError = validateField("name", name);
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);
    const confirmPasswordError = validateField("confirmPassword", confirmPassword, password);
    
    const newErrors = {
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError
    };
    
    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    
    return !nameError && !emailError && !passwordError && !confirmPasswordError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, general: "" }));
    
    if (validateForm()) {
      try {
        await onSignup(name.trim(), email, password);
        // Success - the Auth component will handle the state update and redirection
      } catch (error: any) {
        setErrors({ 
          general: error.message || "Signup failed. Please try again.",
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        // Clear confirm password error when password changes
        if (touched.confirmPassword && confirmPassword) {
          const confirmError = validateField("confirmPassword", confirmPassword, value);
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
    }

    if (touched[field as keyof typeof touched]) {
      const error = validateField(
        field, 
        value, 
        field === "confirmPassword" ? password : undefined
      );
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: "", color: "" };
    if (password.length < 6) return { strength: 1, text: "Very Weak", color: "bg-red-500" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    switch (strength) {
      case 1:
      case 2:
        return { strength, text: "Weak", color: "bg-red-500" };
      case 3:
        return { strength, text: "Medium", color: "bg-yellow-500" };
      case 4:
        return { strength, text: "Strong", color: "bg-green-500" };
      case 5:
        return { strength, text: "Very Strong", color: "bg-green-600" };
      default:
        return { strength: 0, text: "", color: "" };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4 relative overflow-y-auto">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 hidden sm:block"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 hidden sm:block"></div>
      
      <Card className="w-full max-w-md bg-white shadow-2xl border border-blue-100/50 rounded-2xl sm:rounded-3xl relative z-10 my-4">
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
          
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 sm:mt-2">Join Reflective Pomodoro and start your focus journey</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 sm:space-y-6 pt-6 sm:pt-8 px-4 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-slate-700">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className={`pl-10 sm:pl-12 py-2.5 sm:py-3 text-sm bg-blue-50/50 border rounded-lg sm:rounded-xl transition-all ${
                    errors.name ? "border-red-400 focus:border-red-500" : "border-blue-200 focus:border-emerald-500"
                  } focus:bg-white text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/20`}
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 animate-in fade-in-50 flex items-center gap-1">✕ {errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-slate-700">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`pl-10 sm:pl-12 py-2.5 sm:py-3 text-sm bg-blue-50/50 border rounded-lg sm:rounded-xl transition-all ${
                    errors.email ? "border-red-400 focus:border-red-500" : "border-blue-200 focus:border-emerald-500"
                  } focus:bg-white text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/20`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 animate-in fade-in-50 flex items-center gap-1">✕ {errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-slate-700">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleFieldChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className={`pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm bg-blue-50/50 border rounded-lg sm:rounded-xl transition-all ${
                    errors.password ? "border-red-400 focus:border-red-500" : "border-blue-200 focus:border-emerald-500"
                  } focus:bg-white text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/20`}
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
              
              {password.length > 0 && (
                <div className="space-y-2 p-2 sm:p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Strength:</span>
                    <span className={`font-semibold ${
                      passwordStrength.text === "Very Weak" || passwordStrength.text === "Weak" ? "text-red-600" :
                      passwordStrength.text === "Medium" ? "text-yellow-600" :
                      "text-emerald-600"
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200/50 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-xs text-red-500 animate-in fade-in-50 flex items-center gap-1">✕ {errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-semibold text-slate-700">
                Confirm Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  className={`pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm bg-blue-50/50 border rounded-lg sm:rounded-xl transition-all ${
                    errors.confirmPassword ? "border-red-400 focus:border-red-500" : "border-blue-200 focus:border-emerald-500"
                  } focus:bg-white text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/20`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-blue-100 rounded-lg transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 animate-in fade-in-50 flex items-center gap-1">✕ {errors.confirmPassword}</p>
              )}
            </div>

            {errors.general && (
              <div className="p-3 sm:p-4 bg-red-50/80 border border-red-200 rounded-lg sm:rounded-xl">
                <p className="text-xs sm:text-sm text-red-700 text-center font-medium">{errors.general}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 transition-all py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white rounded-lg sm:rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 mt-4 sm:mt-6 min-h-[40px] sm:min-h-[48px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-blue-100 pt-4 sm:pt-6 mt-4 sm:mt-6 px-4 sm:px-8 pb-4 sm:pb-8">
          <p className="text-xs sm:text-sm text-slate-600 text-center">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;