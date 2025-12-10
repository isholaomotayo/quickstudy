"use client";

import { useState, useRef } from "react";
import { useUser } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Editor } from "@tinymce/tinymce-react";
import { editorInit } from "@/helpers/tinyMCE";
import { TINYMCE_KEY } from "@/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Send, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface CreateAnnouncementDialogProps {
  onAnnouncementCreated: () => void;
}

export function CreateAnnouncementDialog({ onAnnouncementCreated }: CreateAnnouncementDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const { userData } = useUser();
  const editorRef = useRef<any>(null);

  // Check if user can create announcements
  const canCreateAnnouncements = userData && userData.role &&
    ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"].includes(userData.role);

  const handleEditorChange = (content: string) => {
    setBody(content);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData) {
      toast.error("Please log in to create announcements");
      return;
    }

    // Get content from TinyMCE editor
    const editorContent = editorRef.current ? editorRef.current.getContent() : body;

    if (!title || !editorContent) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/schoolAnnouncement", {
        method: "POST",
        credentials: "include", // Automatically sends cookies securely
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          body: editorContent,
          user_id: userData?.id,
          institution_id: userData?.institution_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create announcement");
      }

      const newAnnouncement = await response.json();
      
      toast.success("Announcement created successfully!");
      
      // Reset form
      setTitle("");
      setBody("");
      if (editorRef.current) {
        editorRef.current.setContent("");
      }
      setOpen(false);
      
      // Refresh the notifications list
      onAnnouncementCreated();
      
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      toast.error(error.message || "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };

  if (!canCreateAnnouncements) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[900px] max-w-[90vw] max-h-[80vh] overflow-y-auto" style={{ width: '900px', maxWidth: '90vw' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Create New Announcement
          </DialogTitle>
          <DialogDescription>
            Share important information with all users in your institution.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              placeholder="Enter announcement title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              {title?.length || 0}/200 characters
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="body" className="text-sm font-medium">
              Message <span className="text-red-500">*</span>
            </label>
            <div className="border rounded-md overflow-hidden">
              <Editor
                apiKey={TINYMCE_KEY}
                onInit={(evt, editor) => editorRef.current = editor}
                initialValue=""
                init={editorInit(350, false)}
                onEditorChange={handleEditorChange}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Rich text editor with image upload support
            </p>
          </div>

          {!title || !body ? (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Please fill in all required fields</span>
            </div>
          ) : null}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title || !body}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Create
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}