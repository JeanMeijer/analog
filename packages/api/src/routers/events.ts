import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { dateInputSchema } from "../providers/validations";
import { calendarProcedure, createTRPCRouter } from "../trpc";

export const eventsRouter = createTRPCRouter({
  list: calendarProcedure
    .input(
      z.object({
        calendarIds: z.array(z.string()).default([]),
        timeMin: z.string().optional(),
        timeMax: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const allEvents = await Promise.all(
        ctx.providers.map(async ({ client, account }) => {
          let calendarIds = input.calendarIds;

          if (calendarIds.length === 0) {
            try {
              const calendars = await client.calendars();

              calendarIds = calendars.map((cal) => cal.id).filter(Boolean);
            } catch (error) {
              console.error(
                `Failed to fetch calendars for provider ${account.providerId}:`,
                error,
              );
              return [];
            }
          }

          const providerEvents = await Promise.all(
            calendarIds.map(async (calendarId) => {
              return await client.events(
                calendarId,
                input.timeMin,
                input.timeMax,
              );
            }),
          );

          return providerEvents.flat();
        }),
      );

      const events = allEvents
        .flat()
        .sort(
          (a, b) =>
            new Date(a.start.dateTime).getTime() -
            new Date(b.start.dateTime).getTime(),
        );

      return { events };
    }),

  create: calendarProcedure
    .input(
      z.object({
        accountId: z.string(),
        calendarId: z.string(),
        title: z.string(),
        start: dateInputSchema,
        end: dateInputSchema,
        allDay: z.boolean().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { accountId, calendarId, ...data } = input;

      const provider = ctx.providers.find(
        ({ account }) => account.accountId === accountId,
      );

      if (!provider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${accountId}`,
        });
      }

      const event = await provider.client.createEvent(calendarId, data);

      return { event };
    }),

  update: calendarProcedure
    .input(
      z.object({
        accountId: z.string(),
        calendarId: z.string(),
        eventId: z.string(),
        title: z.string().optional(),
        start: dateInputSchema.optional(),
        end: dateInputSchema.optional(),
        allDay: z.boolean().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { accountId, calendarId, eventId, ...data } = input;

      const provider = ctx.providers.find(
        ({ account }) => account.accountId === accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${accountId}`,
        });
      }

      const event = await provider.client.updateEvent(
        calendarId,
        eventId,
        data,
      );

      return { event };
    }),

  delete: calendarProcedure
    .input(
      z.object({
        accountId: z.string(),
        calendarId: z.string(),
        eventId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) => account.accountId === input.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }

      await provider.client.deleteEvent(input.calendarId, input.eventId);

      return { success: true };
    }),
});
