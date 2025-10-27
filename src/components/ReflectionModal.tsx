import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface ReflectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string | null;
  onSubmit?: (reflectionData: { learnings: string; sessionId: string | null }) => void;  
}

// Backend API URL
const API_BASE_URL = 'http://localhost:5000';

const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  onOpenChange,
  sessionId,
  onSubmit,
}) => {
  const { user, token } = useAuth();
  const [learnings, setLearnings] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      setError(null);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLearnings("");
      setError(null);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && learnings.trim().length > 0) {
      e.stopPropagation();
      return;
    }
    
    if (e.key === ' ' && e.target === textareaRef.current) {
      e.stopPropagation();
    }

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (learnings.trim().length > 0 && !isSaving) {
        handleSubmit(e);
      }
    }
  };

  // Extract session ID from object or string
  const extractSessionId = (sessionData: string | null): string | null => {
    if (!sessionData) return null;
    
    if (typeof sessionData === 'object' && sessionData !== null) {
      // If it's an object, extract the sessionId property
      return (sessionData as any).sessionId || null;
    }
    
    return sessionData;
  };

  // Save reflection to database
  const saveReflectionToDatabase = async (reflectionData: { learnings: string; sessionId: string | null }) => {
    try {
      if (!token) {
        console.log('No auth token found, reflection saved locally only');
        return null;
      }

      // Extract the actual session ID
      const actualSessionId = extractSessionId(reflectionData.sessionId);
      
      if (!actualSessionId) {
        throw new Error('Session ID is required to save reflection');
      }

      console.log('💭 Sending reflection data:', {
        sessionId: actualSessionId,
        learnings: reflectionData.learnings,
        tokenPresent: !!token
      });

      const payload = {
        sessionId: actualSessionId,
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

      console.log('🔍 Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.errors?.[0]?.msg || errorMessage;
          console.log('🔍 Error details:', errorData);
        } catch (parseError) {
          console.log('🔍 Could not parse error response');
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Reflection save successful:', data);
      
      if (data.success) {
        console.log('Reflection saved to database with ID:', data.data.reflection._id);
        return data.data.reflection._id;
      } else {
        throw new Error(data.message || 'Failed to save reflection');
      }
    } catch (error) {
      console.error('❌ Error saving reflection to database:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!learnings.trim()) {
      setError('Please write something about what you learned');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      console.log('📝 Submitting reflection...');
      console.log('Session ID:', sessionId);
      console.log('Extracted Session ID:', extractSessionId(sessionId));
      console.log('User logged in:', !!user);
      console.log('Token present:', !!token);

      // Save to database if user is logged in and has a valid session ID
      const extractedSessionId = extractSessionId(sessionId);
      if (user && extractedSessionId) {
        await saveReflectionToDatabase({
          learnings: learnings.trim(),
          sessionId: extractedSessionId
        });
      } else if (!user) {
        console.log('👤 User not logged in, saving locally only');
      } else if (!extractedSessionId) {
        console.log('⚠️ No session ID available');
      }

      // Call the onSubmit prop with the reflection data
      if (onSubmit) {
        await onSubmit({
          learnings: learnings.trim(),
          sessionId: extractedSessionId
        });
      }

      setLearnings("");
      onOpenChange(false);
      console.log('✅ Reflection submitted successfully');
    } catch (error: any) {
      console.error("❌ Failed to save reflection:", error);
      setError(error.message || "Failed to save reflection. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    setLearnings("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[80vh] bg-white"
        onKeyDown={handleKeyDown}
        onInteractOutside={(e) => {
          if (learnings.trim().length > 0) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Session Reflection
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Take a moment to reflect on your completed Pomodoro session. 
            {!user && " Sign in to save reflections to the cloud."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="learnings"
              className="text-sm font-medium text-slate-700"
            >
              What did you learn in this session?
            </Label>
            <p className="text-xs text-slate-500">1–3 sentences or bullet points</p>
            <Textarea
              ref={textareaRef}
              id="learnings"
              placeholder="• Key insight or breakthrough&#10;• Challenge I overcame&#10;• Something I want to remember..."
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              className="min-h-[200px] resize-none font-normal"
              required
              disabled={isSaving}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">Error: {error}</p>
            </div>
          )}

          {/* Data saving indicator */}
          <div className="text-xs text-muted-foreground">
            {user ? (
              <span className="text-green-600">✓ Reflections will be saved to your cloud account</span>
            ) : (
              <span className="text-amber-600">⚠ Sign in to save reflections permanently</span>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
              disabled={isSaving}
            >
              Skip
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSaving || learnings.trim().length === 0}
            >
              {isSaving ? "Saving..." : "Save Reflection"}
            </Button>
          </DialogFooter>
        </form>
        
        {learnings.trim().length > 0 && (
          <div className="text-xs text-amber-600 text-center mt-2">
            Tip: Press Ctrl+Enter to save quickly
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReflectionModal;