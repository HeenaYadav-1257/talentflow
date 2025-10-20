// src/mocks/handlers/jobs.ts
import { http, HttpResponse } from "msw";
import { db } from '../../db/db';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const jobHandlers = [
  // The only change is removing '{ request }' from the function arguments
  http.get('/jobs', async () => {
    await sleep(200);
    const jobs = await db.jobs.orderBy('order').toArray();
    return HttpResponse.json({ data: jobs, meta: { total: jobs.length } });
  }),
];