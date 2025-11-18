# Changelog

All notable changes to the Collective Intention Voting Hub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-11-18

### Phase 3: Deep Expansion & Production Readiness

#### Added - Domain Model Expansion
- **Community** entity with multi-tenancy support
- **Member** entity with profiles, roles, and authentication hooks
- **CommunityMember** join table for member-community relationships with roles (Guest, Member, Moderator, Admin, Owner)
- **Comment** entity for threaded discussions on proposals
- **ProposalTemplate** entity for reusable proposal formats
- **ActivityLog** entity for comprehensive audit trails
- Status enums for Cycles (Draft, Open for Proposals, etc.) and Proposals (Draft, Published, etc.)
- Member status system (Pending, Active, Suspended, Archived)

#### Added - Infrastructure & Extensibility
- Centralized error handling with custom error classes and consistent API responses
- Structured logging utility with contextual information and request IDs
- Metrics collection system with pluggable backends
- **Event system** with typed domain events (CommunityCreated, VoteCast, OutcomeSelected, etc.)
- Event emitter with async handler support
- **Notification adapter system** with Console, Email, SMS, and Multi-channel implementations
- **AI summarization adapter** with OpenAI, Anthropic, and NoOp implementations
- Health check endpoint at `/api/health`

#### Added - Docker & DevOps
- `Dockerfile` for containerizing the Next.js application
- Enhanced `docker-compose.yml` with app, PostgreSQL, and Redis services
- Networked containers with health checks
- `.dockerignore` for optimized builds

#### Added - Scripts & DX
- `typecheck` - TypeScript type checking
- `format` and `format:check` - Prettier formatting
- `db:migrate:prod` - Production migrations
- `db:seed:prod` - Production seeding
- `db:reset` - Reset database
- `test:coverage` - Test coverage reports
- `docker:build`, `docker:up`, `docker:down`, `docker:logs` - Docker management

#### Added - Comprehensive Seed Data
- 3 realistic communities (Tech Collective, Wellness Circle, Neighborhood Co-op)
- 8 members with diverse personas and bios
- Community memberships with different roles
- 3 active intention cycles across different communities
- 7 detailed proposals with real-world scenarios
- 12 votes with resonance tags demonstrating voting patterns
- 4 threaded comments showing community dialogue
- 2 proposal templates for different community types

#### Added - Configuration
- Comprehensive `.env.example` with all configuration options
- Redis configuration for caching/sessions
- AI provider configuration (OpenAI, Anthropic)
- Notification provider configuration (SendGrid, Twilio)
- External auth configuration (Auth0)
- Webhook and rate limiting configuration

#### Added - Documentation
- `docs/PHASE3_OVERVIEW.md` - Comprehensive Phase 3 planning document
- `CHANGELOG.md` - This file

#### Changed - Breaking Changes
- `IntentionCycle.communityId` is now **required** (was optional)
- `IntentionProposal.proposerMemberId` renamed to `proposerId` with proper Member relation
- `IntentionVote.voterMemberId` renamed to `voterId` with proper Member relation
- Added `status` field to IntentionCycle and IntentionProposal
- Added `updatedAt` field to IntentionVote for tracking vote changes

#### Dependencies
- Added `prettier` for code formatting
- Added `@faker-js/faker` for test data generation

---

## [0.1.0] - 2025-11-18

### Initial Release

#### Added
- Core domain models: IntentionCycle, IntentionProposal, IntentionVote, IntentionOutcome
- Resonance-based voting (1-5 scale) with emotional tags
- Composite scoring algorithm (70% weight + 30% participation)
- REST API endpoints for cycles, proposals, voting, and outcomes
- Public UI for browsing cycles and voting
- Admin dashboard for cycle management
- PostgreSQL persistence via Prisma ORM
- Docker Compose for local PostgreSQL
- Basic seed data with one sample cycle
- Unit tests for aggregation logic
- Comprehensive README documentation

#### Technical Stack
- Next.js 15 with App Router
- TypeScript with strict mode
- Prisma ORM
- Tailwind CSS
- Jest for testing
- Zod for validation
