import { Client } from "@microsoft/microsoft-graph-client";
import type {
  Calendar as MicrosoftCalendar,
  Event as MicrosoftEvent,
} from "@microsoft/microsoft-graph-types";

import { CALENDAR_DEFAULTS } from "../constants/calendar";
import type { Calendar, CalendarEvent, CalendarProvider } from "./interfaces";
import {
  calendarPath,
  parseMicrosoftCalendar,
  parseMicrosoftEvent,
  toMicrosoftEvent,
} from "./microsoft-calendar/utils";
import { CreateCalendarInput, UpdateCalendarInput } from "../schemas/calendars";
import { CreateEventInput, UpdateEventInput } from "../schemas/events";

interface MicrosoftCalendarProviderOptions {
  accessToken: string;
}

export class MicrosoftCalendarProvider implements CalendarProvider {
  public providerId = "microsoft" as const;
  private graphClient: Client;

  constructor({ accessToken }: MicrosoftCalendarProviderOptions) {
    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => accessToken,
      },
    });
  }

  async calendars(): Promise<Calendar[]> {
    // Microsoft Graph API does not work without $select due to a bug
    const response = await this.graphClient
      .api("/me/calendars?$select=id,name,isDefaultCalendar")
      .get();
    const data = response.value as MicrosoftCalendar[];

    return data.map((calendar) => parseMicrosoftCalendar(calendar));
  }

  async createCalendar(calendarData: CreateCalendarInput): Promise<Calendar> {
    const createdCalendar = (await this.graphClient
      .api("/me/calendars")
      .post(calendarData)) as MicrosoftCalendar;

    return parseMicrosoftCalendar(createdCalendar);
  }

  async updateCalendar(
    calendarId: string,
    calendar: UpdateCalendarInput,
  ): Promise<Calendar> {
    const updatedCalendar = (await this.graphClient
      .api(calendarPath(calendarId))
      .patch(calendar)) as MicrosoftCalendar;

    return parseMicrosoftCalendar(updatedCalendar);
  }

  async deleteCalendar(calendarId: string): Promise<void> {
    if (calendarId === "primary") {
      throw new Error("Cannot delete primary calendar");
    }

    await this.graphClient.api(calendarPath(calendarId)).delete();
  }

  async events(
    calendarId: string,
    timeMin?: string,
    timeMax?: string,
  ): Promise<CalendarEvent[]> {
    const defaultTimeMin = new Date();
    const defaultTimeMax = new Date(
      Date.now() +
        CALENDAR_DEFAULTS.TIME_RANGE_DAYS_FUTURE * 24 * 60 * 60 * 1000,
    );

    const startTime = timeMin || defaultTimeMin.toISOString();
    const endTime = timeMax || defaultTimeMax.toISOString();

    const response = await this.graphClient
      .api(calendarPath(calendarId))
      .filter(
        `start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`,
      )
      .orderby("start/dateTime")
      .top(CALENDAR_DEFAULTS.MAX_EVENTS_PER_CALENDAR)
      .get();

    return (response.value as MicrosoftEvent[]).map((event: MicrosoftEvent) =>
      parseMicrosoftEvent(event),
    );
  }

  async createEvent(
    calendarId: string,
    event: CreateEventInput,
  ): Promise<CalendarEvent> {
    const createdEvent = (await this.graphClient
      .api(calendarPath(calendarId))
      .post(toMicrosoftEvent(event))) as MicrosoftEvent;

    return parseMicrosoftEvent(createdEvent);
  }

  /**
   * Updates an existing event
   *
   * @param calendarId - The calendar identifier
   * @param eventId - The event identifier
   * @param event - Partial event data for updates using UpdateEventInput interface
   * @returns The updated transformed Event object
   */
  async updateEvent(
    calendarId: string,
    eventId: string,
    event: UpdateEventInput,
  ): Promise<CalendarEvent> {
    const updatedEvent = (await this.graphClient
      .api(`${calendarPath(calendarId)}/events/${eventId}`)
      .patch(toMicrosoftEvent(event))) as MicrosoftEvent;

    return parseMicrosoftEvent(updatedEvent);
  }

  /**
   * Deletes an event from the calendar
   *
   * @param calendarId - The calendar identifier
   * @param eventId - The event identifier
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.graphClient
      .api(`${calendarPath(calendarId)}/events/${eventId}`)
      .delete();
  }
}
