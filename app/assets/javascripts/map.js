var map;

$( document ).ready(function() {
});

var pinArray;
var infoWindowArray = [];
var userMarkerArray = [];
var infoWindowMarkerToSave;
var geocoder;

function initMap() {

  geocoder = new google.maps.Geocoder();

  centerMap();
}

function centerMap(position) {
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 4,
    center: {lat: 39.504041, lng: -97.558594}
  });

  $('.locate-button').on('click', function(){
    event.preventDefault();
    navigator.geolocation.getCurrentPosition(doButton);

    function doButton(position) {
      console.log(position);
      var latLngLiteral = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.log(latLngLiteral);

      closeAllInfoWindows();
      removeUnsavedMarkers();
      map.setCenter(latLngLiteral);
      map.setZoom(10);
    }
  });

  google.maps.event.addListenerOnce(map, 'idle', function(){

    initAutocomplete();
    
    navigator.geolocation.getCurrentPosition(function(position) {
      var latLngLiteral = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      closeAllInfoWindows();
      removeUnsavedMarkers();
      map.setCenter(latLngLiteral);
      map.setZoom(7);
    });

    var request = $.ajax({
      url:      '/map',
      method:   'get',
      dataType: 'json'
    });

    request.done( function(response) {
      for (var i = 0; i < response.length; i++) {
        var latLngLiteral = {
          lat: response[i].latitude,
          lng: response[i].longitude
        };

        if (!response[i].address) {
          reverseGeocode(latLngLiteral, next);
        } else {
          next(response[i].address);
        }
      }

      function next(inputAddressString) {
        placeDatabaseMarker(latLngLiteral, inputAddressString);
      }
    });
  });

  google.maps.event.addListener(map, 'click', function(event) {
    closeAllInfoWindows();
    removeUnsavedMarkers();

    var latLngLiteral = {
     lat: event.latLng.lat(),
     lng: event.latLng.lng()
    };

    reverseGeocode(latLngLiteral, next);

    function next(inputAddressString) {
      placeUserMarker(event.latLng, inputAddressString);
    }
  });
}

function reverseGeocode(inputLocation, callback) {
  var coordinateString = inputLocation.lat + ', ' + inputLocation.lng;
  var addressString;

  geocoder.geocode({'location': inputLocation}, function(results, status) {
    if (status === 'OK') {
      if (results[1]) {
        callback(results[1].formatted_address);
      } else {
        return coordinateString;
      }
    } else {
      return coordinateString;
    }
  });
}

function closeAllInfoWindows() {
  for (var i = 0; i < infoWindowArray.length; i++) {
    infoWindowArray[i].close();
  }
}

function removeUnsavedMarkers() {
  for (var i = 0; i < userMarkerArray.length; i++) {
    userMarkerArray[i].setMap(null);
  }
  userMarkerArray = [];
}
