var map = new L.map("map", {zoomControl: false}).setView([48.8566, 2.3522], 13);
var panelControl = L.control({position: 'topleft'});
var filterPanel = L.control({position: 'topleft'})
var currentLayer = null;
var searchBar = null;
var initialData = null;
var routingControl = null;
var metadataJson = null;
var explorePanel = L.control({position: 'topleft'});

async function init() {
    L.control.zoom({position: 'bottomright'}).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 12,
        maxZoom: 17,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    searchBar = L.control.pinSearch({
            position: 'topleft',
            placeholder: 'Search...',
            buttonText: 'Search',
            onSearch: function(query) {
                console.log('Search query:', query);
                // Handle the search query here
            },
            searchBarWidth: '200px',
            searchBarHeight: '30px',
            maxSearchResults: 5
    })

    addGeoData(map, await loadGeoData(map));
    metadataJson = await loadJson();

    panelControl.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'custom-panel');
        div.innerHTML =`<div class="d-flex gap-2 align-items-center bg-transparent"> 
                            <button class="btn btn-light shadow-sm" type="button" onClick="addSearchBar()" id="btn-search"> Cerca </button> 
                            <button class="btn btn-light shadow-sm" onClick = createFilter() type="button" id="btn-filter"> Filtri </button> 
                            <button class="btn btn-light shadow-sm" onClick = createExplore() type="button" id="btn-explore"> Esplora </button> 
                        </div>`;
        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.disableScrollPropagation(div);
        return div;
    };
    panelControl.addTo(map);
    
}

document.addEventListener('DOMContentLoaded', init, false);

function loadGeoData(map) {
    return fetch("data/paris.geojson")
        .then(function(response){
            return response.json();
        })
        .catch(function(error){
            console.error("Fetch error: ", error);
        })
}

function loadJson(){
    return fetch("data/paris_metadata.json")
        .then(function(response){
            return response.json();
        })
        .catch(function(error){
            console.error("Fetch error: ", error);
        })
}

function addGeoData(map, geojson) {
    currentLayer = L.geoJSON(geojson).addTo(map).bindPopup(function (layer) {
        return `<div class="card" style="width: 18rem;">
                    <img src="${layer.feature.properties.poster_url}" class="card-img-top" alt="${layer.feature.properties.Film}">
                    <div class="card-body">
                        <h5 class="card-title">${layer.feature.properties.Film}</h5>
                        <p class="card-text"><b>Director:</b> ${layer.feature.properties.Regista}</p>
                        <p class="card-text"><b>Year:</b> ${layer.feature.properties.year}</p>
                        <p class="card-text"><b>Location:</b> ${layer.feature.properties.label}</p>
                        <button class="btn btn-primary" onclick="showFilmDetails('${layer.feature.properties.Film}')">View Details</button>
                    </div>
                </div>`;
    });
    initialData = geojson;
    map.fitBounds(currentLayer.getBounds());
}

function removeControlPanel() {
    searchBar.remove();
    filterPanel.remove();
    explorePanel.remove();
}

function createExplore() {   
    removeControlPanel(); // Chiude eventuali filtri o barre di ricerca aperti
    explorePanel.addTo(map); // Apre il pannello esplora
}

function addSearchBar() {
    removeControlPanel();
    searchBar.addTo(map);
}

function createFilter() {   
    removeControlPanel();
    filterPanel.addTo(map);
}

