export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string; // ISO date string
  active: boolean;
};

export const mockUsers: User[] = [
  {
    id: "1",
    firstName: "Ava",
    lastName: "Smith",
    email: "ava.smith@example.com",
    createdAt: "2025-10-01T09:15:00.000Z",
    active: true,
  },
  {
    id: "2",
    firstName: "Liam",
    lastName: "Johnson",
    email: "liam.johnson@example.com",
    createdAt: "2025-09-21T14:30:00.000Z",
    active: false,
  },
  {
    id: "3",
    firstName: "Mia",
    lastName: "Williams",
    email: "mia.williams@example.com",
    createdAt: "2025-08-12T07:45:00.000Z",
    active: true,
  },
  {
    id: "4",
    firstName: "Noah",
    lastName: "Brown",
    email: "noah.brown@example.com",
    createdAt: "2025-07-30T18:05:00.000Z",
    active: true,
  },
  {
    id: "5",
    firstName: "Olivia",
    lastName: "Jones",
    email: "olivia.jones@example.com",
    createdAt: "2025-06-17T11:20:00.000Z",
    active: false,
  },
  {
    id: "6",
    firstName: "Ethan",
    lastName: "Garcia",
    email: "ethan.garcia@example.com",
    createdAt: "2025-05-04T22:10:00.000Z",
    active: true,
  },
  {
    id: "7",
    firstName: "Sophia",
    lastName: "Martinez",
    email: "sophia.martinez@example.com",
    createdAt: "2025-04-12T13:50:00.000Z",
    active: true,
  },
  {
    id: "8",
    firstName: "Lucas",
    lastName: "Davis",
    email: "lucas.davis@example.com",
    createdAt: "2025-03-03T05:40:00.000Z",
    active: false,
  },
  {
    id: "9",
    firstName: "Isabella",
    lastName: "Lopez",
    email: "isabella.lopez@example.com",
    createdAt: "2025-02-18T16:25:00.000Z",
    active: true,
  },
  {
    id: "10",
    firstName: "Mason",
    lastName: "Gonzalez",
    email: "mason.gonzalez@example.com",
    createdAt: "2025-01-07T08:00:00.000Z",
    active: false,
  },
];

export default mockUsers;
