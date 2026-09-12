/**
 * =============================================================================
 * SCRIPTS.JS - Multi-Page Controller & Interactive Tour Engine
 * =============================================================================
 * This script provides core application logic across multiple pages:
 * - Guided Tour Engine (tour.html): URL parameter routing, director-filtered
 *   GeoJSON map rendering, smooth camera fly-to animations, narrative stop-by-stop
 *   presentation, progress tracking, and tour navigation controls.
 * - Catalogue Controller (catalogue.html): Location card grid rendering, responsive
 *   desktop filter sidebar toggling, dynamic smart pagination with ellipses,
 *   and automatic scroll-to-top on page transitions.
 * - Global Theme Switcher: Dynamic CSS stylesheet swapping with persistence
 *   in browser localStorage across all site pages.
 * =============================================================================
 */

// =============================================================================
// GLOBAL STATE VARIABLES (FOR TOUR PAGE)
// =============================================================================

// Leaflet Map instance dedicated to the tour view
let mapTour = null;

// Sequentially ordered array of Leaflet marker layers representing tour stops
let tourLayers = [];

// Loaded tour configuration object from data/tour_data.json matching active director
let currentTourData = null;

// Zero-based index tracking the currently active location stop in the tour
let currentTourIndex = 0; 


// =============================================================================
// PAGE CONTROLLERS DICTIONARY
// =============================================================================

/**
 * Route dictionary containing initialization routines keyed by document.body.dataset.page.
 * Automatically executed when the DOM is fully loaded.
 */
