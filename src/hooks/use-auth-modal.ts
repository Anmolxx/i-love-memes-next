import { create } from "zustand";

interface AuthModalState {
  open: boolean;
  setOpen: (value: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useAuthModal = create<AuthModalState>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
