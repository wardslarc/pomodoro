import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Lightbulb, Target, Zap } from "lucide-react";

interface ReflectionContentProps {
  sessionId: string | null;
  onSubmit?: (reflectionData: { learnings: string; sessionId: string | null }) => void;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://reflectivepomodoro.com';

const ReflectionContent: React.FC<ReflectionContentProps> = ({
  sessionId,
  onSubmit,
  onClose,
}) => {
  const { user, token } = useAuth();
  const [learnings, setLearnings] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (learnings.trim().length > 0 && !isSaving) {
        handleSubmit(e as any);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLearnings(e.target.value);
  };

  const saveReflectionToDatabase = async (reflectionData: { learnings: string; sessionId: string | null }) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    const actualSessionId = reflectionData.sessionId;
    
    if (!actualSessionId) {
      throw new Error('Session ID is required to save reflection');
    }

    if (typeof actualSessionId !== 'string') {
      throw new Error('Session ID must be a string');
    }

    if (actualSessionId.trim().length === 0) {
      throw new Error('Session ID cannot be empty');
    }

    if (reflectionData.learnings.length === 0) {
      throw new Error('Learnings content is required');
    }

    if (reflectionData.learnings.length > 2000) {
      throw new Error('Learnings must be less than 2000 characters');
    }

    const payload = {
      sessionId: actualSessionId.trim(),
      learnings: reflectionData.learnings,
      createdAt: new Date().toISOString()
    };

    const response = await fetch(`${API_BASE_URL}/api/reflections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save reflection: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data?.reflection?._id || responseData.data?.reflection?.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!learnings.trim()) {
      setError('Please write something about what you learned');
      return;
    }

    if (learnings.length > 2000) {
      setError('Reflection must be less than 2000 characters');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (user && token && sessionId) {
        if (typeof sessionId !== 'string') {
          throw new Error('Invalid sessionId type');
        }
        
        if (sessionId.trim().length === 0) {
          throw new Error('Session ID is empty');
        }
        
        await saveReflectionToDatabase({
          learnings: learnings,
          sessionId: sessionId
        });
      }

      if (onSubmit) {
        await onSubmit({
          learnings: learnings,
          sessionId: sessionId
        });
      }

      setLearnings("");
      onClose();
    } catch (error: any) {
      setError(error.message || "Failed to save reflection. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    setLearnings("");
    setError(null);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Session Reflection</h2>
          <p className="text-slate-600 mt-1">Take a moment to reflect on your completed Pomodoro session</p>
        </div>
        {sessionId && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <Target className="h-3 w-3 mr-1" />
            Session: {sessionId.substring(0, 8)}...
          </div>
        )}
      </div>

      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span className="font-medium">Reflect</span>
        </div>
        <div className="w-8 h-px bg-slate-300"></div>
        <div className="flex items-center space-x-2 text-slate-400">
          <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
          <span>Review</span>
        </div>
        <div className="w-8 h-px bg-slate-300"></div>
        <div className="flex items-center space-x-2 text-slate-400">
          <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
          <span>Improve</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <Label htmlFor="learnings" className="text-sm font-semibold text-slate-900">
                What insights did you gain from this session?
              </Label>
              <p className="text-xs text-slate-600">
                Consider what worked well, challenges you overcame, or anything you'd do differently next time.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Your reflection</span>
            <span className="text-xs text-slate-500">
              {learnings.length}/2000 characters
            </span>
          </div>
          <textarea
            ref={textareaRef}
            id="learnings"
            placeholder="• I discovered that...&#10;• The main challenge was...&#10;• Next time I'll try..."
            value={learnings}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              e.stopPropagation(); // Critical: stops modal from intercepting keys
              handleKeyDown(e);
            }}
            className="min-h-[140px] w-full resize-none font-normal border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors rounded-md px-3 py-2 text-sm"
            required
            disabled={isSaving}
            maxLength={2000}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Bullet points help organize thoughts</span>
            <span>{2000 - learnings.length} characters remaining</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2">
            {user && token ? (
              <>
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Cloud sync enabled</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700">Sign in to save permanently</span>
              </>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {learnings.length > 0 ? `${learnings.split(/\s+/).filter(word => word.length > 0).length} words` : 'Start typing...'}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
            disabled={isSaving}
          >
            Skip for now
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            disabled={isSaving || learnings.trim().length === 0}
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Save Reflection</span>
              </div>
            )}
          </Button>
        </div>
      </form>

      {learnings.trim().length === 0 && (
        <div className="border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500 text-center mb-3">Quick reflection prompts:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setLearnings(prev => prev + "• I focused well when...\n")}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-left transition-colors"
            >
              What helped focus?
            </button>
            <button
              type="button"
              onClick={() => setLearnings(prev => prev + "• I overcame distraction by...\n")}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-left transition-colors"
            >
              Distractions faced?
            </button>
            <button
              type="button"
              onClick={() => setLearnings(prev => prev + "• Next time I'll improve by...\n")}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-left transition-colors"
            >
              Future improvements?
            </button>
          </div>
        </div>
      )}

      {learnings.trim().length > 0 && (
        <div className="text-center">
          <p className="text-xs text-slate-500">
            💡 Press <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">Enter</kbd> to save quickly
          </p>
        </div>
      )}
    </div>
  );
};

export default ReflectionContent;