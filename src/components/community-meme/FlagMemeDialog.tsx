// FlagMemeDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FlagMemeDialogProps {
  memeId: string;
  flagMemeId: string | null;
  flagReason: string;
  setFlagReason: (reason: string) => void;
  flagComment: string;
  setFlagComment: (comment: string) => void;
  submitFlag: () => void;
  resetFlagDialog: () => void;
  isSubmitting: boolean;
}

export default function FlagMemeDialog({
  memeId,
  flagMemeId,
  flagReason,
  setFlagReason,
  flagComment,
  setFlagComment,
  submitFlag,
  resetFlagDialog,
  isSubmitting,
}: FlagMemeDialogProps) {
  
  return (
    <Dialog open={flagMemeId === memeId} onOpenChange={resetFlagDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Flag Meme</DialogTitle>
          <DialogDescription>Reason for flagging this meme</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={flagReason} onValueChange={setFlagReason}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="SPAM">Spam: Unwanted or repetitive content</SelectItem>
                <SelectItem value="INAPPROPRIATE">Inappropriate: Offensive or harmful content</SelectItem>
                <SelectItem value="COPYRIGHT">Copyright: Violates intellectual property</SelectItem>
                <SelectItem value="NSFW">NSFW: Content contains nudity or sexual material</SelectItem>
                <SelectItem value="HARASSMENT">Harassment: Bullying or targeted abuse</SelectItem>
                <SelectItem value="VIOLENCE">Violence: Graphic or violent content</SelectItem>
                <SelectItem value="OTHER">Other: Any other issue</SelectItem>
              </SelectContent>
          </Select>

          <Input
            className="w-full"
            placeholder="Additional comments (optional)"
            value={flagComment}
            onChange={(e) => setFlagComment(e.target.value)}
          />

          <DialogFooter className="flex justify-end gap-2 cursor-pointer">
            <Button variant="outline" onClick={resetFlagDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitFlag} disabled={!flagReason || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}