import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { prisma } from "../../db";
import { z } from "zod";
import { createId } from "../../../utils/id";
import { TRPCError } from "@trpc/server";

export const linksRouter = createTRPCRouter({
  getLinks: protectedProcedure.query(async ({ ctx }) => {
    const links = await prisma.link.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return links;
  }),

  createLink: protectedProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input: { url }, ctx }) => {
      const res = await prisma.link.create({
        data: {
          id: createId(),
          userId: ctx.session.user.id,
          url,
        },
      });
      return res;
    }),

  getLink: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id } }) => {
      console.log(id);
      const link = await prisma.link.findFirst({
        where: {
          id,
        },
      });
      console.log(link);
      return link;
    }),

  deleteLink: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const link = await prisma.link.findFirst({
        where: {
          id,
        },
      });
      if (!link)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "inavlid id",
        });

      if (link.userId !== ctx.session.user.id)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "you do not own this link",
        });

      await prisma.link.delete({
        where: {
          id,
        },
      });
    }),
});
