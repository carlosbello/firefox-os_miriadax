"use strict";

var map,
	lat = 40.4167754,
	lng = -3.7037901999999576,
	ruta = [];

/**
 * Añade una posición a la ruta actual y guarda la ruta para futuras ejecuciones 
 */
function actualizarRuta(lat, lng) {
	ruta.push([lat, lng]);
	localStorage.ruta = JSON.stringify(ruta);
}

function enlazarMarcador(e) {
	// muestra ruta entre marcas anteriores y actuales
	map.drawRoute({
		origin : [lat, lng], // origen en coordenadas anteriores
		// destino en coordenadas del click o toque actual
		destination : [e.latLng.lat(), e.latLng.lng()],
		travelMode : 'driving',
		strokeColor : '#000000',
		strokeOpacity : 0.6,
		strokeWeight : 5
	});

	lat = e.latLng.lat();
	// guarda coords para marca siguiente
	lng = e.latLng.lng();
	
	// Guardar ultima posición en la ruta actual
	actualizarRuta(lat, lng);
	
	map.addMarker({
		lat : lat,
		lng : lng
	});
	// pone marcador en mapa
};


/**
 * Mueve el mapa hacia la posición indicada y añade un marcador en el centro indicado 
 */
function centrarEn(lat, lng) {
	map.setCenter(lat, lng);
	
	map.addMarker({
		lat : lat,
		lng : lng
	});
	// añadir el primer punto de la ruta.
	actualizarRuta(lat, lng);
}

function geolocalizar() {
	/* Solo mostrar el marcador en la posición actual si no se cargó
	 * una ruta existente pues la idea es que, al iniciar la aplicación,
	 * se retome la ruta anterior, o se comience una nueva ruta, a partir
	 * de la posición actual.
	 */
	if (ruta.length > 0) return;  

	GMaps.geolocate({
		success : function(position) {
			// guarda coords en lat y lng
			lat = position.coords.latitude;
			lng = position.coords.longitude;

			centrarEn(lat, lng);
		},
		error : function(error) {
			if (error.code === 3) {
				centrarEn(lat, lng);
			}
			else
				alert('Geolocalización falla: ' + error.message);
		},
		not_supported : function() {
			alert("Su navegador no soporta geolocalización");
		},
		options: {
			timeout: 5 * 1000,
			maximumAge: 10 * 60 * 1000,
			enableHighAccuracy: false
		}
	});
};

/**
 * Verifica si hay una ruta guardada y, si la hay, la repinta en el mapa.
 */
function inicializarRuta() {
	var rutaAnterior,
		e = { latLng: null };
		
	localStorage.ruta = localStorage.ruta || "[]";
	rutaAnterior = JSON.parse(localStorage.ruta);
	if (rutaAnterior.length > 1) { // Repintar la ruta guardada, solo si tiene más de un punto de recorrido
		// Guardar posición inicial de la ruta
		lat = rutaAnterior[0][0];
		lng = rutaAnterior[0][1];
		centrarEn(lat, lng);
		// Añadir el primer punto de la ruta
		actualizarRuta(lat, lng);
		for (var i = 1; i < rutaAnterior.length; i++) {
			// Crear un objeto con los datos de la posición de la ruta, como si 
			// se hubiera hecho click en el mapa
			e.latLng = new google.maps.LatLng(rutaAnterior[i][0], rutaAnterior[i][1]);
			// Pintar ruta hasta la posición actual
			enlazarMarcador(e);	
		}
	}
}

function inicializarMapa() {
	map = new GMaps({// muestra mapa centrado en coords [lat, lng]
		el : '#map',
		lat : lat,
		lng : lng,
		click : enlazarMarcador,
		tap : enlazarMarcador
	});
}

$('#btnLimpiar').click(function () {
	localStorage.ruta = "[]";
	ruta = [];
	map.cleanRoute();
	map.removeMarkers();
	geolocalizar();
});

inicializarMapa();
inicializarRuta();
geolocalizar();
