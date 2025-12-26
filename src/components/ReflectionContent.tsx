import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Lightbulb, Target, Zap, Share2, Users, Globe, Lock, CheckCircle, AlertCircle, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { sanitizeText, sanitizeTags } from "@/utils/sanitization";

interface ReflectionContentProps {
  sessionId: string | null;
  onSubmit?: (reflectionData: { learnings: string; sessionId: string | null }) => void;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://www.reflectivepomodoro.com/";

// Validation helpers
const validateSessionId = (id: string | null): string => {
  if (!id) throw new Error('Session ID is required');
  if (typeof id !== 'string') throw new Error('Invalid session ID format');
  const trimmed = id.trim();
  if (trimmed.length === 0) throw new Error('Session ID cannot be empty');
  return trimmed;
};

const validateReflection = (text: string): void => {
  if (!text.trim()) throw new Error('Please write something about what you learned');
  if (text.length > 2000) throw new Error('Reflection must be less than 2000 characters');
};

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
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [savedReflectionId, setSavedReflectionId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-focus textarea on mount
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
    // Allow normal text input without propagation issues
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 2000) {
      setLearnings(text);
      if (saveSuccess) setSaveSuccess(false);
      if (error) setError(null);
    }
  };

  const saveReflectionToDatabase = async (reflectionData: { learnings: string; sessionId: string | null }) => {
    if (!token) {
      throw new Error('Authentication required to save reflection');
    }

    const actualSessionId = validateSessionId(reflectionData.sessionId);

    if (!reflectionData.learnings || reflectionData.learnings.length === 0) {
      throw new Error('Learnings content is required');
    }

    if (reflectionData.learnings.length > 2000) {
      throw new Error('Learnings must be less than 2000 characters');
    }

    const payload = {
      sessionId: actualSessionId,
      learnings: reflectionData.learnings,
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/reflections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Failed to save reflection (${response.status})`);
      }

      const responseData = await response.json();
      const reflectionId = responseData.data?.reflection?._id || responseData.data?.id;
      
      if (!reflectionId) {
        throw new Error('Invalid response from server');
      }
      
      return reflectionId;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save reflection');
    }
  };

  const shareReflectionToCommunity = async (reflectionId: string) => {
    if (!token) {
      throw new Error('Authentication required to share');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/social/share`, {
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
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error('Sharing not available - feature may be in development');
        }
        if (response.status === 400) {
          throw new Error(errorData?.message || 'Invalid reflection data');
        }
        
        throw new Error(errorData?.message || `Failed to share (${response.status})`);
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (err: any) {
      console.error('Share error:', err);
      throw new Error(err.message || 'Failed to share reflection');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate reflection
    try {
      validateReflection(learnings);
    } catch (err: any) {
      setError(err.message);
      return;
    }

    setIsSaving(true);
    setError(null);
    setShareError(null);
    setShareSuccess(false);

    try {
      const sanitizedLearnings = sanitizeText(learnings);
      let reflectionId: string | null = null;

      // Save reflection to database if authenticated
      if (user && token && sessionId) {
        try {
          reflectionId = await saveReflectionToDatabase({
            learnings: sanitizedLearnings,
            sessionId: sessionId
          });
          setSavedReflectionId(reflectionId);
          setSaveSuccess(true);
        } catch (saveErr: any) {
          setError(saveErr.message || 'Failed to save reflection');
          setIsSaving(false);
          return;
        }

        // Share to community if enabled and reflection saved
        if (shareToCommunity && reflectionId) {
          try {
            await shareReflectionToCommunity(reflectionId);
            setShareSuccess(true);
            setShareError(null);
          } catch (shareErr: any) {
            // Reflection is saved, just sharing failed
            setShareError(shareErr.message || 'Failed to share reflection');
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

      // Auto-close after success
      if (!shareToCommunity || shareSuccess) {
        setTimeout(() => {
          setLearnings("");
          onClose();
        }, 1500);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setLearnings(prev => {
      const newText = prev + promptText;
      if (saveSuccess) {
        setSaveSuccess(false);
      }
      return newText;
    });
    textareaRef.current?.focus();
  };

  // Header Component
  const HeaderSection = ({ sessionId }: { sessionId: string | null }) => (
    <div className="text-center space-y-2 sm:space-y-3">
      <div className="flex justify-center">
        <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Session Reflection</h2>
        <p className="text-sm text-slate-600 mt-1 sm:mt-2">Take a moment to reflect on your completed Pomodoro session</p>
      </div>
      {sessionId && (
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-slate-700 text-xs font-medium border border-blue-200/50 gap-1.5">
          <Target className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Session: {sessionId.substring(0, 8)}...</span>
        </div>
      )}
    </div>
  );

  // Progress Steps
  const ProgressSteps = () => (
    <div className="flex items-center justify-center space-x-4 text-xs sm:text-sm overflow-x-auto pb-2">
      <div className="flex items-center space-x-2 text-blue-600 flex-shrink-0">
        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        <span className="font-medium whitespace-nowrap">Reflect</span>
      </div>
      <div className="w-6 sm:w-8 h-px bg-slate-300"></div>
      <div className="flex items-center space-x-2 text-slate-400 flex-shrink-0">
        <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
        <span className="whitespace-nowrap">Review</span>
      </div>
      <div className="w-6 sm:w-8 h-px bg-slate-300"></div>
      <div className="flex items-center space-x-2 text-slate-400 flex-shrink-0">
        <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
        <span className="whitespace-nowrap">Improve</span>
      </div>
    </div>
  );

  // Prompt Card
  const PromptCard = () => (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200/50">
      <div className="flex items-start space-x-3">
        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-2 min-w-0">
          <Label htmlFor="learnings" className="text-sm font-semibold text-slate-900">
            What insights did you gain from this session?
          </Label>
          <p className="text-xs text-slate-600 leading-relaxed">
            Consider what worked well, challenges you overcame, or anything you'd do differently next time.
          </p>
        </div>
      </div>
    </div>
  );

  // Textarea Section
  const TextareaSection = ({
    learnings,
    isSaving,
    textareaRef,
    handleInputChange,
    handleKeyDown,
  }: any) => (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex justify-between items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Your reflection</span>
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
          e.stopPropagation();
          handleKeyDown(e);
        }}
        className="min-h-[130px] sm:min-h-[150px] w-full resize-none font-normal border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors rounded-lg sm:rounded-xl px-4 py-3 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-500"
        required
        disabled={isSaving}
        maxLength={2000}
      />
      <div className="flex justify-between text-xs text-slate-500 gap-2">
        <span className="truncate">Bullet points help organize thoughts</span>
        <span className="whitespace-nowrap">{2000 - learnings.length} remaining</span>
      </div>
    </div>
  );

  // Alert Message
  const AlertMessage = ({
    type,
    title,
    message,
    icon,
  }: {
    type: "error" | "success";
    title: string;
    message: string;
    icon: React.ReactNode;
  }) => {
    const isError = type === "error";
    const bgClass = isError
      ? "bg-red-50 border-red-200"
      : "bg-green-50 border-green-200";
    const textClass = isError ? "text-red-700" : "text-green-700";

    return (
      <div className={`p-3 sm:p-4 ${bgClass} border rounded-lg sm:rounded-xl animate-in fade-in-50`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${isError ? "text-red-500" : "text-green-500"}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className={`text-xs sm:text-sm ${textClass} font-medium`}>{message}</p>
          </div>
        </div>
      </div>
    );
  };

  // Sync Status Card
  const SyncStatusCard = ({
    user,
    token,
    learnings,
  }: {
    user: any;
    token: string | null;
    learnings: string;
  }) => (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-lg sm:rounded-xl border border-slate-200">
      <div className="flex items-center space-x-3 min-w-0">
        {user && token ? (
          <>
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-green-700 font-medium truncate">
              Cloud sync enabled
            </span>
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-amber-700 truncate">
              Sign in to save permanently
            </span>
          </>
        )}
      </div>
      <div className="text-xs text-slate-500 whitespace-nowrap ml-2">
        {learnings.length > 0
          ? `${learnings.split(/\s+/).filter((word) => word.length > 0).length} words`
          : "Start typing..."}
      </div>
    </div>
  );

  // Social Sharing Section
  const SocialSharingSection = ({
    shareToCommunity,
    setShareToCommunity,
    isPublic,
    setIsPublic,
    isSaving,
    saveSuccess,
    shareSuccess,
    shareError,
  }: any) => (
    <div className="border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          <Label
            htmlFor="share-to-community"
            className="text-sm font-medium text-slate-700"
          >
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
        <div className="space-y-3 sm:space-y-4 pl-4 sm:pl-6 border-l-2 border-blue-300">
          {/* Visibility Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              {isPublic ? (
                <Globe className="h-4 w-4 text-green-600" />
              ) : (
                <Lock className="h-4 w-4 text-slate-500" />
              )}
              <Label htmlFor="post-visibility" className="text-sm text-slate-700">
                {isPublic ? "Public (visible to all)" : "Private (only you)"}
              </Label>
            </div>
            <Switch
              id="post-visibility"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isSaving}
            />
          </div>

          {/* Info Box */}
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200/50">
            <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-medium text-blue-900">Share Your Insights</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                {isPublic
                  ? "Your reflection will be visible to everyone in the community. Help others learn from your experience!"
                  : "Your reflection will only be visible to you. Toggle on to share with the community."}
              </p>
            </div>
          </div>

          {/* Share Success */}
          {saveSuccess && shareSuccess && (
            <AlertMessage
              type="success"
              title="Shared!"
              message="Your reflection has been shared with the community! 🎉"
              icon={<CheckCircle className="h-4 w-4" />}
            />
          )}

          {/* Share Error */}
          {shareError && (
            <AlertMessage
              type="error"
              title="Share Failed"
              message={shareError}
              icon={<AlertCircle className="h-4 w-4" />}
            />
          )}
        </div>
      )}
    </div>
  );

  // Action Buttons
  const ActionButtons = ({
    isSaving,
    learmingsEmpty,
    onSkip,
    shareToCommunity,
  }: any) => (
    <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onSkip}
        className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm sm:text-base h-9 sm:h-10"
        disabled={isSaving}
      >
        Skip for now
      </Button>
      <Button
        type="submit"
        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm hover:shadow-md transition-all text-sm sm:text-base h-9 sm:h-10 disabled:opacity-50"
        disabled={isSaving || learmingsEmpty}
      >
        {isSaving ? (
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>{shareToCommunity ? "Sharing..." : "Saving..."}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>{shareToCommunity ? "Save & Share" : "Save Reflection"}</span>
          </div>
        )}
      </Button>
    </div>
  );

  // Quick Prompts
  const QuickPromptsSection = ({ onPrompt }: any) => (
    <div className="border-t border-slate-200 pt-3 sm:pt-4">
      <p className="text-xs text-slate-500 text-center mb-3">Quick reflection prompts:</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          {
            text: "What helped focus?",
            prompt: "• I focused well when...\n",
          },
          {
            text: "Distractions faced?",
            prompt: "• I overcame distraction by...\n",
          },
          {
            text: "Future improvements?",
            prompt: "• Next time I'll improve by...\n",
          },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onPrompt(item.prompt)}
            className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200/50 rounded-lg text-slate-700 text-xs sm:text-sm text-left transition-all duration-200 font-medium"
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  );

  // Keyboard Hint
  const KeyboardHint = () => (
    <div className="text-center">
      <p className="text-xs text-slate-500">
        💡 Press{" "}
        <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono">
          Ctrl
        </kbd>{" "}
        +{" "}
        <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono">
          Enter
        </kbd>{" "}
        to save quickly
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-full">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Reflect</h2>
              <p className="text-xs sm:text-sm text-slate-600">What did you learn?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-200/50 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
          {/* Session ID */}
          {sessionId && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              <Target className="h-3 w-3 mr-1.5" />
              Session: {sessionId.substring(0, 8)}...
            </div>
          )}

          {/* Main Prompt */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200/50">
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <Label className="text-sm font-semibold text-slate-900 block mb-1">
                  What insights did you gain?
                </Label>
                <p className="text-xs text-slate-600">
                  Share what you learned, challenges faced, or improvements for next time.
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <AlertMessage
              type="error"
              title="Error"
              message={error}
              icon={<AlertCircle className="h-4 w-4" />}
            />
          )}

          {/* Textarea - Prominent */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="learnings" className="font-medium text-slate-900">
                Your reflection
              </Label>
              <span className="text-xs text-slate-500">
                {learnings.length}/2000
              </span>
            </div>
            <textarea
              ref={textareaRef}
              id="learnings"
              placeholder="• I discovered that...&#10;• The challenge was...&#10;• Next time I'll try..."
              value={learnings}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[180px] sm:min-h-[220px] p-4 border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm resize-none font-normal transition-all"
              maxLength={2000}
              disabled={isSaving}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>💡 Tip: Press Ctrl+Enter to save</span>
              <span>{2000 - learnings.length} remaining</span>
            </div>
          </form>

          {/* Success Message */}
          {saveSuccess && (
            <AlertMessage
              type="success"
              title="Saved!"
              message="Your reflection has been saved to your account."
              icon={<CheckCircle className="h-4 w-4" />}
            />
          )}

          {/* Sync Status */}
          {user && token && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700">Cloud sync enabled</p>
              </div>
              {learnings.length > 0 && (
                <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                  {learnings.split(/\s+/).filter(w => w.length > 0).length} words
                </span>
              )}
            </div>
          )}

          {/* Sharing Section - More Prominent */}
          {user && token && (
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-transparent">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Share2 className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-slate-900">Share with Community</span>
                  </div>
                  <Switch
                    checked={shareToCommunity}
                    onCheckedChange={setShareToCommunity}
                    disabled={isSaving}
                  />
                </div>

                {shareToCommunity && (
                  <div className="space-y-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-2">
                        {isPublic ? (
                          <Globe className="h-4 w-4 text-green-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-amber-600" />
                        )}
                        <span className="text-sm font-medium text-slate-900">
                          {isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                      <Switch
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                        disabled={isSaving}
                      />
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                      {isPublic
                        ? "✓ Your reflection will be shared with all community members"
                        : "🔒 Only you will see this reflection"}
                    </p>

                    {shareError && (
                      <AlertMessage
                        type="error"
                        title="Share Failed"
                        message={shareError}
                        icon={<AlertCircle className="h-4 w-4" />}
                      />
                    )}

                    {saveSuccess && shareSuccess && (
                      <AlertMessage
                        type="success"
                        title="Shared! 🎉"
                        message="Your reflection is now visible in the community."
                        icon={<CheckCircle className="h-4 w-4" />}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Prompts - Bottom */}
          {learnings.trim().length === 0 && (
            <div className="pt-2">
              <p className="text-xs text-slate-500 text-center mb-3 font-medium">
                Need inspiration? Try these:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  "What helped focus?",
                  "Distractions faced?",
                  "Next improvements?",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const promptTexts = [
                        "• I focused well when...\n",
                        "• I overcame distraction by...\n",
                        "• Next time I'll improve by...\n",
                      ];
                      setLearnings(promptTexts[idx]);
                      textareaRef.current?.focus();
                    }}
                    className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs sm:text-sm font-medium text-blue-900 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed Action Buttons */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 p-4 sm:p-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setLearnings("");
              setError(null);
              setShareError(null);
              onClose();
            }}
            className="flex-1 text-sm sm:text-base h-10 sm:h-11"
            disabled={isSaving}
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm sm:text-base h-10 sm:h-11 font-semibold"
            disabled={isSaving || learnings.trim().length === 0}
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{shareToCommunity ? "Sharing..." : "Saving..."}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>{shareToCommunity ? "Save & Share" : "Save Reflection"}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReflectionContent;