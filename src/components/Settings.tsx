import React, { useState } from "react";
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
import { Moon, Sun, Volume2, RotateCcw, Check } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

interface SettingsProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onClose?: () => void; // Add this prop to handle modal closing
}

const Settings = ({ isDarkMode, onToggleDarkMode, onClose }: SettingsProps) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const handleSave = () => {
    // Show confirmation
    setShowSaveConfirmation(true);
    
    // Hide confirmation after 1.5 seconds and close modal
    setTimeout(() => {
      setShowSaveConfirmation(false);
      if (onClose) {
        // Add a small delay for smooth transition
        setTimeout(() => onClose(), 100);
      }
    }, 1500);
  };

  const handleReset = () => {
    resetSettings();
    // Optional: Show a brief confirmation for reset
  };

  const defaultSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notificationSound: "bell",
    volume: 80,
    darkMode: false
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-background">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Customize your Pomodoro experience</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={handleReset} 
              size="sm"
              disabled={JSON.stringify(settings) === JSON.stringify(defaultSettings)}
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
                        updateSettings({ workDuration: parseInt(e.target.value) || 25 })
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
                        updateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })
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
                        updateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })
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
                        updateSettings({ sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })
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
                        updateSettings({ autoStartBreaks: checked })
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
                        updateSettings({ autoStartPomodoros: checked })
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
                    onValueChange={(value) => updateSettings({ notificationSound: value })}
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
                    onValueChange={(value) => updateSettings({ volume: value[0] })}
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
                      onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
                    />
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={JSON.stringify(settings) === JSON.stringify(defaultSettings)}
          >
            Reset to Defaults
          </Button>
          <div className="relative">
            <Button 
              onClick={handleSave}
              className={`transition-all duration-300 ${
                showSaveConfirmation ? "bg-green-600 scale-105" : ""
              }`}
            >
              {showSaveConfirmation ? (
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
    </div>
  );
};

export default Settings;