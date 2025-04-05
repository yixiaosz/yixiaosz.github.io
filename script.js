document.addEventListener('DOMContentLoaded', () => {
    // --- Helper Function for Generating Photo Lists ---
    function generatePhotoList(baseName, startNum, endNum, digits, extension) {
        const photos = [];
        for (let i = startNum; i <= endNum; i++) {
            const numStr = i.toString().padStart(digits, '0');
            photos.push(`${baseName}${numStr}${extension}`);
        }
        return photos;
    }

    // --- Configuration ---

    // List filenames in your homepagePhotos folder EXACTLY.
    // Make sure these files exist in the /homepagePhotos/ directory.
    const homepagePhotoFiles = generatePhotoList('home', 1, 9, 5, '.jpg');
    const homepagePhotoBasePath = 'homepagePhotos/'; // Path relative to HTML files

    // Define your albums here.
    // The key (e.g., 'urban_landscapes') MUST match the folder name in the /albums/ directory.
    // Inside each album object:
    //   - title: The display name for the album on the albums page.
    //   - photos: An array of EXACT filenames within that album's folder (e.g., /albums/urban_landscapes/photo1.jpg).
    //             DO NOT include 'thumb.jpg' in this 'photos' array.
    const albumsData = {
        'melbourne': {
            title: "Melbourne Late Summer\nMarch 2025",
            photos: generatePhotoList('melbourne2023', 1, 10, 2, '.jpg').concat([
            ])
        },
        'utah': {
            title: "Utah Road Trip\nDecember 2024",
            photos: [
                'image4.jpg',
                'image5.jpg',
                'image6.jpg'
            ]
        },

        'doorscdmx': {
            title: "Doors and Windows of Mexico City\nDecember 2023",
            photos: generatePhotoList('doorsCDMX', 1, 13, 2, '.jpg').concat([
            ])
        },

        'cdmx': {
            title: "CDMX\nDecember 2023",
            photos: generatePhotoList('cdmx', 1, 15, 2, '.jpg').concat([
            ])
        },

        'turkey2023': {
            title: "From the Aegean to the Black Sea\nOctober 2023 in Turkey",
            photos: generatePhotoList('turkey2023', 1, 20, 2, '.jpg').concat([
            ])
        },

        'croatia2023': {
            title: "Dream of Ariatic\nApril 2023 in Croatia",
            photos: generatePhotoList('croatia', 1, 37, 5, '.jpg').concat([
                // Add any additional unique filenames for this album here, e.g.:
                // 'special_view.jpg',
                // 'different_angle.png'
            ])
        },

    };
    const albumsBasePath = 'albums/'; // Path relative to HTML files

    // --- Global Variables & DOM Elements ---
    let currentPhotoList = []; // Holds the list of photo URLs currently being viewed (homepage or album)
    let currentPhotoIndex = 0;
    let currentAlbumContext = null; // To know which album we are inspecting

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
    function showInspector(photoList, startIndex, albumContext = null) {
        if (!photoInspector || !inspectorImage || !photoList || photoList.length === 0) {
            console.error("Inspector elements or photo list missing.");
            return;
        }

        currentPhotoList = photoList;
        currentPhotoIndex = startIndex;
        currentAlbumContext = albumContext; // Store album context if provided
        updateInspectorImage();
        photoInspector.classList.add('visible'); // Use class to show with transition
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
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
        currentAlbumContext = null;
    }

    function updateInspectorImage() {
        if (!inspectorImage || currentPhotoList.length === 0) return;

        // Ensure index is within bounds (useful for initial load or edge cases)
        currentPhotoIndex = (currentPhotoIndex + currentPhotoList.length) % currentPhotoList.length;

        const imageUrl = currentPhotoList[currentPhotoIndex];
        inspectorImage.src = imageUrl;
        inspectorImage.alt = `Photograph ${currentPhotoIndex + 1} of ${currentPhotoList.length}`;

        // Disable/Enable buttons at ends
        inspectorPrevBtn.disabled = currentPhotoList.length <= 1;
        inspectorNextBtn.disabled = currentPhotoList.length <= 1;
    }


    function showNextInspectorImage() {
        if (currentPhotoList.length === 0) return;
        currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotoList.length;
        updateInspectorImage();
    }

    function showPrevInspectorImage() {
        if (currentPhotoList.length === 0) return;
        currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotoList.length) % currentPhotoList.length;
        updateInspectorImage();
    }

    // Keyboard navigation for inspector
    function handleInspectorKeys(event) {
        if (!photoInspector.classList.contains('visible')) return; // Only act if inspector is visible

        if (event.key === 'ArrowRight') {
            showNextInspectorImage();
        } else if (event.key === 'ArrowLeft') {
            showPrevInspectorImage();
        } else if (event.key === 'Escape') {
            hideInspector();
        }
    }

    // --- Homepage Logic ---
    function loadHomepagePhoto(index) {
        if (!homepagePhotoElement || homepagePhotoFiles.length === 0) return;
        // Ensure index is valid
        currentPhotoIndex = (index + homepagePhotoFiles.length) % homepagePhotoFiles.length;
        const photoPath = homepagePhotoBasePath + homepagePhotoFiles[currentPhotoIndex];
        homepagePhotoElement.src = photoPath;
        homepagePhotoElement.alt = `Homepage Photograph ${currentPhotoIndex + 1}`;
    }

    function setupHomepage() {
        if (!homepagePhotoElement || !homepagePrevBtn || !homepageNextBtn || homepagePhotoFiles.length === 0) {
            // console.log("Homepage elements not found or no photos configured.");
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

        // Click on homepage photo to open inspector
        // homepagePhotoElement.addEventListener('click', () => {
        //     const fullPathList = homepagePhotoFiles.map(file => homepagePhotoBasePath + file);
        //     showInspector(fullPathList, currentPhotoIndex);
        // });
    }

    // --- Albums Page Logic ---
    function loadAlbumGallery() {
        if (!albumGalleryContainer || Object.keys(albumsData).length === 0) {
            // console.log("Album gallery container not found or no albums configured.");
            return; // Exit if not on albums page or no albums
        }

        albumGalleryContainer.innerHTML = ''; // Clear existing content

        for (const albumKey in albumsData) {
            const album = albumsData[albumKey];
            const albumPath = albumsBasePath + albumKey + '/';
            const thumbPath = albumPath + 'thumb.jpg'; // Standard thumbnail name

            const albumItem = document.createElement('div');
            albumItem.classList.add('album-item');

            // Use an anchor tag for the whole item to make it clickable
            const albumLink = document.createElement('a');
            albumLink.href = '#'; // Prevent page jump, handle click via JS
            albumLink.classList.add('album-link');
            albumLink.dataset.albumKey = albumKey; // Store album key for click handler

            const img = document.createElement('img');
            img.src = thumbPath;
            img.alt = album.title || albumKey; // Use title or key as alt text
            // Add error handling for missing thumbnails
            img.onerror = () => {
                img.alt = `Thumbnail not found for ${album.title || albumKey}`;
                // Optionally display a placeholder image or style the container
                // img.src = 'path/to/placeholder-thumb.jpg';
                albumItem.style.border = '1px dashed #ccc'; // Example visual cue
            };

            const title = document.createElement('p');
            title.textContent = album.title || albumKey.replace(/_/g, ' '); // Use title or formatted key

            albumLink.appendChild(img);
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
                if (albumKey && albumsData[albumKey] && albumsData[albumKey].photos.length > 0) {
                    const albumPath = albumsBasePath + albumKey + '/';
                    const photoPaths = albumsData[albumKey].photos.map(file => albumPath + file);
                    showInspector(photoPaths, 0, albumKey); // Open inspector with this album's photos
                } else {
                    console.warn(`Album data or photos not found for key: ${albumKey}`);
                    // Optionally show a message to the user
                }
            }
        });
    }


    // --- Initialization ---

    // Setup Inspector Buttons (always needed if inspector exists)
    if (photoInspector) {
        inspectorBackBtn.addEventListener('click', hideInspector);
        inspectorPrevBtn.addEventListener('click', showPrevInspectorImage);
        inspectorNextBtn.addEventListener('click', showNextInspectorImage);
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
