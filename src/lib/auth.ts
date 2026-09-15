import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./session";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}
