import React from 'react';
import { CalendarEvent } from '../types/models';

export interface EventCardProps {
  event: CalendarEvent;
}

/**
 * Individual event display component with styling for TV viewing
 * Ensures high contrast and large fonts
 */
export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div
      className="event-card"
      style={{
        backgroundColor: event.color,
        padding: '16px',
        margin: '8px',
        borderRadius: '8px',
        fontSize: '24px',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0' }}>{event.title}</h3>
      {event.isAllDay ? (
        <p>All Day</p>
      ) : (
        <p>
          {new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}
        </p>
      )}
      {event.location && <p>📍 {event.location}</p>}
      {event.description && <p>{event.description}</p>}
      <p style={{ fontSize: '18px', opacity: 0.8 }}>👤 {event.familyMember}</p>
    </div>
  );
};
