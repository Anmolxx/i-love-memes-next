export enum InteractionType {
  UPVOTE = "UPVOTE",
  DOWNVOTE = "DOWNVOTE",
  FLAG = "FLAG",
  REPORT = "REPORT",
}

export interface InteractionDto {
  memeId: string;
  type: InteractionType;
  reason?: string;
  note?: string;  
}

export interface DeleteInteractionDto {
  memeId: string;
  type: InteractionType.UPVOTE | InteractionType.DOWNVOTE; 
}

export interface UserInteraction {
  type: "UPVOTE" | "DOWNVOTE" | "REPORT" | "FLAG";
  createdAt: string;
  reason?: string | null;
  note?: string | null;
}

export interface InteractionSummary{
  upvoteCount: number;
  downvoteCount: number;
  reportCount: number;
  flagCount: number;
  netScore: number;
  userInteractions?: UserInteraction[];
}