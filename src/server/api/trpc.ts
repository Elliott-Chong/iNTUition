import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import jwt from "jsonwebtoken";

import { prisma } from "../db";

type CreateContextOptions = Record<string, never>;

export const createTRPCContext = (_opts: CreateNextContextOptions) => {
  return {
    prisma,
    req: _opts.req,
  };
};

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import Users from "../../../models/User";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;

const isAuthorized = t.middleware(async ({ ctx, next }) => {
  const { req } = ctx;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new TRPCError({ code: "BAD_REQUEST" });
  }
  const user_id = await jwt?.decode(token, process.env.JWT_SECRET);
  if (!user_id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const user = await Users.findById(user_id.user.id);
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { ...ctx, user } });
});
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuthorized);
