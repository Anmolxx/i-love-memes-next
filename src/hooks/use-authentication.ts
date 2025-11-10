import { useApplicationUserContext } from "@/context/ApplicationUser";

export default function useAuthentication() {
  const {
    user,
    isLoading: isLoadingUserDetails,
    isLoggedIn,
    refetch,
    isAdmin
  } = useApplicationUserContext();

  return {
    user,
    isLoadingUserDetails,
    isLoggedIn,
    refetch,
    isAdmin
  };
}
