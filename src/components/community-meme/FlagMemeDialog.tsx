// src/components/MemePage/FlagMemeDialog.tsx
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
              <SelectItem value="nsfw">NSFW: Content contains nudity.</SelectItem>
              <SelectItem value="nsfl">NSFL: Highly disturbing.</SelectItem>
              <SelectItem value="tw">Trigger Warning.</SelectItem>
              <SelectItem value="red_flag">Red Flag Emoji (🚩).</SelectItem>
            </SelectContent>
          </Select>

          <Input
            className="w-full"
            placeholder="Additional comments (optional)"
            value={flagComment}
            onChange={(e) => setFlagComment(e.target.value)}
          />

          <DialogFooter className="flex justify-end gap-2 cursor-pointer">
            <Button variant="outline" onClick={resetFlagDialog}>
              Cancel
            </Button>
            <Button onClick={submitFlag} disabled={!flagReason}>
              Submit
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}