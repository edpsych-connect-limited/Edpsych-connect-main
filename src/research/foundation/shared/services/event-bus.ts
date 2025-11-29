/**
 * Event Bus Service
 * 
 * This service provides a central event bus for publishing and subscribing to events
 * across the platform. It facilitates loose coupling between components and services.
 */

/**
 * Event payload for all events
 */
export interface EventPayload {
  [key: string]: any;
}

/**
 * Callback function type for event subscribers
 */
export type EventCallback = (payload: EventPayload) => void;

/**
 * Core EventBus service that allows components to communicate through events
 */
export class EventBusService {
  private subscribers: Map<string, EventCallback[]> = new Map();

  /**
   * Emit an event with the given name and payload
   */
  emit(eventName: string, payload: EventPayload): void {
    const callbacks = this.subscribers.get(eventName) || [];
    for (const callback of callbacks) {
      try {
        callback(payload);
      } catch (_error) {
        console.error(`Error in event subscriber for '${eventName}':`, error);
      }
    }
  }

  /**
   * Subscribe to an event
   */
  subscribe(eventName: string, callback: EventCallback): () => void {
    const callbacks = this.subscribers.get(eventName) || [];
    callbacks.push(callback);
    this.subscribers.set(eventName, callbacks);

    // Return unsubscribe function
    return () => {
      const currentCallbacks = this.subscribers.get(eventName) || [];
      const index = currentCallbacks.indexOf(callback);
      if (index !== -1) {
        currentCallbacks.splice(index, 1);
        this.subscribers.set(eventName, currentCallbacks);
      }
    };
  }

  /**
   * Unsubscribe all callbacks for a given event
   */
  unsubscribeAll(eventName: string): void {
    this.subscribers.delete(eventName);
  }

  /**
   * Clear all subscribers from the event bus
   */
  clear(): void {
    this.subscribers.clear();
  }
}