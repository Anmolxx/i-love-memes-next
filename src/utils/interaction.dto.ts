// interaction.dto.ts

/** Enum representing the allowed interaction types for memes */
export enum InteractionType {
  UPVOTE = "UPVOTE",
  DOWNVOTE = "DOWNVOTE",
  FLAG = "FLAG",
  REPORT = "REPORT",
}

/** DTO for submitting a vote or interaction */
export interface InteractionDto {
  memeId: string;
  type: InteractionType;
  reason?: string; // optional, e.g., for REPORT
  note?: string;   // optional comment
}

/** DTO for deleting a vote */
export interface DeleteInteractionDto {
  memeId: string;
  type: InteractionType.UPVOTE | InteractionType.DOWNVOTE; // only votes can be deleted
}
