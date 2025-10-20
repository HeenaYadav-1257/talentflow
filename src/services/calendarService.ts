// src/services/calendarService.ts - Google Calendar Integration
import type { Interview } from '@/types';
import { gapi } from 'gapi-script';


export class CalendarService {
  static async init() {
    await gapi.load('client:auth2', async () => {
      await gapi.client.init({
        apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.events'
      });
    });
  }

  static async createEvent(interview: Interview) {
    const event = {
      summary: interview.title,
      description: interview.description,
      start: {
        dateTime: new Date(interview.startTime).toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(interview.endTime).toISOString(),
        timeZone: 'UTC'
      },
      attendees: interview.interviewers.map((id: any) => ({
        email: `interviewer-${id}@company.com` // Map to real emails
      })),
      conferenceData: {
        createRequest: {
          requestId: interview.id,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    const response = await (gapi.client as any).calendar.events.insert({
  calendarId: 'primary',
  resource: event,
  conferenceDataVersion: 1
});

    return response.result;
  }
}
