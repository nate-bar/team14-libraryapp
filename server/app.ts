// server/app.ts

// this is the bridge between express server and react router

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

    // gets user session data from the session request and passes
    // it to react router which makes it available to your loader
    // functions as the context parameter
    getLoadContext(req) {
      // Use type assertion to avoid TypeScript errors
      const session = (req as any).session;

      return {
        memberID: session?.memberID || null,
        isAuthenticated: !!session?.memberID,
        groupID: session?.groupID || null,
        firstName: session?.firstName,
        lastName: session?.lastName,
        email: session?.email,
        // (2) alright now go to //utils/auth.ts
      };
    },
  })
);
