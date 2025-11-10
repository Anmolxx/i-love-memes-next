export type Template = {
  id: string;
  name: string;
  img: string;
  status: "active" | "inactive";
  usedCount: number;
  createdAt: string; // ISO date string
};

export const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Funny Cat Meme",
    img: "/public/carousel/meme1.png",
    status: "active",
    usedCount: 1245,
    createdAt: "2025-10-01T09:15:00.000Z",
  },
  {
    id: "2",
    name: "Drake Pointing",
    img: "/public/carousel/meme2.png",
    status: "active",
    usedCount: 3402,
    createdAt: "2025-09-28T14:30:00.000Z",
  },
  {
    id: "3",
    name: "Distracted Boyfriend",
    img: "/public/carousel/meme3.png",
    status: "active",
    usedCount: 2156,
    createdAt: "2025-09-25T07:45:00.000Z",
  },
  {
    id: "4",
    name: "Woman Yelling at Cat",
    img: "/public/carousel/meme4.png",
    status: "inactive",
    usedCount: 890,
    createdAt: "2025-09-20T18:05:00.000Z",
  },
  {
    id: "5",
    name: "This is Fine Dog",
    img: "/public/carousel/meme5.png",
    status: "active",
    usedCount: 4521,
    createdAt: "2025-09-15T11:20:00.000Z",
  },
  {
    id: "6",
    name: "Surprised Pikachu",
    img: "/public/carousel/meme6.png",
    status: "active",
    usedCount: 6789,
    createdAt: "2025-09-10T16:45:00.000Z",
  },
  {
    id: "7",
    name: "Galaxy Brain",
    img: "/public/carousel/meme7.png",
    status: "active",
    usedCount: 1534,
    createdAt: "2025-09-05T13:22:00.000Z",
  },
  {
    id: "8",
    name: "Change My Mind",
    img: "/public/carousel/meme8.png",
    status: "inactive",
    usedCount: 678,
    createdAt: "2025-08-30T08:15:00.000Z",
  },
  {
    id: "9",
    name: "Arthur Fist",
    img: "/public/hero/hero-meme.png",
    status: "active",
    usedCount: 2987,
    createdAt: "2025-08-25T19:30:00.000Z",
  },
  {
    id: "10",
    name: "Success Kid",
    img: "/public/carousel/meme1.png",
    status: "active",
    usedCount: 3456,
    createdAt: "2025-08-20T12:10:00.000Z",
  },
  {
    id: "11",
    name: "Expanding Brain",
    img: "/public/carousel/meme2.png",
    status: "active",
    usedCount: 1876,
    createdAt: "2025-08-15T15:45:00.000Z",
  },
  {
    id: "12",
    name: "Two Buttons",
    img: "/public/carousel/meme3.png",
    status: "inactive",
    usedCount: 234,
    createdAt: "2025-08-10T10:30:00.000Z",
  },
  {
    id: "13",
    name: "Roll Safe",
    img: "/public/carousel/meme4.png",
    status: "active",
    usedCount: 5432,
    createdAt: "2025-08-05T14:20:00.000Z",
  },
  {
    id: "14",
    name: "Mocking SpongeBob",
    img: "/public/carousel/meme5.png",
    status: "active",
    usedCount: 2765,
    createdAt: "2025-07-30T17:55:00.000Z",
  },
  {
    id: "15",
    name: "Hide the Pain Harold",
    img: "/public/carousel/meme6.png",
    status: "active",
    usedCount: 1987,
    createdAt: "2025-07-25T09:40:00.000Z",
  },
];

export default mockTemplates;