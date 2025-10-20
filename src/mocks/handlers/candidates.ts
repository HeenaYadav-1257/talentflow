// src/mocks/handlers/candidates.ts
import { http, HttpResponse } from "msw";
import { db } from "../../db/db";
import { Stage } from "../../types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const candidateHandlers = [
  http.get("/candidates", async ({ request }) => {
    await sleep(300);
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");
    let candidates = await (jobId ? db.candidates.where('jobId').equals(jobId).toArray() : db.candidates.toArray());
    return HttpResponse.json({ data: candidates, meta: {} });
  }),
  http.patch("/candidates/:id", async ({ params, request }) => {
    const { id } = params;
    const { stage } = (await request.json()) as { stage: Stage };
    await db.updateCandidateStage(id as string, stage);
    const updated = await db.candidates.get(id as string);
    return HttpResponse.json(updated);
  }),
];