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
- All image URLs are injected via JS as `<picture>` elements (AVIF/WebP
  `<source>` + JPEG `<img>` fallback; see `photoVariants()` in `script.js`).

## Workflows

Adding an album:
1. Create `albums/<key>/` with `thumb.jpg` plus the album photos.
2. Register it in `albumsData` in `script.js` (key = folder name).
3. Add converted `.avif` and `.webp` versions of every image (same basenames),
   including `thumb`.

Adding homepage photos:
1. Add images to `homepagePhotos/` following the `homeNNNNN.jpg` convention.
2. Update `homepagePhotoFiles` in `script.js` (usually just the
   `generatePhotoList` range).
3. Add converted `.avif` and `.webp` versions alongside the `.jpg` files.

## Planned Work

1. ~~**Reduce code redundancy in `script.js`**~~ **(done)**
   - Consolidated with a shared `wrapIndex()` helper and a single
     `stepInspectorImage(delta)`; removed dead code and the unused
     `currentAlbumContext` state.
2. ~~**Modern image formats with graceful fallback**~~ **(done)**

   Format priority guideline (apply everywhere images are served):
   1. Serve **AVIF** to modern browsers for maximum compression and fastest
      loads.
   2. Fall back to **WebP** for the small slice of older browsers.
   3. Keep **JPEG** as the absolute last resort.
   4. **Lazy-load below-the-fold images; eagerly load hero and cover images**
      (homepage photo, album `thumb.jpg` covers).

   What was done:
   - `script.js` emits `<picture>` markup with AVIF and WebP `<source>`
     elements and a JPEG `<img>` fallback everywhere images are injected
     (homepage photo, album thumbs, inspector image), so exactly one format is
     downloaded per image. See `photoVariants()` / `setPictureSource()` in
     `script.js`; variants are derived by swapping the extension of the `.jpg`
     path.
   - Hero, cover, and inspector images carry `loading="eager"`; lazy loading
     applies to any future below-the-fold images.
   - `style.css` sets `picture { display: contents; }` so the `<picture>`
     wrapper stays layout-neutral and the `<img>` inside lays out exactly as
     before (without it, flex containers stretch the image).
   - All existing JPEGs have been batch-converted by the owner: every `.jpg`
     has sibling `.avif` and `.webp` files (verified for all 113 images).
     **For any future image added to the site, the owner must add converted
     `.avif`/`.webp` files alongside the `.jpg`** — a missing file shows a
     broken image in modern browsers, since `<picture>` does not fall back to
     JPEG on 404.
