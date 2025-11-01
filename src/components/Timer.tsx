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

// Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://reflectivepomodoro.com';

const getApiBaseUrl = () => {
  return API_BASE_URL;
};

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
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const sessionTypeRef = useRef(sessionType);
  const completedSessionsRef = useRef(completedSessions);
  const completionLockRef = useRef(false);
  const endTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();
  const reflectionLockRef = useRef(false);
  const handleTimerCompleteRef = useRef<((wasSkipped?: boolean) => void)>(() => {});

  useEffect(() => {
    sessionTypeRef.current = sessionType;
    completedSessionsRef.current = completedSessions;
  }, [sessionType, completedSessions]);

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getApiBaseUrl();
    
    if (!baseUrl) {
      throw new Error('API base URL is not configured');
    }

    const url = `${baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to server. Please check your connection.`);
      }
      throw error;
    }
  };

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

  const handleTimerComplete = useCallback(async (wasSkipped = false) => {
    if (completionLockRef.current || reflectionLockRef.current) {
      return;
    }
    completionLockRef.current = true;

    const currentSessionType = sessionTypeRef.current;
    const currentCompletedSessions = completedSessionsRef.current;

    try {
      if (currentSessionType !== "work") {
        setSessionType("work");
        setTimeLeft(settings.workDuration * 60);
        setIsRunning(settings.autoStartPomodoros);

        completionLockRef.current = false;
        reflectionLockRef.current = false;
        return;
      }

      reflectionLockRef.current = true;

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

      const totalDuration = getTotalDuration();
      const actualDurationInSeconds = wasSkipped
        ? Math.max(1, totalDuration - timeLeft)
        : totalDuration;
      const actualDurationInMinutes = Math.max(1, Math.round(actualDurationInSeconds / 60));

      let newSessionId = `local-${Date.now()}`;
      
      // Always try to save to database if user is logged in
      if (user && token) {
        try {
          const dbSessionId = await saveSessionToDatabase({
            sessionType: currentSessionType,
            duration: actualDurationInMinutes,
          });
          if (dbSessionId) {
            newSessionId = dbSessionId;
            console.log('Session saved to database with ID:', dbSessionId);
          }
        } catch (error: any) {
          console.error('Failed to save session to database:', error);
          setLastError(`Failed to save session: ${error.message}`);
          // Continue with local session ID even if cloud save fails
        }
      }

      const newSession: SessionHistory = {
        sessionType: currentSessionType,
        duration: actualDurationInMinutes,
        completedAt: new Date(),
        sessionId: newSessionId,
      };
      
      setSessionHistory(prev => [...prev, newSession].slice(-50));
      setCompletedSessions(currentCompletedSessions + 1);

      // Call the completion callback
      onSessionComplete({
        sessionId: newSessionId,
        sessionType: currentSessionType,
        duration: actualDurationInMinutes,
      });

      setShowReflection(true);
      setCompletedSessionId(newSessionId);

      if ((currentCompletedSessions + 1) % settings.sessionsBeforeLongBreak === 0) {
        setSessionType("longBreak");
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setSessionType("break");
        setTimeLeft(settings.shortBreakDuration * 60);
      }

      setIsRunning(false);
      endTimeRef.current = null;
    } catch (err: any) {
      console.error('Error in timer completion:', err);
      setLastError(`Completion error: ${err.message}`);
    } finally {
      setTimeout(() => {
        completionLockRef.current = false;
      }, 300);
    }
  }, [settings, onSessionComplete, user, token, timeLeft, getTotalDuration]);

  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  const loadSessionsFromDatabase = async () => {
    try {
      if (!token) {
        setCloudSyncEnabled(false);
        return;
      }

      console.log('Loading sessions from database...');
      const data = await apiRequest('/api/sessions?limit=100');

      if (data.success) {
        const dbSessions: SessionHistory[] = data.data.sessions.map((session: any) => ({
          sessionId: session._id || session.id,
          sessionType: session.sessionType,
          duration: session.duration,
          completedAt: new Date(session.completedAt)
        }));

        setSessionHistory(dbSessions);
        const workSessionsCount = dbSessions.filter(s => s.sessionType === 'work').length;
        setCompletedSessions(workSessionsCount);
        setCloudSyncEnabled(true);
        setLastError(null);
        console.log(`Loaded ${dbSessions.length} sessions from database`);
      } else {
        setCloudSyncEnabled(false);
        setLastError('Failed to load sessions from server');
      }
    } catch (error: any) {
      console.error('Failed to load sessions:', error);
      setCloudSyncEnabled(false);
      setLastError(`Sync failed: ${error.message}`);
    }
  };

  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const saved = localStorage.getItem("pomodoroTimer");
        if (saved) {
          const parsed: any = JSON.parse(saved);
          
          const historyWithDates = parsed.sessionHistory.map((session: any) => ({
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

        // Enable cloud sync by default if user is logged in
        if (user && token) {
          setCloudSyncEnabled(true);
          await loadSessionsFromDatabase();
        } else {
          setCloudSyncEnabled(false);
        }
      } catch (error: any) {
        console.error('Error loading timer state:', error);
        setLastError(`Load error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimerState();
  }, [user, token]);

  useEffect(() => {
    const totalDuration = getTotalDuration();
    setTimeLeft(totalDuration);
    setProgress(0);
    endTimeRef.current = null;
    completionLockRef.current = false;
    reflectionLockRef.current = false;
  }, [settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration, sessionType]);

  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      return;
    }

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
        setIsRunning(false);
        endTimeRef.current = null;
        handleTimerCompleteRef.current();
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
  }, [isRunning]);

  useEffect(() => {
    const totalDuration = getTotalDuration();
    const newProgress = ((totalDuration - timeLeft) / totalDuration) * 100;
    setProgress(newProgress);
  }, [timeLeft, getTotalDuration]);

  useEffect(() => {
    if (!isRunning) {
      endTimeRef.current = null;
    }
  }, [timeLeft, isRunning]);

  // Live browser tab title functionality
  useEffect(() => {
    if (isLoading) return;

    const formattedTime = formatTime(timeLeft);

    if (isRunning) {
      document.title = `⏱️ ${formattedTime} - ${sessionType === "work" ? "Focus" : "Break"} Time`;
    } else {
      document.title = `⏸️ ${formattedTime} - Paused (${sessionType === "work" ? "Focus" : "Break"})`;
    }

    return () => {
      document.title = "Reflective Pomodoro";
    };
  }, [timeLeft, isRunning, sessionType, isLoading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const saveSessionToDatabase = async (sessionData: {
    sessionType: "work" | "break" | "longBreak";
    duration: number;
  }) => {
    try {
      if (!token || !user) {
        console.log('No token or user - skipping cloud save');
        return null;
      }

      if (sessionData.duration <= 0) {
        console.log('Invalid duration - skipping save');
        return null;
      }

      const payload = {
        userId: user.uid,
        sessionType: sessionData.sessionType,
        duration: sessionData.duration,
        completedAt: new Date().toISOString(),
        notes: "",
        tags: [],
        efficiency: 3
      };

      console.log('Saving session to database:', payload);
      const data = await apiRequest('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (data.success) {
        console.log('Session saved successfully:', data.data.session);
        setLastError(null);
        return data.data.session._id || data.data.session.id;
      } else {
        throw new Error(data.message || 'Failed to save session');
      }
    } catch (error: any) {
      console.error('Error saving session to database:', error);
      setCloudSyncEnabled(false);
      setLastError(`Save failed: ${error.message}`);
      throw error;
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

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
      endTimeRef.current = Date.now() + timeLeft * 1000;
    } else {
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
  };
  
  const skipTimer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    
    endTimeRef.current = null;
    
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
    setShowReflection(false);
    setCompletedSessionId(null);
  };

  const handleReflectionOpenChange = (open: boolean) => {
    setShowReflection(open);
    if (!open) {
      setCompletedSessionId(null);
      setTimeout(() => {
        reflectionLockRef.current = false;
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
              {user && !cloudSyncEnabled && (
                <div className="text-xs text-amber-600">
                  Cloud sync unavailable - using local storage
                </div>
              )}
              {lastError && (
                <div className="text-xs text-red-600">
                  Error: {lastError}
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
                Session History {user && cloudSyncEnabled ? "(Cloud Synced)" : user ? "(Local Only)" : "(Local Only)"}
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
        onOpenChange={handleReflectionOpenChange}
        sessionId={completedSessionId}
        onSubmit={handleReflectionSubmit}
      />
    </>
  );
};

export default Timer;