const pages = {
    // -------------------------------------------------------------------------
    // CATALOGUE PAGE CONTROLLER (catalogue.html)
    // -------------------------------------------------------------------------
    catalogue: () => {
        // Desktop filter sidebar collapse/expand toggle elements
        const desktopToggleBtn = document.getElementById("desktop_filter_toggle");
        const filterSidebar = document.getElementById("filters_menu");
            
        // Attach click listener to toggle desktop filter sidebar visibility
        if (desktopToggleBtn && filterSidebar) {
            desktopToggleBtn.addEventListener("click", () => {
                filterSidebar.classList.toggle("collapsed-desktop"); // Toggle collapsed class on sidebar
                desktopToggleBtn.classList.toggle("is-open");         // Toggle open state on toggle button
            });
        }

        // Pagination container element
        const paginationContainer = document.getElementById('pagination');
        if (paginationContainer) {
            // Event delegation: handle clicks on pagination buttons (arrows and page numbers)
            paginationContainer.addEventListener('click', (e) => {
                // Find closest button ancestor of the clicked element
                const btn = e.target.closest('button');
                // Ignore clicks that didn't hit a button or hit a disabled button
                if (!btn || btn.disabled) return;

                // Calculate total number of pages based on total locations and items per page
                const totalPages = Math.ceil(catalogueState.allLocations.length / catalogueState.itemsPerPage) || 1;
                let targetPage = catalogueState.currentPage;

                // Handle Prev/Next arrow navigation (-1 or +1)
                if (btn.classList.contains('arrow')) {
                    const dir = parseInt(btn.dataset.dir, 10);
                    targetPage += dir;
                // Handle numeric page button navigation
                } else if (btn.dataset.page) {
                    targetPage = parseInt(btn.dataset.page, 10);
                }

                // Verify target page is within valid boundaries and differs from active page
                if (targetPage >= 1 && targetPage <= totalPages && targetPage !== catalogueState.currentPage) {
                    // Render requested page
                    displayCataloguePage(targetPage);

                    // Smoothly scroll viewport back to top of catalogue cards section
                    const titleOrCards = document.getElementById('catalogue_page_title') || document.getElementById('cardSection');
                    if (titleOrCards) {
                        titleOrCards.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        }

        // Asynchronously fetch catalogue locations metadata
        loadJson().then(locations => {
            if (locations && locations.length > 0) {
                // Store loaded locations in state and render page 1
                catalogueState.allLocations = locations;
                displayCataloguePage(1);
            } else {
                // Fallback to empty state if no locations returned
                renderCatalogueCards([]);
            }
        });
    },
    
    // -------------------------------------------------------------------------
    // TOUR PAGE CONTROLLER (tour.html)
    // -------------------------------------------------------------------------
    tour: async () => {
        // Extract 'keyword' query parameter from current URL (e.g. tour.html?keyword=Jean-Luc+Godard)
        const urlParams = new URLSearchParams(window.location.search);
        const targetKeyword = urlParams.get('keyword') || 'Jean-Luc Godard';
        
        // Instantiate Leaflet map centered on Paris coordinates [lat, lng] at zoom level 13
        // Default zoom control disabled to position it cleanly in bottom-right
        mapTour = L.map("map", { zoomControl: false }).setView([48.8566, 2.3522], 13);
            
        // Add zoom controls to bottom-right corner
        L.control.zoom({ position: 'bottomright' }).addTo(mapTour);
        // Add OpenStreetMap raster tile layer with zoom bounds and copyright attribution
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 12,
            maxZoom: 17,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapTour);

        // Fetch GeoJSON film locations filtered for the selected director
        const filteredGeoData = await filteredLoadGeoData(targetKeyword);
        if (filteredGeoData) {
            // Render filtered location pins on map and store layer references
            addGeoDataTour(filteredGeoData);
        }
        
        // Fetch textual narrative content and tour metadata for this director
        currentTourData = await loadTourTextData(targetKeyword); 
        currentTourIndex = 0; // Initialize tour at first stop

        // If tour data contains locations, render initial location story paragraph
        if (currentTourData && currentTourData.locations.length > 0) {
            showParagraph(0);
        }

        // Select navigation buttons for both desktop and mobile layouts
        const prevButtons = document.querySelectorAll('#btn-prev, #btn-prev-mobile');
        const nextButtons = document.querySelectorAll('#btn-next, #btn-next-mobile');

        // Initialize progress bar visual fill
        updateProgressBar();

        // Attach click listeners to Next buttons: advance stop, fly map camera, update story text
        nextButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (currentTourData && currentTourIndex < currentTourData.locations.length - 1){
                    currentTourIndex++;
                    goToLocation(currentTourIndex);
                    showParagraph(currentTourIndex);
                }
            });
        });

        // Attach click listeners to Prev buttons: move back one stop, fly map camera, update story text
        prevButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (currentTourIndex > 0){
                    currentTourIndex--;
                    goToLocation(currentTourIndex);
                    showParagraph(currentTourIndex);
                }
            });
        });

        // Attach click listener to "Back to first" button: reset tour directly to stop 0
        const backToFirstBtn = document.getElementById('backToFirst');
        if (backToFirstBtn) {
            backToFirstBtn.addEventListener('click', () => {
                currentTourIndex = 0;
                showParagraph(currentTourIndex);
                goToLocation(currentTourIndex);
            });
        }

        // Initialize button enabled/disabled states based on initial stop index
        updateBtnStatus();

        const tourOptions = document.querySelectorAll('.tour-option');
        const dropdownButton = document.getElementById('tourDropdownMenuButton');

        if (tourOptions.length > 0) {
            tourOptions.forEach(option => {
                option.addEventListener('click', async (event) => {
                    const newKeyword = event.target.getAttribute('data-keyword');
                    if (!newKeyword) return;

                    if (dropdownButton) {
                        dropdownButton.textContent = newKeyword; // Update dropdown button text to reflect selected director
                    }

                    if (typeof currentLayer !== 'undefined' && currentLayer) {
                        mapTour.removeLayer(currentLayer);
                    }
                    tourLayers = []; 
                    
                    const newGeoData = await filteredLoadGeoData(newKeyword);
                    if (newGeoData) {
                        addGeoDataTour(newGeoData);
                    }
                    
                    currentTourData = await loadTourTextData(newKeyword);
                    currentTourIndex = 0; 

                    if (currentTourData && currentTourData.locations.length > 0) {
                        showParagraph(0);
                    }
                    
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set('regista', newKeyword);
                    window.history.pushState({}, '', newUrl);
                });
            });
        }
    }
};


// =============================================================================
// TOUR NAVIGATION & UI HELPERS
// =============================================================================

/**
 * Updates the disabled states of Prev and Next navigation buttons,
 * and controls the visibility and layout animation of the "Back to first" button.
 */
