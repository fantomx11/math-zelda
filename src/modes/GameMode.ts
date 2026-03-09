export abstract class GameMode {
  // Pass the central gameState to modes rather than the Scene
  abstract enter(): void;
  abstract exit(): void;
  abstract update(delta: number): void;
  abstract handleInput(event: KeyboardEvent): void;
}