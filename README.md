TalentFlow - A Mini Hiring Platform

TalentFlow is a frontend-only React application designed to simulate a modern hiring platform. It allows an HR team to manage job postings, track candidates through a hiring pipeline, and build custom assessments for job roles. The entire application runs locally in the browser, using a mock API and IndexedDB for data persistence.

Live Demo: http://localhost:5173

✨ Core Features

This project implements three primary workflows as per the project requirements:

1. 📋 Jobs Board

List & Filter: A comprehensive view of all job postings with server-like filtering for title, status, and tags.

Create & Edit: A modal-based form allows for the creation and editing of job details with client-side validation.

Drag-and-Drop Reordering: Job cards can be reordered via drag-and-drop. This feature is built with optimistic updates for a seamless user experience and includes a rollback mechanism to handle simulated API failures.

Archive/Unarchive: Toggle the status of jobs between "Active" and "Archived".

Deep Linking: Each job has a unique URL (/jobs/:id) for direct access.

2. 👥 Candidate Pipeline

Kanban Board: A visual, drag-and-drop Kanban board to move candidates between different hiring stages (Applied, Screen, Tech, Offer, Hired, Rejected).

Virtualized List: A high-performance, virtualized list view capable of rendering over 1,000 candidates without performance degradation.

Advanced Filtering: Includes client-side search for name/email and server-like filtering by job and hiring stage.

Candidate Profile: A detailed profile page (/candidates/:id) showing a timeline of all status changes and activities related to the candidate.

3. 📝 Assessment Builder

Dynamic Form Creation: An interface for HR users to build job-specific assessments by adding sections and questions.

Multiple Question Types: Supports various question formats, including single-choice, multi-choice, short text, and long text.

Live Preview: A real-time preview pane that renders the assessment form as the candidate would see it.

Local Persistence: The state of the assessment builder and the candidate's responses are saved locally in IndexedDB.

🛠️ Technical Stack & Architecture

This project is built with a modern, scalable frontend architecture.

Framework: React 18 with Vite for a fast development experience.

Language: TypeScript for robust type safety.

Styling: Tailwind CSS for a utility-first styling approach, allowing for rapid and consistent UI development.

State Management: Zustand for simple, scalable global state management with minimal boilerplate. It is used to handle optimistic updates and rollbacks.

Mock API: Mock Service Worker (MSW) to simulate a full backend API. It intercepts network requests and provides responses, including artificial latency and random error rates to test resilience.

Data Persistence: Dexie.js as a wrapper around IndexedDB for robust, client-side storage. This acts as the "database" for the mock API, ensuring all data persists across page reloads.

Drag & Drop: React Beautiful DnD for the Kanban board and React DnD for the jobs list, providing accessible and smooth drag-and-drop experiences.

Routing: React Router v6 for client-side routing and navigation.

UI Components: Headless UI and Heroicons for accessible and well-designed UI primitives.

🚀 Getting Started

Follow these instructions to set up and run the project locally.

Prerequisites

Node.js (v18 or later)

npm or yarn

Installation

Clone the repository:

git clone [https://github.com/HeenaYadav-1257]
cd talentflow


Install dependencies:

npm install


Run the development server:

npm run dev


The application will start on http://localhost:5173 (or the next available port). The mock API and database seeding will be enabled automatically in development mode.

💡 Key Implementation Highlights

Optimistic Updates & Rollback: The job reordering feature demonstrates a robust UI pattern. When a job is dragged, the UI updates instantly. An API call is made in the background. If the API call fails (simulated with a 10% error rate in MSW), the UI seamlessly reverts to its original state.

Client-Side Virtualization: The "List View" on the Candidates page uses react-window to render only the visible items in a list of 1,000+ candidates, ensuring the application remains fast and responsive.

Simulated Backend Environment: By combining MSW and Dexie.js, the application fully simulates a real-world client-server architecture. MSW acts as the network layer with latency and errors, while Dexie provides the persistent database layer, fulfilling a core requirement of the project.