function updateBtnStatus() {
    if (!currentTourData) return;

    // Retrieve desktop and mobile button elements
    const prevButtons = document.querySelectorAll('#btn-prev, #btn-prev-mobile');
    const nextButtons = document.querySelectorAll('#btn-next, #btn-next-mobile');
    const backToFirstBtn = document.getElementById('backToFirst');

    // Disable Prev button if user is on the first stop (index 0)
    prevButtons.forEach(button => {
        button.disabled = (currentTourIndex === 0);
    });

    // Disable Next button if user has reached the final tour stop
    nextButtons.forEach(button => {
        button.disabled = (currentTourIndex === currentTourData.locations.length - 1);
    });

    // Manage visibility and layout preservation for "Back to first" button
    if (backToFirstBtn) {
        if (currentTourIndex === 0) {
            // Measure current height before hiding to avoid abrupt layout shift in container
            const buttonHeight = backToFirstBtn.offsetHeight;
            backToFirstBtn.style.setProperty('display', 'none', 'important');
            const container = document.getElementById('backToFirstContainer');
            if (container && buttonHeight > 0) container.style.height = buttonHeight + 'px';
            backToFirstBtn.style.setProperty('animation', 'fade 1s ease forwards', 'important');
        } else {
            // Show button when beyond the first stop
            backToFirstBtn.style.setProperty('display', 'inline-flex', 'important');    
            const container = document.getElementById('backToFirstContainer');
            if (container) container.style.height = 'auto'; // Reset container height
        }
    }
}

/**
 * Updates the progress bar width based on current tour step completion percentage.
 */
function updateProgressBar() {
    const progress = document.querySelector('.progress-bar');
    if (progress && currentTourData) {
        // Calculate percentage: (currentStep / totalSteps) * 100
        progress.style.width = ((currentTourIndex + 1) / currentTourData.locations.length * 100) + '%';
    }
}

/**
 * Coordinates UI updates when moving to a new tour stop:
 * updates narrative texts, updates button statuses, and recalculates the progress bar.
 * @param {number} newIndex - Index of the newly selected tour stop.
 */
function showParagraph(newIndex) {
    updateLocationTexts(newIndex);
    updateBtnStatus();
    updateProgressBar();
}


// =============================================================================
// DATA FETCHING & FILTERING FUNCTIONS
// =============================================================================

/**
 * Fetches JSON file containing metadata (extended descriptions, photos) for Paris locations.
 * @returns {Promise<Array>} Array of metadata objects, or empty array on error.
 */
function loadJson() {
    return fetch("data/paris_metadata.json")
        .then(function(response) {
            if (!response.ok) throw new Error("HTTP error " + response.status);
            return response.json();
        })
        .catch(function(error) {
            console.error("Fetch error metadata: ", error);
            return [];
        });
}

/**
 * Fetches tour narrative data and populates introductory tour header details
 * (title, description, thematic tags/pills) for the selected director keyword.
 * @param {string} targetKeyword - Director name to find matching tour for.
 * @returns {Promise<Object|null>} Matched tour object or null if not found.
 */
async function loadTourTextData(targetKeyword) {
    try {
        const response = await fetch('data/tour_data.json'); 
        const toursArray = await response.json();

        // Find tour matching the specified director keyword
        let filteredTourData = toursArray.find(tour => tour.keywords === targetKeyword);

        if (filteredTourData) {
            // Update DOM headers and introductory descriptions
            const titleSect = document.getElementById('title-section');
            const descSect = document.getElementById('description-section');
            const pillSecOne = document.getElementById('pillsOneSection');
            const pillSecTwo = document.getElementById('pillsTwoSection');
            const pillSecThree = document.getElementById('pillsThreeSection');

            if (titleSect) titleSect.innerHTML = `<h2>${filteredTourData.tour_name}</h2>`;
            if (descSect) descSect.innerHTML = `<p>${filteredTourData.description}</p>`;
            // Populate thematic badges/pills
            if (pillSecOne) pillSecOne.innerHTML = `${filteredTourData.pills[0]}`;
            if (pillSecTwo) pillSecTwo.innerHTML = `${filteredTourData.pills[1]}`;
            if (pillSecThree) pillSecThree.innerHTML = `${filteredTourData.pills[2]}`;

            return filteredTourData;
        } else {
            console.warn("Nessun tour trovato per:", targetKeyword);
            return null;
        }
    } catch (error) {
        console.error("Errore nel fetch del file JSON testuale:", error);
        return null;
    }
}

