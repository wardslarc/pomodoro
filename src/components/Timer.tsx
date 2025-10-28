import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import ReflectionModal from "./ReflectionModal";

interface TimerProps {
  onSessionComplete?: (sessionData: {
    sessionId: string;
    sessionType: "work" | "break" | "longBreak";
    duration: number;
  }) => void;
}

interface SessionHistory {
  sessionType: "work" | "break" | "longBreak";
  duration: number;
  completedAt: Date;
  sessionId: string;
}

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  sessionType: "work" | "break" | "longBreak";
  completedSessions: number;
  progress: number;
  sessionHistory: SessionHistory[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Timer = ({
  onSessionComplete = () => {},
}: TimerProps) => {
  const { settings } = useSettings();
  const { user, token } = useAuth();
  
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<"work" | "break" | "longBreak">("work");
  const [completedSessions, setCompletedSessions] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [showReflection, setShowReflection] = useState(false);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  
  // Refs for real-time timer and state management
  const sessionTypeRef = useRef(sessionType);
  const completedSessionsRef = useRef(completedSessions);
  const completionLockRef = useRef(false);
  const endTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();
  
  // ✅ Reflection modal lock to prevent stacking
  const reflectionLockRef = useRef(false);

  // ✅ Ref for handleTimerComplete to avoid dependency issues
  const handleTimerCompleteRef = useRef<((wasSkipped?: boolean) => void)>(() => {});

  // Sync refs with state
  useEffect(() => {
    sessionTypeRef.current = sessionType;
    completedSessionsRef.current = completedSessions;
  }, [sessionType, completedSessions]);

  const getTotalDuration = useCallback(() => {
    switch (sessionType) {
      case "work":
        return settings.workDuration * 60;
      case "break":
        return settings.shortBreakDuration * 60;
      case "longBreak":
        return settings.longBreakDuration * 60;
      default:
        return settings.workDuration * 60;
    }
  }, [settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration, sessionType]);

  // Define handleTimerComplete first
  const handleTimerComplete = useCallback(async (wasSkipped = false) => {
    // ✅ Step 1: Instant lock at the very top
    if (completionLockRef.current || reflectionLockRef.current) {
      console.log("⛔ Timer completion already in progress or reflection showing");
      return;
    }
    completionLockRef.current = true;

    const currentSessionType = sessionTypeRef.current;
    const currentCompletedSessions = completedSessionsRef.current;
    console.log("🔄 Completing session:", currentSessionType, { wasSkipped });

    try {
      // ✅ Step 2: No reflection for breaks (exit early)
      if (currentSessionType !== "work") {
        console.log("⏸️ Break completed — no reflection modal will open.");

        // Prepare next session
        setSessionType("work");
        setTimeLeft(settings.workDuration * 60);
        setIsRunning(settings.autoStartPomodoros);

        // Unlock and return immediately
        completionLockRef.current = false;
        reflectionLockRef.current = false;
        return;
      }

      // ✅ Step 3: Reflection only for work sessions
      reflectionLockRef.current = true;

      // Notification sound and browser notifications (if not skipped)
      if (!wasSkipped) {
        if (settings.notificationSound !== "none") {
          const audio = new Audio("/notification.mp3");
          audio.volume = settings.volume / 100;
          audio.play().catch(() => {});
        }

        if (Notification.permission === "granted") {
          new Notification("Pomodoro Timer", {
            body: "Work session complete! Time for a break.",
          });
        } else if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }

      // Calculate duration - FIXED: Ensure minimum duration of 1 minute
      const totalDuration = getTotalDuration();
      const actualDurationInSeconds = wasSkipped
        ? Math.max(1, totalDuration - timeLeft) // Ensure at least 1 second
        : totalDuration;
      const actualDurationInMinutes = Math.max(1, Math.round(actualDurationInSeconds / 60)); // Ensure at least 1 minute

      console.log('Duration calculation:', {
        wasSkipped,
        totalDuration,
        timeLeft,
        actualDurationInSeconds,
        actualDurationInMinutes
      });

      // Save session
      let newSessionId = `local-${Date.now()}`;
      if (user && token) {
        const dbSessionId = await saveSessionToDatabase({
          sessionType: currentSessionType,
          duration: actualDurationInMinutes,
        });
        if (dbSessionId) newSessionId = dbSessionId;
      }

      // Log and update
      const newSession: SessionHistory = {
        sessionType: currentSessionType,
        duration: actualDurationInMinutes,
        completedAt: new Date(),
        sessionId: newSessionId,
      };
      setSessionHistory(prev => [...prev, newSession].slice(-50));
      setCompletedSessions(currentCompletedSessions + 1);

      // ✅ Step 4: Open reflection modal
      console.log("🟢 Opening reflection modal for work session");
      setShowReflection(true);
      setCompletedSessionId(newSessionId);

      // Next session type
      if ((currentCompletedSessions + 1) % settings.sessionsBeforeLongBreak === 0) {
        setSessionType("longBreak");
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setSessionType("break");
        setTimeLeft(settings.shortBreakDuration * 60);
      }

      setIsRunning(false);
      endTimeRef.current = null;
    } catch (err) {
      console.error("❌ Error in timer completion:", err);
    } finally {
      // Unlock after delay to prevent double triggers
      setTimeout(() => {
        completionLockRef.current = false;
        console.log("🔓 Completion lock released");
      }, 300);
    }
  }, [settings, onSessionComplete, user, token, timeLeft, getTotalDuration]);

  // Update the ref when handleTimerComplete changes
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  // Load timer state from localStorage on mount AND load session history from database
  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const saved = localStorage.getItem("pomodoroTimer");
        if (saved) {
          const parsed: TimerState = JSON.parse(saved);
          
          // Convert completedAt strings back to Date objects
          const historyWithDates = parsed.sessionHistory.map(session => ({
            ...session,
            completedAt: new Date(session.completedAt)
          }));

          setTimeLeft(parsed.timeLeft);
          setIsRunning(false);
          setSessionType(parsed.sessionType);
          setCompletedSessions(parsed.completedSessions);
          setProgress(parsed.progress);
          setSessionHistory(historyWithDates);
        }

        // Load session history from database if user is logged in
        if (user && token) {
          await loadSessionsFromDatabase();
        }
      } catch (error) {
        console.error("Error loading timer state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimerState();
  }, [user, token]);

  // Load sessions from database
  const loadSessionsFromDatabase = async () => {
    try {
      if (!token) {
        console.log('No authentication token available');
        return;
      }

      console.log('Loading sessions from database...');

      const response = await fetch(`${API_BASE_URL}/api/sessions?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error loading sessions:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          console.log('Authentication failed');
          return;
        }
        throw new Error(`Failed to load sessions: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Sessions loaded:', data);
      
      if (data.success) {
        const dbSessions: SessionHistory[] = data.data.sessions.map((session: any) => ({
          sessionId: session._id || session.id,
          sessionType: session.sessionType,
          duration: session.duration,
          completedAt: new Date(session.completedAt)
        }));

        console.log('Processed sessions:', dbSessions);
        setSessionHistory(dbSessions);
        
        // Update completed sessions count
        const workSessionsCount = dbSessions.filter(s => s.sessionType === 'work').length;
        setCompletedSessions(workSessionsCount);
      } else {
        console.error('Server returned error:', data.message);
      }
    } catch (error) {
      console.error('Error loading sessions from database:', error);
    }
  };

  // Update timer when settings change
  useEffect(() => {
    const totalDuration = getTotalDuration();
    setTimeLeft(totalDuration);
    setProgress(0);
    endTimeRef.current = null;
    completionLockRef.current = false;
    reflectionLockRef.current = false;
  }, [settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration, sessionType]);

  // Real-time timer animation loop
  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      return;
    }

    // Set end time when timer starts
    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }

    const updateTimer = () => {
      if (!endTimeRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
        return;
      }

      const now = Date.now();
      const timeRemaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
      
      setTimeLeft(timeRemaining);

      if (timeRemaining <= 0) {
        // Timer completed
        setIsRunning(false);
        endTimeRef.current = null;
        handleTimerCompleteRef.current(); // Use the ref instead of direct function
      } else {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [isRunning]); // Remove handleTimerComplete from dependencies

  // Update progress percentage
  useEffect(() => {
    const totalDuration = getTotalDuration();
    const newProgress = ((totalDuration - timeLeft) / totalDuration) * 100;
    setProgress(newProgress);
  }, [timeLeft, getTotalDuration]);

  // Reset endTimeRef when timeLeft changes externally (like reset)
  useEffect(() => {
    if (!isRunning) {
      endTimeRef.current = null;
    }
  }, [timeLeft, isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Save session to database - FIXED VERSION
  const saveSessionToDatabase = async (sessionData: {
    sessionType: "work" | "break" | "longBreak";
    duration: number;
  }) => {
    try {
      if (!token || !user) {
        console.log('No authentication token or user available');
        return null;
      }

      // Validate duration before sending
      if (sessionData.duration <= 0) {
        console.warn('Invalid duration, skipping database save:', sessionData.duration);
        return null;
      }

      // ✅ FIXED: Use user.uid instead of user.id
      const payload = {
        userId: user.uid, // This matches your AuthContext
        sessionType: sessionData.sessionType,
        duration: sessionData.duration,
        completedAt: new Date().toISOString(),
        notes: "",
        tags: [],
        efficiency: 3
      };

      console.log('Saving session with payload:', payload);

      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        console.log('Authentication failed');
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        
        // Try to parse the error for better debugging
        try {
          const errorData = JSON.parse(errorText);
          console.error('Parsed error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        throw new Error(`Failed to save session: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Session saved successfully:', data.data.session);
        return data.data.session._id || data.data.session.id;
      } else {
        throw new Error(data.message || 'Failed to save session');
      }
    } catch (error) {
      console.error('Error saving session to database:', error);
      return null;
    }
  };

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Debug auth hook
  useEffect(() => {
    console.log('Auth debug:', { 
      user: user ? 'present' : 'missing', 
      token: token ? 'present' : 'missing' 
    });
    if (user) {
      console.log('User object:', user);
      console.log('User ID (uid):', user.uid); // ✅ Changed from user.id to user.uid
    }
  }, [user, token]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggleTimer();
      } else if (e.code === "KeyR" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        resetTimer();
      } else if (e.code === "KeyS" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        skipTimer();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const toggleTimer = () => {
    if (!isRunning) {
      // Starting the timer - set end time based on current timeLeft
      endTimeRef.current = Date.now() + timeLeft * 1000;
    } else {
      // Pausing the timer - clear end time
      endTimeRef.current = null;
    }
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getTotalDuration());
    setProgress(0);
    endTimeRef.current = null;
    completionLockRef.current = false;
    reflectionLockRef.current = false;
    console.log("🔄 Timer reset");
  };
  
  const skipTimer = () => {
    console.log("⏭️ Skipping current session");
    
    // Calculate the actual time spent before skipping
    const totalDuration = getTotalDuration();
    const timeSpent = Math.max(1, totalDuration - timeLeft); // Ensure at least 1 second
    
    console.log('Skip details:', {
      totalDuration,
      timeLeft,
      timeSpent,
      timeSpentInMinutes: Math.max(1, Math.round(timeSpent / 60))
    });
    
    // Stop the animation frame immediately
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    
    // Clear end time
    endTimeRef.current = null;
    
    // Use the ref to call handleTimerComplete
    setTimeout(() => {
      handleTimerCompleteRef.current(true);
    }, 0);
  };

  const getSessionLabel = useCallback(() => {
    switch (sessionType) {
      case "work":
        return `Work Session (${settings.workDuration} min)`;
      case "break":
        return `Short Break (${settings.shortBreakDuration} min)`;
      case "longBreak":
        return `Long Break (${settings.longBreakDuration} min)`;
      default:
        return "Session";
    }
  }, [sessionType, settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration]);

  const getBackgroundColor = () => {
    switch (sessionType) {
      case "work":
        return "bg-blue-50 dark:bg-blue-950";
      case "break":
        return "bg-green-50 dark:bg-green-950";
      case "longBreak":
        return "bg-teal-50 dark:bg-teal-950";
      default:
        return "bg-background";
    }
  };

  const getCircleColor = () => {
    switch (sessionType) {
      case "work":
        return "text-blue-500";
      case "break":
        return "text-green-500";
      case "longBreak":
        return "text-teal-500";
      default:
        return "text-blue-500";
    }
  };

  const totalFocusTime = sessionHistory
    .filter(session => session.sessionType === "work")
    .reduce((total, session) => total + session.duration, 0);

  const handleReflectionSubmit = async (reflectionData: {
    learnings: string;
    sessionId: string | null;
  }) => {
    console.log('Reflection saved:', reflectionData);
    setShowReflection(false);
    setCompletedSessionId(null);
  };

  const handleReflectionOpenChange = (open: boolean) => {
    setShowReflection(open);
    if (!open) {
      setCompletedSessionId(null);
      // ✅ STEP 2: Release the reflection lock only after modal fully closes
      setTimeout(() => {
        reflectionLockRef.current = false;
        console.log("🧹 Reflection modal fully unmounted and lock released");
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardContent className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto space-y-6">
        <Card className={`shadow-lg ${getBackgroundColor()}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{getSessionLabel()}</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center space-y-6">
            <div 
              role="timer" 
              aria-label={`${getSessionLabel()}, ${formatTime(timeLeft)} remaining`}
              className="relative w-64 h-64 flex items-center justify-center"
            >
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  className="text-muted-foreground/20" 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  strokeWidth="8" 
                  stroke="currentColor" 
                />
                <circle
                  className={getCircleColor()}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  strokeWidth="8"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  transform="rotate(-90 50 50)"
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute">
                <span className="text-5xl font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-center space-y-1">
              <div>Completed sessions: {completedSessions}</div>
              {sessionHistory.length > 0 && (
                <div>Total focus time: {totalFocusTime} minutes</div>
              )}
              {!user && (
                <div className="text-xs text-amber-600">
                  Sign in to save sessions to the cloud
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={resetTimer}
              aria-label="Reset timer"
              disabled={isRunning}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button 
              variant={isRunning ? "destructive" : "default"} 
              size="lg" 
              onClick={toggleTimer}
              aria-label={isRunning ? "Pause timer" : "Start timer"}
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Start
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={skipTimer}
              aria-label="Skip to next session"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {sessionHistory.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Session History {user && token ? "(Cloud Synced)" : "(Local Only)"}
              </h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Work Sessions:</span>
                  <span>{sessionHistory.filter(s => s.sessionType === "work").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Short Breaks:</span>
                  <span>{sessionHistory.filter(s => s.sessionType === "break").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Long Breaks:</span>
                  <span>{sessionHistory.filter(s => s.sessionType === "longBreak").length}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Focus Time:</span>
                  <span>{totalFocusTime} minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-slate-100 rounded text-xs">Space</kbd>
                <span>Play/Pause</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-slate-100 rounded text-xs">Ctrl + R</kbd>
                <span>Reset Timer</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-slate-100 rounded text-xs">Ctrl + S</kbd>
                <span>Skip Session</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Only ONE ReflectionModal will ever be mounted at a time */}
      <ReflectionModal
        isOpen={showReflection}
        onOpenChange={handleReflectionOpenChange}
        sessionId={completedSessionId}
        onSubmit={handleReflectionSubmit}
      />
    </>
  );
};

export default Timer;