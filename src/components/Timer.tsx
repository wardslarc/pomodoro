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

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isSavingSession, setIsSavingSession] = useState(false);
  
  const sessionTypeRef = useRef(sessionType);
  const completedSessionsRef = useRef(completedSessions);
  const completionLockRef = useRef(false);
  const endTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();
  const handleTimerCompleteRef = useRef<((wasSkipped?: boolean) => void)>(() => {});

  useEffect(() => {
    sessionTypeRef.current = sessionType;
    completedSessionsRef.current = completedSessions;
  }, [sessionType, completedSessions]);

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

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

    return response.json();
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

  const saveSessionToDatabase = async (sessionData: {
    sessionType: "work" | "break" | "longBreak";
    duration: number;
  }) => {
    try {
      if (!token || !user) {
        return null;
      }

      if (sessionData.duration <= 0) {
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

      const data = await apiRequest('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (data.success) {
        setLastError(null);
        return data.data.session._id || data.data.session.id;
      } else {
        throw new Error(data.message || 'Failed to save session');
      }
    } catch (error: any) {
      setCloudSyncEnabled(false);
      setLastError(`Save failed: ${error.message}`);
      throw error;
    }
  };

  const showNotification = useCallback((title: string, body: string) => {
    // Browser notification
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        const notification = new Notification(title, { 
          body, 
          icon: "/favicon.ico",
          requireInteraction: true
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } else if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            const notification = new Notification(title, { 
              body, 
              icon: "/favicon.ico",
              requireInteraction: true
            });
            
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          }
        });
      }
    }

    // Audio notification
    if (settings.notificationSound !== "none") {
      const audio = new Audio("/notification.mp3");
      audio.volume = settings.volume / 100;
      audio.play().catch(() => {
        console.log("Audio notification blocked by browser");
      });
    }

    // Automatically focus the tab when timer completes
    setTimeout(() => {
      if (document.hidden) {
        window.focus();
        
        // Fallback: flash the title if notifications aren't available
        if (!("Notification" in window) || Notification.permission !== "granted") {
          let originalTitle = document.title;
          let flashCount = 0;
          const flashInterval = setInterval(() => {
            document.title = flashCount % 2 === 0 
              ? "⏰ TIMER COMPLETE! ⏰" 
              : originalTitle;
            flashCount++;
            if (flashCount >= 6) {
              clearInterval(flashInterval);
              document.title = originalTitle;
            }
          }, 500);
        }
      }
    }, 100);

  }, [settings.notificationSound, settings.volume]);

  const handleTimerComplete = useCallback(async (wasSkipped = false) => {
    if (completionLockRef.current) {
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
        return;
      }

      if (!wasSkipped) {
        showNotification(
          "Pomodoro Timer", 
          "Work session complete! Time for a break."
        );
      }

      const totalDuration = getTotalDuration();
      const actualDurationInSeconds = wasSkipped
        ? Math.max(1, totalDuration - timeLeft)
        : totalDuration;
      const actualDurationInMinutes = Math.max(1, Math.round(actualDurationInSeconds / 60));

      let newSessionId = `local-${Date.now()}`;
      
      if (user && token) {
        setIsSavingSession(true);
        try {
          const dbSessionId = await saveSessionToDatabase({
            sessionType: currentSessionType,
            duration: actualDurationInMinutes,
          });
          
          if (dbSessionId) {
            newSessionId = dbSessionId;
            setCloudSyncEnabled(true);
          }
        } catch (error: any) {
          setLastError(`Failed to save session: ${error.message}`);
          setCloudSyncEnabled(false);
        } finally {
          setIsSavingSession(false);
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

      onSessionComplete({
        sessionId: newSessionId,
        sessionType: currentSessionType,
        duration: actualDurationInMinutes,
      });

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
      setLastError(`Completion error: ${err.message}`);
      
      const newSession: SessionHistory = {
        sessionType: currentSessionType,
        duration: Math.max(1, Math.round(getTotalDuration() / 60)),
        completedAt: new Date(),
        sessionId: `local-${Date.now()}`,
      };
      
      setSessionHistory(prev => [...prev, newSession].slice(-50));
      setCompletedSessions(currentCompletedSessions + 1);

      if ((currentCompletedSessions + 1) % settings.sessionsBeforeLongBreak === 0) {
        setSessionType("longBreak");
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setSessionType("break");
        setTimeLeft(settings.shortBreakDuration * 60);
      }

      setIsRunning(false);
      endTimeRef.current = null;
      
      completionLockRef.current = false;
    } finally {
      setTimeout(() => {
        completionLockRef.current = false;
      }, 100);
    }
  }, [settings, onSessionComplete, user, token, timeLeft, getTotalDuration, showNotification]);

  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  const loadSessionsFromDatabase = async () => {
    try {
      if (!token) {
        setCloudSyncEnabled(false);
        return;
      }

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
      } else {
        setCloudSyncEnabled(false);
        setLastError('Failed to load sessions from server');
      }
    } catch (error: any) {
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

        if (user && token) {
          setCloudSyncEnabled(true);
          await loadSessionsFromDatabase();
        } else {
          setCloudSyncEnabled(false);
        }
      } catch (error: any) {
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

    let lastTime = Date.now();
    let completionTriggered = false;
    
    const updateTimer = () => {
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      if (!endTimeRef.current || completionTriggered) {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
        return;
      }

      const timeRemaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
      
      setTimeLeft(timeRemaining);

      if (timeRemaining <= 0 && !completionTriggered) {
        completionTriggered = true;
        setIsRunning(false);
        endTimeRef.current = null;
        
        setTimeout(() => {
          handleTimerCompleteRef.current();
        }, 100);
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

  // Add this new useEffect to handle background tab counting
  useEffect(() => {
    if (!isRunning || !endTimeRef.current) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden - switch to interval-based updates for background
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }

        const backgroundInterval = setInterval(() => {
          if (!endTimeRef.current) {
            clearInterval(backgroundInterval);
            return;
          }

          const now = Date.now();
          const timeRemaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
          
          setTimeLeft(timeRemaining);

          if (timeRemaining <= 0) {
            clearInterval(backgroundInterval);
            setIsRunning(false);
            endTimeRef.current = null;
            setTimeout(() => {
              handleTimerCompleteRef.current();
            }, 100);
          }
        }, 1000);

        return () => clearInterval(backgroundInterval);
      } else {
        // Tab became visible - switch back to animation frames
        if (!animationFrameRef.current && isRunning && endTimeRef.current) {
          let lastTime = Date.now();
          let completionTriggered = false;
          
          const updateTimer = () => {
            const now = Date.now();
            const delta = now - lastTime;
            lastTime = now;

            if (!endTimeRef.current || completionTriggered) {
              animationFrameRef.current = requestAnimationFrame(updateTimer);
              return;
            }

            const timeRemaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
            
            setTimeLeft(timeRemaining);

            if (timeRemaining <= 0 && !completionTriggered) {
              completionTriggered = true;
              setIsRunning(false);
              endTimeRef.current = null;
              
              setTimeout(() => {
                handleTimerCompleteRef.current();
              }, 100);
            } else {
              animationFrameRef.current = requestAnimationFrame(updateTimer);
            }
          };

          animationFrameRef.current = requestAnimationFrame(updateTimer);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  useEffect(() => {
    if (isLoading) return;

    const updateTitle = () => {
      const formattedTime = formatTime(timeLeft);
      
      if (isRunning) {
        document.title = `⏱️ ${formattedTime} - ${sessionType === "work" ? "Focus" : "Break"} Time`;
      } else {
        document.title = `⏸️ ${formattedTime} - Paused (${sessionType === "work" ? "Focus" : "Break"})`;
      }
    };

    updateTitle();

    // Set up interval to update title even when tab is not active
    const titleInterval = setInterval(updateTitle, 1000);

    return () => {
      clearInterval(titleInterval);
      document.title = "Reflective Pomodoro";
    };
  }, [timeLeft, isRunning, sessionType, isLoading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
  };
  
  const skipTimer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    
    endTimeRef.current = null;
    
    if (!completionLockRef.current) {
      setTimeout(() => {
        handleTimerCompleteRef.current(true);
      }, 0);
    }
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
        return "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900";
      case "break":
        return "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900";
      case "longBreak":
        return "bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900";
      default:
        return "bg-gradient-to-br from-blue-50 to-blue-100";
    }
  };

  const getCircleColor = () => {
    switch (sessionType) {
      case "work":
        return "text-blue-600";
      case "break":
        return "text-green-600";
      case "longBreak":
        return "text-teal-600";
      default:
        return "text-blue-600";
    }
  };

  const getBorderColor = () => {
    switch (sessionType) {
      case "work":
        return "border-blue-200 dark:border-blue-700";
      case "break":
        return "border-green-200 dark:border-green-700";
      case "longBreak":
        return "border-teal-200 dark:border-teal-700";
      default:
        return "border-blue-200";
    }
  };

  const totalFocusTime = sessionHistory
    .filter(session => session.sessionType === "work")
    .reduce((total, session) => total + session.duration, 0);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
        <Card className="shadow-2xl border-0">
          <CardContent className="flex items-center justify-center h-64 sm:h-80 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="text-slate-600 font-medium text-sm sm:text-base">Loading timer...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0">
      <Card className={`shadow-2xl border-0 overflow-hidden ${getBackgroundColor()}`}>
        <CardHeader className="text-center pb-3 sm:pb-4 pt-6 sm:pt-8">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getCircleColor().replace('text-', 'bg-')}`}></div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 truncate sm:truncate-none">{getSessionLabel()}</CardTitle>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            {isRunning ? '⏱️ Timer is running' : '⏸️ Timer paused'}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 py-6 sm:py-8">
          <div 
            role="timer" 
            aria-label={`${getSessionLabel()}, ${formatTime(timeLeft)} remaining`}
            className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 flex items-center justify-center"
          >
            <svg className="w-full h-full filter drop-shadow-lg" viewBox="0 0 100 100">
              <circle 
                className="text-slate-200 dark:text-slate-700" 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                strokeWidth="6" 
                stroke="currentColor" 
              />
              <circle
                className={getCircleColor()}
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl sm:text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="text-center space-y-2 sm:space-y-3 w-full px-2 sm:px-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-slate-200/50">
                <div className="text-xs sm:text-sm text-slate-600 font-medium mb-0.5 sm:mb-1">Sessions</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900">{completedSessions}</div>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-slate-200/50">
                <div className="text-xs sm:text-sm text-slate-600 font-medium mb-0.5 sm:mb-1">Progress</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900">{Math.round(progress)}%</div>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-slate-200/50">
                <div className="text-xs sm:text-sm text-slate-600 font-medium mb-0.5 sm:mb-1">Focus Time</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900">{totalFocusTime}m</div>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-1 sm:space-y-2 pt-2 sm:pt-3 px-2">
              {!user && (
                <p className="text-xs text-amber-600 font-medium">
                  💡 Sign in to save sessions to the cloud
                </p>
              )}
              {user && !cloudSyncEnabled && (
                <p className="text-xs text-amber-600 font-medium">
                  ☁️ Cloud sync unavailable - using local storage
                </p>
              )}
              {isSavingSession && (
                <p className="text-xs text-blue-600 font-medium">
                  ✓ Saving session to cloud...
                </p>
              )}
              {lastError && (
                <p className="text-xs text-red-600 font-medium break-words">
                  ✗ Error: {lastError}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center gap-2 sm:gap-3 md:gap-4 pb-6 sm:pb-8 px-2 sm:px-4 flex-wrap">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={resetTimer}
            aria-label="Reset timer"
            disabled={isRunning || isSavingSession}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-slate-200 transition-all duration-300 flex-shrink-0"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <Button 
            onClick={toggleTimer}
            aria-label={isRunning ? "Pause timer" : "Start timer"}
            disabled={isSavingSession}
            className={`px-4 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 flex items-center gap-2 shadow-lg whitespace-nowrap ${
              isRunning 
                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> 
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Start</span>
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={skipTimer}
            aria-label="Skip to next session"
            disabled={isSavingSession}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-slate-200 transition-all duration-300 flex-shrink-0"
          >
            <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </CardFooter>
      </Card>

      {sessionHistory.length > 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
              📊 Session History
              {user && cloudSyncEnabled && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Cloud Synced</span>
              )}
              {user && !cloudSyncEnabled && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">Local Only</span>
              )}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="p-3 sm:p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-700/30">
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 sm:mb-2">Work Sessions</div>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{sessionHistory.filter(s => s.sessionType === "work").length}</div>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-700/30">
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 sm:mb-2">Short Breaks</div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{sessionHistory.filter(s => s.sessionType === "break").length}</div>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-700/30">
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 sm:mb-2">Long Breaks</div>
                <div className="text-xl sm:text-2xl font-bold text-teal-600">{sessionHistory.filter(s => s.sessionType === "longBreak").length}</div>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-700/30">
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1 sm:mb-2">Total Focus</div>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{totalFocusTime}m</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            ⌨️ Keyboard Shortcuts
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Play/Pause</span>
              <kbd className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-slate-800 rounded font-mono text-xs font-semibold border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white shadow-sm">Space</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Reset Timer</span>
              <kbd className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-slate-800 rounded font-mono text-xs font-semibold border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white shadow-sm">Ctrl + R</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Skip Session</span>
              <kbd className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-slate-800 rounded font-mono text-xs font-semibold border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white shadow-sm">Ctrl + S</kbd>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timer;