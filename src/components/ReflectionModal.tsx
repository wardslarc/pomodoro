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

// Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://reflectivepomodoro.com';

const getApiBaseUrl = () => {
  return API_BASE_URL;
};

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

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      setError(null);
    }
  }, [isOpen]);

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

  const extractSessionId = (sessionData: string | null): string | null => {
    if (!sessionData) return null;
    
    if (typeof sessionData === 'object' && sessionData !== null) {
      return (sessionData as any).sessionId || null;
    }
    
    // Ensure the sessionId is a string
    return String(sessionData);
  };

  const validateSessionId = (sessionId: string | null): boolean => {
    if (!sessionId) return false;
    
    // Check if it's a MongoDB ObjectId (24 hex characters)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(sessionId);
    // Check if it's a local session ID
    const isLocalId = sessionId.startsWith('local-');
    
    return isMongoId || isLocalId;
  };

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
        
        // Extract validation errors if they exist
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors.map((err: any) => 
            `${err.field}: ${err.message}`
          ).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }
        
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

  const saveReflectionToDatabase = async (reflectionData: { learnings: string; sessionId: string | null }) => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      const actualSessionId = extractSessionId(reflectionData.sessionId);
      
      if (!actualSessionId) {
        throw new Error('Session ID is required to save reflection');
      }

      // Validate session ID format
      if (!validateSessionId(actualSessionId)) {
        throw new Error('Invalid session ID format');
      }

      // Validate learnings length
      if (reflectionData.learnings.trim().length === 0) {
        throw new Error('Learnings content is required');
      }

      if (reflectionData.learnings.trim().length > 2000) {
        throw new Error('Learnings must be less than 2000 characters');
      }

      const payload = {
        sessionId: actualSessionId,
        learnings: reflectionData.learnings.trim(),
        createdAt: new Date().toISOString()
      };

      console.log('Saving reflection with payload:', payload);

      const data = await apiRequest('/api/reflections', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (data.success) {
        return data.data.reflection._id || data.data.reflection.id;
      } else {
        throw new Error(data.message || 'Failed to save reflection');
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!learnings.trim()) {
      setError('Please write something about what you learned');
      return;
    }

    if (learnings.trim().length > 2000) {
      setError('Reflection must be less than 2000 characters');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const extractedSessionId = extractSessionId(sessionId);
      
      console.log('Submitting reflection:', {
        hasUser: !!user,
        hasToken: !!token,
        sessionId: extractedSessionId,
        learningsLength: learnings.trim().length
      });

      // Only save to database if user is logged in and we have a valid session ID
      if (user && token && extractedSessionId && validateSessionId(extractedSessionId)) {
        console.log('Attempting to save to cloud...');
        await saveReflectionToDatabase({
          learnings: learnings.trim(),
          sessionId: extractedSessionId
        });
        console.log('Successfully saved to cloud');
      } else {
        console.log('Saving locally only:', {
          reason: !user ? 'No user' : !token ? 'No token' : !extractedSessionId ? 'No session ID' : 'Invalid session ID'
        });
      }

      // Always call the onSubmit callback for local handling
      if (onSubmit) {
        await onSubmit({
          learnings: learnings.trim(),
          sessionId: extractedSessionId
        });
      }

      setLearnings("");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
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
            <p className="text-xs text-slate-500">
              1–3 sentences or bullet points ({learnings.length}/2000 characters)
            </p>
            <Textarea
              ref={textareaRef}
              id="learnings"
              placeholder="• Key insight or breakthrough&#10;• Challenge I overcame&#10;• Something I want to remember..."
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              className="min-h-[200px] resize-none font-normal"
              required
              disabled={isSaving}
              maxLength={2000}
            />
            <div className="text-xs text-slate-500 text-right">
              {learnings.length}/2000 characters
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">Error: {error}</p>
              <p className="text-xs text-red-600 mt-1">
                If this continues, try refreshing the page or check your connection.
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {user && token ? (
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