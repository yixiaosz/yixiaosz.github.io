# Active Context: Code Refactoring & Performance Optimization

## Current Status
The project is a functional static photography portfolio. The codebase uses vanilla JS for dynamic content injection (albums, homepage photos, and the photo inspector).

## Immediate Goals
1.  **Reduce Code Redundancy:** Review `script.js` to consolidate duplicate logic and remove any unused functions.
2.  **Improve Loading Speed:** Implement AVIF image support with JPEG fallbacks to reduce bandwidth usage while maintaining browser compatibility.
3.  **Optimize Image Delivery:** Ensure the browser only downloads the most efficient supported format (AVIF > JPEG).

## Planned Changes

### JavaScript Refactoring
- [ ] Analyze `script.js` for overlapping logic between the homepage, album gallery, and photo inspector.
- [ ] Identify opportunities for higher-level abstractions in photo loading and navigation.

### AVIF Implementation
- [ ] Update `script.js` to support multiple image formats.
- [ ] Implement a mechanism (e.g., `<picture>` tag generation or modern JS-based feature detection) to prioritize AVIF files.
- [ ] Verify that only one format is downloaded per image request.

## Considerations
- **Backward Compatibility:** All new implementations must fall back gracefully to JPEG for older browsers.
- **File Structure:** This will require creating AVIF versions of existing images in `homepagePhotos/` and `albums/`.
- **Dynamic Injection:** Since images are injected via JS, the implementation must handle the transition from simple `<img>` tags to more complex structures if necessary.
