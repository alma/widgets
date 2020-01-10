// For semantic purposes
export type integer = number;

type primitive = string | number | boolean | Function | undefined | null;
export type DeepRequired<T> = {
  [K in keyof T]-?:
    T[K] extends primitive ? T[K] :
    T[K] extends (infer U)[] ? DeepRequired<U>[] :
    DeepRequired<T[K]>
}

export type DOMContent = string | Element;

export interface RenderingFunc {
  (renderingContext: any): DOMContent;
}
