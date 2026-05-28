var map = new L.map("map", {zoomControl: false}).setView([48.8566, 2.3522], 13);
var panelControl = L.control({position: 'topleft'});
var filterPanel = L.control({position: 'topleft'})
var currentLayer = null;
var searchBar = null;
var initialData = null;
var routingControl = null;

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

    panelControl.onAdd = function (map) {
        // Creiamo un "div" che conterrà la nostra interfaccia
        var div = L.DomUtil.create('div', 'custom-panel');
        div.innerHTML =`<div class="d-flex gap-2 align-items-center bg-transparent"> 
                            <button class="btn btn-light shadow-sm" type="button" onClick="addSearchBar()" id="btn-search"> Cerca </button> 
                            <button class="btn btn-light shadow-sm" onClick = createFilter() type="button" id="btn-filter"> Filtri </button> 
                            <button class="btn btn-light shadow-sm" type="button" id="btn-explore"> Esplora </button> 
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

function addGeoData(map, geojson) {
    currentLayer = L.geoJSON(geojson).addTo(map).bindPopup(function (layer) {
        return `<div class="card" style="width: 18rem;">
                    <img src="${layer.feature.properties.poster_url}" class="card-img-top" alt="${layer.feature.properties.Film}">
                    <div class="card-body">
                        <h5 class="card-title">${layer.feature.properties.Film}</h5>
                        <p class="card-text"><b>Director:</b> ${layer.feature.properties.Regista}</p>
                        <p class="card-text"><b>Year:</b> ${layer.feature.properties.year}</p>
                        <p class="card-text"><b>Location:</b> ${layer.feature.properties.label}</p>
                    </div>
                </div>`;
    });
    initialData = geojson;
    map.fitBounds(currentLayer.getBounds());
}

function removeControlPanel() {
    searchBar.remove();
    filterPanel.remove();
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
        
        
        var linkCliccato = e.target.closest('.filtro-regista');

        if (linkCliccato) {
            e.preventDefault(); 
            
            var registaSelezionato = linkCliccato.getAttribute('data-regista');
            
            document.getElementById('btn-filterDirector').innerText = registaSelezionato;
            
            Drawpoints(registaSelezionato);
        }
    });

    return div;
};

function disegnaPercorso(featuresFiltrate) {
    if (routingControl !== null) {
        map.removeControl(routingControl);
        routingControl = null;
    }

    if (!featuresFiltrate || featuresFiltrate.length < 2) {
        return;
    }

    var waypoints = featuresFiltrate.map(function(feature) {
        var coords = feature.geometry.coordinates;
        return L.latLng(coords[1], coords[0]); 
    });

    routingControl = L.Routing.control({
        waypoints: waypoints,
        show: true,
        lineOptions: {
            styles: [{color: '#E32636', opacity: 0.8, weight: 4}] // Colore della linea (es. Rosso Alizarina)
        },
        createMarker: function() { return null; } 
    }).addTo(map);
}

function Drawpoints(registaScelto) {
    if (currentLayer !== null) {
        map.removeLayer(currentLayer);
    }
    
    var featuresFiltrate = [];
    
    currentLayer = L.geoJSON(initialData, {
        filter: function(feature) {
            var mostraPunto = (registaScelto === "Tutti" || feature.properties.Regista === registaScelto);
            
            if (mostraPunto) {
                featuresFiltrate.push(feature);
            }
            
            return mostraPunto;
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<b>" + feature.properties.Film + "</b>");
        }
    }).addTo(map);

    if (registaScelto !== "Tutti") {
        disegnaPercorso(featuresFiltrate);
    } else {
        if (routingControl !== null) {
            map.removeControl(routingControl);
            routingControl = null;
        }
    }
}