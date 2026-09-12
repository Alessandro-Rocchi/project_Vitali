/**
 * =============================================================================
 * MAP_SCRIPTS.JS - Interactive Cinema Map of Paris (Nouvelle Vague)
 * =============================================================================
 * This script powers the interactive map experience for the cinema project:
 * - Initializes a Leaflet map centered on Paris with custom controls.
 * - Loads GeoJSON spatial coordinates and complementary metadata JSON.
 * - Provides search autocomplete and location lookup via L.control.pinSearch.
 * - Supports dynamic filtering by film Director and Year decade range.
 * - Calculates and visualizes itineraries connecting locations using Leaflet Routing Machine.
 * - Implements a three-tier progressive disclosure text reader ("Learn more" / "Show less").
 * - Offers an "Explore" panel linking to historical themes and director tours.
 * =============================================================================
 */

// =============================================================================
// GLOBAL STATE & LEAFLET CONTROL VARIABLES
// =============================================================================

// Leaflet Map instance
var map = null;

// Leaflet Control container for the top-left navigation buttons (Search, Filters, Explore)
var panelControl = null;

// Leaflet Control container for the secondary filter sub-panel (Director & Year dropdowns)
var filterPanel = null;

// Leaflet Control container for the secondary exploration sub-panel (Thematic cards)
var explorePanel = null;

// Leaflet PinSearch control instance for location search and autocomplete
var searchBar = null;

// Active Leaflet GeoJSON layer currently displayed on the map
var currentLayer = null;

// Pristine GeoJSON dataset loaded from data/paris.geojson (used as single source of truth for filtering)
var initialData = null;

// Complementary metadata loaded from data/paris_metadata.json (rich descriptions, imagery)
var metadataJson = null;

// Leaflet Routing Machine control instance for drawing routes between markers
var routingControl = null;

// Tracks currently active secondary subpanel ('search' | 'filter' | 'explore' | null)
var activeSubpanel = null;

// Current director filter selection ("Any" or specific director name)
var selectedDirector = "Any";

// Current year range filter selection ("Any" or decade string like "1950-1959")
var selectedYearRange = "Any";


// =============================================================================
// MAP INITIALIZATION & BOOTSTRAP
// =============================================================================

/**
 * Main asynchronous initialization function.
 * Sets up the Leaflet map, adds base tile layer, mounts controls,
 * loads GeoJSON & metadata, and configures search autocomplete behaviors.
 */
