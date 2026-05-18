/** Respaldo JSX cuando @types/react no resuelve (UNC/WSL sin node_modules). */
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }
}
