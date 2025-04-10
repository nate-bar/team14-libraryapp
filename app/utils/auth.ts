// app/utils/auth.ts
import { redirect } from "react-router";

export function isAuthenticated(context: any) {
  return !!context.memberID;
}

export function getCurrentMemberID(context: any) {
  return context.memberID || null;
}

export function getCurrentGroupID(context: any) {
  return context.groupID || null;
}

// Adding more member information

export function getCurrentEmail(context: any) {
  return context.email || null;
}

export function getCurrentFirstName(context: any) {
  return context.firstName || null;
}

export function getCurrentLastName(context: any) {
  return context.lastName || null;
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
    firstName: getCurrentFirstName(context),
    lastName: getCurrentLastName(context),
    email: getCurrentEmail(context),
  };
}
