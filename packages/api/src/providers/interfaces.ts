import { Temporal } from "temporal-polyfill";

import type { CreateEventInput, UpdateEventInput } from "../schemas/events";

export type TemporalDate =
  | Temporal.PlainDate
  | Temporal.Instant
  | Temporal.ZonedDateTime;

export interface Calendar {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  timeZone?: string;
  primary: boolean;
  accountId: string;
}

export interface Category {
  id: string;
  provider?: string;
  title?: string;
  updated?: string;
}

export interface Task {
  id: string;
  title?: string;
  categoryId?: string;
  status?: string;
  completed?: string;
  notes?: string;
  due?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  end: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  allDay?: boolean;
  location?: string;
  status?: string;
  url?: string;
  color?: string;
  providerId: string;
  accountId: string;
  calendarId: string;
}

export interface ProviderOptions {
  accessToken: string;
}

export interface CalendarProvider {
  providerId: "google" | "microsoft";
  calendars(): Promise<Calendar[]>;
  createCalendar(
    calendar: Omit<Calendar, "id" | "providerId">,
  ): Promise<Calendar>;
  updateCalendar(
    calendarId: string,
    calendar: Partial<Calendar>,
  ): Promise<Calendar>;
  deleteCalendar(calendarId: string): Promise<void>;
  events(
    calendarId: string,
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
  ): Promise<CalendarEvent[]>;
  createEvent(
    calendarId: string,
    event: CreateEventInput,
  ): Promise<CalendarEvent>;
  updateEvent(
    calendarId: string,
    eventId: string,
    event: UpdateEventInput,
  ): Promise<CalendarEvent>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
}


export interface TaskProvider {
  providerId: "google" | "microsoft";
  categories(): Promise<Category[]>;
  tasks(): Promise<Task[]>;
  tasksForCategory(category: Category): Promise<Task[]>;
  createTask(category: Category, task: Omit<Task, "id">): Promise<Task>;
  updateTask(category: Category, task: Partial<Task>): Promise<Task>;
  deleteTask(category: Category, taskId: string): Promise<void>;
}