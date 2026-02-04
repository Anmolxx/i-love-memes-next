export interface RoleDto {
  id: number;
  name: string;
  __entity: string;
}

export interface StatusDto {
  id: number;
  name: string;
  __entity: string;
}

export interface User {
  id: string;
  email: string;
  provider: string;
  socialId: string | null;
  firstName: string;
  lastName: string;
  role: RoleDto;
  status: StatusDto;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}