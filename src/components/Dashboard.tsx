import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sanitizeText, sanitizeName, sanitizeTags } from "@/utils/sanitization";
import { 
  Award, 
  BarChart3, 
  Clock, 
  Target, 
  RefreshCw, 
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Zap,
  Brain,
  Lightbulb,
  Crown,
  Flame,
  Star,
  Activity,
  PieChart,
  Trophy,
  Medal,
  TrendingUp as TrendingUpIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardProps {}

interface SessionData {
  id: string;
  completedAt: Date;
  duration: number;
  sessionType: string;
  createdAt?: Date;
}

interface ReflectionData {
  id: string;
  createdAt: Date;
  learnings: string;
  sessionId: string;
  session?: SessionData;
}

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  rank: number;
  totalFocusMinutes: number;
  completedPomodoros: number;
  currentStreak: number;
  productivityScore: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Optimized data loading with caching
const useDashboardData = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState({
    sessions: [] as SessionData[],
    recentReflections: [] as ReflectionData[],
    leaderboardData: [] as LeaderboardUser[],
    loading: true,
    refreshing: false
  });

  const apiRequest = useCallback(async (method: string, endpoint: string, options: RequestInit = {}) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${API_BASE_URL}/api/${cleanEndpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, [token]);

  const loadLeaderboardData = useCallback(async (sessions: SessionData[], streakDays: number) => {
    if (!user) return [];

    try {
      const data = await apiRequest('GET', 'users/leaderboard');
      
      if (data.success) {
        return data.data.users.map((userData: any, index: number) => ({
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          rank: index + 1,
          totalFocusMinutes: userData.totalFocusMinutes || 0,
          completedPomodoros: userData.completedPomodoros || 0,
          currentStreak: userData.currentStreak || 0,
          productivityScore: userData.productivityScore || 0,
          avatar: userData.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "U",
          isCurrentUser: userData._id === user.uid || userData.id === user.uid
        }));
      }
      throw new Error(data.message || 'Failed to load leaderboard');
    } catch (error) {
      // Fallback to local data
      const workSessions = sessions.filter(s => s.sessionType === 'work');
      return [{
        id: user.uid,
        name: user.name,
        email: user.email,
        rank: 1,
        totalFocusMinutes: workSessions.reduce((total, session) => total + session.duration, 0),
        completedPomodoros: workSessions.length,
        currentStreak: streakDays,
        productivityScore: Math.min(100, Math.round((workSessions.length / Math.max(1, sessions.length)) * 100)),
        avatar: user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "U",
        isCurrentUser: true
      }];
    }
  }, [user, apiRequest]);

  const calculateDashboardStats = useCallback((sessionsData: SessionData[]) => {
    const workSessions = sessionsData.filter(s => s.sessionType === 'work');
    const completedPomodoros = workSessions.length;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];
    
    sessionsData.forEach((session) => {
      const sessionDate = session.completedAt;
      if (sessionDate >= startOfWeek && sessionDate <= endOfWeek) {
        const dayOfWeek = sessionDate.getDay();
        weeklyCounts[dayOfWeek] += 1;
      }
    });

    const reorderedWeekly = [...weeklyCounts.slice(1), weeklyCounts[0]];

    const calendarMap: { [key: string]: number } = {};
    sessionsData.forEach((session) => {
      const dateKey = session.completedAt.toDateString();
      calendarMap[dateKey] = (calendarMap[dateKey] || 0) + 1;
    });

    const uniqueDates = new Set();
    sessionsData.forEach(session => {
      uniqueDates.add(session.completedAt.toDateString());
    });

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);

    while (true) {
      const dateString = currentDate.toDateString();
      if (uniqueDates.has(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
        currentDate.setHours(23, 59, 59, 999);
      } else {
        break;
      }
    }

    return {
      completedPomodoros,
      weeklyPomodoros: reorderedWeekly,
      streakDays: streak,
      calendarData: Object.entries(calendarMap).map(([dateKey, count]) => ({
        date: new Date(dateKey),
        count
      }))
    };
  }, []);

  const loadLocalData = useCallback(() => {
    try {
      const savedTimer = localStorage.getItem("pomodoroTimer");
      if (savedTimer) {
        const timerState = JSON.parse(savedTimer);
        const localSessions: SessionData[] = timerState.sessionHistory.map((session: any) => ({
          id: session.sessionId,
          completedAt: new Date(session.completedAt),
          duration: session.duration,
          sessionType: session.sessionType
        }));

        const stats = calculateDashboardStats(localSessions);
        loadLeaderboardData(localSessions, stats.streakDays).then(leaderboard => {
          setData({
            sessions: localSessions,
            recentReflections: [],
            leaderboardData: leaderboard,
            loading: false,
            refreshing: false
          });
        });
      } else {
        setData(prev => ({ ...prev, loading: false, refreshing: false }));
      }
    } catch (error) {
      setData(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  }, [calculateDashboardStats, loadLeaderboardData]);

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, refreshing: true }));
      
      if (!token) {
        loadLocalData();
        return;
      }

      // Parallel API calls for better performance
      const [sessionsResponse, reflectionsResponse] = await Promise.allSettled([
        apiRequest('GET', 'sessions?limit=200'),
        apiRequest('GET', 'reflections?limit=10')
      ]);

      let sessions: SessionData[] = [];
      let reflections: ReflectionData[] = [];

      if (sessionsResponse.status === 'fulfilled' && sessionsResponse.value.success) {
        sessions = sessionsResponse.value.data.sessions.map((session: any) => ({
          id: session._id || session.id,
          completedAt: new Date(session.completedAt),
          duration: session.duration,
          sessionType: session.sessionType,
          createdAt: session.createdAt ? new Date(session.createdAt) : undefined
        }));
      }

      if (reflectionsResponse.status === 'fulfilled' && reflectionsResponse.value.success) {
        reflections = reflectionsResponse.value.data.reflections.map((reflection: any) => ({
          id: reflection._id || reflection.id,
          createdAt: new Date(reflection.createdAt),
          learnings: reflection.learnings,
          sessionId: reflection.sessionId,
          session: sessions.find(s => s.id === reflection.sessionId)
        }));
      }

      const stats = calculateDashboardStats(sessions);
      const leaderboard = await loadLeaderboardData(sessions, stats.streakDays);

      setData({
        sessions,
        recentReflections: reflections,
        leaderboardData: leaderboard,
        loading: false,
        refreshing: false
      });

    } catch (error) {
      loadLocalData();
    }
  }, [user, token, apiRequest, calculateDashboardStats, loadLeaderboardData, loadLocalData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    ...data,
    refreshData: loadDashboardData,
    stats: calculateDashboardStats(data.sessions)
  };
};

