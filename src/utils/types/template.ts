import { Tag } from "./tag";

//api-response
export interface Template{
  id: string;
  title: string;
  slug: string;
  description: string;
  config: any;
  author: { 
      id: string; 
      email: string; 
    };
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export type GetTemplatesResponse = PaginatedResponse<Template>;

//api-request params
export type TemplateOrderBy = "createdAt" | "updatedAt" | "title";
export type SortOrder = "ASC" | "DESC";

//get templates
export interface GetTemplatesArgs {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  order?: SortOrder;
  orderBy?: TemplateOrderBy;
}

//delete templates
export type DeleteTemplateArgs = string;
export type DeleteTemplateResponse = void;

//permanent-delete | restore templates;
export type TemplateMutationArg = string;
export type EmptyResponse = void;