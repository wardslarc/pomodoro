import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, BarChart3, LogOut, Lock, Shield, FileText, Mail, Heart, Menu, X, Users } from "lucide-react";
import Timer from "./Timer";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import ReflectionContent from "./ReflectionContent";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsAndConditions from "./TermsAndConditions";
import ContactContent from "./ContactContent";
import SocialFeed from "./social/SocialFeed"; // Add this import
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type ModalType = 
  | "dashboard" 
  | "settings" 
  | "privacy" 
  | "terms" 
  | "contact" 
  | "loginPrompt" 
  | "logoutConfirm" 
  | "donate" 
  | "reflection"
  | "social"
  | "alert"
  | null;

interface AlertConfig {
  title: string;
  description: string;
  type: "error" | "warning" | "success" | "info";
  actionLabel?: string;
  onAction?: () => void;
}

const Home = () => {
  const [activeTab, setActiveTab] = useState("timer");
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
    setOpenModal("alert");
  };

  const handleTimerComplete = (sessionData: {
    sessionId: string;
    sessionType: "work" | "break" | "longBreak";
    duration: number;
  }) => {
    if (user) {
      setCurrentSessionId(sessionData.sessionId);
      setOpenModal("reflection");
    } else {
      setOpenModal("loginPrompt");
    }
  };

  const handleReflectionSubmit = async (reflectionData: {
    learnings: string;
    sessionId: string | null;
  }) => {
    setOpenModal(null);
    setCurrentSessionId(null);
  };

  const handleProtectedFeature = (feature: "dashboard" | "settings" | "social") => {
    if (!user) {
      showAlert({
        title: "Sign In Required",
        description: "Please sign in first to access this feature.",
        type: "info",
        actionLabel: "Go to Sign In",
        onAction: handleNavigateToAuth
      });
      return;
    }
    setOpenModal(feature);
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setOpenModal("logoutConfirm");
    setMobileMenuOpen(false);
  };

  const handleConfirmLogout = () => {
    logout();
    setOpenModal(null);
  };

  const handleNavigateToAuth = () => {
    navigate("/auth");
    setMobileMenuOpen(false);
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setOpenModal(null);
      setCurrentSessionId(null);
    } else {
      if ((openModal === "dashboard" || openModal === "settings" || openModal === "reflection") && !user) {
        setOpenModal(null);
      }
    }
  };

  const handleNavigationClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const getModalSize = (modalType: ModalType) => {
    switch (modalType) {
      case "dashboard":
      case "settings":
      case "social":
        return "max-w-7xl w-full h-[90vh] mx-4";
      case "privacy":
      case "terms":
        return "max-w-4xl w-full max-h-[80vh] mx-4";
      case "reflection":
        return "max-w-2xl w-full max-h-[80vh] mx-4";
      case "contact":
        return "max-w-2xl w-full mx-4";
      case "alert":
        return "max-w-md w-full mx-4";
      case "loginPrompt":
      case "logoutConfirm":
      case "donate":
      default:
        return "max-w-md w-full mx-4";
    }
  };

  const renderModalContent = () => {
  if ((openModal === "dashboard" || openModal === "settings" || openModal === "reflection") && !user) {
    return null;
  }

  switch (openModal) {
    case "social":
      return (
        <>
          <DialogHeader>
            <DialogTitle className="sr-only">Community Feed</DialogTitle>
            <DialogDescription className="sr-only">
              Share and learn from other learners' experiences
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto h-full">
            <SocialFeed />
          </div>
        </>
      );
    
    case "reflection":
      return (
        <>
          <DialogHeader>
            <DialogTitle className="sr-only">Session Reflection</DialogTitle>
            <DialogDescription className="sr-only">
              Reflect on your completed Pomodoro session
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto">
            <ReflectionContent
              sessionId={currentSessionId}
              onSubmit={handleReflectionSubmit}
              onClose={() => setOpenModal(null)}
            />
          </div>
        </>
      );
      
      case "loginPrompt":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Great work! 🎉</DialogTitle>
              <DialogDescription>
                You completed a Pomodoro session! Sign in to save reflections and track progress.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setOpenModal(null)} className="flex-1">
                Continue Without Account
              </Button>
              <Button onClick={handleNavigateToAuth} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </DialogFooter>
          </>
        );
      
      case "dashboard":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Dashboard</DialogTitle>
              <DialogDescription className="sr-only">
                Analytics and productivity dashboard
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-auto h-full">
              <Dashboard />
            </div>
          </>
        );
      
      case "settings":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Settings</DialogTitle>
              <DialogDescription className="sr-only">
                Application settings and preferences
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-auto h-full">
              <Settings />
            </div>
          </>
        );

      case "logoutConfirm":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Confirm Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to sign out? Your current session data will be saved.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setOpenModal(null)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmLogout} 
                className="flex-1 bg-red-600 hover:bg-red-700"
                variant="destructive"
              >
                Sign Out
              </Button>
            </DialogFooter>
          </>
        );
      
      case "donate":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Support Reflective Pomodoro
              </DialogTitle>
              <DialogDescription className="text-base leading-relaxed">
                Hi! 👋 Reflective Pomodoro is a personal project I built to help people focus. 
                Your support helps keep the site alive and enables continued improvements.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpenModal(null)} className="flex-1">
                Maybe Later
              </Button>
              <Button 
                onClick={() => window.open("https://ko-fi.com/reflectivepomodoro", "_blank")}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
              >
                Donate Now
              </Button>
            </DialogFooter>
          </>
        );
      
      case "alert":
        if (!alertConfig) return null;
        const iconMap: Record<string, string> = {
          error: "❌",
          warning: "⚠️",
          success: "✅",
          info: "ℹ️"
        };
        const buttonColorMap: Record<string, string> = {
          error: "bg-red-600 hover:bg-red-700",
          warning: "bg-amber-600 hover:bg-amber-700",
          success: "bg-green-600 hover:bg-green-700",
          info: "bg-blue-600 hover:bg-blue-700"
        };
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <span>{iconMap[alertConfig.type || "info"]}</span>
                {alertConfig.title}
              </DialogTitle>
              <DialogDescription className="text-base">
                {alertConfig.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpenModal(null)} className="flex-1">
                Close
              </Button>
              {alertConfig.actionLabel && (
                <Button 
                  onClick={() => {
                    alertConfig.onAction?.();
                    setOpenModal(null);
                  }}
                  className={`flex-1 text-white ${buttonColorMap[alertConfig.type || "info"]}`}
                >
                  {alertConfig.actionLabel}
                </Button>
              )}
            </DialogFooter>
          </>
        );
      
      case "privacy":
        return <PrivacyPolicy />;
      
      case "terms":
        return <TermsAndConditions />;
      
      case "contact":
        return <ContactContent />;
      
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen w-full ${settings.darkMode ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" : "bg-gradient-to-br from-blue-50 via-white to-blue-50 text-slate-900"}`}>
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300" style={{borderColor: settings.darkMode ? "rgba(255,255,255,0.1)" : "rgba(59,130,246,0.1)"}}>
        <div className="px-4 md:px-8 py-4 md:py-6">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0">
              <div className="relative flex-shrink-0">
                <div className={`absolute inset-0 blur-lg ${settings.darkMode ? "bg-blue-500/30" : "bg-blue-400/30"} rounded-full`}></div>
                <img 
                  src="/pomodoro.png" 
                  alt="Reflective Pomodoro Logo" 
                  className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent truncate">Reflective Pomodoro</h1>
                <p className={`text-xs sm:text-sm mt-0.5 truncate ${settings.darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  {user ? `Welcome, ${user.name}! 👋` : "Mindful focus"}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <div className="flex items-center gap-6 lg:gap-8">
                <button 
                  onClick={() => handleNavigationClick("timer")}
                  className={`text-sm lg:text-base font-semibold transition-all duration-300 relative whitespace-nowrap ${
                    activeTab === "timer" 
                      ? "text-blue-600" 
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Home
                  {activeTab === "timer" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></div>
                  )}
                </button>
                <button 
                  onClick={() => handleProtectedFeature("social")}
                  className={`text-sm lg:text-base font-semibold transition-all duration-300 relative whitespace-nowrap ${
                    activeTab === "social" 
                      ? "text-blue-600" 
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Community
                  {activeTab === "social" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></div>
                  )}
                </button>
                <button 
                  onClick={() => handleProtectedFeature("dashboard")}
                  className={`text-sm lg:text-base font-semibold transition-all duration-300 relative whitespace-nowrap ${
                    activeTab === "dashboard" 
                      ? "text-blue-600" 
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Dashboard
                  {activeTab === "dashboard" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></div>
                  )}
                </button>
                <button 
                  onClick={() => handleProtectedFeature("settings")}
                  className={`text-sm lg:text-base font-semibold transition-all duration-300 relative whitespace-nowrap ${
                    activeTab === "settings" 
                      ? "text-blue-600" 
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Settings
                  {activeTab === "settings" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></div>
                  )}
                </button>
              </div>

              <div className={`h-6 w-px ${settings.darkMode ? "bg-slate-700" : "bg-slate-200"}`}></div>

              <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                {user ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setOpenModal("donate")} 
                      title="Support the project"
                      className={`h-9 w-9 lg:h-10 lg:w-10 transition-all duration-300 ${settings.darkMode ? "hover:bg-pink-500/20" : "hover:bg-pink-500/10"}`}
                    >
                      <Heart className="h-4 w-4 lg:h-5 lg:w-5 text-pink-500" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleLogoutClick} 
                      title="Logout"
                      className="h-9 w-9 lg:h-10 lg:w-10 transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleNavigateToAuth} 
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30 text-white px-4 lg:px-6 py-2 rounded-lg font-semibold text-sm lg:text-base transition-all duration-300"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {user && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setOpenModal("donate")} 
                  title="Support the project"
                  className="h-9 w-9 transition-all duration-300"
                >
                  <Heart className="h-4 w-4 text-pink-500" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-9 w-9 transition-all duration-300"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden mb-4 sm:mb-6 backdrop-blur-xl border-b rounded-lg border transition-all duration-300 ${
          settings.darkMode 
            ? "bg-slate-800/50 border-slate-700" 
            : "bg-white/50 border-slate-200"
        } mx-2 sm:mx-4 mt-3 sm:mt-4`}>
          <nav className="flex flex-col space-y-1 p-3 sm:p-4">
            <button 
              onClick={() => handleNavigationClick("timer")}
              className={`text-left text-base sm:text-lg font-semibold transition-all duration-300 py-3 px-3 sm:px-4 rounded-lg ${
                activeTab === "timer" 
                  ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-blue-600" 
                  : `text-slate-600 hover:bg-slate-100 ${settings.darkMode ? "hover:bg-slate-700" : ""}`
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => handleProtectedFeature("social")}
              className={`text-left text-base sm:text-lg font-semibold transition-all duration-300 py-3 px-3 sm:px-4 rounded-lg ${
                activeTab === "social" 
                  ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-blue-600" 
                  : `text-slate-600 hover:bg-slate-100 ${settings.darkMode ? "hover:bg-slate-700" : ""}`
              }`}
            >
              Community
            </button>
            <button 
              onClick={() => handleProtectedFeature("dashboard")}
              className={`text-left text-base sm:text-lg font-semibold transition-all duration-300 py-3 px-3 sm:px-4 rounded-lg ${
                activeTab === "dashboard" 
                  ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-blue-600" 
                  : `text-slate-600 hover:bg-slate-100 ${settings.darkMode ? "hover:bg-slate-700" : ""}`
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => handleProtectedFeature("settings")}
              className={`text-left text-base sm:text-lg font-semibold transition-all duration-300 py-3 px-3 sm:px-4 rounded-lg ${
                activeTab === "settings" 
                  ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-blue-600" 
                  : `text-slate-600 hover:bg-slate-100 ${settings.darkMode ? "hover:bg-slate-700" : ""}`
              }`}
            >
              Settings
            </button>
            
            <div className={`border-t my-3 sm:my-4 ${settings.darkMode ? "border-slate-700" : "border-slate-200"}`}></div>
            {user ? (
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handleLogoutClick}
                  className="justify-start text-red-600 h-10 sm:h-11 transition-all duration-300 text-base sm:text-lg"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                variant="default" 
                onClick={handleNavigateToAuth} 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold transition-all duration-300 h-10 sm:h-11 text-base sm:text-lg"
              >
                Sign In
              </Button>
            )}
          </nav>
        </div>
      )}

    <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="timer" className="mt-0">
          <div className="flex flex-col items-center justify-center px-2 sm:px-4 py-6 sm:py-8 md:py-12">
            <Timer onSessionComplete={handleTimerComplete} />
            
       
        {/* Add Community Button */}
        <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 flex flex-col items-center gap-4 sm:gap-5 md:gap-6 px-3 sm:px-4">
          <Button 
            onClick={() => handleProtectedFeature("social")}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 sm:px-8 py-5 sm:py-6 rounded-lg font-semibold text-base sm:text-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 w-full sm:w-auto min-h-[44px]"
            size="lg"
          >
            <Users className="h-5 w-5" />
            <span className="hidden sm:inline">Join the Community</span>
            <span className="sm:hidden">Community</span>
          </Button>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 text-center max-w-md leading-relaxed">
            Share your reflections and learn from other focused learners
          </p>
        </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>

 <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gradient-to-br from-white via-blue-50 to-cyan-50 text-slate-900 py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-8 mt-12 sm:mt-16 md:mt-24 border-t border-slate-200">
  <div className="max-w-5xl mx-auto">
    <div className="text-center mb-8 sm:mb-12 md:mb-16">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent leading-tight">
        About Reflective Pomodoro
      </h2>
      <div className="h-1 w-16 sm:w-20 md:w-24 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mx-auto"></div>
    </div>

    <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 md:mb-12 text-slate-700 max-w-3xl mx-auto">
      <span className="font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Reflective Pomodoro</span> is more than just a productivity timer—it's a mindful system designed to help you balance focus and reflection. 
      Built on the foundation of the classic Pomodoro Technique, it encourages you to work with intention, pause with purpose, 
      and learn from your habits over time.
    </p>

    <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-10 md:mb-16">
      <div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-slate-900">How to Use</h3>
        <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed">
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="text-blue-600 font-bold text-lg sm:text-xl mt-0.5 sm:mt-1 flex-shrink-0">→</span>
            <span>Begin by selecting your task and starting a focused session using the built-in timer.</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="text-blue-600 font-bold text-lg sm:text-xl mt-0.5 sm:mt-1 flex-shrink-0">→</span>
            <span>Work deeply and avoid distractions until the timer ends.</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="text-blue-600 font-bold text-lg sm:text-xl mt-0.5 sm:mt-1 flex-shrink-0">→</span>
            <span>After each session, take a few moments to reflect on your experience.</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="text-blue-600 font-bold text-lg sm:text-xl mt-0.5 sm:mt-1 flex-shrink-0">→</span>
            <span>Review your personalized Dashboard to visualize trends and track improvement.</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="text-blue-600 font-bold text-lg sm:text-xl mt-0.5 sm:mt-1 flex-shrink-0">→</span>
            <span>Repeat and refine—each reflection helps you understand your optimal working style.</span>
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-blue-100">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-slate-900">Key Benefits</h3>
        <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed">
          <li className="flex items-center gap-2 sm:gap-3">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex-shrink-0"></span>
            <span><strong>Reflection Recording:</strong> Capture emotions & insights</span>
          </li>
          <li className="flex items-center gap-2 sm:gap-3">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex-shrink-0"></span>
            <span><strong>Customizable Timer:</strong> Adapt to your personal rhythm</span>
          </li>
          <li className="flex items-center gap-2 sm:gap-3">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex-shrink-0"></span>
            <span><strong>Dashboard:</strong> Detailed analytics & metrics</span>
          </li>
          <li className="flex items-center gap-2 sm:gap-3">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex-shrink-0"></span>
            <span><strong>Community:</strong> Learn from other users</span>
          </li>
          <li className="flex items-center gap-2 sm:gap-3">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex-shrink-0"></span>
            <span><strong>Cloud Sync:</strong> Seamless cross-device access</span>
          </li>
        </ul>
      </div>
    </div>

    <div className="bg-gradient-to-r from-blue-600/10 to-cyan-500/10 rounded-xl sm:rounded-2xl border border-blue-200 p-6 sm:p-8 md:p-12 text-center">
      <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-700 mb-0">
        <span className="font-bold text-slate-900">Reflective Pomodoro</span> transforms everyday work into a meaningful journey of growth. 
        It helps you not only get things done—but understand <span className="font-semibold">how</span> you work best, 
        <span className="font-semibold"> why</span> you lose focus, and <span className="font-semibold"> what</span> makes you thrive.
      </p>
    </div>
  </div>
</section>



      <Dialog open={openModal !== null} onOpenChange={handleModalOpenChange}>
        <DialogContent className={`${getModalSize(openModal)} max-h-[90vh] overflow-hidden ${settings.darkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900 shadow-2xl"}`}>
          {renderModalContent()}
        </DialogContent>
      </Dialog>

      <footer className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen mt-12 sm:mt-16 md:mt-24 bg-gradient-to-br from-slate-900 to-slate-800 border-t border-slate-700`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-8 sm:py-12 md:py-16">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-10 md:mb-12">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <img src="/pomodoro.png" alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8" />
                <h3 className="text-lg sm:text-xl font-bold text-white">Reflective Pomodoro</h3>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                A mindful productivity system combining focus with meaningful reflection.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
              <div className="flex flex-col gap-2 sm:gap-3">
                <button onClick={() => handleNavigationClick("timer")} className="text-slate-400 hover:text-blue-400 transition-colors text-xs sm:text-sm font-medium text-left">
                  Home
                </button>
                <button onClick={() => handleProtectedFeature("dashboard")} className="text-slate-400 hover:text-blue-400 transition-colors text-xs sm:text-sm font-medium text-left">
                  Dashboard
                </button>
                <button onClick={() => handleProtectedFeature("settings")} className="text-slate-400 hover:text-blue-400 transition-colors text-xs sm:text-sm font-medium text-left">
                  Settings
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <div className="flex flex-col gap-2 sm:gap-3">
                <Button variant="ghost" onClick={() => setOpenModal("privacy")} className="justify-start text-slate-400 hover:text-blue-400 hover:bg-transparent text-xs sm:text-sm font-medium p-0 h-auto">
                  Privacy Policy
                </Button>
                <Button variant="ghost" onClick={() => setOpenModal("terms")} className="justify-start text-slate-400 hover:text-blue-400 hover:bg-transparent text-xs sm:text-sm font-medium p-0 h-auto">
                  Terms of Service
                </Button>
                <Button variant="ghost" onClick={() => setOpenModal("contact")} className="justify-start text-slate-400 hover:text-blue-400 hover:bg-transparent text-xs sm:text-sm font-medium p-0 h-auto">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <p className="text-slate-500 text-xs sm:text-sm font-medium text-center sm:text-left">
                © {new Date().getFullYear()} Reflective Pomodoro. All rights reserved.
              </p>
              <p className="text-slate-500 text-xs sm:text-sm">
                Built with <span className="text-pink-500">♥</span> for mindful productivity
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;