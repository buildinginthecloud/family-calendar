/**
 * Type definitions for Family Calendar Display application
 * Based on design document data models
 */

export type CalendarSource = 'icloud' | 'outlook';

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[];
  dayOfMonth?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location?: string;
  source: CalendarSource;
  familyMember: string;
  color: string;
  recurrence?: RecurrencePattern;
}

export interface EncryptedCredentials {
  secretArn: string;
  encryptedData: string;
}

export interface CalendarSourceConfig {
  type: CalendarSource;
  credentials: EncryptedCredentials;
  calendarIds: string[];
  color: string;
  enabled: boolean;
}

export interface DisplaySettings {
  fontSize: number;
  contrastMode: 'normal' | 'high';
  viewMode: 'weekly' | 'monthly';
  showAllDay: boolean;
  showLocations: boolean;
}

export interface CalendarConfiguration {
  familyMemberId: string;
  name: string;
  sources: CalendarSourceConfig[];
  displaySettings: DisplaySettings;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthenticationMethod = 'ip-restriction' | 'cognito-login' | 'both';

export interface AuthenticationConfig {
  method: AuthenticationMethod;
  allowedIPs?: string[];
  cognitoUserPoolId?: string;
}

export interface EventQueryParams {
  startDate: string;
  endDate: string;
  familyMemberId?: string;
  source?: CalendarSource;
}

export interface EventsResponse {
  events: CalendarEvent[];
  metadata: {
    count: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}