async function init() {
    // Instantiate Leaflet map attached to DOM element with ID 'map'
    // Disable default top-left zoom controls to reposition them cleanly
    map = L.map("map", { zoomControl: false }).setView([48.8566, 2.3522], 13);

    // Place zoom control in the bottom-right corner to prevent overlapping with custom top-left panels
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add OpenStreetMap raster tile layer with zoom constraints and required attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 12,
        maxZoom: 17,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Instantiate custom control containers positioned in top-left
    panelControl = L.control({ position: 'topleft' });

    // Filter panel control: onAdd lifecycle hook delegates HTML rendering to createFilterPanelUI
    filterPanel = L.control({ position: 'topleft' });
    filterPanel.onAdd = createFilterPanelUI;

    // Explore panel control: onAdd lifecycle hook delegates HTML rendering to createExplorePanelUI
    explorePanel = L.control({ position: 'topleft' });
    explorePanel.onAdd = createExplorePanelUI;

    // Initialize pinSearch plugin control with custom placeholder, dimensions, and callback
    searchBar = L.control.pinSearch({
        position: 'topleft',
        placeholder: 'Search...',
        buttonText: 'Search',
        onSearch: function(query) {
            handleSearch(query); // Execute custom search logic when a search is triggered
        },
        searchBarWidth: '200px',
        searchBarHeight: '30px',
        maxSearchResults: 5
    });

    // Fetch GeoJSON location features and descriptive metadata concurrently
    var geoData = await loadGeoData();
    metadataJson = await loadJson();

    // If GeoJSON was successfully loaded, render initial markers on the map
    if (geoData) {
        addGeoData(geoData);
    }

    /**
     * Override pinSearch internal helper to populate autocomplete suggestions
     * by collecting all unique location names from the active dataset.
     */
    searchBar._populateMarkerLabels = function () {
        this.markerLabels = []; // Reset autocomplete list
        var dataset = initialData || currentLayer;
        if (!dataset) return;

        // If dataset is raw GeoJSON object, extract names from features array
        if (dataset.features) {
            dataset.features.forEach(function (f) {
                var name = f.properties && f.properties.name;
                // Add unique non-empty names
                if (name && !this.markerLabels.includes(name)) {
                    this.markerLabels.push(name);
                }
            }, this);
        // If dataset is a Leaflet layer group, iterate over each layer
        } else if (dataset.eachLayer) {
            dataset.eachLayer(function (layer) {
                var name = layer.feature && layer.feature.properties && layer.feature.properties.name;
                // Add unique non-empty names
                if (name && !this.markerLabels.includes(name)) {
                    this.markerLabels.push(name);
                }
            }, this);
        }
    };

    /**
     * Override pinSearch internal helper to locate a Leaflet layer matching a given title.
     * Performs a case-insensitive search across layers in currentLayer.
     * @param {string} title - Target location name to look for.
     * @returns {L.Layer|null} Matching Leaflet layer or null if not found.
     */
    searchBar._findMarkerByTitle = function (title) {
        var matchingLayer = null;
        if (!currentLayer) return matchingLayer;

        // Loop through all active layers on the map
        currentLayer.eachLayer(function (layer) {
            var name = layer.feature && layer.feature.properties && layer.feature.properties.name;
            if (name && name.toLowerCase() === title.toLowerCase()) {
                matchingLayer = layer;
            }
        });

        return matchingLayer;
    };

    /**
     * Override pinSearch click handler for dropdown autocomplete items.
     * Syncs selected text to the input element and triggers the search handler.
     * @param {string} query - Selected location title.
     */
    searchBar._onSearchItemClick = function (query) {
        var input = this._container && this._container.querySelector('.search-input');
        if (input) {
            input.value = query; // Fill input with clicked suggestion
        }
        handleSearch(query); // Execute search
    };

    /**
     * Define onAdd lifecycle callback for panelControl.
     * Creates and returns the DOM container holding the main action buttons: Search, Filters, Explore.
     * @param {L.Map} map - Leaflet map instance.
     * @returns {HTMLElement} The created panel element.
     */
    panelControl.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'custom-panel');
        // Render three action buttons triggering subpanel toggles
        div.innerHTML = `<div class="d-flex gap-2 align-items-center bg-transparent"> 
                            <button class="btn btn-light shadow-sm" type="button" onclick="addSearchBar()" id="btn-search"> Cerca </button> 
                            <button class="btn btn-light shadow-sm" type="button" onclick="createFilter()" id="btn-filter"> Filtri </button> 
                            <button class="btn btn-light shadow-sm" type="button" onclick="createExplore()" id="btn-explore"> Esplora </button> 
                        </div>`;
        // Prevent click events from propagating to the map canvas underneath (avoids accidental clicks/drags)
        L.DomEvent.disableClickPropagation(div);
        // Prevent mouse scroll wheel events from zooming the map when scrolling over buttons
        L.DomEvent.disableScrollPropagation(div);
        return div;
    };

    // Add the top-level button bar to the map
    panelControl.addTo(map);
}

// Attach init execution to DOMContentLoaded event
document.addEventListener('DOMContentLoaded', init, false);


// =============================================================================
// DATA FETCHING FUNCTIONS
// =============================================================================

/**
 * Fetches GeoJSON file containing geographic coordinates and basic film location properties.
 * @returns {Promise<Object|null>} Parsed GeoJSON object, or null on network/parsing error.
 */
