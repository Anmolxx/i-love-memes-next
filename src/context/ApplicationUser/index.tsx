import { selectIsLoggedIn } from "@/redux/slices/auth";
import { useTypedSelector } from "@/redux/store";
import { createContext, useContext, useMemo } from "react";
import { useCurrentUserDataQuery } from "@/redux/services/auth";

export interface IApplicationUserContext {
  user: any | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  refetch: () => void;
  isAdmin: boolean;
}

export const ApplicationUserContext = createContext<IApplicationUserContext>(
  {} as IApplicationUserContext
);

export const useApplicationUserContext = () => {
  const context = useContext(ApplicationUserContext);

  if (!context) {
    throw new Error(
      "useApplicationUserContext must be used within a ApplicationUserContextProvider"
    );
  }

  return context;
};

export const ApplicationUserContextProvider = (props: any) => {
  const isLoggedIn = useTypedSelector(selectIsLoggedIn);

  const {
    data: userData,
    isLoading: isUserDataLoading,
    refetch,
  } = useCurrentUserDataQuery(undefined, {
    skip: !isLoggedIn,
  });

  const user = useMemo<any | null>(() => {
    if (isUserDataLoading || !userData) {
      return null;
    }
    return userData;
  }, [isUserDataLoading, userData]);

  const isAdmin = useMemo(() => {
    return userData?.role?.name === "Admin";
  }, [userData?.role?.name]); 

  return (
    <ApplicationUserContext.Provider
      value={{
        user,
        isLoading: isUserDataLoading,
        isLoggedIn,
        refetch,
        isAdmin,
      }}
    >
      {props.children}
    </ApplicationUserContext.Provider>
  );
};

export default ApplicationUserContext;
