export interface CommentDto {
  id: string;
  content: string;
  meme: {
    id: string;
    title: string;
    slug: string;
    description: string;
    audience: string;
    createdAt: string;
    updatedAt: string;
  };
  author: {
    id: string;
    email: string;
    provider: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: string;
    updatedAt: string;
    username?: string;
  };
  parentComment?: {
    id: string;
  }
  replyCount: number;
  depth: number;
  status: "ACTIVE" | "DELETED";
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
}

export interface CommentEntity extends CommentDto {
  parentId: string | null;    
  replyIds: string[];       
  loadedPages: number;         
  hasMoreReplies: boolean;    
}

export interface NestedComment extends CommentEntity {
  replies: NestedComment[];
}

//delete comment
export type DeleteCommentResponse = void;

//get comments (by memeId)
export type CommentSortOptions = 'newest' | 'oldest' | 'popular';