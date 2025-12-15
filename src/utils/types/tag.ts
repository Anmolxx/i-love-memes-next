export interface Tag {
  id: string;
  name: string;
  normalizedName: string;
  slug: string;
  category: string;
  description?: string;
  usageCount?: number;
  status?: "ACTIVE" | "INACTIVE" | string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
