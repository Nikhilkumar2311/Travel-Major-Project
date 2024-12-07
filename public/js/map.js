var map = L.map('map').setView([lat, lon], 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.marker([lat, lon]).addTo(map)
        .bindPopup("Exact location provided after booking")
        .openPopup();

L.circle([lat, lon], {
                color: 'blue',
                fillColor: '#add8e6',
                fillOpacity: 0.5,
                radius: 500
        }).addTo(map);