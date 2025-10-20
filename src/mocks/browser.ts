// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { jobHandlers } from './handlers/jobs';
import { candidateHandlers } from './handlers/candidates';

export const worker = setupWorker(
  ...jobHandlers,
  ...candidateHandlers
);