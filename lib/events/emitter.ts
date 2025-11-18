/**
 * Event emitter for domain events
 */

import { DomainEvent, EventType, EventHandler } from './types';
import { logger } from '../logger';
import { metrics, MetricNames } from '../metrics';

class EventEmitter {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();

  /**
   * Register an event handler
   */
  on<T extends DomainEvent>(
    eventType: EventType,
    handler: EventHandler<T>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler as EventHandler);

    logger.debug('Event handler registered', {
      eventType,
      handlerCount: this.handlers.get(eventType)!.size,
    });

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler as EventHandler);
    };
  }

  /**
   * Emit an event to all registered handlers
   */
  async emit(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);

    if (!handlers || handlers.size === 0) {
      logger.debug('No handlers for event', { eventType: event.type });
      return;
    }

    logger.info('Emitting event', {
      eventType: event.type,
      eventId: event.id,
      handlerCount: handlers.size,
    });

    // Execute all handlers concurrently
    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await metrics.measureAsync(
          'event.handler.duration',
          () => handler(event),
          { eventType: event.type }
        );
      } catch (error) {
        logger.error(`Event handler failed for ${event.type}`, error as Error);
        metrics.counter('event.handler.error', 1, { eventType: event.type });
      }
    });

    await Promise.all(promises);

    metrics.counter('event.emitted', 1, { eventType: event.type });
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Get number of handlers for an event type
   */
  handlerCount(eventType: EventType): number {
    return this.handlers.get(eventType)?.size || 0;
  }
}

// Global event emitter instance
export const eventEmitter = new EventEmitter();

/**
 * Helper to create a properly formatted event
 */
export function createEvent<T extends DomainEvent>(
  type: T['type'],
  data: T['data'],
  actorId?: string,
  metadata?: Record<string, any>
): T {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: new Date(),
    actorId,
    metadata,
    data,
  } as T;
}
