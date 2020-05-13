import {Widget, WidgetConstructor, WidgetSettings} from "./base";
import {DOMContent} from "../types";

export interface WidgetFactoryFunc {
  (widgetCtor: WidgetConstructor, options: WidgetSettings): Widget;
}

export interface RenderingFunc {
  (renderingContext: any, createWidget: WidgetFactoryFunc): Promise<DOMContent>;
}
