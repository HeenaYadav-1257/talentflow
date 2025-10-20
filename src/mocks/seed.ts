// src/mocks/seed.ts
import { db } from '../db/db';
import { EmploymentType, JobStatus, Stage } from '../types';
import type { Job, Candidate, CandidateTimeline } from '../types';

const JOB_TITLES = ['Senior Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Product Manager'];
const TAGS = ['Remote', 'Hybrid', 'React', 'Node.js', 'Python'];
const FIRST_NAMES = ['Emma','Liam','Olivia','Noah','Ava','Ethan'];
const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones'];
function randomElement<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomElements<T>(arr: T[], count: number): T[] { return [...arr].sort(() => 0.5 - Math.random()).slice(0, count); }

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    await db.transaction('rw', db.tables, async () => {
      console.log('Clearing all existing data from tables...');
      await Promise.all(db.tables.map(table => table.clear()));

      const jobs: Job[] = [];
      for (let i = 0; i < 25; i++) {
        jobs.push({
          id: `job-${i + 1}`,
          title: `${randomElement(JOB_TITLES)}`,
          status: Math.random() > 0.3 ? JobStatus.Active : JobStatus.Archived,
          type: EmploymentType.FullTime,
          order: i * 10,
          department: "Engineering",
          location: "Remote",
          description: "A fantastic job opportunity.",
          tags: randomElements(TAGS, 3),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPublished: true,
          salary: '$100k - $150k',
          requirements: ['Bachelors Degree'],
          postedDate: new Date().toISOString(),
          slug: `job-slug-${i+1}`,
          candidateCount: 0,
        });
      }
      await db.jobs.bulkAdd(jobs);
      console.log(`✅ Seeded ${jobs.length} jobs`);

      const candidates: Candidate[] = [];
      const timelineEntries: CandidateTimeline[] = [];
      const jobIds = jobs.map(j => j.id);

      for (let i = 0; i < 1000; i++) {
        const candidateId = `candidate-${i + 1}`;
        const stage = randomElement(Object.values(Stage).filter(s => s !== 'map'));
        
        candidates.push({
          id: candidateId,
          jobId: randomElement(jobIds),
          name: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
          email: `candidate${i}@example.com`,
          stage,
          appliedAt: Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000),
          isArchived: false,
          notes: [],
          assessments: [],
          timeline: [],
        });

        timelineEntries.push({
          id: `timeline-${i}-1`,
          candidateId,
          type: 'application',
          description: 'Application received',
          timestamp: Date.now(),
        });
      }
      await db.candidates.bulkAdd(candidates);
      await db.candidateTimeline.bulkAdd(timelineEntries);
      console.log(`✅ Seeded ${candidates.length} candidates and their timeline entries.`);

      console.log('🎉 Database seeding completed successfully!');
    });
  } catch (error) {
    console.error('❌ Error during database seeding transaction:', error);
    throw error;
  }
}