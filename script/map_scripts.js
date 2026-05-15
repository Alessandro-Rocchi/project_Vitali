var map = new L.map("map", {zoomControl: false}).setView([48.8566, 2.3522], 13);
var panelControl = L.control({position: 'topleft'});
var filter = L.control({position: 'topleft'})
var datiOriginali = null;
var layerCorrente = null;
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.control.zoom({position: 'bottomright'}).addTo(map);

var searchBar = L.control.pinSearch({
            position: 'topleft',
            placeholder: 'Search...',
            buttonText: 'Search',
            onSearch: function(query) {
                console.log('Search query:', query);
                // Handle the search query here
            },
            searchBarWidth: '200px',
            searchBarHeight: '30px',
            maxSearchResults: 3
})


function addSearchBar() {
    searchBar.addTo(map);
}

panelControl.onAdd = function (map) {
    
    // Creiamo un "div" che conterrà la nostra interfaccia
    var div = L.DomUtil.create('div', 'custom-panel');
    div.innerHTML ='<div class="d-flex gap-2 align-items-center bg-transparent"> <button class="btn btn-light shadow-sm" type="button" onClick="addSearchBar()" id="btn-search"> Cerca </button> <button class="btn btn-light shadow-sm" onClick = createFilter() type="button" id="btn-filter"> Filtri </button> <button class="btn btn-light shadow-sm" type="button" id="btn-explore"> Esplora </button> </div>';
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    return div;
};
panelControl.addTo(map);

filter.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'custom-panel');
    div.innerHTML ='<div class="d-flex gap-2 align-items-center bg-transparent"> <button class="btn btn-light shadow-sm" type="button" onClick="addSearchBar()" id="btn-search"> Cerca </button> <button class="btn btn-light shadow-sm" onClick = createFilter() type="button" id="btn-filter"> Filtri </button> <button class="btn btn-light shadow-sm" type="button" id="btn-explore"> Esplora </button> </div>';
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    return div;
};

function createFilter() {
    filter.addTo(map);
}
