# Research Page UI/UX Enhancement Plan

## Context

The user wants to optimize the Research page design by referencing NotebookLM's interface. Three key improvements were requested:

1. **Inline citations** in chat responses (e.g., [1], [PDF: doc.pdf])
2. **Source preview cards** with richer metadata display
3. **Interactive mind map** with zoom/pan capability

## Current State

The research page has a 3-column layout (Sources | Chat | Studio) with:
- Basic source list grouped by type
- Simple chat with no citations
- Static non-interactive mind map

## Implementation Plan

### Task 1: Inline Citations in Chat

**Files to modify:**
- `apps/web/src/app/[locale]/research/page.tsx` — Update message rendering to parse citations
- `apps/api/app/services/research_service.py` — Update prompt to include citation format

**Approach:**
1. Modify `stream_chat_response()` in `research_service.py` to include citation markers in the format `[{index}: {source_name}]` when referencing sources
2. Update frontend to render citations as clickable badges that highlight the referenced source
3. Parse SSE chunks for citation patterns and render with special styling

**Citation format:**
```
The compound has a molecular weight of 342.5 g/mol [1: compound_data.pdf].
According to the supplier report [2: supplier_spec.pdf], the purity is 99.8%.
```

---

### Task 2: Source Preview Cards

**Files to create/modify:**
- `apps/web/src/components/research/SourceCard.tsx` (CREATE) — Rich source card component
- `apps/web/src/components/research/SourcesPanel.tsx` (MODIFY) — Replace current list with SourceCard grid

**SourceCard features:**
- Source type icon with color coding
- File name (truncated with tooltip)
- File size and upload date
- Status badge (PENDING/PROCESSING/READY/ERROR)
- Page count for PDFs
- Preview snippet for TEXT sources
- Hover actions: delete, copy URL

**Layout:** Switch from grouped list to a responsive grid (2 columns in the left panel).

---

### Task 3: Interactive Mind Map

**Files to modify:**
- `apps/web/src/components/research/MindMapView.tsx` (MODIFY) — Rewrite for interactive pan/zoom
- `apps/web/src/components/research/MindMapNode.tsx` (CREATE) — Node component with expand/collapse

**Features:**
- Pan: Click and drag on empty space
- Zoom: Mouse wheel (scale 0.5x to 2x)
- Expand/collapse: Click on nodes
- Smooth transitions
- Reset view button
- Node colors by depth level
- Curved bezier connection lines

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/components/research/SourceCard.tsx` | CREATE | New rich source card component |
| `apps/web/src/components/research/SourcesPanel.tsx` | MODIFY | Replace list with SourceCard grid |
| `apps/web/src/components/research/MindMapView.tsx` | MODIFY | Rewrite for interactive pan/zoom |
| `apps/web/src/components/research/MindMapNode.tsx` | CREATE | Node component with expand/collapse |
| `apps/web/src/app/[locale]/research/page.tsx` | MODIFY | Update chat to render citations |
| `apps/api/app/services/research_service.py` | MODIFY | Add citation markers in LLM prompts |

---

## Verification

1. **Inline Citations:**
   - Upload 2+ sources, ask a question
   - Verify response shows citation markers
   - Click citation → source should highlight

2. **Source Cards:**
   - Add sources of different types
   - Verify cards display all metadata
   - Verify delete works

3. **Interactive Mind Map:**
   - Generate a mind map with 3+ levels
   - Test pan by dragging
   - Test zoom by mouse wheel
   - Test expand/collapse
   - Verify reset button works
