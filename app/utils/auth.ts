// app/utils/auth.ts
import { redirect } from "react-router";

// Function to check if user is authenticated
export function isAuthenticated(context: any) {
  return !!context.memberID;
}

// Function to get the current user ID
export function getCurrentMemberID(context: any) {
  return context.memberID || null;
}

// Function to get the current group ID
export function getCurrentGroupID(context: any) {
    return context.groupID || null;
}

// Function to require authentication (use in protected route loaders)
export function requireAuth(context: any, redirectTo = "/login") {
  if (!isAuthenticated(context)) {
    const params = new URLSearchParams();
    params.set("redirectTo", window.location.pathname);
    return redirect(`${redirectTo}?${params.toString()}`);
  }
  return null;
}

// Helper to get common auth data for components
export function getAuthData(context: any) {
  return {
    isLoggedIn: isAuthenticated(context),
    memberID: getCurrentMemberID(context),
    groupID: getCurrentGroupID(context),
  };
}