/**
 * Fetches GeoJSON file and filters features array to include only locations
 * associated with the specified director.
 * @param {string} targetKeyword - Director name used for filtering.
 * @returns {Promise<Object|null>} Filtered GeoJSON object or null on error.
 */
function filteredLoadGeoData(targetKeyword) {
    return fetch("data/paris.geojson")
        .then(function(response){
            if (!response.ok) throw new Error("HTTP error " + response.status);
            return response.json();
        })
        .then(data => {
            // Filter features matching the requested director
            const filteredFeatures = data.features.filter(feature => 
                    feature.properties.director && 
                    feature.properties.director === targetKeyword
            );
            // Return shallow copy of GeoJSON with filtered features array
            return { ...data, features: filteredFeatures };
        })
        .catch(function(error){
            console.error("Fetch error GeoJSON: ", error);
            return null;
        });
}


// =============================================================================
// TOUR MAP RENDERING & ANIMATION
// =============================================================================

/**
 * Renders filtered GeoJSON features onto the map, binds popups,
 * stores marker layers into the ordered tourLayers array, and navigates to stop 0.
 * @param {Object} geojson - Filtered GeoJSON feature collection.
 */
function addGeoDataTour(geojson) {
    if (!geojson || geojson.features.length === 0) return;
    tourLayers = []; // Reset tour layers array

    // Instantiate GeoJSON layer and collect markers sequentially
    const currentLayer = L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(createPopupContentTour(feature)); // Bind card popup
            tourLayers.push(layer); // Store layer reference in sequential tour order
        }
    }).addTo(mapTour);

    // If locations were loaded, fly camera directly to the first stop
    if (tourLayers.length > 0) {
        goToLocation(0);
    }
}

/**
 * Smoothly animates the map viewport camera (flyTo) to the coordinates
 * of the tour stop at the given index, and opens its marker popup.
 * @param {number} index - Index of the target location in tourLayers.
 */
function goToLocation(index) {
    if (!tourLayers[index]) return;
    const targetLayer = tourLayers[index];
    // Smooth flight animation to marker coordinates at zoom 16 over 1.5 seconds
    mapTour.flyTo(targetLayer.getLatLng(), 16, { animate: true, duration: 1.5 });
    targetLayer.openPopup(); // Display marker popup card
}

/**
 * Generates HTML string for a Leaflet marker popup card on the tour map.
 * @param {Object} feature - GeoJSON feature representing a film location.
 * @returns {string} HTML markup for the popup card.
 */
