import { z } from "zod";
import Users from "../../../../models/User";

import { createTRPCRouter, privateProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getMe: privateProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  addTransaction: privateProcedure
    .input(
      z.object({
        amount: z.number(),
        timestamp: z.date(),
        to: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { amount, timestamp, to } = input;
      const transaction = {
        to,
        amount,
        timestamp,
      };

      const new_transactions = user.transactions;
      new_transactions.push(transaction);
      user.transactions = new_transactions;
      await user.save();
      return user;
    }),
});