const Dashboard: React.FC<DashboardProps> = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  
  const {
    sessions,
    recentReflections,
    leaderboardData,
    loading,
    refreshing,
    refreshData,
    stats
  } = useDashboardData();

  const handleRefresh = () => {
    refreshData();
  };

  // Memoized computed values
  const {
    workSessions,
    breakSessions,
    longBreakSessions,
    totalFocusMinutes,
    productivityScore,
    todaySessions,
    currentUserRank
  } = useMemo(() => {
    const workSessions = sessions.filter(s => s.sessionType === 'work');
    const breakSessions = sessions.filter(s => s.sessionType === 'break');
    const longBreakSessions = sessions.filter(s => s.sessionType === 'longBreak');
    const totalFocusMinutes = workSessions.reduce((total, session) => total + session.duration, 0);
    const productivityScore = Math.min(100, Math.round((workSessions.length / Math.max(1, sessions.length)) * 100));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySessions = sessions.filter(session => {
      const sessionDate = new Date(session.completedAt);
      return sessionDate >= today && sessionDate < tomorrow;
    });

    const currentUserRank = leaderboardData.find(user => user.isCurrentUser)?.rank || 0;

    return {
      workSessions,
      breakSessions,
      longBreakSessions,
      totalFocusMinutes,
      productivityScore,
      todaySessions,
      currentUserRank
    };
  }, [sessions, leaderboardData]);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Calculate max pomodoros for progress bar scaling
  const maxWeeklyPomodoros = useMemo(() => 
    Math.max(...stats.weeklyPomodoros.filter(n => n > 0), 1),
    [stats.weeklyPomodoros]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center space-y-4">
              <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Loading Dashboard</h3>
                <p className="text-muted-foreground">Crunching your productivity numbers...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 lg:p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl sm:rounded-2xl border border-blue-200/30">
                <PieChart className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Productivity Dashboard
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-1 sm:mt-2 leading-relaxed">
                  Track your focus sessions and optimize your workflow
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
            {user && (
              <Badge variant="secondary" className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200/50 font-medium">
                {sessions.length > 0 ? '☁️ Cloud Synced' : '📱 Local Data'}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2 px-3 sm:px-4 py-2 h-auto text-sm sm:text-base border-slate-300 hover:bg-slate-50 font-medium"
            >
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Mobile Optimized */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Stats Grid - Mobile Optimized */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 sm:space-y-3 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold opacity-95">Total Pomodoros</span>
                      </div>
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.completedPomodoros}</div>
                      <div className="text-xs sm:text-sm opacity-80 font-medium">Work sessions</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white/15 rounded-xl lg:rounded-2xl border border-white/20 flex-shrink-0">
                      <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 sm:space-y-3 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <Flame className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold opacity-95">Current Streak</span>
                      </div>
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.streakDays} days</div>
                      <div className="text-xs sm:text-sm opacity-80 font-medium">Focus days</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white/15 rounded-xl lg:rounded-2xl border border-white/20 flex-shrink-0">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 sm:space-y-3 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold opacity-95">This Week</span>
                      </div>
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                        {stats.weeklyPomodoros.reduce((a, b) => a + b, 0)}
                      </div>
                      <div className="text-xs sm:text-sm opacity-80 font-medium">Weekly sessions</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white/15 rounded-xl lg:rounded-2xl border border-white/20 flex-shrink-0">
                      <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 sm:space-y-3 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <Brain className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold opacity-95">Focus Time</span>
                      </div>
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">{totalFocusMinutes}m</div>
                      <div className="text-xs sm:text-sm opacity-80 font-medium">Total minutes</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white/15 rounded-xl lg:rounded-2xl border border-white/20 flex-shrink-0">
                      <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Section - Mobile Optimized */}
            <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 sm:pb-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 xs:grid-cols-5 h-11 sm:h-13 gap-0.5 sm:gap-1 p-1 bg-slate-100/50">
                    <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden xs:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden xs:inline">Analytics</span>
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                      <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden xs:inline">Calendar</span>
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden xs:inline">Ranking</span>
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                      <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden xs:inline">Insights</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Weekly Activity - Fixed Progress Bar */}
                      <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4 sm:pb-5">
                          <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
                            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            Weekly Activity
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-slate-600">Your focus sessions this week</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-7 gap-1 sm:gap-2 h-24 sm:h-32">
                              {stats.weeklyPomodoros.map((count, index) => (
                                <div key={index} className="flex flex-col items-center">
                                  <div className="flex-1 w-full flex items-end">
                                    <div
                                      className="bg-gradient-to-t from-green-500 to-green-600 w-full rounded-t-lg transition-all duration-500"
                                      style={{
                                        height: `${Math.max((count / maxWeeklyPomodoros) * 100, 8)}%`,
                                        minHeight: count > 0 ? '20%' : '8%'
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium mt-1 sm:mt-2 text-muted-foreground">
                                    {daysOfWeek[index]}
                                  </span>
                                  <span className="text-xs font-bold mt-0.5 sm:mt-1">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4 sm:pb-5">
                          <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
                            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            Session Distribution
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-slate-600">Breakdown of your session types</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full"></div>
                                <span className="text-sm font-medium">Work Sessions</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">{workSessions.length}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium">Short Breaks</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">{breakSessions.length}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium">Long Breaks</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">{longBreakSessions.length}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Today's Activity - Mobile Optimized */}
                    <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4 sm:pb-5">
                        <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
                          <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          Today's Activity
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-slate-600">Sessions completed today</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                          {todaySessions.length > 0 ? (
                            todaySessions.map((session, i) => (
                              <div
                                key={`${session.id}-${i}`}
                                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border text-center transition-all hover:scale-105 ${
                                  session.sessionType === 'work' 
                                    ? 'bg-primary/10 border-primary/20' 
                                    : 'bg-green-500/10 border-green-500/20'
                                }`}
                              >
                                <div className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${
                                  session.sessionType === 'work' ? 'text-primary' : 'text-green-600'
                                }`}>
                                  {i + 1}
                                </div>
                                <Badge 
                                  variant={session.sessionType === 'work' ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {session.sessionType === 'work' ? 'Work' : 'Break'}
                                </Badge>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {session.duration}min
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center py-6 sm:py-8">
                              <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2 sm:mb-4" />
                              <p className="text-sm sm:text-base text-muted-foreground">No sessions completed today</p>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Start a Pomodoro session to see your activity here
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4 sm:pb-5">
                          <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
                            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            Productivity Score
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-slate-600">Your focus efficiency rating</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center space-y-3 sm:space-y-4">
                            <div className="relative inline-block">
                              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-6 sm:border-8"
                                style={{
                                  background: `conic-gradient(#3b82f6 ${productivityScore * 3.6}deg, #e5e7eb 0deg)`
                                }}
                              >
                                <div className="w-18 h-18 sm:w-24 sm:h-24 bg-background rounded-full flex items-center justify-center">
                                  <span className="text-xl sm:text-2xl font-bold">{productivityScore}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-base sm:text-lg">
                                {productivityScore >= 80 ? 'Excellent!' : 
                                 productivityScore >= 60 ? 'Great Job!' :
                                 productivityScore >= 40 ? 'Good Progress' : 'Getting Started'}
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {productivityScore >= 80 ? 'Keep up the amazing focus!' : 
                                 'Continue building your productive habits'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4 sm:pb-5">
                          <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
                            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            Session Trends
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-slate-600">Your weekly performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 sm:space-y-4">
                            {stats.weeklyPomodoros.map((count, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-medium w-8 sm:w-12">{daysOfWeek[index]}</span>
                                <div className="flex-1 mx-2 sm:mx-4">
                                  <Progress 
                                    value={count > 0 ? (count / maxWeeklyPomodoros) * 100 : 0} 
                                    className="h-2 sm:h-3"
                                  />
                                </div>
                                <span className="text-xs sm:text-sm font-bold w-6 sm:w-8 text-right">
                                  {count}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="calendar" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4 sm:pb-5">
                          <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
                            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            Activity Calendar
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-slate-600">Your focus day history</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-center">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              className="rounded-xl border"
                              modifiers={{
                                highlighted: stats.calendarData.map(d => d.date),
                              }}
                              modifiersClassNames={{
                                highlighted: "bg-primary text-primary-foreground font-bold",
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4 sm:pb-5">
                          <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
                            <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            Calendar Stats
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-slate-600">Summary of your activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-muted/30 rounded-lg text-center">
                                <div className="text-2xl font-bold text-primary">{sessions.length}</div>
                                <div className="text-sm text-muted-foreground">Total Sessions</div>
                              </div>
                              <div className="p-4 bg-muted/30 rounded-lg text-center">
                                <div className="text-2xl font-bold text-primary">{stats.calendarData.length}</div>
                                <div className="text-sm text-muted-foreground">Active Days</div>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border">
                              <div className="flex items-center gap-3">
                                <Flame className="h-5 w-5 text-primary" />
                                <div>
                                  <div className="font-semibold">Current Streak</div>
                                  <div className="text-2xl font-bold text-primary">{stats.streakDays} days</div>
                                  <div className="text-sm text-muted-foreground">
                                    {stats.streakDays > 0 
                                      ? `You're on fire! Keep it up!` 
                                      : 'Start a streak by focusing tomorrow'
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">Average Sessions/Day</span>
                                <Badge variant="secondary">
                                  {stats.calendarData.length > 0 
                                    ? (sessions.length / stats.calendarData.length).toFixed(1) 
                                    : '0'
                                  }
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">Best Day</span>
                                <Badge variant="secondary">
                                  {Math.max(...stats.weeklyPomodoros)} sessions
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="leaderboard" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4 sm:pb-5">
                        <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
                          <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          Productivity Leaderboard
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-slate-600">Compare your progress with other focused users</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {leaderboardData.length >= 3 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                              {leaderboardData.slice(0, 3).map((user, index) => (
                                <div 
                                  key={user.id}
                                  className={`relative p-6 rounded-xl text-center ${
                                    index === 0 
                                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white scale-105 shadow-lg' 
                                      : index === 1
                                      ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
                                      : 'bg-gradient-to-br from-amber-700 to-amber-900 text-white'
                                  }`}
                                >
                                  <div className="absolute -top-3 -left-3">
                                    {index === 0 && <Crown className="h-8 w-8 text-yellow-300" />}
                                    {index === 1 && <Medal className="h-8 w-8 text-gray-300" />}
                                    {index === 2 && <Medal className="h-8 w-8 text-amber-300" />}
                                  </div>
                                  <div className="text-4xl font-bold mb-2">#{user.rank}</div>
                                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                                    {user.avatar}
                                  </div>
                                  <div className="font-bold text-lg mb-1">{user.name}</div>
                                  <div className="text-sm opacity-90">{user.totalFocusMinutes}m focused</div>
                                  <div className="text-xs mt-2">{user.completedPomodoros} pomodoros</div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/30 rounded-lg font-semibold text-sm">
                              <div className="col-span-1">Rank</div>
                              <div className="col-span-5">User</div>
                              <div className="col-span-2 text-center">Focus Time</div>
                              <div className="col-span-2 text-center">Pomodoros</div>
                              <div className="col-span-2 text-center">Streak</div>
                            </div>
                            
                            {leaderboardData.length > 0 ? (
                              leaderboardData.map((user) => (
                                <div 
                                  key={user.id}
                                  className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border transition-all ${
                                    user.isCurrentUser 
                                      ? 'bg-primary/10 border-primary/20 shadow-md' 
                                      : 'bg-card hover:bg-muted/30'
                                  }`}
                                >
                                  <div className="col-span-1 flex items-center">
                                    <span className="font-bold text-lg">#{user.rank}</span>
                                  </div>
                                  <div className="col-span-5 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">
                                      {user.avatar}
                                    </div>
                                    <div>
                                      <div className="font-medium flex items-center gap-2">
                                        {user.name}
                                        {user.isCurrentUser && (
                                          <Badge variant="secondary" className="text-xs">You</Badge>
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {user.completedPomodoros} sessions • {user.productivityScore} pts
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-span-2 flex items-center justify-center font-semibold">
                                    {user.totalFocusMinutes}m
                                  </div>
                                  <div className="col-span-2 flex items-center justify-center">
                                    <Badge variant="outline">{user.completedPomodoros}</Badge>
                                  </div>
                                  <div className="col-span-2 flex items-center justify-center gap-1">
                                    <Flame className="h-4 w-4 text-orange-500" />
                                    <span className="font-medium">{user.currentStreak}d</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No leaderboard data available</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Complete more Pomodoro sessions to appear on the leaderboard
                                </p>
                              </div>
                            )}
                          </div>

                          {currentUserRank > 0 && (
                            <Card className="bg-primary/5 border-primary/20">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Trophy className="h-6 w-6 text-primary" />
                                    <div>
                                      <div className="font-semibold">Your Current Rank: #{currentUserRank}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {currentUserRank === 1 
                                          ? "You're in first place! 🎉" 
                                          : `Keep going! You're making great progress.`
                                        }
                                      </div>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm" className="gap-2">
                                    <TrendingUpIcon className="h-4 w-4" />
                                    View Progress
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4 sm:pb-5">
                        <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold">
                          <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          Recent Reflections
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-slate-600">Learnings from your focus sessions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentReflections.length > 0 ? (
                            recentReflections.map((reflection) => (
                              <div key={reflection.id} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      <Brain className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <span className="font-semibold">
                                        {reflection.session 
                                          ? `${reflection.session.sessionType === 'work' ? 'Work' : 'Break'} Session`
                                          : 'Session Reflection'
                                        }
                                      </span>
                                      {reflection.session && (
                                        <Badge variant="outline" className="ml-2 text-xs">
                                          {reflection.session.duration}min
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {reflection.createdAt.toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                  {sanitizeText(reflection.learnings)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">No reflections yet</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Add reflections to your completed sessions to see insights here
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>

          {/* Sidebar - Mobile Optimized */}
          <div className="space-y-6 lg:space-y-8">
            <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4 sm:pb-5">
                <CardTitle className="text-base sm:text-lg font-bold">Quick Stats</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-600">Your productivity at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-lg border border-blue-200/30 hover:border-blue-300/50 transition-colors">
                    <span className="text-xs sm:text-sm font-medium text-slate-700">Avg Sessions/Day</span>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200/50 font-semibold">
                      {stats.calendarData.length > 0 
                        ? (sessions.length / stats.calendarData.length).toFixed(1) 
                        : '0'
                      }
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-green-50/50 rounded-lg border border-green-200/30 hover:border-green-300/50 transition-colors">
                    <span className="text-xs sm:text-sm font-medium text-slate-700">Best Day</span>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200/50 font-semibold">
                      {Math.max(...stats.weeklyPomodoros)} sessions
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-lg border border-purple-200/30 hover:border-purple-300/50 transition-colors">
                    <span className="text-xs sm:text-sm font-medium text-slate-700">Completion Rate</span>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200/50 font-semibold">
                      {sessions.length > 0 ? Math.round((workSessions.length / sessions.length) * 100) : 0}%
                    </Badge>
                  </div>
                  {currentUserRank > 0 && (
                    <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gradient-to-r from-amber-50 to-amber-50/50 rounded-lg border-2 border-amber-300/50 hover:border-amber-400/50 transition-colors">
                      <span className="text-xs sm:text-sm font-medium text-slate-700">Leaderboard Rank</span>
                      <Badge variant="default" className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold border-0">
                        #{currentUserRank}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4 sm:pb-5">
                <CardTitle className="text-base sm:text-lg font-bold">Session Summary</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-600">Total sessions by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-blue-200/30 bg-blue-50/40 hover:bg-blue-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                      <span className="text-xs sm:text-sm font-medium text-slate-700">Work Sessions</span>
                    </div>
                    <span className="font-bold text-sm sm:text-base text-blue-600">{workSessions.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-green-200/30 bg-green-50/40 hover:bg-green-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-sm"></div>
                      <span className="text-xs sm:text-sm font-medium text-slate-700">Short Breaks</span>
                    </div>
                    <span className="font-bold text-sm sm:text-base text-green-600">{breakSessions.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-cyan-200/30 bg-cyan-50/40 hover:bg-cyan-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-sm"></div>
                      <span className="text-xs sm:text-sm font-medium text-slate-700">Long Breaks</span>
                    </div>
                    <span className="font-bold text-sm sm:text-base text-cyan-600">{longBreakSessions.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;