function loadGeoData() {
    return fetch("data/paris.geojson")
        .then(function(response){
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .catch(function(error){
            console.error("Fetch error GeoJSON: ", error);
            return null;
        });
}

/**
 * Fetches JSON file containing supplementary metadata (extended descriptions, photos) for locations.
 * @returns {Promise<Array>} Array of metadata objects, or empty array on error.
 */
function loadJson(){
    return fetch("data/paris_metadata.json")
        .then(function(response){
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .catch(function(error){
            console.error("Fetch error metadata: ", error);
            return [];
        });
}


// =============================================================================
// POPUP & GEOJSON LAYER MANAGEMENT
// =============================================================================

/**
 * Generates HTML markup for a Leaflet marker popup card.
 * Displays poster image, location name, director, year, movie title, and a "View Details" button.
 * @param {Object} feature - GeoJSON feature object representing a film location.
 * @returns {string} HTML markup string for the popup card.
 */
function createPopupContent(feature) {
    var props = feature.properties || {};
    // Escape single quotes in location name to safely embed inside inline onclick handler
    var safeName = (props.name || '').replace(/'/g, "\\'");
    
    // Conditionally include poster image if poster_url exists in feature properties
    var posterHtml = props.poster_url 
        ? `<img src="${props.poster_url}" class="card-img-top" alt="${props.name || 'Movie image'}">`
        : '';

    // Return Bootstrap card template with film location details
    return `<div class="card" style="width: 18rem;">
                ${posterHtml}
                <div class="card-body">
                    <h5 class="card-title">${props.name || 'Location'}</h5>
                    <p class="card-text mb-1"><b>Director:</b> ${props.director || 'N/A'}</p>
                    <p class="card-text mb-1"><b>Year:</b> ${props.production_year || 'N/A'}</p>
                    <p class="card-text mb-2"><b>Associated Film:</b> ${props.movie || 'N/A'}</p>
                    <button class="btn btn-primary" onclick="showLocationDetails('${safeName}')">View Details</button>
                </div>
            </div>`;
}

/**
 * Renders the provided GeoJSON dataset on the map as markers with bound popups,
 * caches the dataset into initialData, and fits map view bounds to encompass all points.
 * @param {Object} geojson - GeoJSON feature collection.
 */
function addGeoData(geojson) {
    if (!geojson) return;
    // Cache the original dataset for subsequent client-side filter operations
    initialData = geojson;

    // Create Leaflet GeoJSON layer and bind a popup to each marker feature
    currentLayer = L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(createPopupContent(feature));
        }
    }).addTo(map);

    // If points exist, automatically adjust map viewport to fit all markers
    if (currentLayer.getLayers().length > 0) {
        map.fitBounds(currentLayer.getBounds());
    }
}


// =============================================================================
// SUB-PANEL CONTROLS (SEARCH, FILTERS, EXPLORE)
// =============================================================================

/**
 * Removes any currently visible sub-panel control (searchBar, filterPanel, explorePanel)
 * from the map and resets the activeSubpanel tracking state.
 */
function removeControlPanel() {
    // Remove search bar if currently attached to the map DOM
    if (searchBar && searchBar._map && searchBar._container) {
        searchBar.remove();
    }
    // Remove filter panel if currently attached to the map DOM
    if (filterPanel && filterPanel._map && filterPanel._container) {
        filterPanel.remove();
    }
    // Remove explore panel if currently attached to the map DOM
    if (explorePanel && explorePanel._map && explorePanel._container) {
        explorePanel.remove();
    }
    // Reset active subpanel identifier
    activeSubpanel = null;
}

/**
 * Toggles a subpanel open or closed using an accordion-style toggle logic.
 * If the requested panel is already open, it is closed.
 * Otherwise, any open panel is closed and the requested panel is added to the map.
 * @param {string} panelType - Type of panel to toggle ('search' | 'filter' | 'explore').
 */
function toggleControl(panelType) {
    // If the clicked panel is already active, close it and exit
    if (activeSubpanel === panelType) {
        removeControlPanel();
        return;
    }

    // Close any other open subpanel first
    removeControlPanel();

    // Mount the requested subpanel and update tracking variable
    if (panelType === 'search') {
        searchBar.addTo(map);
        activeSubpanel = 'search';
    } else if (panelType === 'filter') {
        filterPanel.addTo(map);
        activeSubpanel = 'filter';
    } else if (panelType === 'explore') {
        explorePanel.addTo(map);
        activeSubpanel = 'explore';
    }
}

/**
 * Wrapper function to toggle the Explore subpanel.
 * Called by the "Esplora" button in the main panel.
 */
function createExplore() {   
    toggleControl('explore');
}

/**
 * Wrapper function to toggle the Search bar subpanel.
 * Called by the "Cerca" button in the main panel.
 */
function addSearchBar() {
    toggleControl('search');
}

/**
 * Wrapper function to toggle the Filter dropdowns subpanel.
 * Called by the "Filtri" button in the main panel.
 */
function createFilter() {   
    toggleControl('filter');
}


// =============================================================================
// SEARCH LOGIC & INTERACTION
// =============================================================================

/**
 * Executes location search by name.
 * 1. Checks if the location exists in the currently active map layer.
 * 2. If not found in currentLayer (e.g. filtered out), searches the full initialData.
 *    If found there, resets filters to "Any" so all markers re-appear.
 * 3. Centers map on the matched marker, opens its popup, and updates sidebar details.
 * @param {string} query - Location name to search for.
 */
function handleSearch(query) {
    if (!query) return;

    var targetLayer = null;

    // Step 1: Attempt to find marker in the currently displayed layer
    if (currentLayer) {
        currentLayer.eachLayer(function(layer) {
            var name = layer.feature && layer.feature.properties && layer.feature.properties.name;
            if (name && name.toLowerCase() === query.toLowerCase()) {
                targetLayer = layer;
            }
        });
    }

    // Step 2: If not found in currentLayer, search pristine initialData
    if (!targetLayer && initialData && initialData.features) {
        var foundInAll = initialData.features.find(function(f) {
            return f.properties.name && f.properties.name.toLowerCase() === query.toLowerCase();
        });

        // If the location exists in the global dataset, reset active filters to make it visible
        if (foundInAll) {
            selectedDirector = "Any";
            selectedYearRange = "Any";
            applyFilters(); // Re-render all markers

            // Locate the newly created layer for this location
            currentLayer.eachLayer(function(layer) {
                if (layer.feature && layer.feature.properties && layer.feature.properties.name.toLowerCase() === query.toLowerCase()) {
                    targetLayer = layer;
                }
            });
        }
    }

    // Step 3: If target layer is located, pan map, open popup, and show sidebar info
    if (targetLayer) {
        map.panTo(targetLayer.getLatLng()); // Center viewport on marker coordinates
        targetLayer.openPopup(); // Display marker popup
        showLocationDetails(targetLayer.feature.properties.name); // Populate detail sidebar
    }
}


// =============================================================================
// FILTER UI CREATION & EVENT DELEGATION
// =============================================================================

/**
 * Builds the Filter subpanel UI containing Director and Year Range dropdowns.
 * Attaches event listeners for dropdown toggling and filter selections.
 * @param {L.Map} map - Leaflet map instance.
 * @returns {HTMLElement} Container div for the filter panel.
 */
function createFilterPanelUI(map) {
    // Extract unique director names from initial GeoJSON dataset using a Set
    var registiSet = new Set();
    if (initialData && initialData.features) {
        initialData.features.forEach(function(element) {
            if (element.properties.director) {
                registiSet.add(element.properties.director);
            }
        });
    }

    // Convert Set to sorted array for alphabetical display
    var registiUnivoci = Array.from(registiSet).sort();

    // Generate HTML <li> list items for each director
    var listaLiHTML = registiUnivoci.map(function(regista) {
        return `<li><a class="dropdown-item filtro-regista" href="#" data-regista="${regista}">${regista}</a></li>`;
    }).join('');

    // Determine current button labels based on active filter state
    var directorBtnLabel = (selectedDirector !== "Any") ? selectedDirector : "Director";
    var yearBtnLabel = (selectedYearRange !== "Any") ? selectedYearRange : "Year";

    // Create container div for the sub-panel
    var div = L.DomUtil.create('div', 'sub-panel-filter');
    div.innerHTML = `<div class="d-flex gap-2 align-items-center bg-transparent"> 
                        <div class="dropdown">
                            <button class="btn btn-light shadow-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" type="button" id="btn-filterdirector">
                                ${directorBtnLabel}
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item filtro-regista" href="#" data-regista="Any">Any Director</a></li>
                                <li><hr class="dropdown-divider"></li>
                                ${listaLiHTML}
                            </ul>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-light shadow-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="btn-filterYear">
                                ${yearBtnLabel}
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item filtro-year" href="#" data-year="Any">Any Year</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item filtro-year" href="#" data-year="1950-1959">1950-1959</a></li>
                                <li><a class="dropdown-item filtro-year" href="#" data-year="1960-1969">1960-1969</a></li>
                            </ul>
                        </div>
                    </div>`;

    // Prevent map dragging and zooming when interacting with dropdown elements
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    // Event delegation on the filter sub-panel container
    div.addEventListener('click', function(e) {
        // Ensure opening one dropdown hides any other open dropdown in this panel
        var dropdownToggle = e.target.closest('[data-bs-toggle="dropdown"]');
        if (dropdownToggle && window.bootstrap && bootstrap.Dropdown) {
            var allToggles = div.querySelectorAll('[data-bs-toggle="dropdown"]');
            allToggles.forEach(function(t) {
                if (t !== dropdownToggle) {
                    var otherDd = bootstrap.Dropdown.getInstance(t);
                    if (otherDd) otherDd.hide();
                }
            });
        }

        // Handle Director filter item selection
        var clickedDirector = e.target.closest('.filtro-regista');
        if (clickedDirector) {
            e.preventDefault(); 
            var choosendirector = clickedDirector.getAttribute('data-regista') || "Any";
            var btnDir = document.getElementById('btn-filterdirector');
            if (btnDir) {
                // Update button label to selected director name (or "Director" if "Any")
                btnDir.innerText = (choosendirector === "Any") ? "Director" : choosendirector;
            }
            
            // Programmatically close the Bootstrap dropdown menu
            var menu = clickedDirector.closest('.dropdown');
            if (menu && window.bootstrap) {
                var toggleBtn = menu.querySelector('[data-bs-toggle="dropdown"]');
                if (toggleBtn) bootstrap.Dropdown.getOrCreateInstance(toggleBtn).hide();
            }
            // Apply director filter
            Drawpoints(choosendirector);
            return;
        }

        // Handle Year range filter item selection
        var clickedYear = e.target.closest('.filtro-year');
        if (clickedYear) {
            e.preventDefault();
            var choosenYear = clickedYear.getAttribute('data-year') || "Any";
            var btnYear = document.getElementById('btn-filterYear');
            if (btnYear) {
                // Update button label to selected year range (or "Year" if "Any")
                btnYear.innerText = (choosenYear === "Any") ? "Year" : choosenYear;
            }
            // Programmatically close the Bootstrap dropdown menu
            var menu = clickedYear.closest('.dropdown');
            if (menu && window.bootstrap) {
                var toggleBtn = menu.querySelector('[data-bs-toggle="dropdown"]');
                if (toggleBtn) bootstrap.Dropdown.getOrCreateInstance(toggleBtn).hide();
            }
            // Apply year range filter
            filterByYear(choosenYear);
            return;
        }
    });

    return div;
};


// =============================================================================
// ROUTING / ITINERARY PATH VISUALIZATION
// =============================================================================

/**
 * Draws a travel itinerary line connecting the filtered location markers using Leaflet Routing Machine.
 * Active when a specific director is selected, visualizing the cinematic trail across Paris.
 * @param {Array<Object>} filteredFeatures - Array of GeoJSON feature objects to connect.
 */
function disegnaPercorso(filteredFeatures) {
    // Remove existing routing line/control if present
    if (routingControl !== null) {
        map.removeControl(routingControl);
        routingControl = null;
    }

    // At least 2 waypoints are required to calculate and draw a route
    if (!filteredFeatures || filteredFeatures.length < 2) {
        return;
    }

    // Convert GeoJSON [lon, lat] coordinates to Leaflet L.latLng(lat, lon) instances
    var waypoints = filteredFeatures.map(function(feature) {
        var coords = feature.geometry.coordinates;
        return L.latLng(coords[1], coords[0]); 
    });

    // Configure and mount Leaflet Routing Machine control
    routingControl = L.Routing.control({
        waypoints: waypoints,
        show: false,                 // Hide the textual turn-by-turn itinerary panel
        addWaypoints: false,         // Disable adding new waypoints by clicking route
        routeWhileDragging: false,   // Disable dragging route lines
        lineOptions: {
            styles: [{color: '#E32636', opacity: 0.8, weight: 4}] // Distinct red route line
        },
        createMarker: function() { return null; } // Suppress default waypoint markers to keep custom pins
    }).addTo(map);
}


// =============================================================================
// FILTER ENGINE LOGIC
// =============================================================================

/**
 * Core filtering function.
 * Evaluates both selectedDirector and selectedYearRange against initialData features.
 * Rebuilds the GeoJSON layer with matching markers, fits map bounds, and draws route if applicable.
 */
function applyFilters() {
    // Remove previously rendered layer from the map
    if (currentLayer !== null) {
        map.removeLayer(currentLayer);
    }

    // Ensure raw data is available
    if (!initialData || !initialData.features) return;
    
    var filteredFeatures = [];
    
    // Reconstruct GeoJSON layer applying combined filter predicate
    currentLayer = L.geoJSON(initialData, {
        filter: function(feature) {
            // Check if feature matches selected director
            var matchDirector = (selectedDirector === "Any" || feature.properties.director === selectedDirector);
            
            // Check if feature matches selected decade year range (e.g. "1950-1959")
            var matchYear = true;
            if (selectedYearRange !== "Any") {
                var year = parseInt(feature.properties.production_year, 10);
                var parts = selectedYearRange.split('-');
                if (parts.length === 2) {
                    var start = parseInt(parts[0], 10);
                    var end = parseInt(parts[1], 10);
                    matchYear = (!isNaN(year) && year >= start && year <= end);
                }
            }

            // Both conditions must be met to display marker
            var showPoint = matchDirector && matchYear;
            if (showPoint) {
                filteredFeatures.push(feature);
            }
            return showPoint;
        },
        onEachFeature: function(feature, layer) {
            // Re-bind popup to each filtered marker
            layer.bindPopup(createPopupContent(feature));
        }
    }).addTo(map);

    // Adjust map zoom and center to encompass all matching markers
    if (filteredFeatures.length > 0) {
        map.fitBounds(currentLayer.getBounds());
    }

    // If a specific director is selected, draw their cinematic path; otherwise clear any route
    if (selectedDirector !== "Any") {
        disegnaPercorso(filteredFeatures);
    } else {
        if (routingControl !== null) {
            map.removeControl(routingControl);
            routingControl = null;
        }
    }
}

/**
 * Updates selectedDirector filter state and re-executes filtering.
 * @param {string} choosendirector - Selected director name or "Any".
 */
function Drawpoints(choosendirector) {
    selectedDirector = choosendirector || "Any";
    applyFilters();
}

/**
 * Updates selectedYearRange filter state and re-executes filtering.
 * @param {string} yearRange - Selected decade range string (e.g. "1950-1959") or "Any".
 */
function filterByYear(yearRange) {
    selectedYearRange = yearRange || "Any";
    applyFilters();
}


// =============================================================================
// LOCATION DETAILS SIDEBAR & PROGRESSIVE DISCLOSURE
// =============================================================================

/**
 * Displays full information and photo for a selected location in the sidebar/details card.
 * Implements a 3-tier progressive disclosure mechanism:
 * Level 1: Simple short description (default)
 * Level 2: Medium description ("Learn more")
 * Level 3: Detailed long description ("Learn more" -> button becomes "Show less" to cycle back)
 * @param {string} locationName - Name of the location clicked.
 */
function showLocationDetails(locationName) {
    // Retrieve target DOM elements
    var text_info = document.getElementById('text-section');
    var img_panel = document.getElementById('img-section');
    var title_sect = document.getElementById('title-sect');

    // Ensure spatial data is loaded
    if (!initialData || !initialData.features) {
        return;
    }

    // Find corresponding feature in GeoJSON dataset (exact or case-insensitive match)
    var filmGeoJson = initialData.features.find(function(f) {
        return f.properties.name === locationName || (f.properties.name && f.properties.name.toLowerCase() === locationName.toLowerCase());
    });

    if (!filmGeoJson) {
        console.error("Location not found in GeoJSON:", locationName);
        return;
    }

    // Find complementary rich textual metadata in metadataJson
    var Locationtexts = null;
    if (metadataJson && metadataJson.length > 0) {
        Locationtexts = metadataJson.find(function(elemento) {
            return elemento.name === locationName || (elemento.name && elemento.name.toLowerCase() === locationName.toLowerCase()); 
        });
    }

    // Determine location title and image URL with fallback priorities
    var locTitle = (Locationtexts && Locationtexts.name) || (filmGeoJson.properties && filmGeoJson.properties.name) || locationName;
    var url_Img = (Locationtexts && Locationtexts.image_url) || (filmGeoJson.properties && filmGeoJson.properties.poster_url) || '';

    // Update section title text
    if (title_sect) {
        title_sect.textContent = locTitle;
    }

    // Update or hide image element based on URL availability
    if (img_panel) {
        if (url_Img) {
            img_panel.src = url_Img;
            img_panel.alt = locTitle;
            img_panel.style.display = 'block';
        } else {
            img_panel.removeAttribute('src');
            img_panel.alt = '';
            img_panel.style.display = 'none';
        }
    }

    if (!text_info) return;

    // Populate textual description with progressive disclosure toggle
    if (Locationtexts) {
        var text_short = Locationtexts.simple_description || '';
        var text_medium = Locationtexts.medium_description || '';
        var text_long = Locationtexts.detailed_description || '';

        // If all three description tiers exist, construct tiered spans with toggle button
        if (text_short && text_medium && text_long) {
            text_info.innerHTML = `
                <span id="testo-breve">${text_short}</span>
                <span id="testo-medio" style="display: none;">${text_medium}</span>
                <span id="testo-lungo" style="display: none;">${text_long}</span>
                <button id="btn-scopri" class="btn btn-link p-0 ms-1 text-decoration-none fw-bold">Learn more</button>
            `;

            var btnScopri = document.getElementById('btn-scopri');
            if (btnScopri) {
                // Click handler cycling through Short -> Medium -> Long -> Short
                btnScopri.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    var spanBreve = document.getElementById('testo-breve');
                    var spanMedio = document.getElementById('testo-medio');
                    var spanLungo = document.getElementById('testo-lungo');

                    // Step 1: If short is visible, switch to medium
                    if (spanBreve.style.display !== 'none') {
                        spanBreve.style.display = 'none';
                        spanMedio.style.display = 'inline';
                        spanLungo.style.display = 'none';
                        this.textContent = 'Learn more';
                    // Step 2: If medium is visible, switch to long and update button to "Show less"
                    } else if (spanMedio.style.display !== 'none') {
                        spanBreve.style.display = 'none';
                        spanMedio.style.display = 'none';
                        spanLungo.style.display = 'inline';
                        this.textContent = 'Show less';
                    // Step 3: If long is visible, cycle back to short and button to "Learn more"
                    } else {
                        spanBreve.style.display = 'inline';
                        spanMedio.style.display = 'none';
                        spanLungo.style.display = 'none';
                        this.textContent = 'Learn more';
                    }
                });
            }
        } else {
            // Fallback if full 3-level tiering is incomplete: show whichever description is present
            text_info.textContent = text_short || text_medium || text_long || 'Details not available.';
        }
    } else {
        // Fallback when no metadata record exists for this location
        text_info.textContent = 'Details not yet inserted into the database.';
    }

    // Smoothly scroll sidebar container into view on mobile or small screens
    var headInfo = document.getElementById('head-info');
    if (headInfo) {
        headInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}


// =============================================================================
// EXPLORE SUBPANEL UI CREATION
// =============================================================================

/**
 * Builds the Explore subpanel UI featuring quick thematic shortcut cards:
 * 1. "Il Movimento" (links to about_nouvelle_vague.html#revolution)
 * 2. "Jean-Luc Godard" (links to tour.html?regista=Jean-Luc Godard)
 * 3. "François Truffaut" (links to about_nouvelle_vague.html#cannes)
 * @param {L.Map} map - Leaflet map instance.
 * @returns {HTMLElement} Container div for the explore panel.
 */
function createExplorePanelUI(map) {
    // Create container element with styling classes
    var div = L.DomUtil.create('div', 'sub-panel-explore d-flex flex-column gap-2 bg-transparent border-0 p-0');
    
    // Render thematic card links with Bootstrap icons and styled headers
    div.innerHTML = `
        <a href="about_nouvelle_vague.html#revolution" class="text-decoration-none text-dark link-esplora">
            <div class="card border-0 shadow rounded-3 bg-white" style="width: 260px; transition: transform 0.2s, background-color 0.2s;">
                <div class="row g-0 align-items-center p-2">
                    <div class="col-3 text-center text-primary">
                        <i class="bi bi-camera-reels fs-4"></i>
                    </div>
                    <div class="col-9">
                        <h6 class="mb-0 fw-bold" style="font-size: 0.85rem;">Il Movimento</h6>
                        <small class="text-muted" style="font-size: 0.75rem;">Storia e Manifesto</small>
                    </div>
                </div>
            </div>
        </a>

        <a href="tour.html?regista=Jean-Luc Godard" class="text-decoration-none text-dark link-esplora">
            <div class="card border-0 shadow rounded-3 bg-white" style="width: 260px; transition: transform 0.2s, background-color 0.2s;">
                <div class="row g-0 align-items-center p-2">
                    <div class="col-3 text-center text-success">
                        <i class="bi bi-person-badge fs-4"></i>
                    </div>
                    <div class="col-9">
                        <h6 class="mb-0 fw-bold" style="font-size: 0.85rem;">Jean-Luc Godard</h6>
                        <small class="text-muted" style="font-size: 0.75rem;">Biografia e Stile</small>
                    </div>
                </div>
            </div>
        </a>

        <a href="about_nouvelle_vague.html#cannes" class="text-decoration-none text-dark link-esplora">
            <div class="card border-0 shadow rounded-3 bg-white" style="width: 260px; transition: transform 0.2s, background-color 0.2s;">
                <div class="row g-0 align-items-center p-2">
                    <div class="col-3 text-center text-danger">
                        <i class="bi bi-film fs-4"></i>
                    </div>
                    <div class="col-9">
                        <h6 class="mb-0 fw-bold" style="font-size: 0.85rem;">François Truffaut</h6>
                        <small class="text-muted" style="font-size: 0.75rem;">I Grandi Capolavori</small>
                    </div>
                </div>
            </div>
        </a>
    `;

    // Prevent map click and scroll events while interacting with the explore panel
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    
    return div;
};
