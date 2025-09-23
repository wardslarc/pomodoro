import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, BarChart3, LogOut, Lock, Shield, FileText, Mail, Heart } from "lucide-react";
import Timer from "./Timer";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import ReflectionModal from "./ReflectionModal";
import Auth from "./Auth";
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

type ModalType = "dashboard" | "settings" | "privacy" | "terms" | "contact" | "loginPrompt" | "auth" | "logoutConfirm" | "donate" | null;

const Home = () => {
  const [activeTab, setActiveTab] = useState("timer");
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const { user, logout } = useAuth();
  const { settings } = useSettings();

  const navigate = useNavigate();

  // Effect to handle refresh after successful login
  useEffect(() => {
    if (shouldRefresh) {
      setShouldRefresh(false);
      // Refresh the page to ensure all components re-render with the new auth state
      window.location.reload();
    }
  }, [shouldRefresh]);

  // Timer completion
  const handleTimerComplete = (sessionId: string) => {
    if (user) {
      setCurrentSessionId(sessionId);
      setShowReflection(true);
    } else {
      setOpenModal("loginPrompt");
    }
  };

  // Reflection submit
  const handleReflectionSubmit = () => {
    setShowReflection(false);
    setCurrentSessionId(null);
  };

  // Protected features - show alert if user isn't logged in
  const handleProtectedFeature = (feature: "dashboard" | "settings") => {
    if (!user) {
      alert("Please log in first to access this feature.");
      return;
    }
    setOpenModal(feature);
  };

  // Handle logout confirmation
  const handleLogoutClick = () => {
    setOpenModal("logoutConfirm");
  };

  // Handle confirmed logout
  const handleConfirmLogout = () => {
    logout();
    setOpenModal(null);
  };

  // Close modal if user logs out while modal is open
  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setOpenModal(null);
    } else {
      // If modal is being opened but user is not logged in for protected modals, don't open
      if ((openModal === "dashboard" || openModal === "settings") && !user) {
        setOpenModal(null);
        return;
      }
    }
  };

  // Handle successful login
  const handleSuccessfulLogin = () => {
    setShouldRefresh(true);
    setOpenModal(null);
  };

  const modalBg = settings.darkMode ? "bg-slate-800 text-white" : "bg-blue-100 text-blue-900";

  // Helper function to render modal content with proper accessibility
  const renderModalContent = () => {
    // Additional protection: don't render protected modals if user is not logged in
    if ((openModal === "dashboard" || openModal === "settings") && !user) {
      return null; // This shouldn't happen due to our protection, but just in case
    }

    switch (openModal) {
      case "auth":
        return <Auth onSuccess={handleSuccessfulLogin} />;
      
      case "loginPrompt":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Great work! 🎉</DialogTitle>
              <DialogDescription>
                You completed a Pomodoro session! Sign in to save reflections and track progress.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenModal(null)} className="flex-1">Continue Without Account</Button>
              <Button onClick={() => setOpenModal("auth")} className="flex-1 bg-blue-600 hover:bg-blue-700">Sign In</Button>
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
            <Dashboard />
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
            <Settings />
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
            <DialogFooter className="flex gap-2">
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
                Hi! 👋 Reflective Pomodoro is a personal Pomodoro timer I built to help people focus and get things done. I run this project on my own—it's not backed by a big company—and your support would mean the world to me. Every donation, big or small, will not only help keep the site alive but also make it possible for me to keep improving it. Thank you for helping me continue this project—I truly appreciate it!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 pt-4">
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
        return (
          <>
            <DialogHeader>
              <DialogTitle>Privacy Policy</DialogTitle>
              <DialogDescription>
                How we handle your data and privacy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 text-sm leading-relaxed">
                            <p className="italic">Effective Date: {new Date().toLocaleDateString()}</p>
              <p>
                Reflective Pomodoro ("we", "our", or "us") operates this application (the
                "Service"). This Privacy Policy explains how we collect, use, and protect
                your information when you use our Service. By using the Service, you
                agree to the collection and use of information in accordance with this
                policy.
              </p>

              <section>
                <h3 className="font-semibold text-lg mb-2">1. Information We Collect</h3>
                <p>We collect several types of information to provide and improve our Service:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Account information (e.g., name, email) for registered users</li>
                  <li>Pomodoro session data and reflection notes</li>
                  <li>Usage data such as device info, browser type, pages visited, and
                      time spent</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">2. Use of Data</h3>
                <p>Your information is used to:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Provide and maintain the Service</li>
                  <li>Track productivity patterns and progress</li>
                  <li>Personalize and improve the user experience</li>
                  <li>Send important updates or notifications</li>
                  <li>Monitor usage and detect technical issues</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">3. Cookies & Tracking</h3>
                <p>
                  We use cookies and similar technologies to track activity and store
                  certain preferences. You may choose to disable cookies in your browser,
                  but some features of the Service may not function properly.
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Session Cookies (to operate the Service)</li>
                  <li>Preference Cookies (to remember your settings)</li>
                  <li>Security Cookies (for authentication and protection)</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">4. Data Security</h3>
                <p>
                  We implement industry-standard measures to protect your data. However,
                  please remember that no method of transmission over the Internet or
                  electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">5. Data Transfers</h3>
                <p>
                  Your information may be transferred and stored on servers outside of
                  your country. By using the Service, you consent to such transfers,
                  provided appropriate safeguards are in place.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">6. Disclosure of Data</h3>
                <p>We may disclose your data only when required to:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Comply with a legal obligation</li>
                  <li>Protect and defend the rights or property of Reflective Pomodoro</li>
                  <li>Investigate possible wrongdoing in connection with the Service</li>
                  <li>Ensure the safety of users or the public</li>
                  <li>Protect against legal liability</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">7. Service Providers</h3>
                <p>
                  We may employ third-party companies to provide services (such as
                  analytics or hosting). These providers have access to your data only to
                  perform specific tasks and are obligated not to disclose it.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">8. Your Rights</h3>
                <p>
                  You have the right to access, update, or delete your personal data
                  through your account settings or by contacting us directly.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">9. Changes to This Policy</h3>
                <p>
                  We may update this Privacy Policy from time to time. Updates will be
                  posted here with a new effective date. Continued use of the Service
                  after changes are made constitutes acceptance of the revised policy.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">10. Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy, you can contact us
                  at: <a href="mailto:reflectivepomodoro.supp@gmail.com" className="underline">
                    reflectivepomodoro.supp@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </>
        );
      
      case "terms":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Terms and Conditions</DialogTitle>
              <DialogDescription>
                Terms of service for using Reflective Pomodoro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 text-sm leading-relaxed">
                  <p className="italic">Last Updated: {new Date().toLocaleDateString()}</p>
              <p>
                Please read these Terms and Conditions carefully before using Reflective
                Pomodoro (the "Service"). By accessing or using the Service, you agree
                to comply with and be bound by these Terms and our Privacy Policy. If
                you do not agree, please discontinue use of the Service.
              </p>

              <section>
                <h3 className="font-semibold text-lg mb-2">1. Acceptance of Terms</h3>
                <p>
                  By using Reflective Pomodoro, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms and our Privacy
                  Policy.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">2. Changes to Terms</h3>
                <p>
                  We reserve the right to modify or update these Terms at any time. Any
                  changes will be effective immediately upon posting. Continued use of
                  the Service after changes are posted constitutes acceptance of the
                  revised Terms.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">3. Use of Service</h3>
                <p>You agree to use Reflective Pomodoro only for lawful purposes:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>For personal, non-commercial purposes</li>
                  <li>Not to reverse-engineer, decompile, or disassemble any part</li>
                  <li>Not to interfere with or disrupt the Service</li>
                  <li>Not to use the Service for any illegal or unauthorized activity</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">4. Account Responsibility</h3>
                <p>
                  You are responsible for maintaining the confidentiality of your account
                  credentials and for all activities that occur under your account. We
                  are not liable for any loss or damage resulting from unauthorized
                  account access.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">5. Intellectual Property</h3>
                <p>
                  All content, features, and functionality of the Service (including but
                  not limited to text, graphics, logos, and software) are the property of
                  Reflective Pomodoro and are protected by applicable intellectual
                  property laws.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">6. Service Modifications & Termination</h3>
                <p>
                  We reserve the right to modify, suspend, or discontinue the Service at
                  any time without prior notice. We may also terminate or restrict your
                  access if you violate these Terms.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">7. Limitation of Liability</h3>
                <p>
                  Reflective Pomodoro is provided "as is" without warranties of any kind.
                  To the fullest extent permitted by law, we disclaim liability for any
                  indirect, incidental, special, consequential, or punitive damages,
                  including but not limited to loss of data, profits, or goodwill.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">8. Governing Law</h3>
                <p>
                  These Terms shall be governed and construed in accordance with the laws
                  of your country of residence, without regard to conflict of law
                  provisions.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">9. Contact</h3>
                <p>
                  Questions or concerns about these Terms may be sent to:{" "}
                  <a href="mailto:reflectivepomodoro.supp@gmail.com" className="underline">
                    reflectivepomodoro.supp@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </>
        );
      
      case "contact":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Contact Us</DialogTitle>
              <DialogDescription>
                Get in touch with our support team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>If you have any questions, feedback, or issues, feel free to contact us:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Email: <a href="mailto:reflectivepomodoro.supp@gmail.com" className="underline">reflectivepomodoro.supp@gmail.com</a></li>
                <li>Subject: Support or General Inquiry</li>
                <li>Response Time: Typically within 24–48 hours</li>
              </ul>
              <p>We appreciate your feedback and strive to improve your Reflective Pomodoro experience.</p>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen w-full p-4 md:p-8 ${settings.darkMode ? "bg-slate-900 text-white" : "bg-blue-100 text-blue-900"}`}>
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
<div className="flex items-center space-x-4">
  <img 
    src="/pomodoro.png" 
    alt="Reflective Pomodoro Logo" 
    className="w-20 h-20 object-contain -translate-y-1"
  />
  <div className="flex flex-col justify-center">
    <h1 className="text-2xl md:text-3xl font-bold">Reflective Pomodoro</h1>
    <p className="text-sm mt-1 text-blue-700">
      {user ? `Welcome back, ${user.name}!` : "Focus timer - Sign in for reflections & analytics"}
    </p>
  </div>
</div>




        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Donate Button - Added before Dashboard */}
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setOpenModal("donate")} 
                title="Support the project"
                className="text-pink-500 border-pink-300 hover:bg-pink-50 hover:text-pink-600"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleProtectedFeature("dashboard")} 
                title="Go to Dashboard"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleProtectedFeature("settings")} 
                title="Open Settings"
              >
                <SettingsIcon className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleLogoutClick} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleProtectedFeature("dashboard")} 
                className="relative" 
                title="Sign in for analytics"
              >
                <BarChart3 className="h-5 w-5" />
                <Lock className="h-3 w-3 absolute -top-1 -right-1 bg-slate-400 text-white rounded-full p-0.5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleProtectedFeature("settings")} 
                className="relative" 
                title="Sign in for settings"
              >
                <SettingsIcon className="h-5 w-5" />
                <Lock className="h-3 w-3 absolute -top-1 -right-1 bg-slate-400 text-white rounded-full p-0.5" />
              </Button>
              <Button variant="default" onClick={() => setOpenModal("auth")} className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="timer" className="mt-0">
            <div className="flex flex-col items-center justify-center">
              <Timer onSessionComplete={handleTimerComplete} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

{/* About Section */}
<section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-white text-blue-900 py-20 px-4 md:px-8 mt-16">
  <div className="max-w-5xl mx-auto text-center">
    <h2 className="text-5xl font-extrabold mb-8">About Reflective Pomodoro</h2>
    <p className="text-xl leading-relaxed mb-8">
      <span className="font-semibold">Reflective Pomodoro</span> combines focused work intervals with intentional self-reflection, helping you stay productive while learning from each session.
    </p>
    <h3 className="text-3xl font-bold mb-6">What is the Pomodoro Technique?</h3>
    <p className="text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
      Developed by <span className="font-semibold">Francesco Cirillo</span>, it breaks work into intervals, traditionally <span className="font-semibold">25 minutes of focused work</span> followed by <span className="font-semibold">short breaks</span>.
    </p>
    <h3 className="text-3xl font-bold mb-6">How to Use Reflective Pomodoro</h3>
    <ul className="text-lg leading-relaxed space-y-4 text-left max-w-3xl mx-auto">
      <li>• Start a session using the timer and focus on a single task.</li>
      <li>• Reflect after completion and log your insights.</li>
      <li>• Review your Dashboard to visualize progress.</li>
      <li>• Repeat the cycle to maintain focus.</li>
    </ul>
    <h3 className="text-3xl font-bold mt-12 mb-6">Key Features</h3>
    <ul className="text-lg leading-relaxed space-y-4 text-left max-w-3xl mx-auto">
      <li>• <span className="font-semibold">Reflection Recording:</span> Log insights after each session.</li>
      <li>• <span className="font-semibold">Session Timer:</span> Customizable intervals.</li>
      <li>• <span className="font-semibold">Dashboard Analytics:</span> Visualize productivity trends.</li>
      <li>• <span className="font-semibold">Personalization:</span> Adjust session lengths and notifications.</li>
    </ul>
  </div>
</section>


      {/* Reflection Modal */}
      {user && (
        <ReflectionModal
          isOpen={showReflection}
          onOpenChange={(open) => {
            setShowReflection(open);
            if (!open) setCurrentSessionId(null);
          }}
          sessionId={currentSessionId}
          onSubmit={handleReflectionSubmit}
        />
      )}

      {/* Unified Modals */}
      <Dialog 
        open={openModal !== null} 
        onOpenChange={handleModalOpenChange}
      >
        <DialogContent className={`w-full max-h-[90vh] overflow-auto ${modalBg} ${openModal === "logoutConfirm" || openModal === "donate" ? "max-w-md" : ""}`}>
          {renderModalContent()}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-blue-200">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-blue-700">Reflective Pomodoro - Focus with mindfulness</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setOpenModal("privacy")} className="flex items-center gap-2 text-blue-700 hover:text-blue-900"><Shield className="h-4 w-4" /> Privacy</Button>
            <Button variant="ghost" size="sm" onClick={() => setOpenModal("terms")} className="flex items-center gap-2 text-blue-700 hover:text-blue-900"><FileText className="h-4 w-4" /> Terms</Button>
            <Button variant="ghost" size="sm" onClick={() => setOpenModal("contact")} className="flex items-center gap-2 text-blue-700 hover:text-blue-900"><Mail className="h-4 w-4" /> Contact</Button>
          </div>
        </div>
       <div className="text-center mt-4">
          <img 
            src="/pomodoro.png" 
            alt="Reflective Pomodoro Logo" 
            className="mx-auto mb-2 w-12 h-12"
          />
          <p className="text-xs text-blue-600">
            © {new Date().getFullYear()} Reflective Pomodoro. All rights reserved.
          </p>
        </div>

      </footer>
    </div>
  );
};

export default Home;