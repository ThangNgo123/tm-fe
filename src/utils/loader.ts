import { redirect } from "react-router";
import { isUserAuthenticated } from "@/stores/auth";

/**
 * Loader for public pages (auth pages)
 * Redirects to home if user is already authenticated
 */
export const nonAuthLoader = async () => {
  if (isUserAuthenticated()) {
    return redirect("/");
  }
  return null;
};

/**
 * Loader for protected pages
 * Redirects to login if user is not authenticated
 */
export const authLoader = async () => {
  if (!isUserAuthenticated()) {
    return redirect("/auth/login");
  }
  return null;
};
