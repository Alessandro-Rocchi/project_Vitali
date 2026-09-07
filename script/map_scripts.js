var map = null;
var panelControl = null;
var filterPanel = null;
var explorePanel = null;
var searchBar = null;
var currentLayer = null;
var initialData = null;
var metadataJson = null;
var routingControl = null;
var activeSubpanel = null;
var selectedDirector = "Tutti";
var selectedYearRange = "Tutti";

async function init() {
    map = L.map("map", { zoomControl: false }).setView([48.8566, 2.3522], 13);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 12,
        maxZoom: 17,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    panelControl = L.control({ position: 'topleft' });
    filterPanel = L.control({ position: 'topleft' });
    filterPanel.onAdd = createFilterPanelUI;

    explorePanel = L.control({ position: 'topleft' });
    explorePanel.onAdd = createExplorePanelUI;

    searchBar = L.control.pinSearch({
        position: 'topleft',
        placeholder: 'Search...',
        buttonText: 'Search',
        onSearch: function(query) {
            handleSearch(query);
        },
        searchBarWidth: '200px',
        searchBarHeight: '30px',
        maxSearchResults: 5
    });

    var geoData = await loadGeoData();
    metadataJson = await loadJson();

    if (geoData) {
        addGeoData(geoData);
    }

    // Personalizzazione di PinSearch per popolare la ricerca e centrare/aprire il marker
    searchBar._populateMarkerLabels = function () {
        this.markerLabels = [];
        var dataset = initialData || currentLayer;
        if (!dataset) return;

        if (dataset.features) {
            dataset.features.forEach(function (f) {
                var name = f.properties && f.properties.name;
                if (name && !this.markerLabels.includes(name)) {
                    this.markerLabels.push(name);
                }
            }, this);
        } else if (dataset.eachLayer) {
            dataset.eachLayer(function (layer) {
                var name = layer.feature && layer.feature.properties && layer.feature.properties.name;
                if (name && !this.markerLabels.includes(name)) {
                    this.markerLabels.push(name);
                }
            }, this);
        }
    };

    searchBar._findMarkerByTitle = function (title) {
        var matchingLayer = null;
        if (!currentLayer) return matchingLayer;

        currentLayer.eachLayer(function (layer) {
            var name = layer.feature && layer.feature.properties && layer.feature.properties.name;
            if (name && name.toLowerCase() === title.toLowerCase()) {
                matchingLayer = layer;
            }
        });

        return matchingLayer;
    };

    searchBar._onSearchItemClick = function (query) {
        var input = this._container && this._container.querySelector('.search-input');
        if (input) {
            input.value = query;
        }
        handleSearch(query);
    };

    panelControl.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'custom-panel');
        div.innerHTML = `<div class="d-flex gap-2 align-items-center bg-transparent"> 
                            <button class="btn btn-light shadow-sm" type="button" onclick="addSearchBar()" id="btn-search"> Cerca </button> 
                            <button class="btn btn-light shadow-sm" type="button" onclick="createFilter()" id="btn-filter"> Filtri </button> 
                            <button class="btn btn-light shadow-sm" type="button" onclick="createExplore()" id="btn-explore"> Esplora </button> 
                        </div>`;
        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.disableScrollPropagation(div);
        return div;
    };
    panelControl.addTo(map);
}

document.addEventListener('DOMContentLoaded', init, false);

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

function createPopupContent(feature) {
    var props = feature.properties || {};
    var safeName = (props.name || '').replace(/'/g, "\\'");
    
    var posterHtml = props.poster_url 
        ? `<img src="${props.poster_url}" class="card-img-top" alt="${props.name || 'Movie image'}">`
        : '';

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

function addGeoData(geojson) {
    if (!geojson) return;
    initialData = geojson;

    currentLayer = L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(createPopupContent(feature));
        }
    }).addTo(map);

    if (currentLayer.getLayers().length > 0) {
        map.fitBounds(currentLayer.getBounds());
    }
}

function removeControlPanel() {
    if (searchBar && searchBar._map && searchBar._container) {
        searchBar.remove();
    }
    if (filterPanel && filterPanel._map && filterPanel._container) {
        filterPanel.remove();
    }
    if (explorePanel && explorePanel._map && explorePanel._container) {
        explorePanel.remove();
    }
    activeSubpanel = null;
}

