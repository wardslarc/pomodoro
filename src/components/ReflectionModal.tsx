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
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

interface ReflectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string | null;
  onSubmit?: () => void;  
}

const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  onOpenChange,
  sessionId,
  onSubmit,
}) => {
  const { user } = useAuth();
  const [learnings, setLearnings] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent dialog from closing when pressing Escape while typing
    if (e.key === 'Escape' && learnings.trim().length > 0) {
      e.stopPropagation();
      return;
    }
    
    // Allow spacebar to work normally in textarea
    if (e.key === ' ' && e.target === textareaRef.current) {
      e.stopPropagation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!sessionId) {
      console.warn("Reflection submitted without sessionId");
    }

    setIsSaving(true);

    try {
      const reflectionsRef = collection(db, "users", user.uid, "reflections");

      await addDoc(reflectionsRef, {
        learnings: learnings.trim(),
        sessionId: sessionId || null,
        createdAt: serverTimestamp(),
      });

      setLearnings("");
      onOpenChange(false);
      
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error("Failed to save reflection:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    setLearnings("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[80vh] bg-white"
        onKeyDown={handleKeyDown}
        onInteractOutside={(e) => {
          // Prevent closing when clicking outside if there's content
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
              onKeyDown={(e) => {
                // Allow Tab key for accessibility
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  // Insert tab character
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const newValue = learnings.substring(0, start) + '\t' + learnings.substring(end);
                  setLearnings(newValue);
                  // Set cursor position after tab
                  setTimeout(() => {
                    if (textareaRef.current) {
                      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
                    }
                  }, 0);
                }
              }}
            />
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
        
        {/* Optional: Add a warning when trying to close with unsaved content */}
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