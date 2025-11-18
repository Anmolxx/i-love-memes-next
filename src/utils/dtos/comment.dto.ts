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
  parentComment?: CommentDto | null;
  replyCount: number;
  depth: number;
  status: "ACTIVE" | "DELETED";
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
}