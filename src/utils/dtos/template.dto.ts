import { Tag } from "./tag.dto";

export interface Template{
  id: string;
  title: string;
  slug: string;
  description: string;
  config: any;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}