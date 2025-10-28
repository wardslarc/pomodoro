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
  
  const sessionTypeRef = useRef(sessionType);
  const completedSessionsRef = useRef(completedSessions);
  const isHandlingCompleteRef = useRef(false);

  useEffect(() => {
    sessionTypeRef.current = sessionType;
    completedSessionsRef.current = completedSessions;
  }, [sessionType, completedSessions]);

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

      const response = await fetch(`${API_BASE_URL}/api/sessions?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication failed');
          return;
        }
        throw new Error(`Failed to load sessions: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const dbSessions: SessionHistory[] = data.data.sessions.map((session: any) => ({
          sessionId: session._id,
          sessionType: session.sessionType,
          duration: session.duration,
          completedAt: new Date(session.completedAt)
        }));

        setSessionHistory(dbSessions);
        
        // Update completed sessions count
        const workSessionsCount = dbSessions.filter(s => s.sessionType === 'work').length;
        setCompletedSessions(workSessionsCount);
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
  }, [settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration, sessionType]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Save session to database
  const saveSessionToDatabase = async (sessionData: {
    sessionType: "work" | "break" | "longBreak";
    duration: number;
  }) => {
    try {
      if (!token) {
        console.log('No authentication token available');
        return null;
      }

      const payload = {
        sessionType: sessionData.sessionType,
        duration: sessionData.duration,
        completedAt: new Date().toISOString()
      };

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
        throw new Error(`Failed to save session: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data.session._id;
      } else {
        throw new Error(data.message || 'Failed to save session');
      }
    } catch (error) {
      console.error('Error saving session to database:', error);
      return null;
    }
  };

  const handleTimerComplete = useCallback(async (wasSkipped = false) => {
    if (isHandlingCompleteRef.current) {
      return;
    }
    
    isHandlingCompleteRef.current = true;

    try {
      const currentSessionType = sessionTypeRef.current;
      const currentCompletedSessions = completedSessionsRef.current;
      
      // Only play notification sound and show browser notifications for natural completion (not skipped)
      if (!wasSkipped) {
        // Notification sound
        if (settings.notificationSound !== "none") {
          const audio = new Audio("/notification.mp3");
          audio.volume = settings.volume / 100;
          audio.play().catch(() => {});
        }

        // Browser notifications
        if (Notification.permission === "granted") {
          new Notification("Pomodoro Timer", {
            body: `${getSessionLabel()} complete!`,
          });
        } else if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }

      // Calculate duration based on how much time was actually completed
      const actualDurationInSeconds = currentSessionType === "work"
        ? (wasSkipped ? (settings.workDuration * 60 - timeLeft) : settings.workDuration * 60)
        : currentSessionType === "break"
        ? (wasSkipped ? (settings.shortBreakDuration * 60 - timeLeft) : settings.shortBreakDuration * 60)
        : (wasSkipped ? (settings.longBreakDuration * 60 - timeLeft) : settings.longBreakDuration * 60);

      const actualDurationInMinutes = Math.round(actualDurationInSeconds / 60);

      // Save session to database
      let newSessionId: string;
      
      if (user && token) {
        const dbSessionId = await saveSessionToDatabase({
          sessionType: currentSessionType,
          duration: actualDurationInMinutes
        });
        
        newSessionId = dbSessionId || `local-${Date.now()}`;
      } else {
        newSessionId = `local-${Date.now()}`;
      }

      // Create session data
      const sessionData = {
        sessionId: newSessionId,
        sessionType: currentSessionType,
        duration: actualDurationInMinutes,
      };

      onSessionComplete(sessionData);

      const newSession: SessionHistory = {
        sessionType: currentSessionType,
        duration: actualDurationInMinutes,
        completedAt: new Date(),
        sessionId: newSessionId,
      };

      // Update session history
      setSessionHistory(prev => [...prev, newSession].slice(-50));

      // Update completed sessions count for work sessions
      if (currentSessionType === "work") {
        const newCompletedSessions = currentCompletedSessions + 1;
        setCompletedSessions(newCompletedSessions);

        // ✅ ALWAYS show reflection after work sessions (even when skipped)
        console.log("🔄 Showing reflection for work session (completed or skipped)");
        setCompletedSessionId(newSessionId);
        setShowReflection(true);

        if (newCompletedSessions % settings.sessionsBeforeLongBreak === 0) {
          setSessionType("longBreak");
          setTimeLeft(settings.longBreakDuration * 60);
        } else {
          setSessionType("break");
          setTimeLeft(settings.shortBreakDuration * 60);
        }
      } else {
        // ❌ NEVER show reflection after break sessions (short or long)
        console.log("⏸️ Break session completed - no reflection");
        setShowReflection(false);
        setCompletedSessionId(null);
        setSessionType("work");
        setTimeLeft(settings.workDuration * 60);
      }

      // Auto-start logic
      if ((currentSessionType === "work" && settings.autoStartBreaks) || 
          (currentSessionType !== "work" && settings.autoStartPomodoros)) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } finally {
      isHandlingCompleteRef.current = false;
    }
  }, [settings, onSessionComplete, user, token, timeLeft]);

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          const newTimeLeft = prev - 1;
          const totalDuration = getTotalDuration();
          setProgress(((totalDuration - newTimeLeft) / totalDuration) * 100);
          return newTimeLeft;
        });
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleTimerComplete(false); // Natural completion
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, getTotalDuration, handleTimerComplete]);

  // Progress effect
  useEffect(() => {
    const totalDuration = getTotalDuration();
    setProgress(((totalDuration - timeLeft) / totalDuration) * 100);
  }, [sessionType, getTotalDuration, timeLeft]);

  // Save timer state to localStorage
  useEffect(() => {
    const timerState: TimerState = {
      timeLeft,
      isRunning,
      sessionType,
      completedSessions,
      progress,
      sessionHistory,
    };
    localStorage.setItem("pomodoroTimer", JSON.stringify(timerState));
  }, [timeLeft, isRunning, sessionType, completedSessions, progress, sessionHistory]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

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

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getTotalDuration());
    setProgress(0);
  };
  
  const skipTimer = () => {
    handleTimerComplete(true); // Mark as skipped
  };

  const getSessionLabel = () => {
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
  };

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
                Session History {user && "(Cloud)"}
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

      <ReflectionModal
        isOpen={showReflection}
        onOpenChange={setShowReflection}
        sessionId={completedSessionId}
        onSubmit={handleReflectionSubmit}
      />
    </>
  );
};

export default Timer;