function createPopupContentTour(feature) {
    var props = feature.properties || {};
    var safeName = (props.name || '').replace(/'/g, "\\'");
    return `<div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">${props.name || 'Location'}</h5>
                    <p class="card-text m-0"><b>Director:</b> ${props.director || 'N/A'}</p>
                    <p class="card-text m-0"><b>Year:</b> ${props.production_year || 'N/A'}</p>
                    <p class="card-text m-0"><b>Associated Film:</b> ${props.movie || 'N/A'}</p>
                </div>
            </div>`;
}

/**
 * Updates the text-section DOM container with the story and title
 * of the currently active tour stop.
 * @param {number} index - Tour stop index.
 */
function updateLocationTexts(index) {
    if (!currentTourData || !currentTourData.locations[index]) return;
    const currentLocation = currentTourData.locations[index];
    const textInfo = document.getElementById('text-section');
    if (textInfo) {
        // Inject location heading and descriptive historical narrative text
        textInfo.innerHTML = `
            <h3>${currentLocation.location_name}</h3>
            <p>${currentLocation.text}</p>
        `;
    }
}


// =============================================================================
// CATALOGUE STATE & PAGINATION LOGIC (catalogue.html)
// =============================================================================

/**
 * Reactive state object tracking catalogue items and pagination status.
 */
const catalogueState = {
    allLocations: [], // Complete array of fetched location objects
    currentPage: 1,   // Currently displayed page number (1-indexed)
    itemsPerPage: 9   // Number of location cards displayed per page
};

/**
 * Calculates page slices, renders the location card grid for the target page,
 * updates the catalogue header counter, and re-renders pagination controls.
 * @param {number} page - Page number to navigate to.
 */
function displayCataloguePage(page) {
    const totalItems = catalogueState.allLocations.length;
    // Calculate total pages (fallback to 1 if no items)
    const totalPages = Math.ceil(totalItems / catalogueState.itemsPerPage) || 1;

    // Enforce page boundaries
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    catalogueState.currentPage = page;

    // Calculate array slice indices for the current page
    const startIndex = (page - 1) * catalogueState.itemsPerPage;
    const endIndex = Math.min(startIndex + catalogueState.itemsPerPage, totalItems);
    const pageLocations = catalogueState.allLocations.slice(startIndex, endIndex);

    // Render location cards for this page slice
    renderCatalogueCards(pageLocations);

    // Update the catalogue section title with item and page counters
    const catalogueTitle = document.querySelector("#catalogue_page_title h2");
    if (catalogueTitle) {
        if (totalItems === 0) {
            catalogueTitle.textContent = "0 locations shown";
        } else {
            catalogueTitle.textContent = `${totalItems} locations shown (Page ${page} of ${totalPages})`;
        }
    }

    // Rebuild pagination buttons for current page state
    renderPagination(totalPages, page);
}

/**
 * Generates an array of page numbers and ellipsis strings ('...')
 * implementing a smart sliding window around the active page.
 * @param {number} current - Currently active page number.
 * @param {number} total - Total number of pages.
 * @returns {Array<number|string>} Array containing page numbers and ellipses.
 */
function getPaginationRange(current, total) {
    // If 7 or fewer pages, display all page numbers directly without ellipses
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];
    const showLeftEllipsis = current > 4;          // Need ellipsis on left if beyond page 4
    const showRightEllipsis = current < total - 3; // Need ellipsis on right if before total - 3

    // Case 1: Near the beginning (no left ellipsis, right ellipsis active)
    if (!showLeftEllipsis && showRightEllipsis) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
    // Case 2: Near the end (left ellipsis active, no right ellipsis)
    } else if (showLeftEllipsis && !showRightEllipsis) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
    // Case 3: In the middle (both left and right ellipses active)
    } else {
        pages.push(1);
        pages.push('...');
        pages.push(current - 1);
        pages.push(current);
        pages.push(current + 1);
        pages.push('...');
        pages.push(total);
    }
    return pages;
}

/**
 * Generates and appends HTML pagination buttons (Previous arrow, page numbers,
 * ellipses, and Next arrow) inside the #pagination container element.
 * @param {number} totalPages - Total count of available pages.
 * @param {number} currentPage - Currently active page number.
 */
