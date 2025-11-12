// src/types/meme-types.ts

// --- API Request/Response Types ---

// Type for the POST /interactions body (Upvote/Downvote/Report/Flag)
export type VoteType = 'UPVOTE' | 'DOWNVOTE' | 'REPORT' | 'FLAG';

export interface PostInteractionBody {
  memeId: string;
  type: VoteType;
  reason?: string;
  note?: string; // Corresponds to the 'note' field in your POST example
}

// Type for the response from GET /interactions/memes/{slugOrid}/summary
export interface InteractionSummary {
  upvoteCount: number;
  downvoteCount: number;
  reportCount: number;
  flagCount: number;
  netScore: number;
  userInteraction?: {
    type: VoteType;
    createdAt: string;
  };
}

// --- Frontend Component State Type ---

// Base Meme object fetched from GET /memes
export interface BaseMeme {
  id: string;
  title: string;
  description: string;
  slug: string;
  file: { id: string; path: string };
  author: { id: string; email: string };
  audience: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Meme type used in the component state (combines BaseMeme with interaction data)
export interface Meme extends BaseMeme {
  upvoteCount: number;
  downvoteCount: number;
  netScore: number;
  userVoteType: 'UPVOTE' | 'DOWNVOTE' | 'NONE'; // Simplified for the component
  isVoting?: boolean; // Optional flag to disable buttons during API calls
}