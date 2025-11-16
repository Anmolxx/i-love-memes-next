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
 