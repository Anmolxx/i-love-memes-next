// "use client";

// import * as React from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { useAuthModal } from "@/hooks/use-auth-modal";
// import LoginPage from "@/app/auth/login/page";
// import useAuthentication from "@/hooks/use-authentication"

// export const AuthModal: React.FC = () => {
//   const { open, setOpen } = useAuthModal();
//   const { isLoggedIn } = useAuthentication();

//   React.useEffect(() => {
//       if (isLoggedIn && open) {
//         setOpen(false);
//       }
//     }, [isLoggedIn, open, setOpen]);
    
//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent className="w-[450px] max-w-full p-6 rounded-xl shadow-xl bg-gray-950 flex flex-col items-center justify-center">
//         <DialogHeader className="mb-4 text-center">
//           <DialogTitle className="text-2xl font-semibold text-white">
//             Welcome Back
//           </DialogTitle>
//           <DialogDescription className="text-gray-400">
//             Please sign in to continue
//           </DialogDescription>
//         </DialogHeader>
//         <div className="w-full">
//           <LoginPage />
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };
