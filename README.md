# MySankey

**AI-powered interactive Sankey diagrams.**

Transform complex flow data — energy mix, financial cashflows, trade routes, supply chains, customer journeys — into clean, shareable Sankey diagrams. Drop in a CSV or describe your flow in natural language; MySankey handles the layout, colouring, and tooltips.

## Who it's for

- Analysts visualising where resources, money, or users move through a system.
- Finance and energy reporting teams producing annual-report-style flow diagrams without wrestling D3 directly.
- Anyone who's tried to build a Sankey in a spreadsheet and given up.

## What it does

- Accepts flow data as CSV or pasted table.
- AI-assisted interpretation: describe the flow in plain English and get a draft diagram back.
- Interactive highlighting — click a node or link to isolate a path through the diagram.
- Export to SVG / PNG for slide decks and reports.
- Presets for common domains (energy, finance, trade, supply chain).

## Stack

- [Vite](https://vitejs.dev) + React + TypeScript
- [shadcn/ui](https://ui.shadcn.com) + Tailwind — UI
- D3 / Sankey layout
- [Bun](https://bun.sh) — runtime

## Getting started

```sh
bun install
bun run dev
```

Open the URL the dev server prints.

## Licence

MIT.
