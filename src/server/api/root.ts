import { createTRPCRouter } from "./trpc";
import { linksRouter } from "./routers/links";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  links: linksRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
