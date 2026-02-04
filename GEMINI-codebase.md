# Codebase Documentation: Yixiao Zhang's Portfolio

## Overview
This repository contains a personal photography portfolio website for Yixiao Zhang. It is a static site built with HTML, CSS, and vanilla JavaScript, designed to showcase various photo albums and featured photographs.

## Project Structure

### Core Files
- `index.html`: The landing page, featuring a rotating selection of photographs from `homepagePhotos/`.
- `albums.html`: The gallery page that displays all available photo albums as thumbnails.
- `information.html`: An "About" or information page (referenced in navigation).
- `script.js`: Central logic for the site, including:
    - Photo list generation (`generatePhotoList`).
    - Album metadata and photo definitions (`albumsData`).
    - The "Photo Inspector" overlay logic for full-screen photo viewing.
    - Page-specific initialization (`setupHomepage`, `loadAlbumGallery`).
- `style.css`: Site-wide styling, including responsive layouts and the inspector overlay.

### Assets
- `homepagePhotos/`: Contains images displayed on the home page (e.g., `home00001.jpg`).
- `albums/`: Root directory for all photo albums.
    - Each subfolder (e.g., `cdmx/`, `melbourne/`) represents an album.
    - `thumb.jpg`: Every album folder **must** contain a `thumb.jpg` for the gallery display.
    - Album images follow specific naming conventions (e.g., `cdmx01.jpg`) defined in `script.js`.

## Key Technical Details

### Photo Inspector
Instead of navigating to separate pages for individual photos or albums, the site uses a "Photo Inspector" (`#photo-inspector`).
- It is a fixed-position overlay (`.photo-inspector-overlay`) that is hidden by default.
- It is triggered when an album is clicked in `albums.html`.
- It supports keyboard navigation (Left/Right arrows for photos, Escape to close).

### Album Management
Albums are managed via the `albumsData` constant in `script.js`.
- **Key**: Folder name in the `albums/` directory.
- **title**: Display title (supports `
` for line breaks).
- **photos**: An array of photo filenames. Usually generated using `generatePhotoList`.

### Photo Naming Convention
The helper function `generatePhotoList(baseName, startNum, endNum, digits, extension)` is used to automate the inclusion of large photo sets.
- Example: `generatePhotoList('home', 1, 9, 5, '.jpg')` generates `home00001.jpg` through `home00009.jpg`.

## Development Workflows
- **Adding an Album**:
    1. Create a folder in `albums/`.
    2. Add `thumb.jpg` and all album photos.
    3. Register the album in `albumsData` within `script.js`.
- **Adding Homepage Photos**:
    1. Add images to `homepagePhotos/`.
    2. Update `homepagePhotoFiles` in `script.js` (usually by adjusting `generatePhotoList` parameters).
- **Styling**: All styles are in `style.css`. The site uses the 'Roboto' font and a clean, minimalist design with a fixed header.
