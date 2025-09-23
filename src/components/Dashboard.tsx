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
import { Award, BarChart2, Clock, Target, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

interface DashboardProps {}

interface SessionData {
  id: string;
  completedAt: Timestamp;
  duration: number;
  sessionType: string;
  createdAt?: Timestamp;
}

interface ReflectionData {
  id: string;
  createdAt: Timestamp;
  learnings: string;
  sessionId: string;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [weeklyPomodoros, setWeeklyPomodoros] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [streakDays, setStreakDays] = useState(0);
  const [calendarData, setCalendarData] = useState<{ date: Date; count: number }[]>([]);
  const [recentReflections, setRecentReflections] = useState<ReflectionData[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionData[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // ✅ Query the sessions subcollection
    const sessionsRef = collection(db, "users", user.uid, "sessions");
    const sessionsQuery = query(
      sessionsRef,
      orderBy("completedAt", "desc")
    );

    // ✅ Query the reflections subcollection
    const reflectionsRef = collection(db, "users", user.uid, "reflections");
    const reflectionsQuery = query(
      reflectionsRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribeSessions = onSnapshot(sessionsQuery, 
      (snapshot) => {
        const sessionsData: SessionData[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data()
        }));

        setSessions(sessionsData);

        if (sessionsData.length === 0) {
          setLoading(false);
          return;
        }

        // ✅ Total completed pomodoros
        setCompletedPomodoros(sessionsData.length);

        // ✅ Weekly Pomodoros (current week)
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday start
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (6 - now.getDay())); // Saturday end
        endOfWeek.setHours(23, 59, 59, 999);

        const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];
        
        sessionsData.forEach((session) => {
          const sessionDate = session.completedAt?.toDate ? session.completedAt.toDate() : new Date(session.completedAt);
          
          if (sessionDate >= startOfWeek && sessionDate <= endOfWeek) {
            const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
            weeklyCounts[dayOfWeek] += 1;
          }
        });

        // Reorder to start with Monday (1) instead of Sunday (0)
        const reorderedWeekly = [...weeklyCounts.slice(1), weeklyCounts[0]];
        setWeeklyPomodoros(reorderedWeekly);

        // ✅ Calendar Data for heatmap
        const calendarMap: { [key: string]: number } = {};
        sessionsData.forEach((session) => {
          const sessionDate = session.completedAt?.toDate ? session.completedAt.toDate() : new Date(session.completedAt);
          const dateKey = sessionDate.toDateString();
          calendarMap[dateKey] = (calendarMap[dateKey] || 0) + 1;
        });

        const calendarDataArray = Object.entries(calendarMap).map(([dateKey, count]) => ({
          date: new Date(dateKey),
          count
        }));

        setCalendarData(calendarDataArray);

        // ✅ Streak calculation
        const uniqueDates = new Set();
        sessionsData.forEach(session => {
          const sessionDate = session.completedAt?.toDate ? session.completedAt.toDate() : new Date(session.completedAt);
          uniqueDates.add(sessionDate.toDateString());
        });

        // Calculate streak by checking consecutive days from today backwards
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
      },
      (error) => {
        console.error("Error fetching sessions:", error);
        setLoading(false);
      }
    );

    const unsubscribeReflections = onSnapshot(reflectionsQuery, 
      (snapshot) => {
        const reflectionsData: ReflectionData[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Get latest 3 reflections
        setRecentReflections(reflectionsData.slice(0, 3));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching reflections:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeSessions();
      unsubscribeReflections();
    };
  }, [user]);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Function to find session by ID for reflection display
  const getSessionForReflection = (sessionId: string) => {
    return sessions.find(session => session.id === sessionId);
  };

  // Alternative: Go to timer page if that's where you want to go back to
  // const handleGoBack = () => {
  //   navigate("/timer"); // Navigate to timer page
  // };

  if (loading) {
    return (
      <div className="container mx-auto p-4 bg-background">
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-background">
      {/* Header with Go Back Button and Title */}
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pomodoros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{completedPomodoros}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Work Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Target className="mr-2 h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">
                {sessions.filter(s => s.sessionType === 'work').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="mr-2 h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{streakDays} days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart2 className="mr-2 h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">
                {weeklyPomodoros.reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="daily">Daily Stats</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Stats</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        {/* Daily Stats Tab */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Activity</CardTitle>
              <CardDescription>
                Your completed sessions and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Completed Sessions Today
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: completedPomodoros }, (_, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="flex items-center justify-center py-1"
                      >
                        #{i + 1}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Session Types</h4>
                  <div className="flex space-x-4">
                    <Badge variant="secondary" className="px-3 py-1">
                      Work: {sessions.filter(s => s.sessionType === 'work').length}
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      Break: {sessions.filter(s => s.sessionType === 'break').length}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reflections</CardTitle>
              <CardDescription>Your learnings from recent sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReflections.length > 0 ? (
                  recentReflections.map((reflection) => {
                    const session = getSessionForReflection(reflection.sessionId);
                    return (
                      <div key={reflection.id} className="border-b pb-3 last:border-0">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">
                            {session ? `${session.sessionType === 'work' ? 'Work' : 'Break'} Session` : 'Session'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {reflection.createdAt?.toDate 
                              ? reflection.createdAt.toDate().toLocaleDateString()
                              : new Date(reflection.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reflection.learnings}
                        </p>
                        {session && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              Duration: {session.duration}min
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No reflections yet. Add reflections to your Pomodoro sessions to see them here.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Stats Tab */}
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
              <CardDescription>
                Your productivity for the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-medium mb-4">
                    Pomodoros Completed
                  </h4>
                  <div className="grid grid-cols-7 gap-2 h-40">
                    {weeklyPomodoros.map((count, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="flex-1 w-full flex items-end">
                          <div
                            className="bg-primary/80 w-full rounded-t"
                            style={{
                              height: `${Math.max((count / Math.max(...weeklyPomodoros.filter(n => n > 0)) || 1) * 100, 10)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs mt-2">
                          {daysOfWeek[index]}
                        </span>
                        <span className="text-xs font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-4">Daily Activity</h4>
                  <div className="space-y-2">
                    {weeklyPomodoros.map((count, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-xs w-16 font-medium">
                          {daysOfWeek[index]}
                        </span>
                        <div className="flex-1">
                          <Progress 
                            value={count > 0 ? (count / Math.max(...weeklyPomodoros)) * 100 : 0} 
                            className="h-2" 
                          />
                        </div>
                        <span className="text-xs font-medium ml-2">
                          {count} session{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Calendar</CardTitle>
              <CardDescription>
                Your Pomodoro activity over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  modifiers={{
                    highlighted: calendarData.map(d => d.date),
                  }}
                  modifiersClassNames={{
                    highlighted: "bg-primary text-primary-foreground",
                  }}
                />
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Activity Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{completedPomodoros}</div>
                    <div className="text-muted-foreground">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{calendarData.length}</div>
                    <div className="text-muted-foreground">Active Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{streakDays}</div>
                    <div className="text-muted-foreground">Current Streak</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;