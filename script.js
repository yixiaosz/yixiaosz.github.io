document.addEventListener('DOMContentLoaded', () => {
    // --- Helper Functions ---
    function generatePhotoList(baseName, startNum, endNum, digits, extension) {
        const photos = [];
        for (let i = startNum; i <= endNum; i++) {
            const numStr = i.toString().padStart(digits, '0');
            photos.push(`${baseName}${numStr}${extension}`);
        }
        return photos;
    }

    // Wrap an index into [0, length), handling negatives for backwards navigation.
    function wrapIndex(index, length) {
        return (index % length + length) % length;
    }

    // Derive modern-format variants of a JPEG path (same basename, new extension).
    function photoVariants(jpgPath) {
        return {
            avif: jpgPath.replace(/\.jpg$/i, '.avif'),
            webp: jpgPath.replace(/\.jpg$/i, '.webp'),
            jpg: jpgPath
        };
    }

    // Point a <picture>-wrapped <img> at a photo: sets AVIF/WebP srcset on the
    // sibling <source> elements and the JPEG src/alt on the <img> itself.
    function setPictureSource(imgElement, jpgPath, altText) {
        const variants = photoVariants(jpgPath);
        const picture = imgElement.closest('picture');
        if (picture) {
            picture.querySelector('source[type="image/avif"]').srcset = variants.avif;
            picture.querySelector('source[type="image/webp"]').srcset = variants.webp;
        }
        imgElement.src = variants.jpg;
        imgElement.alt = altText;
    }

    // --- Configuration ---

    // All photos live in the flat /photos/ directory. Organization is tag-based:
    // each photoDB entry records which album a photo belongs to and whether it
    // appears in the homepage rotation.
    const photosBasePath = 'photos/'; // Path relative to HTML files

    // Album display metadata and cover image. Object key order = gallery order.
    const albumsMeta = {
        'colorado2025': { title: "Colorado on Medium Format\nJune 2025", cover: 'colorado2025-thumb.jpg' },
        'melbourne': { title: "Melbourne Late Summer\nMarch 2025", cover: 'melbourne-thumb.jpg' },
        'utah': { title: "Utah Road Trip\nDecember 2024", cover: 'utah-thumb.jpg' },
        'doorscdmx': { title: "Doors and Windows of Mexico City\nDecember 2023", cover: 'doorscdmx-thumb.jpg' },
        'cdmx': { title: "CDMX\nDecember 2023", cover: 'cdmx-thumb.jpg' },
        'turkey2023': { title: "From the Aegean to the Black Sea\nSummer 2023 in Turkey", cover: 'turkey2023-thumb.jpg' },
        'croatia2023': { title: "Dream of Ariatic\nApril 2023 in Croatia", cover: 'croatia2023-thumb.jpg' },
    };

    // Build photoDB entries for an album from its exact filenames in /photos/.
    // Files listed in homepageFiles also appear in the homepage rotation.
    function buildEntries(album, files, homepageFiles = []) {
        return files.map(file => ({ file, album, homepage: homepageFiles.includes(file) }));
    }

    const photoDB = [
        ...buildEntries('colorado2025', generatePhotoList('colorado2025-', 1, 23, 1, '.jpg'), [
            'colorado2025-1.jpg', 'colorado2025-9.jpg', 'colorado2025-14.jpg', 'colorado2025-20.jpg'
        ]),
        ...buildEntries('melbourne', generatePhotoList('melbourne2023', 1, 10, 2, '.jpg'), [
            'melbourne202301.jpg', 'melbourne202304.jpg', 'melbourne202305.jpg'
        ]),
        ...buildEntries('utah', [
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
        ]),
        ...buildEntries('doorscdmx', generatePhotoList('doorsCDMX', 1, 13, 2, '.jpg'), [
            'doorsCDMX01.jpg', 'doorsCDMX11.jpg'
        ]),
        ...buildEntries('cdmx', generatePhotoList('cdmx', 1, 15, 2, '.jpg')),
        ...buildEntries('turkey2023', generatePhotoList('turkey2023', 1, 20, 2, '.jpg')),
        ...buildEntries('croatia2023', generatePhotoList('croatia', 1, 37, 5, '.jpg'), [
            'croatia00006.jpg', 'croatia00015.jpg', 'croatia00021.jpg', 'croatia00037.jpg'
        ]),
    ];

    // Homepage rotation = every photo tagged homepage: true.
    const homepagePhotoFiles = photoDB.filter(p => p.homepage).map(p => p.file);

    // Album photos in gallery/inspector order.
    function albumPhotoFiles(albumKey) {
        return photoDB.filter(p => p.album === albumKey).map(p => p.file);
    }

    // --- Global Variables & DOM Elements ---
    let currentPhotoList = []; // Holds the list of photo URLs currently being viewed (homepage or album)
    let currentPhotoIndex = 0;

    // Inspector Elements
    const photoInspector = document.getElementById('photo-inspector');
    const inspectorImage = document.getElementById('inspector-image');
    const inspectorBackBtn = document.getElementById('inspector-back');
    const inspectorPrevBtn = document.getElementById('inspector-prev');
    const inspectorNextBtn = document.getElementById('inspector-next');

    // Homepage Elements (check if they exist)
    const homepagePhotoElement = document.getElementById('homepage-photo');
    const homepagePrevBtn = document.getElementById('prev-photo');
    const homepageNextBtn = document.getElementById('next-photo');

    // Albums Page Elements (check if they exist)
    const albumGalleryContainer = document.getElementById('album-gallery');

    // --- Photo Inspector Logic ---
    function showInspector(photoList, startIndex) {
        if (!photoInspector || !inspectorImage || !photoList || photoList.length === 0) {
            console.error("Inspector elements or photo list missing.");
            return;
        }

        currentPhotoList = photoList;
        currentPhotoIndex = startIndex;
        // Reveal the overlay only once the first image has loaded (or failed),
        // so neither a stale frame nor an empty one is ever shown.
        const reveal = () => {
            photoInspector.classList.add('visible'); // Show the overlay
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        };
        inspectorImage.addEventListener('load', reveal, { once: true });
        inspectorImage.addEventListener('error', reveal, { once: true });
        updateInspectorImage();
        // Add key listeners when inspector is open
        document.addEventListener('keydown', handleInspectorKeys);
    }

    function hideInspector() {
        if (!photoInspector) return;
        photoInspector.classList.remove('visible');
        document.body.style.overflow = ''; // Restore scrolling
        // Remove key listeners when inspector is closed
        document.removeEventListener('keydown', handleInspectorKeys);
        currentPhotoList = []; // Clear the list
        currentPhotoIndex = 0;
        // Clear the displayed image so reopening never flashes the previous photo
        const picture = inspectorImage.closest('picture');
        if (picture) {
            picture.querySelectorAll('source').forEach(s => s.removeAttribute('srcset'));
        }
        inspectorImage.removeAttribute('src');
    }

    function updateInspectorImage() {
        if (!inspectorImage || currentPhotoList.length === 0) return;

        // Ensure index is within bounds (useful for initial load or edge cases)
        currentPhotoIndex = wrapIndex(currentPhotoIndex, currentPhotoList.length);

        const imageUrl = currentPhotoList[currentPhotoIndex];
        setPictureSource(inspectorImage, imageUrl, `Photograph ${currentPhotoIndex + 1} of ${currentPhotoList.length}`);

        // Disable/Enable buttons at ends
        inspectorPrevBtn.disabled = currentPhotoList.length <= 1;
        inspectorNextBtn.disabled = currentPhotoList.length <= 1;
    }


    function stepInspectorImage(delta) {
        if (currentPhotoList.length === 0) return;
        currentPhotoIndex = wrapIndex(currentPhotoIndex + delta, currentPhotoList.length);
        updateInspectorImage();
    }

    // Keyboard navigation for inspector
    function handleInspectorKeys(event) {
        if (!photoInspector.classList.contains('visible')) return; // Only act if inspector is visible

        if (event.key === 'ArrowRight') {
            stepInspectorImage(1);
        } else if (event.key === 'ArrowLeft') {
            stepInspectorImage(-1);
        } else if (event.key === 'Escape') {
            hideInspector();
        }
    }

    // --- Homepage Logic ---
    function loadHomepagePhoto(index) {
        if (!homepagePhotoElement || homepagePhotoFiles.length === 0) return;
        // Ensure index is valid
        currentPhotoIndex = wrapIndex(index, homepagePhotoFiles.length);
        const photoPath = photosBasePath + homepagePhotoFiles[currentPhotoIndex];
        setPictureSource(homepagePhotoElement, photoPath, `Homepage Photograph ${currentPhotoIndex + 1}`);
    }

    function setupHomepage() {
        if (!homepagePhotoElement || !homepagePrevBtn || !homepageNextBtn || homepagePhotoFiles.length === 0) {
            return; // Exit if not on homepage or no photos
        }

        // Load initial random photo
        const randomIndex = Math.floor(Math.random() * homepagePhotoFiles.length);
        loadHomepagePhoto(randomIndex);

        // Homepage navigation buttons
        homepagePrevBtn.addEventListener('click', () => {
            loadHomepagePhoto(currentPhotoIndex - 1);
        });

        homepageNextBtn.addEventListener('click', () => {
            loadHomepagePhoto(currentPhotoIndex + 1);
        });
    }

    // --- Albums Page Logic ---
    function loadAlbumGallery() {
        if (!albumGalleryContainer || Object.keys(albumsMeta).length === 0) {
            return; // Exit if not on albums page or no albums
        }

        albumGalleryContainer.innerHTML = ''; // Clear existing content

        for (const albumKey in albumsMeta) {
            const album = albumsMeta[albumKey];
            const thumbPath = photosBasePath + album.cover;

            const albumItem = document.createElement('div');
            albumItem.classList.add('album-item');

            // Use an anchor tag for the whole item to make it clickable
            const albumLink = document.createElement('a');
            albumLink.href = '#'; // Prevent page jump, handle click via JS
            albumLink.classList.add('album-link');
            albumLink.dataset.albumKey = albumKey; // Store album key for click handler

            // Build <picture> with AVIF/WebP sources and a JPEG <img> fallback
            const thumbVariants = photoVariants(thumbPath);
            const picture = document.createElement('picture');

            const avifSource = document.createElement('source');
            avifSource.type = 'image/avif';
            avifSource.srcset = thumbVariants.avif;

            const webpSource = document.createElement('source');
            webpSource.type = 'image/webp';
            webpSource.srcset = thumbVariants.webp;

            const img = document.createElement('img');
            img.src = thumbVariants.jpg;
            img.loading = 'eager'; // Album covers are eagerly loaded per site guideline
            img.alt = album.title || albumKey; // Use title or key as alt text
            // Add error handling for missing thumbnails
            img.onerror = () => {
                img.alt = `Thumbnail not found for ${album.title || albumKey}`;
                albumItem.style.border = '1px dashed #ccc'; // Example visual cue
            };

            picture.append(avifSource, webpSource, img);

            const title = document.createElement('p');
            title.textContent = album.title || albumKey.replace(/_/g, ' '); // Use title or formatted key

            albumLink.appendChild(picture);
            albumLink.appendChild(title);
            albumItem.appendChild(albumLink);
            albumGalleryContainer.appendChild(albumItem);
        }

        // Add single event listener to the gallery container (Event Delegation)
        albumGalleryContainer.addEventListener('click', (event) => {
            const clickedLink = event.target.closest('.album-link'); // Find the nearest album link ancestor
            if (clickedLink) {
                event.preventDefault(); // Prevent default anchor behavior
                const albumKey = clickedLink.dataset.albumKey;
                const albumFiles = albumKey ? albumPhotoFiles(albumKey) : [];
                if (albumFiles.length > 0) {
                    const photoPaths = albumFiles.map(file => photosBasePath + file);
                    showInspector(photoPaths, 0); // Open inspector with this album's photos
                } else {
                    console.warn(`Album data or photos not found for key: ${albumKey}`);
                }
            }
        });
    }


    // --- Initialization ---

    // Setup Inspector Buttons (always needed if inspector exists)
    if (photoInspector) {
        inspectorBackBtn.addEventListener('click', hideInspector);
        inspectorPrevBtn.addEventListener('click', () => stepInspectorImage(-1));
        inspectorNextBtn.addEventListener('click', () => stepInspectorImage(1));
        // Close inspector if clicking the background overlay itself
        photoInspector.addEventListener('click', (event) => {
            if (event.target === photoInspector) { // Check if the click is directly on the overlay
                hideInspector();
            }
            
        });
    } else {
        console.error("Photo inspector element not found in the HTML.");
    }

    // Run page-specific setup
    setupHomepage();
    loadAlbumGallery();

}); // End DOMContentLoaded
