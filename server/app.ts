// server/app.ts

// This is the bridge between the express server and React Router

import "react-router";
import { createRequestHandler } from "@react-router/express";
import express from "express";

// (2) add middleName here and in getLoadContext
declare module "react-router" {
  interface AppLoadContext {
    memberID: number;
    isAuthenticated: boolean;
    groupID: string;
    firstName: string;
    lastName: string;
    email: string;
  }
}

export const app = express();

app.use(
  createRequestHandler({
    // @ts-expect-error - virtual module provided by React Router at build time
    build: () => import("virtual:react-router/server-build"),

    // Gets user session data from the session request and passes
    // it to React Router, making it available to your loader functions
    // as the context parameter.
    getLoadContext(req) {
      // Use type assertion to avoid TypeScript errors
      const session = (req as any).session;

      // Here we add the firstName globally to the context.
      return {
        memberID: session?.memberID || null,
        isAuthenticated: !!session?.memberID,
        groupID: session?.groupID || null,
        firstName: session?.firstName || "", // Make sure firstName is available
        lastName: session?.lastName || "",
        email: session?.email || "",
      };
    },
  })
);
