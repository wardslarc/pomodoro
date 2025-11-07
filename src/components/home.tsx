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
  | "social" // Add this
  | null;

const Home = () => {
  const [activeTab, setActiveTab] = useState("timer");
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

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
      alert("Please log in first to access this feature.");
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
      case "social": // Add this
        return "max-w-7xl w-full h-[90vh] mx-4";
      case "privacy":
      case "terms":
        return "max-w-4xl w-full max-h-[80vh] mx-4";
      case "reflection":
        return "max-w-2xl w-full max-h-[80vh] mx-4";
      case "contact":
        return "max-w-2xl w-full mx-4";
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
    <div className={`min-h-screen w-full p-4 md:p-8 ${settings.darkMode ? "bg-slate-900 text-white" : "bg-blue-100 text-blue-900"}`}>
      <header className="flex justify-between items-center mb-6 md:mb-8">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <img 
            src="/pomodoro.png" 
            alt="Reflective Pomodoro Logo" 
            className="w-12 h-12 md:w-20 md:h-20 object-contain -translate-y-1"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Reflective Pomodoro</h1>
            <p className="text-xs md:text-sm mt-1 text-blue-700">
              {user ? `Welcome back, ${user.name}!` : "Focus timer - Sign in for reflections & analytics"}
            </p>
          </div>
        </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => handleNavigationClick("timer")}
            className={`text-base font-medium transition-colors hover:text-blue-700 ${
              activeTab === "timer" ? "text-blue-800 font-semibold" : "text-blue-600"
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => handleProtectedFeature("social")}
            className={`text-left text-base font-medium transition-colors hover:text-blue-700 py-2 px-3 rounded-lg ${
              activeTab === "social" 
                ? "bg-blue-100 text-blue-800 font-semibold" 
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            Community
          </button>
          <button 
            onClick={() => handleProtectedFeature("dashboard")}
            className={`text-base font-medium transition-colors hover:text-blue-700 ${
              activeTab === "dashboard" ? "text-blue-800 font-semibold" : "text-blue-600"
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => handleProtectedFeature("settings")}
            className={`text-base font-medium transition-colors hover:text-blue-700 ${
              activeTab === "settings" ? "text-blue-800 font-semibold" : "text-blue-600"
            }`}
          >
            Settings
          </button>
        </div>

          <div className="h-6 w-px bg-blue-300"></div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setOpenModal("donate")} 
                  title="Support the project"
                  className="text-pink-500 border-pink-300 hover:bg-pink-50 hover:text-pink-600"
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleLogoutClick} title="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button variant="default" onClick={handleNavigateToAuth} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
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
              className="text-pink-500 border-pink-300 hover:bg-pink-50 hover:text-pink-600 h-9 w-9"
            >
              <Heart className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mb-6 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200 p-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-4">
            <button 
              onClick={() => handleNavigationClick("timer")}
              className={`text-left text-base font-medium transition-colors hover:text-blue-700 py-2 px-3 rounded-lg ${
                activeTab === "timer" 
                  ? "bg-blue-100 text-blue-800 font-semibold" 
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => handleProtectedFeature("social")}
              className={`text-left text-base font-medium transition-colors hover:text-blue-700 py-2 px-3 rounded-lg ${
                activeTab === "social" 
                  ? "bg-blue-100 text-blue-800 font-semibold" 
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Community
            </button>
            <button 
              onClick={() => handleProtectedFeature("dashboard")}
              className={`text-left text-base font-medium transition-colors hover:text-blue-700 py-2 px-3 rounded-lg ${
                activeTab === "dashboard" 
                  ? "bg-blue-100 text-blue-800 font-semibold" 
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => handleProtectedFeature("settings")}
              className={`text-left text-base font-medium transition-colors hover:text-blue-700 py-2 px-3 rounded-lg ${
                activeTab === "settings" 
                  ? "bg-blue-100 text-blue-800 font-semibold" 
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Settings
            </button>
            
            <div className="border-t border-blue-200 pt-4">
              {user ? (
                <div className="flex flex-col space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={handleLogoutClick}
                    className="justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="default" 
                  onClick={handleNavigateToAuth} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign In
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}

    <main className="max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="timer" className="mt-0">
          <div className="flex flex-col items-center justify-center px-2">
            <Timer onSessionComplete={handleTimerComplete} />
            
       
        {/* Add Community Button */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <Button 
            onClick={() => handleProtectedFeature("social")}
            variant="outline" 
            className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            size="lg"
          >
            <Users className="h-5 w-5" />
            Join the Community
          </Button>
          <p className="text-sm text-blue-600 text-center max-w-md">
            Share your reflections and learn from others' experiences
          </p>
        </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>

 <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-white text-blue-900 py-12 md:py-20 px-4 md:px-8 mt-12 md:mt-16">
  <div className="max-w-5xl mx-auto text-center">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 md:mb-8">
      About Reflective Pomodoro
    </h2>

    <p className="text-lg md:text-xl leading-relaxed mb-6 md:mb-8">
      <span className="font-semibold">Reflective Pomodoro</span> is more than just a productivity timer—it’s a mindful system designed to help you balance focus and reflection. 
      Built on the foundation of the classic Pomodoro Technique, it encourages you to work with intention, pause with purpose, 
      and learn from your habits over time. Whether you’re studying, working on creative projects, or managing complex tasks, 
      Reflective Pomodoro helps you build consistency and emotional awareness in every session.
    </p>

    <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">How to Use</h3>
    <ul className="text-base md:text-lg leading-relaxed space-y-3 md:space-y-4 text-left max-w-3xl mx-auto">
      <li>• Begin by selecting your task and starting a focused session using the built-in timer.</li>
      <li>• Work deeply and avoid distractions until the timer ends.</li>
      <li>• After each session, take a few moments to reflect on your experience—record thoughts, challenges, and successes.</li>
      <li>• Review your personalized <span className="font-semibold">Dashboard</span> to visualize your focus trends and track your improvement over time.</li>
      <li>• Check the <span className="font-semibold">Leaderboard</span> to compare your progress with friends, colleagues, or the global community.</li>
      <li>• Repeat and refine your routine—each reflection helps you understand your optimal working style and sustain long-term productivity.</li>
    </ul>

    <h3 className="text-2xl md:text-3xl font-bold mt-8 md:mt-12 mb-4 md:mb-6">Key Features</h3>
    <ul className="text-base md:text-lg leading-relaxed space-y-3 md:space-y-4 text-left max-w-3xl mx-auto">
      <li>
        • <span className="font-semibold">Reflection Recording:</span> Capture your thoughts and emotions after each Pomodoro. 
        Identify recurring patterns, triggers, and insights that influence your productivity and motivation.
      </li>
      <li>
        • <span className="font-semibold">Smart Session Timer:</span> Set customizable work and break intervals that adapt to your personal rhythm, 
        ensuring balance between deep work and mindful rest.
      </li>
      <li>
        • <span className="font-semibold">Comprehensive Dashboard:</span> Analyze detailed charts and metrics that reveal your focus streaks, 
        daily averages, and emotional reflections—all in one clean visual overview.
      </li>
      <li>
        • <span className="font-semibold">Leaderboard & Rewards:</span> Stay motivated by earning points for completed sessions and consistent reflections. 
        Climb the leaderboard, unlock badges, and celebrate your progress.
      </li>
      <li>
        • <span className="font-semibold">Customization & Themes:</span> Personalize your workspace with light or dark themes, sound alerts, 
        and adjustable Pomodoro durations to suit your workflow.
      </li>
      <li>
        • <span className="font-semibold">Cloud Sync & Security:</span> Access your reflections, analytics, and session history across all devices 
        with seamless cloud synchronization and secure data storage.
      </li>
      <li>
        • <span className="font-semibold">Community Insights (coming soon):</span> Discover anonymized insights and shared reflections from users around the world 
        to gain inspiration and perspective on productivity patterns.
      </li>
    </ul>

    <p className="text-lg md:text-xl leading-relaxed mt-10 md:mt-12 max-w-3xl mx-auto">
      <span className="font-semibold">Reflective Pomodoro</span> transforms everyday work into a meaningful journey of growth. 
      It helps you not only get things done—but understand <span className="font-semibold">how</span> you work best, 
      <span className="font-semibold">why</span> you lose focus, and <span className="font-semibold">what</span> makes you thrive. 
      Every session becomes a step toward greater awareness, balance, and productivity.
    </p>
  </div>
</section>



      <Dialog open={openModal !== null} onOpenChange={handleModalOpenChange}>
        <DialogContent className={`${getModalSize(openModal)} max-h-[90vh] overflow-hidden ${settings.darkMode ? "bg-slate-800 text-white" : "bg-blue-100 text-blue-900"}`}>
          {renderModalContent()}
        </DialogContent>
      </Dialog>

      <footer className="mt-8 md:mt-12 pt-6 border-t border-blue-200">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm md:text-base text-blue-700 font-medium text-center md:text-left">
            Reflective Pomodoro - Focus with mindfulness
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Button variant="ghost" onClick={() => setOpenModal("privacy")} className="flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm md:text-base font-medium">
              <Shield className="h-4 w-4" /> Privacy
            </Button>
            <Button variant="ghost" onClick={() => setOpenModal("terms")} className="flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm md:text-base font-medium">
              <FileText className="h-4 w-4" /> Terms
            </Button>
            <Button variant="ghost" onClick={() => setOpenModal("contact")} className="flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm md:text-base font-medium">
              <Mail className="h-4 w-4" /> Contact
            </Button>
          </div>
        </div>
        <div className="text-center mt-4 md:mt-6">
          <img src="/pomodoro.png" alt="Reflective Pomodoro Logo" className="mx-auto mb-2 w-10 h-10 md:w-12 md:h-12" />
          <p className="text-xs md:text-sm text-blue-600 font-medium">
            © {new Date().getFullYear()} Reflective Pomodoro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;