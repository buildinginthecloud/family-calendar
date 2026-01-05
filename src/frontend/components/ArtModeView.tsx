import React from 'react';
import { CalendarEvent } from '../types/models';

export interface ArtModeViewProps {
  upcomingEvents: CalendarEvent[];
}

/**
 * Minimal calendar view for Frame TV Art Mode
 */
export const ArtModeView: React.FC<ArtModeViewProps> = ({ upcomingEvents }) => {
  const today = new Date();
  const todayEvents = upcomingEvents.filter(
    (event) => new Date(event.startTime).toDateString() === today.toDateString()
  );

  return (
    <div
      className="art-mode-view"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        fontSize: '20px',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0' }}>Today&apos;s Events</h3>
      {todayEvents.length === 0 ? (
        <p>No events scheduled for today</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {todayEvents.map((event) => (
            <li key={event.id} style={{ marginBottom: '8px' }}>
              {event.isAllDay ? '🌟' : '⏰'} {event.title}
              {!event.isAllDay && ` - ${new Date(event.startTime).toLocaleTimeString()}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