filterPanel.onAdd = function (map) {

    var registiSet = new Set();
    if (initialData && initialData.features) {
        initialData.features.forEach(function(element) {
            if (element.properties.Regista) {
                registiSet.add(element.properties.Regista);
            }
        });
    }

    var registiUnivoci = Array.from(registiSet).sort();

    var listaLiHTML = registiUnivoci.map(function(regista) {
        return `<li><a class="dropdown-item filtro-regista" href="#" data-regista="${regista}">${regista}</a></li>`;
    }).join('');

    var div = L.DomUtil.create('div', 'sub-panel-filter');
    div.innerHTML =`<div class="d-flex gap-2 align-items-center bg-transparent"> 
                        <button class="btn btn-light shadow-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" type="button" id="btn-filtertOrderby"> Order by </button> 
                        <div class="dropdown">
                            <button class="btn btn-light shadow-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" type="button" id="btn-filterDirector">
                                Director
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item filtro-regista" href="#" onclick="Drawpoints('Tutti')">Tutti i Film</a></li>
                                <li><hr class="dropdown-divider"></li>
                                ${listaLiHTML}
                            </ul>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-light shadow-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="btn-filterYear">
                                Year
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item filtro-year" href="#" data-year="1940-1949">1940-1949</a></li>
                                <li><a class="dropdown-item filtro-year" href="#" data-year="1950-1959">1950-1959</a></li>
                                <li><a class="dropdown-item filtro-year" href="#" data-year="1960-1969">1960-1969</a></li>
                            </ul>
                        </div>
                    </div>`;
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    div.addEventListener('click', function(e) {
        
        
        var clickedLink = e.target.closest('.filtro-regista');

        if (clickedLink) {
            e.preventDefault(); 
            
            var choosenDirector = clickedLink.getAttribute('data-regista');
            
            document.getElementById('btn-filterDirector').innerText = choosenDirector;
            
            Drawpoints(choosenDirector);
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
        lineOptions: {
            styles: [{color: '#E32636', opacity: 0.8, weight: 4}]
        },
        createMarker: function() { return null; } 
    }).addTo(map);
}

function Drawpoints(choosenDirector) {
    if (currentLayer !== null) {
        map.removeLayer(currentLayer);
    }
    
    var filteredFeatures = [];
    
    currentLayer = L.geoJSON(initialData, {
        filter: function(feature) {
            var showPoint = (choosenDirector === "Tutti" || feature.properties.Regista === choosenDirector);
            
            if (showPoint) {
                filteredFeatures.push(feature);
            }
            
            return showPoint;
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<b>" + feature.properties.Film + "</b>");
        }
    }).addTo(map);

    if (choosenDirector !== "Tutti") {
        disegnaPercorso(filteredFeatures);
    } else {
        if (routingControl !== null) {
            map.removeControl(routingControl);
            routingControl = null;
        }
    }
}

function showFilmDetails(filmproperties) {
    var text_info = document.getElementById('text-section');
    var img_panel = document.getElementById('img-section');
    var testiDelFilm = null;

    var filmGeoJson = initialData.features.find(function(f) {
        return f.properties.Film === filmproperties;
    });

    if (!filmGeoJson) {
        console.error("Film non trovato nel GeoJSON:", filmproperties);
        return;
    }
    var properties = filmGeoJson.properties;
    var url_Img = properties.poster_url || "https://via.placeholder.com/300x400?text=Nessuna+Immagine";
    if (img_panel) {
        img_panel.src = url_Img;
        img_panel.alt = properties.Film;
    }

    if (document.getElementById('title-sect')) {
        document.getElementById('title-sect').textContent = properties.Film;
    }
    // Controlliamo che la variabile globale esista e abbia dati
    if (metadataJson && metadataJson.length > 0) {
        
        // Cerchiamo l'oggetto il cui 'titolo' combacia con il 'Film' cliccato sulla mappa
        testiDelFilm = metadataJson.find(function(elemento) {
            return elemento.associated_movie === filmproperties; 
        });
    }
    if (testiDelFilm) {
        
        // 1. Leggiamo i due testi dal JSON (cambia "extended_description" se l'hai chiamata diversamente!)
        var testoBreve = testiDelFilm.simple_description || 'Trama non disponibile.';
        var testoMedio = testiDelFilm.medium_description || 'Trama non disponibile.';
        var testoLungo = testiDelFilm.detailed_description || 'Trama non disponibile.';

        // 2. Controlliamo se per questo film esiste la versione lunga
        if (testoBreve && testoMedio && testoLungo) {
            
            // Inseriamo entrambi i testi e il bottone. Il testo lungo parte nascosto (display: none)
            text_info.innerHTML = `
                <span id="testo-breve">${testoBreve}</span>
                <span id="testo-medio" style="display: none;">${testoMedio}</span>
                <span id="testo-lungo" style="display: none;">${testoLungo}</span>
                <button id="btn-scopri" class="btn btn-link p-0 ms-1 text-decoration-none fw-bold">Scopri di più</button>
            `;

            // 3. Creiamo l'interruttore
            document.getElementById('btn-scopri').addEventListener('click', function(e) {
                e.preventDefault();
                
                var spanBreve = document.getElementById('testo-breve');
                var spanMedio = document.getElementById('testo-medio');
                var spanLungo = document.getElementById('testo-lungo');

               if (spanBreve.style.display !== 'none') {
    
                    // Nascondiamo il Breve, mostriamo il Medio
                    spanBreve.style.display = 'none';
                    spanMedio.style.display = 'inline';
                    spanLungo.style.display = 'none';
                    
                    this.textContent = 'Scopri ancora di più';

                } 
                // STATO 2: Se stiamo vedendo il testo MEDIO
                else if (spanMedio.style.display !== 'none') {
                    
                    // Nascondiamo il Medio, mostriamo il Lungo
                    spanBreve.style.display = 'none';
                    spanMedio.style.display = 'none';
                    spanLungo.style.display = 'inline';
                    
                    this.textContent = 'Mostra meno';

                } 
                // STATO 3: Se stiamo vedendo il testo LUNGO (l'unico caso rimasto)
                else {
                    
                    // IL TUO OBIETTIVO: Torniamo direttamente al testo BREVE, saltando il medio!
                    spanBreve.style.display = 'inline';
                    spanMedio.style.display = 'none';
                    spanLungo.style.display = 'none';
                    
                    this.textContent = 'Scopri di più'; // Riportiamo il bottone allo stato iniziale
                }
    
            });
        } else {
            // Se per un certo film hai preparato solo il testo breve, lo stampiamo senza bottone
            text_info.textContent = testoBreve;
        }

    } else {
        // Se il film NON è nel JSON extra
        text_info.textContent = 'Dettagli non ancora inseriti nel database.';
    }
}
explorePanel.onAdd = function (map) {
    // Il contenitore è totalmente INVISIBILE
    var div = L.DomUtil.create('div', 'sub-panel-explore d-flex flex-column gap-2 bg-transparent border-0 p-0');
    
    div.innerHTML = `
        <a href="pagina-movimento.html" class="text-decoration-none text-dark link-esplora">
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

        <a href="pagina-godard.html" class="text-decoration-none text-dark link-esplora">
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

        <a href="pagina-truffaut.html" class="text-decoration-none text-dark link-esplora">
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