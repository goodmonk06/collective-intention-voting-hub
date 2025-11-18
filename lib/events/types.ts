/**
 * Typed domain events for the Collective Intention system
 */

export enum EventType {
  // Community events
  COMMUNITY_CREATED = 'community.created',
  COMMUNITY_UPDATED = 'community.updated',
  MEMBER_JOINED = 'community.member_joined',
  MEMBER_LEFT = 'community.member_left',
  MEMBER_ROLE_CHANGED = 'community.member_role_changed',

  // Cycle events
  CYCLE_CREATED = 'cycle.created',
  CYCLE_UPDATED = 'cycle.updated',
  CYCLE_STATUS_CHANGED = 'cycle.status_changed',
  CYCLE_PROPOSALS_OPENED = 'cycle.proposals_opened',
  CYCLE_PROPOSALS_CLOSED = 'cycle.proposals_closed',
  CYCLE_VOTING_OPENED = 'cycle.voting_opened',
  CYCLE_VOTING_CLOSED = 'cycle.voting_closed',

  // Proposal events
  PROPOSAL_CREATED = 'proposal.created',
  PROPOSAL_UPDATED = 'proposal.updated',
  PROPOSAL_STATUS_CHANGED = 'proposal.status_changed',

  // Vote events
  VOTE_CAST = 'vote.cast',
  VOTE_UPDATED = 'vote.updated',

  // Comment events
  COMMENT_CREATED = 'comment.created',
  COMMENT_UPDATED = 'comment.updated',
  COMMENT_DELETED = 'comment.deleted',

  // Outcome events
  OUTCOME_SELECTED = 'outcome.selected',
  OUTCOME_PUBLISHED = 'outcome.published',
}

export interface BaseEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  actorId?: string;
  metadata?: Record<string, any>;
}

// Community Events
export interface CommunityCreatedEvent extends BaseEvent {
  type: EventType.COMMUNITY_CREATED;
  data: {
    communityId: string;
    key: string;
    name: string;
  };
}

export interface MemberJoinedEvent extends BaseEvent {
  type: EventType.MEMBER_JOINED;
  data: {
    communityId: string;
    memberId: string;
    role: string;
  };
}

// Cycle Events
export interface CycleCreatedEvent extends BaseEvent {
  type: EventType.CYCLE_CREATED;
  data: {
    cycleId: string;
    communityId: string;
    key: string;
    title: string;
    periodStart: Date;
    periodEnd: Date;
  };
}

export interface CycleStatusChangedEvent extends BaseEvent {
  type: EventType.CYCLE_STATUS_CHANGED;
  data: {
    cycleId: string;
    previousStatus: string;
    newStatus: string;
  };
}

// Proposal Events
export interface ProposalCreatedEvent extends BaseEvent {
  type: EventType.PROPOSAL_CREATED;
  data: {
    proposalId: string;
    cycleId: string;
    communityId: string;
    proposerId?: string;
    title: string;
  };
}

// Vote Events
export interface VoteCastEvent extends BaseEvent {
  type: EventType.VOTE_CAST;
  data: {
    voteId: string;
    proposalId: string;
    cycleId: string;
    voterId?: string;
    weightScore: number;
    resonanceTags: string[];
  };
}

// Comment Events
export interface CommentCreatedEvent extends BaseEvent {
  type: EventType.COMMENT_CREATED;
  data: {
    commentId: string;
    proposalId: string;
    authorId?: string;
    parentId?: string;
  };
}

// Outcome Events
export interface OutcomeSelectedEvent extends BaseEvent {
  type: EventType.OUTCOME_SELECTED;
  data: {
    outcomeId: string;
    cycleId: string;
    communityId: string;
    selectedProposalId: string;
    totalVotes: number;
    winningScore: number;
  };
}

// Union type of all events
export type DomainEvent =
  | CommunityCreatedEvent
  | MemberJoinedEvent
  | CycleCreatedEvent
  | CycleStatusChangedEvent
  | ProposalCreatedEvent
  | VoteCastEvent
  | CommentCreatedEvent
  | OutcomeSelectedEvent;

// Event handler function type
export type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T
) => Promise<void> | void;