function toggleControl(panelType) {
    if (activeSubpanel === panelType) {
        removeControlPanel();
        return;
    }

    removeControlPanel();

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

function createExplore() {   
    toggleControl('explore');
}

function addSearchBar() {
    toggleControl('search');
}

function createFilter() {   
    toggleControl('filter');
}

function handleSearch(query) {
    if (!query) return;

    var targetLayer = null;

    if (currentLayer) {
        currentLayer.eachLayer(function(layer) {
            var name = layer.feature && layer.feature.properties && layer.feature.properties.name;
            if (name && name.toLowerCase() === query.toLowerCase()) {
                targetLayer = layer;
            }
        });
    }

    if (!targetLayer && initialData && initialData.features) {
        var foundInAll = initialData.features.find(function(f) {
            return f.properties.name && f.properties.name.toLowerCase() === query.toLowerCase();
        });

        if (foundInAll) {
            selectedDirector = "Tutti";
            selectedYearRange = "Tutti";
            applyFilters();
            currentLayer.eachLayer(function(layer) {
                if (layer.feature && layer.feature.properties && layer.feature.properties.name.toLowerCase() === query.toLowerCase()) {
                    targetLayer = layer;
                }
            });
        }
    }

    if (targetLayer) {
        map.panTo(targetLayer.getLatLng());
        targetLayer.openPopup();
        showLocationDetails(targetLayer.feature.properties.name);
    }
}

function createFilterPanelUI(map) {
    var registiSet = new Set();
    if (initialData && initialData.features) {
        initialData.features.forEach(function(element) {
            if (element.properties.director) {
                registiSet.add(element.properties.director);
            }
        });
    }

    var registiUnivoci = Array.from(registiSet).sort();

    var listaLiHTML = registiUnivoci.map(function(regista) {
        return `<li><a class="dropdown-item filtro-regista" href="#" data-regista="${regista}">${regista}</a></li>`;
    }).join('');

    var directorBtnLabel = (selectedDirector !== "Tutti") ? selectedDirector : "Director";
    var yearBtnLabel = (selectedYearRange !== "Tutti") ? selectedYearRange : "Year";

    var div = L.DomUtil.create('div', 'sub-panel-filter');
    div.innerHTML = `<div class="d-flex gap-2 align-items-center bg-transparent"> 
                        <div class="dropdown">
                            <button class="btn btn-light shadow-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" type="button" id="btn-filterdirector">
                                ${directorBtnLabel}
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item filtro-regista" href="#" data-regista="Tutti">Tutti i Film</a></li>
                                <li><hr class="dropdown-divider"></li>
                                ${listaLiHTML}
                            </ul>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-light shadow-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="btn-filterYear">
                                ${yearBtnLabel}
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item filtro-year" href="#" data-year="Tutti">Tutti gli Anni</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item filtro-year" href="#" data-year="1950-1959">1950-1959</a></li>
                                <li><a class="dropdown-item filtro-year" href="#" data-year="1960-1969">1960-1969</a></li>
                            </ul>
                        </div>
                    </div>`;

    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    div.addEventListener('click', function(e) {
        var dropdownToggle = e.target.closest('[data-bs-toggle="dropdown"]');
        if (dropdownToggle && window.bootstrap && bootstrap.Dropdown) {
            var allToggles = div.querySelectorAll('[data-bs-toggle="dropdown"]');
            allToggles.forEach(function(t) {
                if (t !== dropdownToggle) {
                    var otherDd = bootstrap.Dropdown.getInstance(t);
                    if (otherDd) otherDd.hide();
                }
            });
            var dd = bootstrap.Dropdown.getOrCreateInstance(dropdownToggle);
        }

        var clickedDirector = e.target.closest('.filtro-regista');
        if (clickedDirector) {
            e.preventDefault(); 
            var choosendirector = clickedDirector.getAttribute('data-regista') || "Tutti";
            var btnDir = document.getElementById('btn-filterdirector');
            if (btnDir) {
                btnDir.innerText = (choosendirector === "Tutti") ? "Director" : choosendirector;
            }
            
            var menu = clickedDirector.closest('.dropdown');
            if (menu && window.bootstrap) {
                var toggleBtn = menu.querySelector('[data-bs-toggle="dropdown"]');
                if (toggleBtn) bootstrap.Dropdown.getOrCreateInstance(toggleBtn).hide();
            }
            Drawpoints(choosendirector);
            return;
        }

        var clickedYear = e.target.closest('.filtro-year');
        if (clickedYear) {
            e.preventDefault();
            var choosenYear = clickedYear.getAttribute('data-year') || "Tutti";
            var btnYear = document.getElementById('btn-filterYear');
            if (btnYear) {
                btnYear.innerText = (choosenYear === "Tutti") ? "Year" : choosenYear;
            }
            // Chiudi manualmente il menu dropdown
            var menu = clickedYear.closest('.dropdown');
            if (menu && window.bootstrap) {
                var toggleBtn = menu.querySelector('[data-bs-toggle="dropdown"]');
                if (toggleBtn) bootstrap.Dropdown.getOrCreateInstance(toggleBtn).hide();
            }
            filterByYear(choosenYear);
            return;
        }
    });

    return div;
};

function disegnaPercorso(filteredFeatures) {
    if (routingControl !== null) {
        map.removeControl(routingControl);
        routingControl = null;
    }

    if (!filteredFeatures || filteredFeatures.length < 2) {
        return;
    }

    var waypoints = filteredFeatures.map(function(feature) {
        var coords = feature.geometry.coordinates;
        return L.latLng(coords[1], coords[0]); 
    });

    routingControl = L.Routing.control({
        waypoints: waypoints,
        show: false,
        addWaypoints: false,
        routeWhileDragging: false,
        lineOptions: {
            styles: [{color: '#E32636', opacity: 0.8, weight: 4}]
        },
        createMarker: function() { return null; } 
    }).addTo(map);
}

function applyFilters() {
    if (currentLayer !== null) {
        map.removeLayer(currentLayer);
    }

    if (!initialData || !initialData.features) return;
    
    var filteredFeatures = [];
    
    currentLayer = L.geoJSON(initialData, {
        filter: function(feature) {
            var matchDirector = (selectedDirector === "Tutti" || feature.properties.director === selectedDirector);
            
            var matchYear = true;
            if (selectedYearRange !== "Tutti") {
                var year = parseInt(feature.properties.production_year, 10);
                var parts = selectedYearRange.split('-');
                if (parts.length === 2) {
                    var start = parseInt(parts[0], 10);
                    var end = parseInt(parts[1], 10);
                    matchYear = (!isNaN(year) && year >= start && year <= end);
                }
            }

            var showPoint = matchDirector && matchYear;
            if (showPoint) {
                filteredFeatures.push(feature);
            }
            return showPoint;
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(createPopupContent(feature));
        }
    }).addTo(map);

    if (filteredFeatures.length > 0) {
        map.fitBounds(currentLayer.getBounds());
    }

    if (selectedDirector !== "Tutti") {
        disegnaPercorso(filteredFeatures);
    } else {
        if (routingControl !== null) {
            map.removeControl(routingControl);
            routingControl = null;
        }
    }
}

function Drawpoints(choosendirector) {
    selectedDirector = choosendirector || "Tutti";
    applyFilters();
}

function filterByYear(yearRange) {
    selectedYearRange = yearRange || "Tutti";
    applyFilters();
}

function showLocationDetails(locationName) {
    var text_info = document.getElementById('text-section');
    var img_panel = document.getElementById('img-section');
    var title_sect = document.getElementById('title-sect');

    if (!initialData || !initialData.features) {
        return;
    }

    var filmGeoJson = initialData.features.find(function(f) {
        return f.properties.name === locationName || (f.properties.name && f.properties.name.toLowerCase() === locationName.toLowerCase());
    });

    if (!filmGeoJson) {
        console.error("Location not found in GeoJSON:", locationName);
        return;
    }

    var Locationtexts = null;
    if (metadataJson && metadataJson.length > 0) {
        Locationtexts = metadataJson.find(function(elemento) {
            return elemento.name === locationName || (elemento.name && elemento.name.toLowerCase() === locationName.toLowerCase()); 
        });
    }

    var locTitle = (Locationtexts && Locationtexts.name) || (filmGeoJson.properties && filmGeoJson.properties.name) || locationName;
    var url_Img = (Locationtexts && Locationtexts.image_url) || (filmGeoJson.properties && filmGeoJson.properties.poster_url) || '';

    if (title_sect) {
        title_sect.textContent = locTitle;
    }

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

    if (Locationtexts) {
        var text_short = Locationtexts.simple_description || '';
        var text_medium = Locationtexts.medium_description || '';
        var text_long = Locationtexts.detailed_description || '';

        if (text_short && text_medium && text_long) {
            text_info.innerHTML = `
                <span id="testo-breve">${text_short}</span>
                <span id="testo-medio" style="display: none;">${text_medium}</span>
                <span id="testo-lungo" style="display: none;">${text_long}</span>
                <button id="btn-scopri" class="btn btn-link p-0 ms-1 text-decoration-none fw-bold">Learn more</button>
            `;

            var btnScopri = document.getElementById('btn-scopri');
            if (btnScopri) {
                btnScopri.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    var spanBreve = document.getElementById('testo-breve');
                    var spanMedio = document.getElementById('testo-medio');
                    var spanLungo = document.getElementById('testo-lungo');

                    if (spanBreve.style.display !== 'none') {
                        spanBreve.style.display = 'none';
                        spanMedio.style.display = 'inline';
                        spanLungo.style.display = 'none';
                        this.textContent = 'Learn more';
                    } else if (spanMedio.style.display !== 'none') {
                        spanBreve.style.display = 'none';
                        spanMedio.style.display = 'none';
                        spanLungo.style.display = 'inline';
                        this.textContent = 'Show less';
                    } else {
                        spanBreve.style.display = 'inline';
                        spanMedio.style.display = 'none';
                        spanLungo.style.display = 'none';
                        this.textContent = 'Learn more';
                    }
                });
            }
        } else {
            text_info.textContent = text_short || text_medium || text_long || 'Details not available.';
        }
    } else {
        text_info.textContent = 'Details not yet inserted into the database.';
    }

    var headInfo = document.getElementById('head-info');
    if (headInfo) {
        headInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function createExplorePanelUI(map) {
    var div = L.DomUtil.create('div', 'sub-panel-explore d-flex flex-column gap-2 bg-transparent border-0 p-0');
    
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

        <a href="about_nouvelle_vague.html#innovation" class="text-decoration-none text-dark link-esplora">
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

    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    
    return div;
};