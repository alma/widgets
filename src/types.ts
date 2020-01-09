// For semantic purposes
export type integer = number;

export type DOMContent = string | Element;

export interface RenderingFunc {
  (renderingContext: any): DOMContent;
}