function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    // Clear previous pagination elements
    paginationContainer.innerHTML = '';

    if (totalPages < 1) return;

    // Create Previous page arrow button («)
    const prevBtn = document.createElement('button');
    prevBtn.className = 'arrow';
    prevBtn.dataset.dir = '-1';
    prevBtn.innerHTML = '&laquo;';
    prevBtn.setAttribute('aria-label', 'Previous page');
    // Disable Previous button if already on the first page
    if (currentPage <= 1) {
        prevBtn.disabled = true;
    }
    paginationContainer.appendChild(prevBtn);

    // Calculate smart pagination range array
    const pageRange = getPaginationRange(currentPage, totalPages);
    pageRange.forEach(item => {
        // If item is an ellipsis separator, render span element
        if (item === '...') {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        // Otherwise render numeric page button
        } else {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-num${item === currentPage ? ' active' : ''}`;
            pageBtn.dataset.page = item;
            pageBtn.textContent = item;
            pageBtn.setAttribute('aria-label', `Page ${item}`);
            // Set accessibility attribute on active page
            if (item === currentPage) {
                pageBtn.setAttribute('aria-current', 'page');
            }
            paginationContainer.appendChild(pageBtn);
        }
    });

    // Create Next page arrow button (»)
    const nextBtn = document.createElement('button');
    nextBtn.className = 'arrow';
    nextBtn.dataset.dir = '1';
    nextBtn.innerHTML = '&raquo;';
    nextBtn.setAttribute('aria-label', 'Next page');
    // Disable Next button if already on the last page
    if (currentPage >= totalPages) {
        nextBtn.disabled = true;
    }
    paginationContainer.appendChild(nextBtn);
}

/**
 * Builds and renders the Bootstrap responsive card grid representing locations on the current page.
 * @param {Array<Object>} locations - Array of location objects to display.
 */
function renderCatalogueCards(locations) {
    const cardSection = document.getElementById("cardSection") || document.querySelector(".row_catalogue");
    if (!cardSection) return;

    // Clear existing cards
    cardSection.innerHTML = "";

    // Empty state fallback when no locations match
    if (!locations || locations.length === 0) {
        cardSection.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="mb-3">No locations available</h3>
                <p class="lead">No locations are currently available for display.</p>
            </div>
        `;
        return;
    }

    // Iterate through location objects and construct card column elements
    locations.forEach(location => {
        const col = document.createElement("div");
        // Responsive Bootstrap column classes: 1 card per row on mobile, 2 on tablet, 3 on desktop
        col.className = "col-sm-12 col-md-6 col-lg-4 col-xl-4";

        const imgUrl = location.image_url || "img/generic_bg.png";
        const title = location.name || "Location";
        const desc = location.simple_description || location.medium_description || "";

        // Build HTML template for the location card with image fallback and link to map
        col.innerHTML = `
            <div class="card border rounded h-100">
                <img src="${imgUrl}" class="img-fluid" alt="${title}" onerror="this.onerror=null;this.src='img/generic_bg.png';">
                <h5 class="ps-2 my-2 mx-1">${title}</h5>
                <p class="ps-2 my-2 mx-1">${desc}</p>
                <a href="map.html" class="card_link align-self-end mt-auto pe-2 my-2 mx-1 d-flex align-items-center">
                    Go to the map<span class="material-symbols-outlined arrow_forward_ios card_arrow">arrow_forward_ios</span>
                </a>
            </div>
        `;
        cardSection.appendChild(col);
    });
}


// =============================================================================
// GLOBAL APPLICATION LIFECYCLE & THEME SWITCHER
// =============================================================================

/**
 * Global entry point executed upon DOMContentLoaded:
 * 1. Checks and restores custom theme from localStorage.
 * 2. Initializes interactive theme switcher menu and event listeners.
 * 3. Identifies active page via body[data-page] and executes corresponding controller.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Read active page identifier attribute from body (e.g. data-page="catalogue" or data-page="tour")
    const currentPage = document.body.dataset.page;    

    // Theme switcher UI control elements
    const closeThemeBtn = document.querySelector('.closeTheme');
    const openThemeMenu = document.querySelector('.openTheme');
    const linkCSS = document.getElementById('stylesheet_file');

    // Restore previously saved theme from browser localStorage if present
    if (linkCSS) {
        const savedTheme = localStorage.getItem('fileTheme');
        if (savedTheme) {
            linkCSS.setAttribute('href', savedTheme);
        }
    }

    // Set up theme switcher menu click interactions
    if (closeThemeBtn && openThemeMenu) {
        // Clicking floating theme button opens the theme selection menu
        closeThemeBtn.addEventListener('click', () => {
            closeThemeBtn.style.display = 'none';
            openThemeMenu.style.display = 'block';
        });

        // Event delegation inside the opened theme menu container
        openThemeMenu.addEventListener('click', (event) => {
            // Handle clicking a specific theme option button (.btn-tema)
            const btnTema = event.target.closest('.btn-tema');
            if (btnTema) {
                event.stopPropagation(); 
                const choosenFile = btnTema.getAttribute('data-file');
                // Apply chosen CSS file and persist choice in localStorage
                if (choosenFile && linkCSS) {
                    linkCSS.setAttribute('href', choosenFile);
                    localStorage.setItem('fileTheme', choosenFile);
                }
                // Close menu and restore open button
                openThemeMenu.style.display = 'none';
                closeThemeBtn.style.display = 'block';
                return;
            }

            // Handle clicking the close button (.btn-chiudi) inside the menu
            const btnChiudiMenu = event.target.closest('.btn-chiudi');
            if (btnChiudiMenu) {
                event.stopPropagation();
                openThemeMenu.style.display = 'none';
                closeThemeBtn.style.display = 'block';
            }
        });
    }
    
    // If active page has a matching controller defined in pages dictionary, invoke it
    if (currentPage && pages[currentPage]) {
        pages[currentPage]();
    }
});
