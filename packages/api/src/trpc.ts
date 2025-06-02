import "server-only";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "@repo/auth/server";
import { db } from "@repo/db";

import { accountToProvider } from "./providers";
import { getAllAccounts } from "./utils/accounts";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    db,
    session: session?.session,
    user: session?.user,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session },
      user: { ...ctx.user },
    },
  });
});

export const accountsProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const accounts = await getAllAccounts(ctx.user, ctx.headers);

    return next({
      ctx: {
        ...ctx,
        accounts,
      },
    });
  },
);

export const calendarProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const accounts = await getAllAccounts(ctx.user, ctx.headers);

    const providers = accounts.map((account) => ({
      account,
      client: accountToProvider(account),
    }));

    return next({
      ctx: {
        ...ctx,
        providers,
        accounts,
      },
    });
  },
);
