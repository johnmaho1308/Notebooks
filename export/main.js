





var map = new ol.Map({
  
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([-95.517064, 30.123469]),
    zoom: 5
  })
});


var iconStyle = new ol.style.Style({
  image: new ol.style.Icon({
    anchor: [0.5, 1], // Adjusted for typical icon bottom-center anchoring
    src: './geolocation_marker.png' // Ensure this path is correct
  })
});

var feature = new ol.Feature({
  //geometry: new ol.geom.Point(ol.proj.fromLonLat([-95.517064, 30.123469]))
  // Note: Removed the style property from here
});

var vectorSource = new ol.source.Vector({
  features: [feature]
});

var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: iconStyle // Setting the style at the layer level
});




const tooltipElement = document.getElementById('tooltip');
const tooltip = new ol.Overlay({
  element: tooltipElement,
  offset: [10, 0],
  positioning: 'bottom-center'
});
map.addOverlay(tooltip);


map.on('pointermove', function(evt) {
  console.log('Pointer moved'); // Check if this logs
  const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
    console.log('Feature found', feature);
    return feature;
  });

  if (feature) {
    const coordinates = feature.getGeometry().getCoordinates();
    tooltip.setPosition(coordinates);
    const legalName = feature.get('legalName'); // Ensure this property is set when creating the feature
    const billingCode = feature.get('billingCode');
    const maxRate = feature.get('maxRate');
    const tax1 = feature.get('tax1');
    const tax2 = feature.get('tax2');
    const otherName = feature.get('otherName');
    const firstName = feature.get('firstName');
   
    const tooltipContent = `
    <div>
        <strong>Legal Name:</strong> ${legalName}<br>
        <strong>Other Name:</strong> ${otherName} ,  ${firstName}<br>
        <strong>Billing Code:</strong> ${billingCode}<br>
        <strong>Max Rate:</strong> ${maxRate}
        <strong>Taxonomy 1:</strong> ${tax1};
        <strong>Taxonomy 2:</strong> ${tax2};
    </div>
`;

// Update the tooltip's innerHTML
tooltipElement.innerHTML = tooltipContent;
tooltipElement.style.display = 'block'; // Show the tooltip
 
  } else {
    tooltipElement.style.display = 'none';
  }
});
map.addLayer(vectorLayer);






function updateMap(longitude, latitude, radiusMiles) {
  const center = ol.proj.fromLonLat([parseFloat(longitude), parseFloat(latitude)]);
  map.getView().setCenter(center);
  map.getView().setZoom(10);  // Implement calculateZoomLevel based on your requirements

  // Here you would also filter and add markers within the new radius
  // This part depends on how your markers are stored and managed
};

window.updateMap = updateMap;
window.dispatchEvent(new CustomEvent('main-js-loaded'));



