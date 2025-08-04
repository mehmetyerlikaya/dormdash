# DormDash - Dormitory Laundry Management

A real-time web app for managing dormitory laundry machines. Built with Next.js and Supabase.

## Features

- **Real-time machine status updates** - Live synchronization across all devices
- **Check-in/out system** for washers and dryers with user ownership tracking
- **Grace period notifications** - Automatic 5-minute grace period after cycle completion
- **🔥 Anonymous Chat** - Real-time anonymous messaging system for dorm community
- **Community features** - Help requests, announcements, and noise reports
- **Mobile-friendly interface** - Responsive design optimized for all devices

## Tech Stack

- Next.js 15
- Supabase (Database & Real-time)
- TailwindCSS
- TypeScript

## Getting Started

1. Clone the repo
```bash
git clone https://github.com/mehmetyerlikaya/dormdash.git
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server
```bash
pnpm dev
```

## Deployment

The app is configured for Vercel deployment. Just connect your GitHub repo to Vercel and add the environment variables.

---

## Machine Status Logic & Scenarios

### Statuses
- `free` → `running` → `finishedGrace` → `free`

### How Transitions Happen
- **free → running**: User starts a machine via check-in page. Status and timer are set in the database.
- **running → finishedGrace**: Happens automatically. A server-side background process (MachineStatusManager) checks every 30 seconds. When the timer expires, status changes to `finishedGrace` and a 5-minute grace period starts.
- **finishedGrace → free**: Also automatic. After the grace period, the server process sets the machine to `free` and clears user info. The original user can also manually mark as collected, which frees the machine immediately.

### Timing
- Automatic transitions are checked every 30 seconds. Status changes are visible to all users in real time (usually within 0–30 seconds, average 15s).
- No one needs to refresh the page; updates are pushed via Supabase real-time subscriptions.

### User Scenarios
| Status           | Who Can Act?         | What Happens Next?                |
|------------------|----------------------|-----------------------------------|
| free             | Anyone               | Can start a new session           |
| running          | Owner                | Can stop early or wait            |
| running          | Others               | See warning, cannot act           |
| finishedGrace    | Owner                | Can mark as collected             |
| finishedGrace    | Others               | See warning, cannot act           |
| free (after grace)| Anyone              | Can start a new session           |

### Technical Details
- The MachineStatusManager (see `src/lib/machineStatusManager.ts`) runs on the server and checks machine timers every 30 seconds.
- All status transitions after a user starts a machine are handled automatically by this process.
- No user action is required for machines to become available after timer/grace period expiry.
- All clients receive updates in real time via Supabase subscriptions.

---

## License

MIT