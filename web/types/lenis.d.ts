declare module "lenis" {
  interface LenisOptions {
    duration?: number;
    easing?: (t: number) => number;
    orientation?: "vertical" | "horizontal";
    gestureOrientation?: "vertical" | "horizontal" | "both";
    smoothWheel?: boolean;
    wheelMultiplier?: number;
    touchMultiplier?: number;
  }

  export default class Lenis {
    constructor(options?: LenisOptions);
    raf(time: number): void;
    destroy(): void;
    scrollTo(target: string | number | HTMLElement, options?: Record<string, unknown>): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
    stop(): void;
    start(): void;
  }
}

