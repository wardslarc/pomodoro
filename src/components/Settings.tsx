import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Moon, 
  Sun, 
  Volume2, 
  RotateCcw, 
  Check, 
  Loader2, 
  Clock,
  Bell,
  Palette,
  Save,
  Settings as SettingsIcon
} from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface SettingsProps {
  onClose?: () => void;
}

const Settings = ({ onClose }: SettingsProps) => {
  const { user } = useAuth();
  const { settings, updateSettings, resetSettings } = useSettings();
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("timer");
  
  // Local state for form values - only saved when user clicks "Save Changes"
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local settings when context settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Load settings from database when user logs in
  useEffect(() => {
    const loadSettingsFromDatabase = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('/api/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load settings');
        }

        const data = await response.json();
        if (data.success && data.data.settings) {
          // Update both context and local settings with database settings
          updateSettings(data.data.settings);
          setLocalSettings(data.data.settings);
        }
      } catch (error) {
        console.error('Error loading settings from database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettingsFromDatabase();
  }, [user, updateSettings]);

  // Save settings to database
  const saveSettingsToDatabase = async (settingsData: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found, settings saved locally only');
        return;
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Settings saved to database');
        return data.data.settings;
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings to database:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Update context with local settings
      updateSettings(localSettings);

      // Save to database if user is logged in
      if (user) {
        await saveSettingsToDatabase(localSettings);
      }

      setShowSaveConfirmation(true);
      
      setTimeout(() => {
        setShowSaveConfirmation(false);
        if (onClose) {
          setTimeout(() => onClose(), 100);
        }
      }, 1500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      // You could show an error message to the user here
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const defaultSettings = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      notificationSound: "bell",
      volume: 50,
      darkMode: false,
      autoStartBreaks: true,
      autoStartPomodoros: false,
    };

    // Update local state first
    setLocalSettings(defaultSettings);

    // Update context
    resetSettings();

    // Save to database if user is logged in
    if (user) {
      try {
        setIsSaving(true);
        await saveSettingsToDatabase(defaultSettings);
      } catch (error) {
        console.error('Failed to reset settings in database:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Update local settings without saving to context or database
  const handleLocalSettingChange = (newSettings: Partial<typeof settings>) => {
    setLocalSettings(prev => ({ ...prev, ...newSettings }));
  };

  const hasUnsavedChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-background min-h-screen sm:min-h-0">
        <Card className="border-0 sm:border shadow-none sm:shadow-lg">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Loading your settings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-background min-h-screen sm:min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Customize your Pomodoro experience
          </p>
        </div>
        {user && (
          <Badge variant="secondary" className="ml-auto hidden sm:flex">
            {user.email}
          </Badge>
        )}
      </div>

      <Card className="border-0 sm:border shadow-none sm:shadow-lg overflow-hidden">
        <CardHeader className="pb-4 sm:pb-6 bg-muted/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl">Preferences</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {user 
                  ? "Changes are saved to your cloud account when you click Save"
                  : "Sign in to save settings across all your devices"
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <Badge variant="outline" className="sm:hidden">
                  {user.email.split('@')[0]}
                </Badge>
              )}
              <Button 
                variant="outline" 
                onClick={handleReset} 
                size="sm"
                disabled={isSaving}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 sm:h-10 mb-6 sm:mb-8">
              <TabsTrigger value="timer" className="flex items-center gap-2 py-3 sm:py-2">
                <Clock className="h-4 w-4" />
                <span className="hidden xs:inline">Timer</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 py-3 sm:py-2">
                <Bell className="h-4 w-4" />
                <span className="hidden xs:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2 py-3 sm:py-2">
                <Palette className="h-4 w-4" />
                <span className="hidden xs:inline">Appearance</span>
              </TabsTrigger>
            </TabsList>

            {/* Timer Settings */}
            <TabsContent value="timer" className="space-y-6 mt-0">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Work Duration */}
                  <div className="space-y-4 p-4 rounded-lg border bg-card">
                    <div className="space-y-2">
                      <Label htmlFor="workDuration" className="text-base font-medium">
                        Work Duration
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Focus session length in minutes
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        id="workDuration"
                        type="number"
                        min="1"
                        max="60"
                        value={localSettings.workDuration}
                        onChange={(e) =>
                          handleLocalSettingChange({ workDuration: parseInt(e.target.value) || 25 })
                        }
                        className="text-lg font-medium text-center"
                      />
                      <span className="text-sm text-muted-foreground min-w-[60px]">minutes</span>
                    </div>
                  </div>

                  {/* Short Break Duration */}
                  <div className="space-y-4 p-4 rounded-lg border bg-card">
                    <div className="space-y-2">
                      <Label htmlFor="shortBreakDuration" className="text-base font-medium">
                        Short Break
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Brief rest period length
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        id="shortBreakDuration"
                        type="number"
                        min="1"
                        max="30"
                        value={localSettings.shortBreakDuration}
                        onChange={(e) =>
                          handleLocalSettingChange({ shortBreakDuration: parseInt(e.target.value) || 5 })
                        }
                        className="text-lg font-medium text-center"
                      />
                      <span className="text-sm text-muted-foreground min-w-[60px]">minutes</span>
                    </div>
                  </div>

                  {/* Long Break Duration */}
                  <div className="space-y-4 p-4 rounded-lg border bg-card">
                    <div className="space-y-2">
                      <Label htmlFor="longBreakDuration" className="text-base font-medium">
                        Long Break
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Extended rest period length
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        id="longBreakDuration"
                        type="number"
                        min="1"
                        max="60"
                        value={localSettings.longBreakDuration}
                        onChange={(e) =>
                          handleLocalSettingChange({ longBreakDuration: parseInt(e.target.value) || 15 })
                        }
                        className="text-lg font-medium text-center"
                      />
                      <span className="text-sm text-muted-foreground min-w-[60px]">minutes</span>
                    </div>
                  </div>

                  {/* Sessions Before Long Break */}
                  <div className="space-y-4 p-4 rounded-lg border bg-card">
                    <div className="space-y-2">
                      <Label htmlFor="sessionsBeforeLongBreak" className="text-base font-medium">
                        Sessions Before Long Break
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Work sessions between long breaks
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        id="sessionsBeforeLongBreak"
                        type="number"
                        min="1"
                        max="10"
                        value={localSettings.sessionsBeforeLongBreak}
                        onChange={(e) =>
                          handleLocalSettingChange({ sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })
                        }
                        className="text-lg font-medium text-center"
                      />
                      <span className="text-sm text-muted-foreground min-w-[60px]">sessions</span>
                    </div>
                  </div>
                </div>

                {/* Auto-start Settings */}
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="text-lg font-semibold mb-4">Auto-start Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoStartBreaks" className="text-base font-medium">
                          Auto-start Breaks
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically begin break periods
                        </p>
                      </div>
                      <Switch
                        id="autoStartBreaks"
                        checked={localSettings.autoStartBreaks}
                        onCheckedChange={(checked) =>
                          handleLocalSettingChange({ autoStartBreaks: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoStartPomodoros" className="text-base font-medium">
                          Auto-start Pomodoros
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically begin work sessions
                        </p>
                      </div>
                      <Switch
                        id="autoStartPomodoros"
                        checked={localSettings.autoStartPomodoros}
                        onCheckedChange={(checked) =>
                          handleLocalSettingChange({ autoStartPomodoros: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6 mt-0">
              <div className="space-y-6">
                <div className="p-4 rounded-lg border bg-card">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notificationSound" className="text-base font-medium">
                        Notification Sound
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Choose the sound for session completion alerts
                      </p>
                    </div>
                    <Select
                      value={localSettings.notificationSound}
                      onValueChange={(value) => handleLocalSettingChange({ notificationSound: value })}
                    >
                      <SelectTrigger id="notificationSound" className="h-12 text-base">
                        <SelectValue placeholder="Select a sound" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bell" className="text-base py-3">🔔 Bell</SelectItem>
                        <SelectItem value="digital" className="text-base py-3">📟 Digital</SelectItem>
                        <SelectItem value="chime" className="text-base py-3">🎵 Chime</SelectItem>
                        <SelectItem value="calm" className="text-base py-3">🌊 Calm</SelectItem>
                        <SelectItem value="none" className="text-base py-3">🔇 None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="volume" className="text-base font-medium">
                          Volume
                        </Label>
                        <Volume2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Adjust the notification volume level
                      </p>
                    </div>
                    <div className="space-y-4">
                      <Slider
                        id="volume"
                        value={[localSettings.volume]}
                        max={100}
                        step={1}
                        onValueChange={(value) => handleLocalSettingChange({ volume: value[0] })}
                        className="py-4"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">0%</span>
                        <div className="text-lg font-semibold text-center min-w-[60px]">
                          {localSettings.volume}%
                        </div>
                        <span className="text-sm text-muted-foreground">100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6 mt-0">
              <div className="space-y-6">
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="darkMode" className="text-base font-medium">
                        Dark Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Switch between light and dark themes
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Sun className="h-5 w-5 text-muted-foreground" />
                      <Switch
                        id="darkMode"
                        checked={localSettings.darkMode}
                        onCheckedChange={(checked) => handleLocalSettingChange({ darkMode: checked })}
                        className="scale-110"
                      />
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Theme Preview */}
                <div className="p-4 rounded-lg border bg-card">
                  <Label className="text-base font-medium mb-4 block">Theme Preview</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border-2 ${!localSettings.darkMode ? 'border-primary bg-primary/5' : 'border-muted bg-background'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="text-sm font-medium ml-auto">Light</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-muted rounded"></div>
                        <div className="h-2 bg-muted rounded w-3/4"></div>
                        <div className="h-2 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${localSettings.darkMode ? 'border-primary bg-primary/5' : 'border-muted bg-muted'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium ml-auto text-white">Dark</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-muted-foreground/30 rounded"></div>
                        <div className="h-2 bg-muted-foreground/30 rounded w-3/4"></div>
                        <div className="h-2 bg-muted-foreground/30 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between p-4 sm:p-6 bg-muted/20 border-t">
          <div className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleReset} 
              disabled={isSaving}
              className="w-full sm:w-auto gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
          
          <div className="w-full sm:w-auto relative">
            <Button 
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className={`w-full sm:w-auto gap-2 transition-all duration-300 ${
                showSaveConfirmation ? "bg-green-600 hover:bg-green-700 scale-105" : ""
              }`}
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : showSaveConfirmation ? (
                <>
                  <Check className="h-4 w-4" />
                  Changes Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            {hasUnsavedChanges && !showSaveConfirmation && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse ring-2 ring-background"></div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Status Footer */}
      <div className="mt-4 p-3 rounded-lg bg-muted/30">
        <div className="text-center text-sm text-muted-foreground">
          {user ? (
            hasUnsavedChanges ? (
              <div className="flex items-center justify-center gap-2 text-amber-600">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span>You have unsaved changes</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="h-4 w-4" />
                <span>All changes saved to cloud</span>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <span>⚠ Sign in to sync settings across devices</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;