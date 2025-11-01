import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, BarChart3, LogOut, Lock, Shield, FileText, Mail, Heart } from "lucide-react";
import Timer from "./Timer";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import ReflectionContent from "./ReflectionContent";
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
  | null;

const Home = () => {
  const [activeTab, setActiveTab] = useState("timer");
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

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

  const handleProtectedFeature = (feature: "dashboard" | "settings") => {
    if (!user) {
      alert("Please log in first to access this feature.");
      return;
    }
    setOpenModal(feature);
  };

  const handleLogoutClick = () => {
    setOpenModal("logoutConfirm");
  };

  const handleConfirmLogout = () => {
    logout();
    setOpenModal(null);
  };

  const handleNavigateToAuth = () => {
    navigate("/auth");
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

  const getModalSize = (modalType: ModalType) => {
    switch (modalType) {
      case "dashboard":
      case "settings":
        return "max-w-7xl w-full h-[90vh]";
      case "privacy":
      case "terms":
        return "max-w-4xl w-full max-h-[80vh]";
      case "reflection":
        return "max-w-2xl w-full max-h-[80vh]";
      case "contact":
        return "max-w-2xl w-full";
      case "loginPrompt":
      case "logoutConfirm":
      case "donate":
      default:
        return "max-w-md w-full";
    }
  };

  const renderModalContent = () => {
    if ((openModal === "dashboard" || openModal === "settings" || openModal === "reflection") && !user) {
      return null;
    }

    switch (openModal) {
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
            <DialogFooter className="flex gap-2">
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
                Hi! 👋 Reflective Pomodoro is a personal project I built to help people focus. 
                Your support helps keep the site alive and enables continued improvements.
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
            <div className="space-y-6 text-sm leading-relaxed overflow-auto max-h-[60vh]">
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
                  <li><strong>Account Information:</strong> When you register, we collect your name, email address, and authentication credentials</li>
                  <li><strong>Session Data:</strong> We store your Pomodoro session details, including session duration, type, and completion timestamps</li>
                  <li><strong>Reflection Content:</strong> Your written reflections and learning insights are stored securely</li>
                  <li><strong>Usage Data:</strong> We collect information about how you interact with our Service, including device information, browser type, pages visited, and time spent on features</li>
                  <li><strong>Technical Data:</strong> IP addresses, cookies, and similar tracking technologies for security and functionality</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">2. How We Use Your Information</h3>
                <p>Your information is used for the following purposes:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>To provide, maintain, and improve our Service</li>
                  <li>To authenticate your account and secure your data</li>
                  <li>To track productivity patterns and generate personalized insights</li>
                  <li>To communicate important updates, security alerts, and support messages</li>
                  <li>To monitor and analyze usage patterns to enhance user experience</li>
                  <li>To detect, prevent, and address technical issues and security vulnerabilities</li>
                  <li>To comply with legal obligations and enforce our terms of service</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">3. Data Storage and Security</h3>
                <p>
                  We implement appropriate technical and organizational security measures
                  to protect your personal information against unauthorized access,
                  alteration, disclosure, or destruction. Your data is stored on secure
                  servers with encryption and access controls. However, no method of
                  transmission over the Internet or electronic storage is 100% secure, and
                  we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">4. Data Retention</h3>
                <p>
                  We retain your personal information only for as long as necessary to
                  fulfill the purposes outlined in this Privacy Policy. We will retain and
                  use your information to the extent necessary to comply with our legal
                  obligations, resolve disputes, and enforce our policies.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">5. Cookies and Tracking Technologies</h3>
                <p>
                  We use cookies and similar tracking technologies to track activity on our
                  Service and hold certain information. Cookies are files with small amount
                  of data which may include an anonymous unique identifier.
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li><strong>Session Cookies:</strong> Used to operate our Service and maintain your login state</li>
                  <li><strong>Preference Cookies:</strong> Used to remember your settings and preferences</li>
                  <li><strong>Security Cookies:</strong> Used for security purposes and authentication</li>
                  <li><strong>Analytics Cookies:</strong> Used to understand how users interact with our Service</li>
                </ul>
                <p className="mt-2">
                  You can instruct your browser to refuse all cookies or to indicate when a
                  cookie is being sent. However, if you do not accept cookies, you may not
                  be able to use some portions of our Service.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">6. Third-Party Services</h3>
                <p>
                  We may employ third-party companies and individuals to facilitate our
                  Service ("Service Providers"), provide the Service on our behalf,
                  perform Service-related services, or assist us in analyzing how our
                  Service is used. These third parties have access to your Personal
                  Information only to perform these tasks on our behalf and are obligated
                  not to disclose or use it for any other purpose.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">7. Your Data Rights</h3>
                <p>You have the following rights regarding your personal data:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li><strong>Access:</strong> You can request copies of your personal data</li>
                  <li><strong>Rectification:</strong> You can request correction of inaccurate or incomplete data</li>
                  <li><strong>Erasure:</strong> You can request deletion of your personal data</li>
                  <li><strong>Restriction:</strong> You can request limitation of processing your data</li>
                  <li><strong>Portability:</strong> You can request transfer of your data to another organization</li>
                  <li><strong>Objection:</strong> You can object to our processing of your personal data</li>
                </ul>
                <p className="mt-2">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">8. International Data Transfers</h3>
                <p>
                  Your information may be transferred to — and maintained on — computers
                  located outside of your state, province, country, or other governmental
                  jurisdiction where the data protection laws may differ from those of
                  your jurisdiction. We will take all steps reasonably necessary to ensure
                  that your data is treated securely and in accordance with this Privacy
                  Policy.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">9. Children's Privacy</h3>
                <p>
                  Our Service does not address anyone under the age of 13 ("Children").
                  We do not knowingly collect personally identifiable information from
                  anyone under the age of 13. If you are a parent or guardian and you are
                  aware that your Child has provided us with Personal Data, please
                  contact us. If we become aware that we have collected Personal Data from
                  children without verification of parental consent, we take steps to
                  remove that information from our servers.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">10. Changes to This Privacy Policy</h3>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you
                  of any changes by posting the new Privacy Policy on this page and
                  updating the "Effective Date" at the top. You are advised to review
                  this Privacy Policy periodically for any changes. Changes to this
                  Privacy Policy are effective when they are posted on this page.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">11. Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy, your data rights,
                  or wish to exercise any of your data protection rights, please contact us at:
                </p>
                <p className="mt-2">
                  Email: <a href="mailto:reflectivepomodoro.supp@gmail.com" className="underline font-medium">
                    reflectivepomodoro.supp@gmail.com
                  </a>
                </p>
                <p>
                  We will respond to all legitimate requests within 30 days.
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
            <div className="space-y-6 text-sm leading-relaxed overflow-auto max-h-[60vh]">
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
                  By accessing or using Reflective Pomodoro, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms and our Privacy Policy.
                  If you are using the Service on behalf of an organization, you represent
                  that you have authority to bind that organization to these Terms.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">2. Changes to Terms</h3>
                <p>
                  We reserve the right to modify or update these Terms at any time. Any
                  changes will be effective immediately upon posting. Continued use of
                  the Service after changes are posted constitutes acceptance of the
                  revised Terms. We will make reasonable efforts to notify users of
                  material changes via email or in-service notifications.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">3. Account Registration and Security</h3>
                <p>
                  To access certain features, you must register for an account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and accept all risks of unauthorized access</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Take responsibility for all activities that occur under your account</li>
                </ul>
                <p className="mt-2">
                  We reserve the right to disable any user account at our sole discretion,
                  including for violation of these Terms or suspicious activity.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">4. Acceptable Use</h3>
                <p>You agree not to use the Service for any unlawful or prohibited purposes, including:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Violating any applicable laws, regulations, or third-party rights</li>
                  <li>Impersonating any person or entity or falsely stating your affiliation</li>
                  <li>Uploading or transmitting viruses, malware, or any destructive code</li>
                  <li>Attempting to gain unauthorized access to other accounts or systems</li>
                  <li>Interfering with or disrupting the Service or servers/networks connected to the Service</li>
                  <li>Using the Service for any commercial purposes without our express written consent</li>
                  <li>Engaging in any activity that could damage, disable, overburden, or impair the Service</li>
                  <li>Collecting or harvesting any information from the Service</li>
                  <li>Using any automated systems, including "robots," "spiders," or "offline readers"</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">5. Intellectual Property Rights</h3>
                <p>
                  The Service and its original content, features, and functionality are
                  and will remain the exclusive property of Reflective Pomodoro and its
                  licensors. The Service is protected by copyright, trademark, and other
                  laws of both the United States and foreign countries. Our trademarks
                  and trade dress may not be used in connection with any product or
                  service without the prior written consent of Reflective Pomodoro.
                </p>
                <p className="mt-2">
                  You retain ownership of any content you create, upload, or store within
                  the Service. By using the Service, you grant us a worldwide,
                  non-exclusive, royalty-free license to use, store, and display your
                  content solely for the purpose of providing and improving the Service.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">6. User Content</h3>
                <p>
                  You are solely responsible for the content you create and store within
                  the Service ("User Content"). You represent and warrant that:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>You own or have the necessary rights to all User Content</li>
                  <li>User Content does not infringe any third-party rights</li>
                  <li>User Content complies with all applicable laws and regulations</li>
                  <li>User Content does not contain harmful, offensive, or illegal material</li>
                </ul>
                <p className="mt-2">
                  We reserve the right to remove any User Content that violates these Terms
                  or that we determine to be otherwise objectionable.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">7. Service Availability and Modifications</h3>
                <p>
                  We strive to maintain the availability of the Service but do not
                  guarantee uninterrupted access. We may modify, suspend, or discontinue
                  any aspect of the Service at any time, including the availability of
                  any feature, database, or content. We may also impose limits on certain
                  features and services or restrict your access to parts or all of the
                  Service without notice or liability.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">8. Termination</h3>
                <p>
                  We may terminate or suspend your account and access to the Service
                  immediately, without prior notice or liability, for any reason,
                  including if you breach these Terms. Upon termination, your right to
                  use the Service will cease immediately. All provisions of these Terms
                  which by their nature should survive termination shall survive,
                  including ownership provisions, warranty disclaimers, and limitations
                  of liability.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">9. Disclaimer of Warranties</h3>
                <p>
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
                  OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
                  IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                  OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
                  UNINTERRUPTED, SECURE, OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED,
                  OR THAT THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">10. Limitation of Liability</h3>
                <p>
                  TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL REFLECTIVE
                  POMODORO, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR
                  AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                  CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS
                  OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING
                  FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">11. Indemnification</h3>
                <p>
                  You agree to defend, indemnify, and hold harmless Reflective Pomodoro
                  and its licensors from and against any claims, damages, obligations,
                  losses, liabilities, costs, or debt, and expenses arising from:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Your use of and access to the Service</li>
                  <li>Your violation of any term of these Terms</li>
                  <li>Your violation of any third-party right, including privacy or intellectual property rights</li>
                  <li>Any content you post or transmit through the Service</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">12. Governing Law and Jurisdiction</h3>
                <p>
                  These Terms shall be governed and construed in accordance with the laws
                  of the United States, without regard to its conflict of law provisions.
                  Any legal suit, action, or proceeding arising out of, or related to,
                  these Terms or the Service shall be instituted exclusively in the
                  federal courts of the United States or the courts of the state where
                  the Service operator is located.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">13. Severability</h3>
                <p>
                  If any provision of these Terms is held to be invalid or unenforceable
                  by a court, the remaining provisions of these Terms will remain in
                  effect. The invalid or unenforceable provision will be deemed modified
                  to the minimum extent necessary to make it valid and enforceable.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">14. Entire Agreement</h3>
                <p>
                  These Terms constitute the entire agreement between you and Reflective
                  Pomodoro regarding our Service and supersede and replace any prior
                  agreements we might have had between us regarding the Service.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">15. Contact Information</h3>
                <p>
                  If you have any questions about these Terms, please contact us at:
                </p>
                <p className="mt-2">
                  Email: <a href="mailto:reflectivepomodoro.supp@gmail.com" className="underline font-medium">
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
            <div className="space-y-6 text-sm leading-relaxed">
              <section>
                <h3 className="font-semibold text-lg mb-3">Support and General Inquiries</h3>
                <p>We're here to help with any questions, feedback, or issues you may have:</p>
                <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                  <li><strong>Email:</strong> <a href="mailto:reflectivepomodoro.supp@gmail.com" className="underline font-medium">reflectivepomodoro.supp@gmail.com</a></li>
                  <li><strong>Response Time:</strong> We typically respond within 24-48 hours</li>
                  <li><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-3">What to Include in Your Message</h3>
                <p>To help us assist you better, please include:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Your username or email associated with your account</li>
                  <li>A clear description of your question or issue</li>
                  <li>Steps to reproduce any technical issues</li>
                  <li>Screenshots if applicable</li>
                  <li>Device and browser information</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-3">Types of Inquiries We Handle</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Account and login issues</li>
                  <li>Technical support and bug reports</li>
                  <li>Feature requests and suggestions</li>
                  <li>Privacy and data concerns</li>
                  <li>Billing and donation questions</li>
                  <li>Partnership opportunities</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-3">Data Protection and Privacy</h3>
                <p>
                  When you contact us, we may collect and process your personal information
                  to respond to your inquiry. This information is handled in accordance
                  with our Privacy Policy. We do not share your contact information with
                  third parties without your consent.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-3">Feedback and Suggestions</h3>
                <p>
                  We welcome your feedback and suggestions for improving Reflective Pomodoro.
                  Your input helps us create a better experience for all users. Please
                  share any ideas you have for new features or improvements.
                </p>
              </section>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">
                  💡 <strong>Pro Tip:</strong> For faster resolution of technical issues,
                  please include your browser version, operating system, and any error
                  messages you've encountered.
                </p>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen w-full p-4 md:p-8 ${settings.darkMode ? "bg-slate-900 text-white" : "bg-blue-100 text-blue-900"}`}>
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
              <Button variant="default" onClick={handleNavigateToAuth} className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </>
          )}
        </div>
      </header>

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

      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-white text-blue-900 py-20 px-4 md:px-8 mt-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold mb-8">About Reflective Pomodoro</h2>
          <p className="text-xl leading-relaxed mb-8">
            <span className="font-semibold">Reflective Pomodoro</span> combines focused work intervals with intentional self-reflection.
          </p>
          <h3 className="text-3xl font-bold mb-6">How to Use</h3>
          <ul className="text-lg leading-relaxed space-y-4 text-left max-w-3xl mx-auto">
            <li>• Start a session using the timer and focus on a single task</li>
            <li>• Reflect after completion and log your insights</li>
            <li>• Review your Dashboard to visualize progress</li>
            <li>• Repeat the cycle to maintain focus</li>
          </ul>
          <h3 className="text-3xl font-bold mt-12 mb-6">Key Features</h3>
          <ul className="text-lg leading-relaxed space-y-4 text-left max-w-3xl mx-auto">
            <li>• Reflection Recording: Log insights after each session</li>
            <li>• Session Timer: Customizable intervals</li>
            <li>• Dashboard Analytics: Visualize productivity trends</li>
            <li>• Personalization: Adjust session lengths and notifications</li>
          </ul>
        </div>
      </section>

      <Dialog open={openModal !== null} onOpenChange={handleModalOpenChange}>
        <DialogContent className={`${getModalSize(openModal)} max-h-[90vh] overflow-hidden ${settings.darkMode ? "bg-slate-800 text-white" : "bg-blue-100 text-blue-900"}`}>
          {renderModalContent()}
        </DialogContent>
      </Dialog>

      <footer className="mt-12 pt-6 border-t border-blue-200">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-blue-700">Reflective Pomodoro - Focus with mindfulness</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setOpenModal("privacy")} className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <Shield className="h-4 w-4" /> Privacy
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpenModal("terms")} className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <FileText className="h-4 w-4" /> Terms
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpenModal("contact")} className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <Mail className="h-4 w-4" /> Contact
            </Button>
          </div>
        </div>
        <div className="text-center mt-4">
          <img src="/pomodoro.png" alt="Reflective Pomodoro Logo" className="mx-auto mb-2 w-12 h-12" />
          <p className="text-xs text-blue-600">
            © {new Date().getFullYear()} Reflective Pomodoro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;