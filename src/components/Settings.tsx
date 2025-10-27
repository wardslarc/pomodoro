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
import { Moon, Sun, Volume2, RotateCcw, Check, Loader2 } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";

interface SettingsProps {
  onClose?: () => void;
}

const Settings = ({ onClose }: SettingsProps) => {
  const { user } = useAuth();
  const { settings, updateSettings, resetSettings } = useSettings();
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
          // Update local settings with database settings
          updateSettings(data.data.settings);
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
      // Save to database if user is logged in
      if (user) {
        await saveSettingsToDatabase(settings);
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
    if (user) {
      // If user is logged in, reset settings in database too
      try {
        setIsSaving(true);
        await saveSettingsToDatabase({
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          sessionsBeforeLongBreak: 4,
          notificationSound: "bell",
          volume: 50,
          darkMode: false,
          autoStartBreaks: true,
          autoStartPomodoros: false,
        });
      } catch (error) {
        console.error('Failed to reset settings in database:', error);
      } finally {
        setIsSaving(false);
      }
    }
    
    resetSettings();
  };

  // Enhanced update function that saves to database
  const handleUpdateSettings = async (newSettings: Partial<typeof settings>) => {
    // Update local settings immediately
    updateSettings(newSettings);

    // Save to database if user is logged in
    if (user) {
      try {
        await saveSettingsToDatabase({ ...settings, ...newSettings });
      } catch (error) {
        console.error('Failed to sync settings to database:', error);
        // You could show a warning that settings are only saved locally
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 bg-background">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Loading settings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                {user 
                  ? `Customize your Pomodoro experience (${user.email}) - Changes saved to cloud`
                  : "Customize your Pomodoro experience - Sign in to save across devices"
                }
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={handleReset} 
              size="sm"
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timer">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timer">Timer</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="timer" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workDuration">
                      Work Duration (minutes)
                    </Label>
                    <Input
                      id="workDuration"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={(e) =>
                        handleUpdateSettings({ workDuration: parseInt(e.target.value) || 25 })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortBreakDuration">
                      Short Break Duration (minutes)
                    </Label>
                    <Input
                      id="shortBreakDuration"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) =>
                        handleUpdateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="longBreakDuration">
                      Long Break Duration (minutes)
                    </Label>
                    <Input
                      id="longBreakDuration"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) =>
                        handleUpdateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionsBeforeLongBreak">
                      Sessions Before Long Break
                    </Label>
                    <Input
                      id="sessionsBeforeLongBreak"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.sessionsBeforeLongBreak}
                      onChange={(e) =>
                        handleUpdateSettings({ sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoStartBreaks">Auto-start Breaks</Label>
                    <Switch
                      id="autoStartBreaks"
                      checked={settings.autoStartBreaks}
                      onCheckedChange={(checked) =>
                        handleUpdateSettings({ autoStartBreaks: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoStartPomodoros">
                      Auto-start Pomodoros
                    </Label>
                    <Switch
                      id="autoStartPomodoros"
                      checked={settings.autoStartPomodoros}
                      onCheckedChange={(checked) =>
                        handleUpdateSettings({ autoStartPomodoros: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notificationSound">Notification Sound</Label>
                  <Select
                    value={settings.notificationSound}
                    onValueChange={(value) => handleUpdateSettings({ notificationSound: value })}
                  >
                    <SelectTrigger id="notificationSound">
                      <SelectValue placeholder="Select a sound" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bell">Bell</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="chime">Chime</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="volume">Volume</Label>
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Slider
                    id="volume"
                    value={[settings.volume]}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleUpdateSettings({ volume: value[0] })}
                  />
                  <div className="text-sm text-muted-foreground text-center">
                    {settings.volume}%
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <Switch
                      id="darkMode"
                      checked={settings.darkMode}
                      onCheckedChange={(checked) => handleUpdateSettings({ darkMode: checked })}
                    />
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            Reset to Defaults
          </Button>
          <div className="relative">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className={`transition-all duration-300 ${
                showSaveConfirmation ? "bg-green-600 scale-105" : ""
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : showSaveConfirmation ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Data saving indicator */}
      {user && (
        <div className="mt-4 text-center">
          <div className="text-xs text-muted-foreground">
            {user ? (
              <span className="text-green-600">✓ Settings are automatically saved to your cloud account</span>
            ) : (
              <span className="text-amber-600">⚠ Sign in to save settings across devices</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;