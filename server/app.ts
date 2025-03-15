import "react-router";
import { createRequestHandler } from "@react-router/express";
import express from "express";

// Update the interface to include memberID
declare module "react-router" {
  interface AppLoadContext {
    memberID: number | null;
    isAuthenticated: boolean;
    groupID: string | null;
  }
}

export const app = express();

app.use(
  createRequestHandler({
    // @ts-expect-error - virtual module provided by React Router at build time
    build: () => import("virtual:react-router/server-build"),
    getLoadContext(req) {
      // Use type assertion to avoid TypeScript errors
      const session = (req as any).session;

      return {
        memberID: session?.memberID || null,
        isAuthenticated: !!session?.memberID,
        groupID: session?.groupID || null
      };
    },
  })
);
