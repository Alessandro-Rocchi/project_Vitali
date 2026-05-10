
document.addEventListener("DOMContentLoaded", function(){
    var map = L.map("map").setView([48.8566, 2.3522], 13);
    var datiOriginali = null;
    var layerCorrente = null;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

    }).addTo(map);
    
    fetch("data/paris.geojson") 
    .then(function(response) {
        return response.json();
    })
    .then(function(datiCinema) {
        datiOriginali = datiCinema;

        layerCorrente = L.geoJSON(datiOriginali, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup("<b>" + feature.properties.Film + "</b><br>Regia: " + feature.properties.Regista);
            }
        }).addTo(map);
    })
    .catch(function(errore) {
        console.error("Errore nel caricamento dei dati:", errore);
    });

    function Drawpoints(){
        if (layerCorrente !== null) {
            map.removeLayer(layerCorrente);
        }
        layerCorrente = L.geoJSON(datiOriginali, {
            filter: function(feature){
                return feature.properties.Regista == "Jean-Luc Godard"
            },
            onEachFeature: function(feature, layer){
                layer.bindPopup("<b>" + feature.properties.Film + "</b><br>Regia: " + feature.properties.Regista)
            }
        }).addTo(map);
    }

    function Reset(){
        layerCorrente = L.geoJSON(datiOriginali, {
            onEachFeature: function(feature, layer){
                layer.bindPopup("<b>" + feature.properties.Film + "</b><br>Regia: " + feature.properties.Regista)
            }
        }).addTo(map);
    }

    document.getElementById('btn-godard').addEventListener('click', function() {
        Drawpoints(); // Attenzione: deve essere scritto ESATTAMENTE come nel tuo JSON
    });
    document.getElementById('reset').addEventListener('click', function() {
        Reset(); // Attenzione: deve essere scritto ESATTAMENTE come nel tuo JSON
    });

});


