import { Tag } from "./tag.dto"
import { InteractionSummary } from "./interaction.dto";

interface Template {
  id: string;
  slug: string;
  title: string;
}

export interface Meme {
  id: string;
  title: string;
  description: string;
  slug: string;
  template: Template; 
  file: { 
    id: string; 
    path: string; 
  };
  author: { 
    id: string; 
    email: string; 
    firstName?: string; 
    lastName?: string; 
  };
  audience: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tags?: Tag[];
  interactionSummary?: InteractionSummary;     
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export type GetMemesResponse = PaginatedResponse<Meme>;

//api-request-params
export type MemeOrderBy = 
  | "createdAt"
  | "updatedAt"
  | "title"
  | "upvotes"
  | "downvotes"
  | "reports"
  | "trending"
  | "score";

export type SortOrder = "ASC" | "DESC";

export type InteractionType = "UPVOTE" | "DOWNVOTE" | "REPORT" | "FLAG";

export type InteractionReason = 
  | "SPAM" 
  | "INAPPROPRIATE" 
  | "COPYRIGHT" 
  | "NSFW" 
  | "HARASSMENT" 
  | "VIOLENCE" 
  | "OTHER";

export interface GetMemesArgs {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  order?: SortOrder;
  orderBy?: MemeOrderBy;
  reported?: boolean;
  interactionType?: InteractionType; 
  reasons?: InteractionReason;        
}

