# Phase 3 Overview: Collective Intention Voting Hub

## Purpose Statement

The Collective Intention Voting Hub is a foundational service within a larger community-driven ecosystem that enables groups to democratically decide on shared themes, intentions, and focus areas through emotionally expressive, resonance-based voting. Unlike traditional binary voting systems, this platform captures both the depth of individual connection (1-5 resonance scores) and the breadth of community engagement, using a composite scoring algorithm to surface proposals that genuinely represent collective will.

This service acts as a decision-making backbone that can feed intentions into narrative campaigns, ritual planning, and other community coordination systems, transforming abstract collective desires into concrete, actionable themes.

## Current State

### Existing Features
- **Core domain models**: IntentionCycle, IntentionProposal, IntentionVote, IntentionOutcome
- **Resonance-based voting**: 1-5 scale with emotional resonance tags
- **Composite scoring algorithm**: 70% weight on total resonance + 30% on vote count
- **Complete cycle flow**: proposal submission → voting → automated outcome selection
- **Public UI**: browsing cycles, viewing proposals, submitting votes
- **Admin dashboard**: cycle creation, window management, outcome selection
- **REST API**: fully typed endpoints for all operations
- **PostgreSQL persistence**: via Prisma ORM with migrations
- **Seed data**: sample December 2025 cycle with 4 proposals and votes
- **Unit tests**: vote aggregation and scoring logic
- **Docker support**: PostgreSQL via docker-compose

### Current Limitations
- **No user/member system**: votes use arbitrary string IDs, no authentication
- **No communities**: cycles exist in isolation, no multi-tenancy
- **No discussions**: proposals can't be discussed or commented on
- **Limited extensibility**: no plugin system, adapters, or event hooks
- **Basic error handling**: inconsistent across API endpoints
- **No observability**: no logging, metrics, or monitoring hooks
- **Limited seed data**: only one cycle, minimal personas
- **No templates**: proposals created from scratch every time
- **Missing Dockerfile**: app not containerized
- **No CLI tooling**: database operations only via npm scripts

## Phase 3 Implementation Plan

### 1. Domain Model Expansion (Rich Multi-Tenancy)
- **Add Member entity**: proper user profiles with authentication hooks
- **Add Community entity**: multi-tenant support, community settings
- **Add Comment entity**: threaded discussions on proposals
- **Add ProposalTemplate entity**: reusable proposal formats
- **Add ActivityLog entity**: audit trail for all significant actions
- **Enrich existing entities**: status enums, metadata JSON fields, soft deletes

### 2. Additional Vertical Slices
- **Member management**: registration → profile → activity history → preferences
- **Community management**: create → configure → invite members → archive
- **Discussion system**: comment on proposals → thread replies → reactions
- **Template library**: create templates → apply to proposals → share across communities

### 3. Extensibility & Integration Points
- **Event system**: typed domain events (ProposalCreated, VoteCast, OutcomeSelected, etc.)
- **Notification adapter**: pluggable interface for email/SMS/push notifications
- **AI summarization adapter**: real integration with OpenAI/Anthropic for outcome summarization
- **External auth adapter**: OAuth, SAML, or custom auth providers
- **Webhook system**: outbound webhooks for external integrations
- **Metrics adapter**: pluggable telemetry (Prometheus, DataDog, custom)

### 4. Developer Experience Enhancements
- **Dockerfile**: containerize the Next.js application
- **Enhanced docker-compose**: app + PostgreSQL + Redis (for caching/sessions)
- **CLI tool**: admin commands (create-community, promote-user, export-data, etc.)
- **Script standardization**: typecheck, format, test:watch, test:coverage
- **Test factories**: easy test data generation with Faker.js
- **Development seeds**: multiple realistic scenarios

### 5. Quality & Observability
- **Centralized error handler**: consistent API error responses
- **Structured logging**: contextual logger with request IDs
- **Metrics collection**: counters, histograms for key operations
- **Enhanced validation**: stronger input validation across all endpoints
- **Integration tests**: API flow tests with test database
- **E2E scenario tests**: complete user journeys

### 6. Rich Seed Data & Demos
- **3 communities**: "Tech Collective", "Wellness Circle", "Neighborhood Co-op"
- **15+ members**: diverse personas (active voters, proposers, lurkers)
- **Multiple cycles**: past, current, and future cycles
- **20+ proposals**: across different communities and themes
- **50+ votes**: demonstrating various resonance patterns
- **Comments & discussions**: realistic community dialogue
- **Proposal templates**: ready-to-use formats for common intention types

### 7. Comprehensive Documentation
- **Architecture docs**: system design, data flows, extension points
- **Domain notes**: deep dive into voting mechanics and decision-making philosophy
- **Integration recipes**: how to connect with auth, notifications, AI services
- **API documentation**: OpenAPI/Swagger specs
- **Deployment guide**: production considerations
- **CHANGELOG**: semantic versioning and migration guides

### 8. Production Readiness
- **Environment configuration**: comprehensive .env.example with all options
- **Database migrations**: proper versioned migrations (not just push)
- **Health check endpoints**: /api/health with DB connectivity check
- **Rate limiting**: basic protection against abuse
- **CORS configuration**: proper cross-origin settings
- **Security headers**: helmet.js or equivalent

## Success Criteria

After Phase 3, the Collective Intention Voting Hub should:

1. **Feel production-ready**: can be deployed and used by real communities immediately
2. **Be deeply extensible**: clear plugin points for auth, notifications, AI, metrics
3. **Have rich examples**: multiple communities, realistic scenarios, demonstration data
4. **Support multi-tenancy**: communities operate independently with shared infrastructure
5. **Enable discussion**: proposals aren't just voted on, but discussed and refined
6. **Provide clear integration paths**: documented recipes for common ecosystem connections
7. **Have excellent DX**: fast local setup, helpful CLI tools, comprehensive tests
8. **Scale conceptually**: architecture supports 100s of communities, 1000s of members

## Timeline Estimate

- Domain expansion & migrations: ~30% of effort
- New vertical slices (members, communities, comments): ~25%
- Extensibility layer (adapters, events, webhooks): ~20%
- Testing & quality improvements: ~15%
- Documentation & examples: ~10%

---

*This document serves as the blueprint for transforming the Collective Intention Voting Hub from a solid prototype into a production-grade, ecosystem-ready service.*
