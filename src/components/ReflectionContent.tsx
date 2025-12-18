import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Lightbulb, Target, Zap, Share, Users, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { sanitizeText, sanitizeTags } from "@/utils/sanitization";

interface ReflectionContentProps {
  sessionId: string | null;
  onSubmit?: (reflectionData: { learnings: string; sessionId: string | null }) => void;
  onClose: () => void;
}

// In AuthContext.tsx
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://www.reflectivepomodoro.com/";

const ReflectionContent: React.FC<ReflectionContentProps> = ({
  sessionId,
  onSubmit,
  onClose,
}) => {
  const { user, token } = useAuth();
  const [learnings, setLearnings] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareToCommunity, setShareToCommunity] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedReflectionId, setSavedReflectionId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
    // Clear success message when user starts typing again
    if (saveSuccess) {
      setSaveSuccess(false);
    }
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

  const shareReflectionToCommunity = async (reflectionId: string) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/social/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reflectionId,
        isPublic
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to share reflection: ${response.status}`);
    }

    return await response.json();
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
      let reflectionId: string | null = null;

      // Sanitize the learnings input to prevent XSS
      const sanitizedLearnings = sanitizeText(learnings);

      // Save reflection to database if user is authenticated
      if (user && token && sessionId) {
        if (typeof sessionId !== 'string') {
          throw new Error('Invalid sessionId type');
        }
        
        if (sessionId.trim().length === 0) {
          throw new Error('Session ID is empty');
        }
        
        reflectionId = await saveReflectionToDatabase({
          learnings: sanitizedLearnings,
          sessionId: sessionId
        });
        setSavedReflectionId(reflectionId);

        // Share to community if enabled
        if (shareToCommunity && reflectionId) {
          try {
            await shareReflectionToCommunity(reflectionId);
            setSaveSuccess(true);
          } catch (shareError) {
            console.error('Error sharing to community:', shareError);
            // Don't throw error here - reflection is still saved
          }
        }
      }

      // Call onSubmit callback if provided
      if (onSubmit) {
        await onSubmit({
          learnings: learnings,
          sessionId: sessionId
        });
      }

      setSaveSuccess(true);
      
      // Auto-close after success if not sharing to community
      if (!shareToCommunity) {
        setTimeout(() => {
          setLearnings("");
          onClose();
        }, 1500);
      }
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

  const handleQuickPrompt = (promptText: string) => {
    setLearnings(prev => {
      const newText = prev + promptText;
      // Clear success message when adding prompt
      if (saveSuccess) {
        setSaveSuccess(false);
      }
      return newText;
    });
    textareaRef.current?.focus();
  };

  return (
    <div 
      ref={contentRef}
      className="space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)] px-2 sm:px-0"
    >
      <div className="text-center space-y-2 sm:space-y-3">
        <div className="flex justify-center items-center">
          <div className="p-2.5 sm:p-3 bg-blue-100 rounded-full">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Session Reflection</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Take a moment to reflect on your completed Pomodoro session</p>
        </div>
        {sessionId && (
          <div className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-slate-700 text-xs font-medium border border-blue-200/50 gap-1 sm:gap-1.5">
            <Target className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">Session: {sessionId.substring(0, 8)}...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center space-x-3 sm:space-x-4 md:space-x-6 text-xs sm:text-sm overflow-x-auto pb-2 sm:pb-0">
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-blue-600 flex-shrink-0">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span className="font-medium whitespace-nowrap">Reflect</span>
        </div>
        <div className="w-6 sm:w-8 h-px bg-slate-300"></div>
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-slate-400 flex-shrink-0">
          <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
          <span className="whitespace-nowrap">Review</span>
        </div>
        <div className="w-6 sm:w-8 h-px bg-slate-300"></div>
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-slate-400 flex-shrink-0">
          <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
          <span className="whitespace-nowrap">Improve</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200/50">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 sm:space-y-2 min-w-0">
              <Label htmlFor="learnings" className="text-xs sm:text-sm font-semibold text-slate-900">
                What insights did you gain from this session?
              </Label>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consider what worked well, challenges you overcame, or anything you'd do differently next time.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">Your reflection</span>
            <span className="text-xs text-slate-500 whitespace-nowrap">
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
            className="min-h-[120px] sm:min-h-[140px] w-full resize-none font-normal border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white"
            required
            disabled={isSaving}
            maxLength={2000}
          />
          <div className="flex justify-between text-xs text-slate-500 gap-2">
            <span className="truncate">Bullet points help organize thoughts</span>
            <span className="whitespace-nowrap">{2000 - learnings.length} remaining</span>
          </div>
        </div>

        {error && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl animate-in fade-in-50">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl animate-in fade-in-50">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <p className="text-xs sm:text-sm text-green-700 font-medium">
                {shareToCommunity 
                  ? "Reflection saved and shared with community! 🎉" 
                  : "Reflection saved successfully! ✓"}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-lg sm:rounded-xl border border-slate-200">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {user && token ? (
              <>
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-green-700 font-medium truncate">Cloud sync enabled</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-amber-700 truncate">Sign in to save permanently</span>
              </>
            )}
          </div>
          <div className="text-xs text-slate-500 whitespace-nowrap ml-2">
            {learnings.length > 0 ? `${learnings.split(/\s+/).filter(word => word.length > 0).length} words` : 'Start typing...'}
          </div>
        </div>

        {/* Social Sharing Section */}
        {user && token && (
          <div className="border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Share className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                <Label htmlFor="share-to-community" className="text-xs sm:text-sm font-medium text-slate-700">
                  Share with community
                </Label>
              </div>
              <Switch
                id="share-to-community"
                checked={shareToCommunity}
                onCheckedChange={setShareToCommunity}
                disabled={isSaving}
              />
            </div>
            
            {shareToCommunity && (
              <div className="space-y-3 sm:space-y-4 pl-3 sm:pl-6 border-l-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {isPublic ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    )}
                    <Label htmlFor="post-visibility" className="text-xs sm:text-sm text-slate-700">
                      {isPublic ? "Public post" : "Private post"}
                    </Label>
                  </div>
                  <Switch
                    id="post-visibility"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    disabled={isSaving}
                  />
                </div>
                
                <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200/50">
                  <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-blue-900">Share your insights</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {isPublic 
                        ? "Your reflection will be visible to everyone in the community. Help others learn from your experience!"
                        : "Only you can see this reflection. Turn on public to share with others."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm sm:text-base h-9 sm:h-10"
            disabled={isSaving}
          >
            Skip for now
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm hover:shadow-md transition-all text-sm sm:text-base h-9 sm:h-10"
            disabled={isSaving || learnings.trim().length === 0}
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>
                  {shareToCommunity ? "Sharing..." : "Saving..."}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>
                  {shareToCommunity ? "Save & Share" : "Save Reflection"}
                </span>
              </div>
            )}
          </Button>
        </div>
      </form>

      {learnings.trim().length === 0 && (
        <div className="border-t border-slate-200 pt-3 sm:pt-4">
          <p className="text-xs text-slate-500 text-center mb-2 sm:mb-3">Quick reflection prompts:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickPrompt("• I focused well when...\n")}
              className="p-2 sm:p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200/50 rounded-lg text-slate-700 text-xs sm:text-sm text-left transition-all duration-200 font-medium"
            >
              What helped focus?
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("• I overcame distraction by...\n")}
              className="p-2 sm:p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200/50 rounded-lg text-slate-700 text-xs sm:text-sm text-left transition-all duration-200 font-medium"
            >
              Distractions faced?
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("• Next time I'll improve by...\n")}
              className="p-2 sm:p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200/50 rounded-lg text-slate-700 text-xs sm:text-sm text-left transition-all duration-200 font-medium"
            >
              Future improvements?
            </button>
          </div>
        </div>
      )}

      {learnings.trim().length > 0 && (
        <div className="text-center">
          <p className="text-xs text-slate-500">
            💡 Press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono">Enter</kbd> to save quickly
          </p>
        </div>
      )}
    </div>
  );
};

export default ReflectionContent;