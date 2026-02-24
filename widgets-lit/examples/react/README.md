# React example with Alma Widgets UMD

This is a **minimal React 19 app** that integrates Alma Widgets via the **UMD bundle**, exactly like a merchant would do when loading the script from Alma's CDN.

## How it works

There are two servers involved:

1. The **root dev server** (from the main repo) serves the built UMD bundle from `dist/`.
2. The **React dev server** (in `examples/react`) serves the React application.

`index.html` loads the UMD bundle from the root dev server:

```html
<script src="http://localhost:1803/dist/alma-widgets.umd.js"></script>
```

> In production, this would typically be something like:
>
> ```html
> <script src="https://cdn.alma.eu/widgets/alma-widgets.umd.js"></script>
> ```

Then `src/main.tsx` is a small React app that:
- initializes `Alma.Widgets` using the global `window.Alma` object
- mounts a `PaymentPlans` widget inside a React layout
- keeps the widget's `purchaseAmount` in sync with React state

## Run locally

1. **From the root of this repo**, first build the widgets bundle and start the root dev server (which serves `dist/` on `http://localhost:1803`):

```bash
cd ../..
npm install
npm run build
npm run dev
```

2. **In another terminal**, start the React example dev server:

```bash
cd examples/react
npm install
npm run dev
```

3. Open the URL printed by the React dev server (for example `http://localhost:5173/` or `http://localhost:5174/`).

At this point:
- the root dev server serves the UMD bundle at `http://localhost:1803/dist/alma-widgets.umd.js`,
- the React dev server serves the React app,
- and you should see the Alma widget rendered inside the React app.
