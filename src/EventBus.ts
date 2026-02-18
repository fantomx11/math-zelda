import { EventPayloads, MathZeldaEvent } from './Event';

type EventCallback<T extends MathZeldaEvent> = (payload: EventPayloads[T]) => void;

/**
 * A type-safe, singleton event bus for game-wide events.
 * This provides a central communication channel decoupled from Phaser's scene-specific event emitter.
 *
 * @example
 * // Emitting an event
 * EventBus.emit(MathZeldaEvent.PLAYER_DIED, undefined);
 *
 * // Subscribing to an event
 * EventBus.on(MathZeldaEvent.PLAYER_DIED, () => {
 *   console.log('Player has died');
 * });
 */
class GameEventBus {
  private subscribers: { [key in MathZeldaEvent]?: EventCallback<key>[] } = {};

  constructor() {}

  public on<T extends MathZeldaEvent>(event: T, callback: EventCallback<T>): void {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [] as any;
    }
    (this.subscribers[event] as EventCallback<T>[]).push(callback);
  }

  public off<T extends MathZeldaEvent>(event: T, callback: EventCallback<T>): void {
    if (!this.subscribers[event]) {
      return;
    }
    this.subscribers[event] = (this.subscribers[event] as any).filter((subscriber: any) => subscriber !== callback);
  }

  public emit<T extends MathZeldaEvent>(
    event: T,
    ...args: EventPayloads[T] extends void ? [] : [payload: EventPayloads[T]]
  ): void {
    const payload = args[0] as EventPayloads[T];
    const subscribers = this.subscribers[event];
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
}

export const EventBus = new GameEventBus();
