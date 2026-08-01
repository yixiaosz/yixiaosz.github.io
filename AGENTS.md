# AGENTS.md — Yixiao Zhang's Photography Portfolio

Static photography portfolio site: plain HTML + CSS + vanilla JavaScript. No build
step, no dependencies, no framework. Deployed as a static site (GitHub Pages).

This file consolidates the plan and conventions previously recorded in
`GEMINI-codebase.md` and `GEMINI-activeContext.md` (kept for reference).

## Project Structure

- `index.html` — landing page; shows a rotating photo from `homepagePhotos/`.
- `albums.html` — gallery page listing all albums as thumbnails.
- `information.html` — about/info page.
- `script.js` — all site logic, wrapped in a single `DOMContentLoaded` handler:
  - `generatePhotoList(baseName, startNum, endNum, digits, extension)` — builds
    zero-padded filename arrays, e.g. `generatePhotoList('home', 1, 9, 5, '.jpg')`
    → `home00001.jpg` … `home00009.jpg`.
  - `albumsData` — album registry; keys must match folder names in `albums/`.
  - Photo Inspector overlay logic (`showInspector` / `hideInspector` /
    `updateInspectorImage` and keyboard nav).
  - Page setup: `setupHomepage()` and `loadAlbumGallery()`.
- `style.css` — all styling; Roboto font, fixed header, responsive layouts.
- `homepagePhotos/` — homepage images (`homeNNNNN.jpg`).
- `albums/<albumKey>/` — one folder per album; **must contain `thumb.jpg`**.

## Key Conventions

- No per-photo/per-album pages. Full-screen viewing happens in the "Photo
  Inspector" (`#photo-inspector`), a fixed overlay hidden by default, opened
  when an album thumbnail is clicked. Arrow Left/Right navigate, Escape closes.
- Album `title` supports `\n` for line breaks.
- Album `photos` arrays list exact filenames in the album folder and must NOT
  include `thumb.jpg`; prefer `generatePhotoList(...)` (optionally `.concat()`
  extra one-off filenames).
- All image URLs are injected via JS (plain `<img>` tags today).

## Workflows

Adding an album:
1. Create `albums/<key>/` with `thumb.jpg` plus the album photos.
2. Register it in `albumsData` in `script.js` (key = folder name).

Adding homepage photos:
1. Add images to `homepagePhotos/` following the `homeNNNNN.jpg` convention.
2. Update `homepagePhotoFiles` in `script.js` (usually just the
   `generatePhotoList` range).

## Planned Work (pending, from GEMINI-activeContext.md)

1. **Reduce code redundancy in `script.js`**
   - Consolidate overlapping logic between homepage photo loading, album
     gallery, and photo inspector (index wrapping / photo-list navigation is
     duplicated).
   - Remove unused code (e.g. commented-out homepage click-to-inspector block).
2. **Modern image formats with graceful fallback**

   Format priority guideline (apply everywhere images are served):
   1. Serve **AVIF** to modern browsers for maximum compression and fastest
      loads.
   2. Fall back to **WebP** for the small slice of older browsers.
   3. Keep **JPEG** as the absolute last resort.
   4. **Lazy-load below-the-fold images; eagerly load hero and cover images**
      (homepage photo, album `thumb.jpg` covers).

   Implementation notes:
   - Update `script.js` to emit `<picture>` markup with AVIF and WebP
     `<source>` elements and a JPEG `<img>` fallback, so exactly one format is
     downloaded per image.
   - Note: images are injected dynamically, so tag generation in `script.js`
     must produce the new structure (homepage photo, album thumbs, inspector
     image), including appropriate `loading="lazy"` / `loading="eager"`
     attributes.
   - **Image conversion is handled manually by the site owner, not by AI
     agents.** Agents should write code referencing the `.avif` / `.webp`
     filenames at their expected locations (same basename/path as the
     corresponding `.jpg`) and leave the actual files absent; the owner will
     batch-convert the existing JPEGs and drop the converted files in place.
