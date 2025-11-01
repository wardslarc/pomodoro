import React, { useState, useEffect } from "react";
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

// Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://reflectivepomodoro.com';

const getApiBaseUrl = () => {
  return API_BASE_URL;
};

const Dashboard: React.FC<DashboardProps> = () => {
  const { user, token } = useAuth();
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [weeklyPomodoros, setWeeklyPomodoros] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [streakDays, setStreakDays] = useState(0);
  const [calendarData, setCalendarData] = useState<{ date: Date; count: number }[]>([]);
  const [recentReflections, setRecentReflections] = useState<ReflectionData[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getApiBaseUrl();
    
    if (!baseUrl) {
      throw new Error('API base URL is not configured');
    }

    const url = `${baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to server. Please check your connection.`);
      }
      throw error;
    }
  };

  const loadLeaderboardData = async () => {
    if (!user || !token) return;

    try {
      const data = await apiRequest('/api/users/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (data.success) {
        const leaderboardUsers: LeaderboardUser[] = data.data.users.map((userData: any, index: number) => ({
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

        setLeaderboardData(leaderboardUsers);
      } else {
        throw new Error(data.message || 'Failed to load leaderboard');
      }
    } catch (error) {
      console.error('Leaderboard load failed, using local data:', error);
      createLeaderboardFromSessions();
    }
  };

  const createLeaderboardFromSessions = () => {
    if (!user) return;

    const currentUserStats: LeaderboardUser = {
      id: user.uid,
      name: user.name,
      email: user.email,
      rank: 1,
      totalFocusMinutes: sessions.filter(s => s.sessionType === 'work').reduce((total, session) => total + session.duration, 0),
      completedPomodoros: sessions.filter(s => s.sessionType === 'work').length,
      currentStreak: streakDays,
      productivityScore: Math.min(100, Math.round((sessions.filter(s => s.sessionType === 'work').length / Math.max(1, sessions.length)) * 100)),
      avatar: user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "U",
      isCurrentUser: true
    };

    setLeaderboardData([currentUserStats]);
  };

  const loadDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      
      if (!token) {
        loadLocalData();
        return;
      }

      const sessionsData = await apiRequest('/api/sessions?limit=200', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      let dbSessions: SessionData[] = [];
      let dbReflections: ReflectionData[] = [];

      if (sessionsData.success) {
        dbSessions = sessionsData.data.sessions.map((session: any) => ({
          id: session._id || session.id,
          completedAt: new Date(session.completedAt),
          duration: session.duration,
          sessionType: session.sessionType,
          createdAt: session.createdAt ? new Date(session.createdAt) : undefined
        }));

        setSessions(dbSessions);
        calculateDashboardStats(dbSessions);
      }

      try {
        const reflectionsData = await apiRequest('/api/reflections?limit=10', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (reflectionsData.success) {
          dbReflections = reflectionsData.data.reflections.map((reflection: any) => ({
            id: reflection._id || reflection.id,
            createdAt: new Date(reflection.createdAt),
            learnings: reflection.learnings,
            sessionId: reflection.sessionId,
            session: dbSessions.find(s => s.id === reflection.sessionId)
          }));

          setRecentReflections(dbReflections);
        }
      } catch (reflectionsError) {
        // Continue without reflections
        console.log('Reflections not available');
      }

      await loadLeaderboardData();

    } catch (error) {
      console.error('Dashboard data load failed, using local data:', error);
      loadLocalData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadLocalData = () => {
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

        setSessions(localSessions);
        calculateDashboardStats(localSessions);
        setRecentReflections([]);
        createLeaderboardFromSessions();
      }
    } catch (error) {
      console.error('Local data load failed:', error);
    }
  };

  const calculateDashboardStats = (sessionsData: SessionData[]) => {
    const workSessions = sessionsData.filter(s => s.sessionType === 'work');
    setCompletedPomodoros(workSessions.length);

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
    setWeeklyPomodoros(reorderedWeekly);

    const calendarMap: { [key: string]: number } = {};
    sessionsData.forEach((session) => {
      const dateKey = session.completedAt.toDateString();
      calendarMap[dateKey] = (calendarMap[dateKey] || 0) + 1;
    });

    const calendarDataArray = Object.entries(calendarMap).map(([dateKey, count]) => ({
      date: new Date(dateKey),
      count
    }));

    setCalendarData(calendarDataArray);

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
    
    setStreakDays(streak);
  };

  useEffect(() => {
    loadDashboardData();
  }, [user, token]);

  const handleRefresh = () => {
    loadDashboardData();
  };

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getTodaySessions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return sessions.filter(session => {
      const sessionDate = new Date(session.completedAt);
      return sessionDate >= today && sessionDate < tomorrow;
    });
  };

  const todaySessions = getTodaySessions();
  const workSessions = sessions.filter(s => s.sessionType === 'work');
  const breakSessions = sessions.filter(s => s.sessionType === 'break');
  const longBreakSessions = sessions.filter(s => s.sessionType === 'longBreak');
  const totalFocusMinutes = workSessions.reduce((total, session) => total + session.duration, 0);
  const productivityScore = Math.min(100, Math.round((workSessions.length / Math.max(1, sessions.length)) * 100));
  const currentUserRank = leaderboardData.find(user => user.isCurrentUser)?.rank || 0;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <PieChart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Productivity Dashboard
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Track your focus sessions and optimize your workflow
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                {sessions.length > 0 ? '☁️ Cloud Synced' : '📱 Local Data'}
              </Badge>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-3 px-6 py-3"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span className="text-sm font-medium opacity-90">Total Pomodoros</span>
                      </div>
                      <div className="text-3xl font-bold">{completedPomodoros}</div>
                      <div className="text-sm opacity-80">Work sessions completed</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-full">
                      <Target className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5" />
                        <span className="text-sm font-medium opacity-90">Current Streak</span>
                      </div>
                      <div className="text-3xl font-bold">{streakDays} days</div>
                      <div className="text-sm opacity-80">Consistent focus days</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-full">
                      <Award className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        <span className="text-sm font-medium opacity-90">This Week</span>
                      </div>
                      <div className="text-3xl font-bold">
                        {weeklyPomodoros.reduce((a, b) => a + b, 0)}
                      </div>
                      <div className="text-sm opacity-80">Weekly sessions</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-full">
                      <Activity className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        <span className="text-sm font-medium opacity-90">Focus Time</span>
                      </div>
                      <div className="text-3xl font-bold">{totalFocusMinutes}m</div>
                      <div className="text-sm opacity-80">Total focused minutes</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-full">
                      <Crown className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 h-14">
                    <TabsTrigger value="overview" className="flex items-center gap-3 text-base">
                      <BarChart3 className="h-5 w-5" />
                      <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-3 text-base">
                      <TrendingUp className="h-5 w-5" />
                      <span>Analytics</span>
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard" className="flex items-center gap-3 text-base">
                      <Trophy className="h-5 w-5" />
                      <span>Leaderboard</span>
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="flex items-center gap-3 text-base">
                      <Lightbulb className="h-5 w-5" />
                      <span>Insights</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Weekly Activity
                          </CardTitle>
                          <CardDescription>Your focus sessions this week</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div className="grid grid-cols-7 gap-2 h-32">
                              {weeklyPomodoros.map((count, index) => (
                                <div key={index} className="flex flex-col items-center">
                                  <div className="flex-1 w-full flex items-end">
                                    <div
                                      className="bg-gradient-to-t from-primary to-primary/80 w-full rounded-t-lg transition-all duration-500"
                                      style={{
                                        height: `${Math.max((count / Math.max(...weeklyPomodoros.filter(n => n > 0)) || 1) * 100, 8)}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium mt-2 text-muted-foreground">
                                    {daysOfWeek[index]}
                                  </span>
                                  <span className="text-xs font-bold mt-1">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Session Distribution
                          </CardTitle>
                          <CardDescription>Breakdown of your session types</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                <span className="font-medium">Work Sessions</span>
                              </div>
                              <Badge variant="secondary">{workSessions.length}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="font-medium">Short Breaks</span>
                              </div>
                              <Badge variant="secondary">{breakSessions.length}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="font-medium">Long Breaks</span>
                              </div>
                              <Badge variant="secondary">{longBreakSessions.length}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                          Today's Activity
                        </CardTitle>
                        <CardDescription>Sessions completed today</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {todaySessions.length > 0 ? (
                            todaySessions.map((session, i) => (
                              <div
                                key={`${session.id}-${i}`}
                                className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                                  session.sessionType === 'work' 
                                    ? 'bg-primary/10 border-primary/20' 
                                    : 'bg-green-500/10 border-green-500/20'
                                }`}
                              >
                                <div className={`text-2xl font-bold mb-2 ${
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
                                <div className="text-xs text-muted-foreground mt-2">
                                  {session.duration}min
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center py-8">
                              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">No sessions completed today</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Start a Pomodoro session to see your activity here
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Productivity Score
                          </CardTitle>
                          <CardDescription>Your focus efficiency rating</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center space-y-4">
                            <div className="relative inline-block">
                              <div className="w-32 h-32 rounded-full flex items-center justify-center border-8"
                                style={{
                                  background: `conic-gradient(#3b82f6 ${productivityScore * 3.6}deg, #e5e7eb 0deg)`
                                }}
                              >
                                <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center">
                                  <span className="text-2xl font-bold">{productivityScore}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">
                                {productivityScore >= 80 ? 'Excellent!' : 
                                 productivityScore >= 60 ? 'Great Job!' :
                                 productivityScore >= 40 ? 'Good Progress' : 'Getting Started'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {productivityScore >= 80 ? 'Keep up the amazing focus!' : 
                                 'Continue building your productive habits'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Session Trends
                          </CardTitle>
                          <CardDescription>Your weekly performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {weeklyPomodoros.map((count, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm font-medium w-12">{daysOfWeek[index]}</span>
                                <div className="flex-1 mx-4">
                                  <Progress 
                                    value={count > 0 ? (count / Math.max(...weeklyPomodoros)) * 100 : 0} 
                                    className="h-3"
                                  />
                                </div>
                                <span className="text-sm font-bold w-8 text-right">
                                  {count}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="leaderboard" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-primary" />
                          Productivity Leaderboard
                        </CardTitle>
                        <CardDescription>Compare your progress with other focused users</CardDescription>
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

                  <TabsContent value="insights" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-primary" />
                          Recent Reflections
                        </CardTitle>
                        <CardDescription>Learnings from your focus sessions</CardDescription>
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
                                  {reflection.learnings}
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

          <div className="space-y-8 h-fit">
            <Card className="sticky top-8 overflow-hidden" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Activity Calendar
                </CardTitle>
                <CardDescription>Your focus day history</CardDescription>
              </CardHeader>
              <CardContent className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-xl border"
                    modifiers={{
                      highlighted: calendarData.map(d => d.date),
                    }}
                    modifiersClassNames={{
                      highlighted: "bg-primary text-primary-foreground font-bold",
                    }}
                  />
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{sessions.length}</div>
                      <div className="text-xs text-muted-foreground">Total Sessions</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{calendarData.length}</div>
                      <div className="text-xs text-muted-foreground">Active Days</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{streakDays}</div>
                      <div className="text-xs text-muted-foreground">Day Streak</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">Keep it up!</div>
                        <div className="text-sm text-muted-foreground">
                          {streakDays > 0 
                            ? `You're on a ${streakDays}-day streak!` 
                            : 'Start a streak by focusing tomorrow'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your productivity at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Average Sessions/Day</span>
                    <Badge variant="secondary">
                      {calendarData.length > 0 
                        ? (sessions.length / calendarData.length).toFixed(1) 
                        : '0'
                      }
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Best Day</span>
                    <Badge variant="secondary">
                      {Math.max(...weeklyPomodoros)} sessions
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <Badge variant="secondary">
                      {sessions.length > 0 ? Math.round((workSessions.length / sessions.length) * 100) : 0}%
                    </Badge>
                  </div>
                  {currentUserRank > 0 && (
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-sm font-medium">Leaderboard Rank</span>
                      <Badge variant="default" className="bg-primary">
                        #{currentUserRank}
                      </Badge>
                    </div>
                  )}
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