async function getZipCodeFromCoordinates(lon, lat) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lon=${lon}&lat=${lat}`
    );
    const data = await response.json();
    return data.address.postcode || 'Unknown ZIP';
  } catch (error) {
    console.error('Error fetching ZIP code:', error);
    return 'Error';
  }
}




var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: 'geolocation_marker.png' // Use your marker icon
    })
  })
});






document.addEventListener('DOMContentLoaded', () => {
  const mapElement = document.getElementById('map');
  const longitude = parseFloat(mapElement.getAttribute('data-longitude'));
  const latitude = parseFloat(mapElement.getAttribute('data-latitude'));


  console.log(longitude);
  if (!isNaN(longitude) && !isNaN(latitude)) {
    updateMap(longitude, latitude, 50);
    // Initialize or update your map using these coordinates

    // Use the locations array passed from PHP to add markers
    
    
    if (typeof locations !== 'undefined') {
        locations.forEach(location => {
          let lonLat = [parseFloat(location.longitude), parseFloat(location.latitude)];
          const lonLatZ = [parseFloat(location.longZ), parseFloat(location.latZ)];

                  // Check if lonLat is valid, else fallback to lonLatZ
        if (isNaN(lonLat[0]) || isNaN(lonLat[1])) {
          lonLat = lonLatZ;
            }


          const marker = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat(lonLat)),
            legalName: location.legal_business_name,
            billingCode: location.billing_code,
            maxRate: location.max_rate,
            tax1 : location.tax1,
            tax2 : location.tax2,
            otherName: location.otherName,
            firstName: location.firstName
             // This should match your data structure
          });
          //console.log(marker.get('legalName'));
          const vectorSource = new ol.source.Vector({
            features: [marker]
          });

          const markerLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
              image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: './geolocation_marker.png'
              })
            })
          });

          map.addLayer(markerLayer);
          updateMapWithFilteredData(locations);
        });
      } else {
        // The 'locations' variable is not defined, handle accordingly
        console.log('Locations data is not available.');
        // Consider initializing the map with a default view in this case
    }

  
  const filters = {}; // Store selected filters
  let currentColumn = '';

    // Render table rows
    function renderTable(data) {
      const tbody = document.querySelector("#locationsTable tbody");
      tbody.innerHTML = "";
      data.forEach(row => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
              <td>${row.legal_business_name}</td>
              <td>${row.npi}</td>
              <td>${row.billing_code}</td>
              <td>${row.max_rate}</td>
              <td>${row.longitude}</td>
              <td>${row.latitude}</td>
              <td>${row.tax1}</td>
              <td>${row.tax2}</td>
              <td>${row.otherName}</td>
              <td>${row.firstName}</td>
              <td>${row.longZ}</td>
              <td>${row.latZ}</td>
          `;
          tbody.appendChild(tr);
      });
  }
  renderTable(tableLocations);

    // Filter Button Click
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            currentColumn = this.getAttribute('data-column');
            showDropdown(currentColumn);
        });
    });

    function showDropdown(column) {
      const dropdown = document.getElementById("filterDropdown");
      const dropdownContent = document.getElementById("dropdownContent");
      dropdownContent.innerHTML = ""; // Clear existing content
  
      // Get unique values for the selected column
      const uniqueValues = [...new Set(tableLocations.map(item => item[column]))];
  
      // Populate checkboxes
      uniqueValues.forEach(value => {
          const checkbox = document.createElement("div");
          checkbox.innerHTML = `
              <input type="checkbox" class="filter-option" value="${value}" ${isChecked(column, value) ? "checked" : ""}>
              ${value}
          `;
          dropdownContent.appendChild(checkbox);
      });
  
      // Calculate position: Center the dropdown
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
  
      dropdown.style.display = "block";
      dropdown.style.left = `${(viewportWidth - dropdown.offsetWidth) / 2}px`;
      dropdown.style.top = `${(viewportHeight - dropdown.offsetHeight) / 2}px`;
  
      // Align dropdown above the current column header
      const headerButton = document.querySelector(`.filter-btn[data-column="${column}"]`);
      if (headerButton) {
          const rect = headerButton.getBoundingClientRect(); // Get position of the column button
          dropdown.style.left = `${rect.left + window.scrollX - (dropdown.offsetWidth / 2) + rect.width / 2}px`;
          dropdown.style.top = `${rect.top + window.scrollY - dropdown.offsetHeight - 10}px`; // 10px above the column
      }
  
      // "Select All" and "Unselect All" Button Functionality
      document.getElementById('selectAllBtn').onclick = () => {
          document.querySelectorAll('.filter-option').forEach(cb => cb.checked = true);
      };
      document.getElementById('unselectAllBtn').onclick = () => {
          document.querySelectorAll('.filter-option').forEach(cb => cb.checked = false);
      };
  }
  

    // Check if value is already selected
    function isChecked(column, value) {
        return filters[column] ? filters[column].includes(value) : false;
    }

    // Apply Filter Button
    document.getElementById("applyFilterBtn").addEventListener("click", function () {
        const selectedValues = Array.from(document.querySelectorAll(".filter-option:checked")).map(el => el.value);
        if (selectedValues.length > 0) {
            filters[currentColumn] = selectedValues;
        } else {
            delete filters[currentColumn]; // Remove filter if none selected
        }
        applyFilters();
        document.getElementById("filterDropdown").style.display = "none";
    });

    // Apply Filters to the Table
    function applyFilters() {
      let filteredData = tableLocations;
    
      Object.keys(filters).forEach(column => {
        filteredData = filteredData.filter(row => filters[column].includes(row[column]));
      });
    
      renderTable(filteredData);
      updateMapWithFilteredData(filteredData); // Call the function to update the map
    }

    // Close Dropdown on Outside Click
    window.addEventListener("click", function (e) {
        if (!e.target.closest(".filter-btn") && !e.target.closest("#filterDropdown")) {
            document.getElementById("filterDropdown").style.display = "none";
        }
    });


  }

  function updateMapWithFilteredData(filteredData) {
    console.log("Starting map update with filtered data...");
    
    // Remove all existing marker layers
    const layersToRemove = [];
    map.getLayers().forEach(layer => {
      if (layer instanceof ol.layer.Vector) {
        layersToRemove.push(layer);
      }
    });
    layersToRemove.forEach(layer => map.removeLayer(layer));
    console.log("Existing layers removed.");
  
    // Group locations by coordinates to find duplicates
    const groupedLocations = {};
    filteredData.forEach(location => {
      const lonLat = [parseFloat(location.longitude), parseFloat(location.latitude)];
      const lonLatZ = [parseFloat(location.longZ), parseFloat(location.latZ)];
      const validCoordinates = isNaN(lonLat[0]) || isNaN(lonLat[1]) ? lonLatZ : lonLat;
  
      const key = validCoordinates.join(',');
      if (!groupedLocations[key]) {
        groupedLocations[key] = [];
      }
      groupedLocations[key].push(location);
    });
  
    console.log("Grouped locations by coordinates:", groupedLocations);
  
    // Create features for each unique location
    const features = [];
  
    Object.keys(groupedLocations).forEach(key => {
      const locations = groupedLocations[key];
      const [lon, lat] = key.split(',').map(Number);
  
      console.log(`Creating feature for ${locations.length} locations at (${lon}, ${lat})`);
  
      const feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
        locations: locations // Attach all data for this group
      });
  
      features.push(feature);
    });
  
    console.log("Final features array:", features);
  
    // Add new vector layer with grouped markers
    const newVectorSource = new ol.source.Vector({
      features: features
    });
  
    const newVectorLayer = new ol.layer.Vector({
      source: newVectorSource,
      style: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: './geolocation_marker.png' // Marker icon path
        })
      })
    });
  
    map.addLayer(newVectorLayer);
    console.log("Updated map with new vector layer.");
  
    // Update tooltip to handle multiple locations at the same coordinates
    map.on('pointermove', function (evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
      });
  
      if (feature) {
        const coordinates = feature.getGeometry().getCoordinates();
        tooltip.setPosition(coordinates);
  
        const locations = feature.get('locations'); // Get all locations for this marker
  
        if (locations && locations.length > 0) {
          // Generate a table for the popup
          let tooltipContent = `<div style="max-height: 300px; overflow-y: auto;">
            <table border="1" style="border-collapse: collapse; text-align: center; width: 100%;">
              <thead>
                <tr>
                  <th>Legal Name</th>
                  <th>Billing Code</th>
                  <th>Max Rate</th>
                  <th>Taxonomy 1</th>
                  <th>Taxonomy 2</th>
                  <th>Other Name</th>
                  <th>First Name</th>
                </tr>
              </thead>
              <tbody>`;
  
          locations.forEach(location => {
            tooltipContent += `
              <tr>
                <td>${location.legal_business_name || 'N/A'}</td>
                <td>${location.billing_code || 'N/A'}</td>
                <td>${location.max_rate || 'N/A'}</td>
                <td>${location.tax1 || 'N/A'}</td>
                <td>${location.tax2 || 'N/A'}</td>
                <td>${location.otherName || 'N/A'}</td>
                <td>${location.firstName || 'N/A'}</td>
              </tr>`;
          });
  
          tooltipContent += `
              </tbody>
            </table>
          </div>`;
  
          tooltipElement.innerHTML = tooltipContent;
          tooltipElement.style.display = 'block'; // Show the tooltip
        }
      } else {
        tooltipElement.style.display = 'none'; // Hide the tooltip
      }
    });
  }
  
  
  

  function generateNormalDistribution(mean, stdDev, numPoints) {
    const points = [];
    const step = (4 * stdDev) / numPoints;
    for (let x = mean - 2 * stdDev; x <= mean + 2 * stdDev; x += step) {
        const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
                  Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
        points.push({x: x, y: y});
    }
    return points;
}
const stdDev = 13
const mean = 65



var max_y = Math.PI*2
console.log(max_y)
max_y=(1 / (stdDev * Math.sqrt(max_y)))
console.log(max_y)
const data = generateNormalDistribution(mean, stdDev, 100); // Mean = 0, StdDev = 1, 100 points

const ctx = document.getElementById('bellCurveChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'Bell Curve',
            data: data,
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            pointRadius: 0
        }]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                
            }
        },
        plugins: {
          annotation: {
              annotations: {
                  line1: {
                      type: 'line',
                      yMin: 0,
                      yMax: max_y, // Adjust depending on the scale of your data
                      xMin: 50, // This should be the value you want the line to appear at
                      xMax: 50, // Same value as xMin for a vertical line
                      borderColor: 'red',
                      borderWidth: 2,
                      label: {
                          enabled: true,
                          content: 'Your Rate',
                          position: 'top'
                      }
                  }
              }
          }
      }
    }
});



});






// Close the popup when the close button is clicked
closeButton.addEventListener('click', function () {
  popupElement.style.display = 'none';
});
