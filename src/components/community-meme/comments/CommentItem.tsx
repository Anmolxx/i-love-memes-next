import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommentEntity } from "@/utils/dtos/comment.dto";
import {
  Edit,
  Trash2,
  CornerDownRight,
  User,
  RectangleEllipsis,
  CircleCheck, 
  CircleX,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useCommentManagement } from "@/hooks/use-comment-management";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; 
import { CommentContent } from "./CommentContent";

export interface CommentItemProps {
  comment: CommentEntity;
  isLoggedIn: boolean;
  onDelete: (id: string, parentId?: string) => Promise<void>;
  onUpdate: (id: string, content: string, parentId?: string) => Promise<void>;
  onReply: (content: string, parentId: string) => Promise<void>;
  onToggleReplies: (id: string, show: boolean) => void;
  showingReplies: Set<string>;
}

const handleApiError = (err: any) => {
  const apiError = err?.data;

  if (apiError?.errors && typeof apiError.errors === "object") {
    Object.values(apiError.errors).forEach((msg: any) => {
      if (typeof msg === "string") toast.error(msg);
    });
  } else if (apiError?.message) {
    toast.error(apiError.message);
  } else {
    toast.error("Failed to perform action");
  }
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isLoggedIn,
  onDelete,
  onUpdate,
  onReply,
}) => {
  const { currentUserId } = useCommentManagement();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState(comment.content);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleStartEditing = () => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setReplyingToCommentId(null);
  };

  const handleEditSubmit = async () => {
    if (!editingContent.trim()) return;

    try {
      await onUpdate(comment.id, editingContent, comment.parentCommentId);
      setEditingCommentId(null);
    } catch (err: any) {
      handleApiError(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent(comment.content); 
  };

  const handleDelete = async () => {
    try {
      await onDelete(comment.id, comment.parentCommentId);
    } catch (err: any) {
      handleApiError(err);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    try {
      await onReply(replyContent, comment.id);
      setReplyingToCommentId(null);
      setReplyContent("");
    } catch (err: any) {
      handleApiError(err);
    }
  };

  const authorName =
    comment.author.firstName && comment.author.lastName
      ? `${comment.author.firstName} ${comment.author.lastName}`
      : comment.author.username || comment.author.email;

  const isOwner = currentUserId === comment.author.id;

  return (
    <div className={`flex flex-col ${comment.depth > 0 ? "pl-8 relative" : "mt-2"}`}>
  
      {comment.depth > 0 && (
        <div className="absolute top-0 left-4 w-[2px] h-full bg-gray-300 rounded-full"></div>
      )}

      <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm relative z-10">
        
        {isLoggedIn && isOwner && (
          <div className="absolute top-3 right-3 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-100">
                  <RectangleEllipsis className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleStartEditing} 
                  disabled={editingCommentId === comment.id}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-xs bg-gray-300">
              {comment.author.firstName?.[0] || <User className="w-4 h-4 text-gray-600" />}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-semibold text-gray-800">{authorName}</p>
        </div>

        {/* Edit Mode */}
        {editingCommentId === comment.id ? (
          <div className="flex gap-2 items-start mt-1 pl-9">
            <Input
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="flex-grow"
              onKeyDown={(e) => {
                if (e.key === "Enter" && editingContent.trim()) handleEditSubmit();
                if (e.key === "Escape") handleCancelEdit();
              }}
              autoFocus
            />
            <Button 
              onClick={handleEditSubmit} 
              disabled={!editingContent.trim()} 
              size="icon" 
              className="bg-green-500 hover:bg-green-600"
              title="Save Edit"
            >
              <CircleCheck className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCancelEdit}
              title="Cancel Edit"
            >
              <CircleX className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ) : (
          <div className="mt-1 pl-9">
            <CommentContent content={comment.content} />
          </div>
          
        )}

        <div className="flex gap-4 text-xs mt-1 pl-9">
          <Button
            variant="link"
            size="sm"
            className="text-gray-500 hover:text-blue-500 p-0 h-auto cursor-pointer"
            onClick={() => {
              setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id);
              setEditingCommentId(null);
            }}
          >
            <CornerDownRight className="w-3 h-3 mr-1" />
            Reply
          </Button>
        </div>

        {replyingToCommentId === comment.id && isLoggedIn && (
          <div className="flex gap-2 items-start mt-2 pl-9">
            <Input
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="flex-grow"
              onKeyDown={(e) => {
                if (e.key === "Enter" && replyContent.trim()) handleReplySubmit();
              }}
            />
            <Button onClick={handleReplySubmit} disabled={!replyContent.trim()} size="sm">
              Reply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;