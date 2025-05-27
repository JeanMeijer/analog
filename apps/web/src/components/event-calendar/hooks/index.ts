/**
 * Event Calendar Hooks
 *
 * Centralized exports for all custom hooks used throughout the event calendar.
 * Organized by functionality for better maintainability.
 */

// Focused logic hooks
export { useCalendarNavigation } from "./use-calendar-navigation";
export { useEventDialog } from "./use-event-dialog";
export { useEventOperations } from "./use-event-operations";

// View-specific hooks
export { useEventCollection } from "./use-event-collection";
export { useGridLayout } from "./use-grid-layout";

// Utility hooks
export { useCurrentTimeIndicator } from "./use-current-time-indicator";
export { useEventVisibility } from "./use-event-visibility";
export { useViewPreferences } from "./use-view-preferences";
