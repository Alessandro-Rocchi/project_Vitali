var map = L.map("map").setView([48.8566, 2.3522], 13);
var datiOriginali = null;
var layerCorrente = null;
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    zoomControl:false,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.control.zoom({
    position: 'bottomright'
}).addTo(map);

var pannelloFiltri = L.control({position: 'topleft'});

pannelloFiltri.onAdd = function (map) {
    
    // Creiamo un "div" che conterrà la nostra interfaccia
    var div = L.DomUtil.create('div', 'mio-pannello-custom');

    // Inseriamo l'HTML del Dropdown di Bootstrap dentro questo div
    div.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-light dropdown-toggle shadow-sm" type="button" id="btn-filtro" data-bs-toggle="dropdown" aria-expanded="false">
            Scegli Regista
          </button>
          <ul class="dropdown-menu" aria-labelledby="btn-filtro">
            <li><a class="dropdown-item" href="#" id="drop-tutti">Tutti i Film</a></li>
            <li><a class="dropdown-item" href="#" id="drop-godard">Jean-Luc Godard</a></li>
            <li><a class="dropdown-item" href="#" id="drop-truffaut">François Truffaut</a></li>
          </ul>
        </div>
    `;
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    return div;
};
pannelloFiltri.addTo(map);