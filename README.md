# Collective Intention Voting Hub

> コミュニティ全体の「意図・テーマ・次の一歩」を投票＋AI集計で決めるコレクティブインテンション・ハブ。

A community-driven platform for collectively deciding themes, intentions, and focus areas through resonance-based voting. Express not just approval, but the depth of your connection to each proposal.

## 🌟 Concept

**Collective Intention** is the practice of communities coming together to decide their shared focus, themes, and direction through a democratic yet emotionally expressive process.

Unlike simple yes/no voting, this platform allows members to:
- **Express resonance** with proposals on a 1-5 scale
- **Tag their feelings** about proposals (inspiring, practical, transformative, etc.)
- **See aggregate sentiment** visualized through collective resonance patterns
- **Celebrate outcomes** that truly represent the group's energy and direction

### Why This Matters

Traditional voting often reduces complex community decisions to binary choices. Collective Intention Voting recognizes that:

1. **Depth matters as much as breadth** - A proposal with deep resonance from some may be as valuable as one with shallow support from many
2. **Emotion is data** - How people *feel* about a proposal tells us something important
3. **Process shapes outcome** - The act of proposing, discussing, and voting itself builds community
4. **Transparency builds trust** - Seeing how collective decisions emerge increases buy-in

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library

### Domain Model

```typescript
IntentionCycle {
  id, communityId, key, title, descriptionMarkdown
  periodStart, periodEnd
  proposalWindowOpen, votingWindowOpen
  createdAt, updatedAt
}

IntentionProposal {
  id, cycleId, proposerMemberId
  title, bodyMarkdown, tagsJson
  createdAt, updatedAt
}

IntentionVote {
  id, proposalId, voterMemberId
  weightScore (1-5), resonanceTagJson
  createdAt
}

IntentionOutcome {
  id, cycleId, selectedProposalId
  summaryMarkdown, aiSummaryJson
  createdAt
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/collective-intention-voting-hub.git
   cd collective-intention-voting-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env if needed (default values work for local development)
   ```

4. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npm run db:push
   ```

6. **Seed sample data**
   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### For Community Members

1. **Browse Cycles**: See active and past intention cycles on the home page
2. **View Proposals**: Click into a cycle to see all submitted proposals
3. **Submit Proposals**: When the proposal window is open, submit your ideas
4. **Vote**: Express your resonance (1-5) and add emotional tags
5. **See Results**: Watch aggregate statistics update in real-time

### For Administrators

1. **Access Admin Dashboard**: Click "Admin Dashboard" from the home page
2. **Create Cycles**: Set up new intention cycles with:
   - Unique key and title
   - Description and time period
   - Initial window states (proposals/voting)
3. **Manage Windows**: Toggle proposal and voting windows open/closed
4. **Select Outcomes**: When voting is complete, select the winning proposal
   - System automatically calculates the winner based on composite scores
   - Score = (total_weight × 0.7) + (vote_count × 0.3)

## 🔌 API Reference

### Cycles

- `POST /api/cycles` - Create a new cycle
- `GET /api/cycles` - List all cycles (optional: ?active=true)
- `PATCH /api/cycles/[id]` - Update cycle windows

### Proposals

- `POST /api/cycles/[id]/proposals` - Submit a proposal
- `GET /api/cycles/[id]/proposals` - List proposals with vote stats

### Voting

- `POST /api/proposals/[id]/vote` - Submit or update a vote

### Outcomes

- `POST /api/cycles/[id]/select-outcome` - Select winning proposal
- `GET /api/cycles/[id]/select-outcome` - View cycle outcome

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:ci
```

## 🔗 Ecosystem Connections

This hub is part of a larger collective intention ecosystem:

### 🎭 narrative-arc-campaign-designer
- **Connection**: Outcomes from voting cycles become narrative themes
- **Flow**: Selected intentions → Campaign narratives
- **Purpose**: Transform collective decisions into storytelling frameworks

### 🎪 ritual-event-orchestrator
- **Connection**: Intentions inform ritual design and event planning
- **Flow**: Selected intentions → Event themes & rituals
- **Purpose**: Manifest collective intentions through shared experiences

### Integration Pattern

```
┌─────────────────────────────┐
│ Collective Intention Hub    │
│ (Community decides focus)   │
└──────────────┬──────────────┘
               │
               ├──────────────────────────┐
               ▼                          ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ Narrative Arc Designer   │  │ Ritual Event Orchestr.   │
│ (Story campaigns)        │  │ (Events & ceremonies)    │
└──────────────────────────┘  └──────────────────────────┘
```

## 🎯 Scoring Algorithm

The platform uses a composite scoring system that balances:

- **70% weight on total resonance** (sum of all vote weights)
- **30% weight on participation** (number of votes)

This ensures that proposals need both *depth* (high resonance) and *breadth* (community participation) to win.

**Example**:
- Proposal A: 10 votes averaging 3 → Score = (30 × 0.7) + (10 × 0.3) = 24
- Proposal B: 5 votes averaging 5 → Score = (25 × 0.7) + (5 × 0.3) = 19
- **Winner**: Proposal A (better participation, despite lower average)

## 🛠️ Development

### Database Management

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Project Structure

```
collective-intention-voting-hub/
├── app/
│   ├── api/              # API routes
│   ├── cycles/[id]/      # Cycle detail pages
│   ├── admin/            # Admin dashboard
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/
│   ├── prisma.ts         # Prisma client
│   └── aggregation.ts    # Vote calculation logic
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── __tests__/            # Test files
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! This platform is designed to be:
- **Simple**: Easy to understand and modify
- **Emotionally expressive**: Supports nuanced community sentiment
- **Extensible**: Ready to integrate with other tools

---

Built with intention, for intentional communities. 🌱
