import React from 'react';
import { CalendarEvent } from '../types/models';

export interface CalendarDisplayProps {
  events: CalendarEvent[];
  viewMode: 'weekly' | 'monthly';
}

/**
 * Main component rendering the calendar grid
 * Optimized for Samsung Frame TV viewing
 */
export const CalendarDisplay: React.FC<CalendarDisplayProps> = ({ events, viewMode }) => {
  return (
    <div className="calendar-display" style={{ fontSize: '24px', minHeight: '100vh' }}>
      <h1>Family Calendar</h1>
      <div className="calendar-grid">
        {/* TODO: Implement calendar grid layout */}
        <p>View Mode: {viewMode}</p>
        <p>Events: {events.length}</p>
      </div>
    </div>
  );
};
