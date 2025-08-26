## React Flow Layout Builder — Build Plan

### Goal
Enable users to design custom photo layouts visually on a canvas (grid-guided), export the layout schema, and render an infinite feed that repeats the designed “tile” vertically or horizontally with actual photos.

---

### High-level Architecture
- **Editor (Design-time)**: React Flow canvas with snapping grid, drag-and-drop photo placeholders, size/ratio controls, alignment helpers, and validation.
- **Schema (Portable)**: JSON describing nodes (frames), edges (optional), positions, sizes, and z-order inside a normalized tile space.
- **Renderer (Run-time)**: Virtualized infinite scroller that maps incoming photos over the exported tile schema and repeats it along the selected axis.
- **State**: Zustand store to share editor config, schema, scroll direction, background, and mapping strategy.

---

### Data Model (v1)
```ts
type TileSize = { width: number; height: number }; // canvas units (e.g., 1000x1000)
type NodeId = string;

interface LayoutNode {
  id: NodeId;
  frame: { x: number; y: number; width: number; height: number }; // in tile units
  style?: {
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    elevation?: number;
    fit?: 'cover' | 'contain' | 'fill';
  };
  meta?: {
    aspectLock?: boolean; // keep ratio while resizing
    name?: string;
    rotation?: number;
    zIndex?: number;
  };
}

interface LayoutTileSchema {
  id: string;
  tileSize: TileSize; // base canvas reference size
  nodes: LayoutNode[]; // order = z-order if zIndex missing
  grid?: { size: number; snap: boolean };
  version: 1;
}

// Rendering config
type RepeatAxis = 'vertical' | 'horizontal';
interface LayoutRenderConfig {
  axis: RepeatAxis;
  gap: number; // gap between repeated tiles in px
  background: 'black' | 'dark' | 'light' | 'white' | 'paper' | 'gradient';
}
```

---

### Editor Features (MVP)
- Snapping grid (configurable size), keyboard nudging, shift-resize to preserve aspect.
- Create/delete/duplicate frames; resize, move, reorder (z-index).
- Frame inspector panel: width/height, x/y, border radius, fit, aspect lock.
- Canvas zoom/pan, rulers and alignment guides.
- Export/Import JSON schema.

Optional niceties (v1.1):
- Preset templates (2-up, 3-up, collage, magazine grid).
- Multi-select and group.
- Smart aspect suggestions (based on common photo ratios).

---

### Rendering Strategy
1. Normalize: Treat schema coordinates in a canonical tile space (e.g., 1000x1000). At render, scale to container width.
2. Map photos to frames: Iterate photos array; for each repeated tile, fill nodes in order. If photos < frames, loop photos; if photos > frames, continue onto next tile.
3. Repeat: Place scaled tiles with configured gap along axis using CSS grid/flex for vertical, and a horizontal scroller for horizontal.
4. Virtualize: Use windowing to render only visible tiles (e.g., react-virtual or custom IntersectionObserver) for performance.
5. Interactions: Click to open lightbox (reuse existing lightbox).

---

### Packages
- react-flow: editor canvas and nodes.
- zustand: global state and schema.
- classnames/tailwind: styling.
- react-virtual (or similar): virtualization for infinite feed.

---

### Components
- `LayoutBuilderPage`
  - Toolbar: zoom, grid size toggle, snap on/off, import/export, tile size, preset templates
  - Sidebar Inspector: node properties (x,y,w,h, aspect, fit, styles)
  - Canvas: React Flow with custom "FrameNode"

- `FrameNode`
  - Resize handles, drag, z-index, snap-to-grid
  - Shows placeholder image/ratio

- `SchemaExporter`
  - Convert internal RF graph to `LayoutTileSchema`
  - Validate bounds/overlaps (warn, but allow)

- `SchemaImporter`
  - Load `LayoutTileSchema` and create RF nodes with scaled positions

- `LayoutRenderer`
  - Props: `schema: LayoutTileSchema`, `config: LayoutRenderConfig`, `photos: PhotoItem[]`
  - Calculates scale, lays out tiles, maps photos to frames, handles lightbox
  - Virtualizes tiles

---

### Store (zustand) additions
```ts
schema: LayoutTileSchema | null
renderConfig: LayoutRenderConfig
setSchema(schema)
setRenderConfig(partial)
```

---

### Milestones
1) Foundation
  - Install deps, set up routes: `/builder` (editor), `/` (viewer)
  - Store additions and types

2) Editor MVP
  - React Flow canvas with grid/snap
  - Custom `FrameNode` with resize/drag and inspector
  - Export/Import schema JSON

3) Renderer MVP
  - Render one tile from schema, scaled to container
  - Map photos to frames, repeat axis, basic infinite scroll
  - Lightbox integration

4) UX polish
  - Presets, keyboard shortcuts, alignment guides, z-order tools
  - Validation + helpful warnings

5) Performance
  - Virtualization, memoization, image lazy-load tuning

6) QA + Docs
  - Document schema, create examples, add e2e screenshot tests of layouts

---

### Acceptance Criteria (MVP)
- Users can design a tile with multiple frames in the builder and export JSON.
- App renders infinite feed repeating that tile along chosen axis, filling frames with photos in order.
- Lightbox works on click; background and axis options apply.
- Import restores the exact builder layout.

---

### Risks & Mitigations
- Precision and scaling differences: normalize tile coordinates; use consistent rounding.
- Performance with large photos: strict lazy-loading and virtualization; low-quality image placeholders (LQIP) optional later.
- Overlapping frames: warn users; render by z-index.

---

### Next Actions
- Implement store types for schema + render config
- Scaffold builder route, add React Flow, create `FrameNode`
- Add exporter/importer and a simple renderer that repeats vertically


