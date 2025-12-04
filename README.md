

## Getting Started

Make sure you have the following installed on your machine:

- git

- Node.js

- npm (Node Package Manager)


Then, install the project dependencies using npm:

```npm install```

Create a new file named .env.local in the root folder and add the following content:

- NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=<*your_public_key*>

Run the front-end on the main directory:

```npm run dev```

Finally, on a separe terminal, run the server :

```npm run sw-server```

Open [http://localhost:3000] with your browser to see the app.

## ⚙️ <a>Tech Stack</a>

- Next.js
- TypeScript
- Liveblocks
- Fabric.js
- Tailwind CSS


### Git Workflow
Branching model:
  - `main` → production
  - `develop` → integration
  - `feature/<name>` → feature branches
  - 
Used **semantic versioning** marked by tags:  
  - `v0.1.0` (MVP) → `v0.2.0` (Live Collaboration) → `v0.3.0` (Full Canvas Funtionality)

### GitHub Project Board
Used **GitHub Projects (Kanban)** to track progress:
- Columns: *Backlog*, *To Do*, *In Progress*, *In Review*, *Done*
- Link issues and pull requests to milestones.

### Milestones
| Milestone | Description |
|------------|--------------|
| MVP | Basic auth, project creation, static canvas |
| Live Collaboration | Real-time editing and presence |
| Full Canvas Funtionality | Adding Free Drawing Mode, Text Tool, Canvas Reset, Color Selection Bar |
