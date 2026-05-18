declare module "react" {
  export type ReactNode =
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactNode[]
    | { type: unknown; props: unknown };

  export type MouseEvent<T = Element> = globalThis.MouseEvent & {
    currentTarget: EventTarget & T;
  };

  export function useEffect(
    effect: () => void | (() => void),
    deps?: readonly unknown[],
  ): void;

  export function useRef<T>(initial: T | null): { readonly current: T | null };
}
