import {ApiMode, Client} from "alma-js-client";
import {Widget, WidgetConstructor, WidgetSettings} from "./widgets/base";

export class WidgetsController {
  private readonly almaClient: Client;
  private widgets: Widget[] = [];

  constructor(merchantId: string, mode: ApiMode) {
    this.almaClient = Client.withMerchantId(merchantId, {mode})
  }

  create(widgetCtor: WidgetConstructor, options: WidgetSettings): Widget {
    const widget = new widgetCtor(this.almaClient, options);
    this.widgets.push(widget);
    return widget;
  }

  async render() {
    let promises: Promise<void>[] = [];

    for (let widget of this.widgets) {
      promises.push(widget.refresh());
    }

    await Promise.all(promises);
  }
}

export default WidgetsController;
