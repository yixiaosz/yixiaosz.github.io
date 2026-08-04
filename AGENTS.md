# AGENTS.md — Yixiao Zhang's Photography Portfolio

Static photography portfolio site: plain HTML + CSS + vanilla JavaScript. No build
step, no dependencies, no framework. Deployed as a static site (GitHub Pages).

This file consolidates the plan and conventions previously recorded in
`GEMINI-codebase.md` and `GEMINI-activeContext.md` (kept for reference).

## Project Structure

- `index.html` — landing page; shows a rotating homepage photo.
- `albums.html` — gallery page listing all albums as thumbnails.
- `information.html` — about/info page.
- `script.js` — all site logic, wrapped in a single `DOMContentLoaded` handler:
  - `generatePhotoList(baseName, startNum, endNum, digits, extension)` — builds
    zero-padded filename arrays, e.g. `generatePhotoList('croatia', 1, 37, 5, '.jpg')`
    → `croatia00001.jpg` … `croatia00037.jpg`.
  - `albumsMeta` — album display titles and cover images; key order = gallery order.
  - `photoDB` — the photo database: one entry per photo
    (`{ file, album, homepage }`), built via `buildEntries(album, files,
    homepageFiles)`. All pages are filtered views over this array.
  - Photo Inspector overlay logic (`showInspector` / `hideInspector` /
    `updateInspectorImage` and keyboard nav).
  - Page setup: `setupHomepage()` and `loadAlbumGallery()`.
- `style.css` — all styling; Roboto font, fixed header, responsive layouts.
- `photos/` — flat directory holding every image on the site: album photos plus
  one `<albumKey>-thumb.jpg` cover per album. Basenames must be unique across the
  whole directory (there are no subfolders to namespace them).

## Key Conventions

- No per-photo/per-album pages. Full-screen viewing happens in the "Photo
  Inspector" (`#photo-inspector`), a fixed overlay hidden by default, opened
  when an album thumbnail is clicked. Arrow Left/Right navigate, Escape closes.
- Organization is tag-based, not folder-based: a photo's album membership and
  homepage presence live only in its `photoDB` entry in `script.js`.
- Album `title` supports `\n` for line breaks.
- `photoDB` `files` arrays list exact filenames in `photos/`; prefer
  `generatePhotoList(...)` via `buildEntries()` (pass one-off filenames as a
  plain array, as the `utah` album does).
- An album's cover is `albumsMeta[key].cover` (the `<albumKey>-thumb.jpg` file),
  NOT a photo in the album — cover files are unique images and never appear in
  `photoDB`.
- All image URLs are injected via JS as `<picture>` elements (AVIF/WebP
  `<source>` + JPEG `<img>` fallback; see `photoVariants()` in `script.js`).

## Workflows

Adding an album:
1. Add the album photos and one cover image to `photos/`, using basenames unique
   across the whole directory; name the cover `<albumKey>-thumb.jpg`.
2. Add converted `.avif` and `.webp` versions of every image (same basenames),
   including the cover.
3. Register the album in `albumsMeta` in `script.js` (title + cover; position in
   the object sets gallery order) and add its photos to `photoDB` via
   `buildEntries('<albumKey>', ...)`.

Adding homepage photos:
1. Homepage photos are album photos — pick existing `photoDB` entries and list
   their filenames in that album's `buildEntries(...)` `homepageFiles` argument.
2. Never copy files for the homepage; the rotation is `photoDB.filter(p =>
   p.homepage)`.

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
      (homepage photo, album cover images).

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
