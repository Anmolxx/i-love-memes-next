"use server";
import { ADMIN_AUTH_TOKEN, AUTH_TOKEN } from "@/contracts/reduxResourceTags";
import { cookies } from "next/headers";

export const setAuthCookie = async (key: string, token: string, days?: number) => {
  const expires = days
    ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    : undefined;
  (await cookies()).set(key, token, { expires });
};

export const checkAuthCookie = async (cookieName: string) => {
  return (await cookies()).get(cookieName) !== undefined;
};

export async function removeAuthCookies() {
  (await cookies()).set(AUTH_TOKEN, "", { expires: new Date(0) });
  (await cookies()).set(ADMIN_AUTH_TOKEN, "", { expires: new Date(0) });
}
