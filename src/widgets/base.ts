import {DOMContent, RenderingFunc} from "../types";
import {Client} from "alma-js-client";

export interface WidgetConstructor {
  new(almaClient: Client, options: any): Widget;
}

export interface WidgetOptions {
  // CSS selector to a single DOM element, or a DOM Element itself into which the widget must render
  container: string | Element;
  // Override the rendering of a widget by providing your own rendering function.
  render?: RenderingFunc;
};

export abstract class Widget {
  protected _options: WidgetOptions;
  protected readonly _almaClient: Client;

  protected constructor(almaClient: Client, options: WidgetOptions) {
    this._options = options;
    this._almaClient = almaClient;
  }

  get options(): WidgetOptions {
    return {...this._options};
  }

  set options(value: WidgetOptions) {
    this._options = {...value};
  }

  private get container(): Element {
    let container: Element | null;

    if (typeof this._options.container === "string") {
       container = document.querySelector(this._options.container);

       if (!container) {
         throw new Error(`Container element '${this._options.container}' not found`);
       }
    } else {
      container = this._options.container
    }

    return container;
  }

  async refresh(): Promise<void> {
    const renderingContext = await this.prepare(this._almaClient);

    let dom: DOMContent;
    if (typeof this._options.render === "function") {
      dom = await this._options.render(renderingContext);
    } else {
      dom = await this.render(renderingContext);
    }

    this.mount(dom);
  }

  mount(dom: DOMContent) {
    if (typeof dom === "string") {
      this.container.innerHTML = dom;
    } else {
      this.container.innerHTML = "";
      this.container.appendChild(dom);
    }
  }


  protected abstract async prepare(almaClient: Client): Promise<any>;
  protected abstract async render(renderingContext: any): Promise<DOMContent>;
}
