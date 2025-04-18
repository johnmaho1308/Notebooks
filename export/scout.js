




// Copy UHC facilities into combinedResults
const combinedResults = UHCfacilityResults.map((facility, index) => ({
    ...facility,
    BCBSmax: BCBSfacilityResults[index]?.max_rate || 'N/A'
    //AETNAmax: AETNAfacilityResults[index]?.max_rate || 'N/A'
}));

console.log(combinedResults); // ✅ Debug: Ensure data is correct
console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");



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
  
  
  

  function updateMapWithFilteredData(filteredData) {
    //console.log("Starting map update with filtered data...");
   
    // Remove all existing marker layers
    const layersToRemove = [];
    map.getLayers().forEach(layer => {
      if (layer instanceof ol.layer.Vector) {
        layersToRemove.push(layer);
      }
    });
    layersToRemove.forEach(layer => map.removeLayer(layer));
    //console.log("Existing layers removed.");
  
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
      
      groupedLocations[key].push({
        ...location,
        insurance: location.insurance || 'Unknown' // Default to 'Unknown' if not set
        });
    });

  
    
  
    // Create features for each unique location
    const features = [];
  
    Object.keys(groupedLocations).forEach(key => {
      const locations = groupedLocations[key];
      const [lon, lat] = key.split(',').map(Number);
  
  
  
      const feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
        locations: locations // Attach all data for this group
      });
  
      features.push(feature);
    });
  
    
  
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
    //console.log("Updated map with new vector layer.");
    let isPopupLocked = false; // Track if the tooltip is locked
    let activeFeature = null; // Store the active feature
    let lastClickTime = 0;
    const doubleClickDelay = 600; // Threshold for detecting a double-click
    
    // Handle hovering (tooltip appears while hovering)
    map.on('pointermove', function (evt) {
        if (isPopupLocked) {
            console.log("[pointermove] Tooltip is locked, not updating.");
            return;
        }
    
        const feature = map.forEachFeatureAtPixel(evt.pixel, f => f);
    
        if (feature) {
            console.log("[pointermove] Hovering over a feature.");
            activeFeature = feature; // Store active feature
            const coordinates = feature.getGeometry().getCoordinates();
            tooltip.setPosition(coordinates);
            tooltipElement.style.display = 'block'; // Show tooltip
    
            const locations = feature.get('locations'); // Get all locations for this marker
            if (locations && locations.length > 0) {
                let tooltipContent = `<div id="tooltip-content" style="max-height: 300px; overflow-y: auto;">
                    <table border="1" style="border-collapse: collapse; text-align: center; width: 100%; font-size: 12px;">
                      <thead>
                        <tr>
                          <th style="width: 200px;">Legal Name</th>
                          <th>Billing Code</th>
                          <th>UHC Max Rate</th>
                          <th>BCBS Max Rate</th>
                          <th>AETNA Max Rate</th>
                          <th>Taxonomy 1</th>
                          <th>Taxonomy 2</th>
                        </tr>
                      </thead>
                      <tbody>`;
    
                locations.forEach(location => {
                    tooltipContent += `
                      <tr>
                        <td style="width: 200px; text-align: left;">${location.legal_business_name || 'N/A'}</td>
                        <td>${location.billing_code || 'N/A'}</td>
                        <td>${location.max_rate || 'N/A'}</td>
                        <td>${location.BCBSmax || 'N/A'}</td>
                        <td>${location.AETNAmax || 'N/A'}</td>
                        <td>${location.tax1 || 'N/A'}</td>
                        <td>${location.tax2 || 'N/A'}</td>
                      </tr>`;
                });
    
                tooltipContent += `</tbody></table></div>`;
    
                tooltipElement.innerHTML = tooltipContent;
            }
        } else {
            console.log("[pointermove] Not hovering over a feature.");
            if (!isPopupLocked) {
                console.log("[pointermove] Hiding tooltip because it is NOT locked.");
                tooltipElement.style.display = 'none';
                activeFeature = null; // Clear active feature when moving away
            }
        }
    });
    
    // Detect double-click to lock/unlock the tooltip
    map.on('pointerdown', function (evt) {
        const currentTime = new Date().getTime();
        const feature = map.forEachFeatureAtPixel(evt.pixel, f => f);
    
        if (feature) {
            if (currentTime - lastClickTime < doubleClickDelay) {
                // **Double-click detected**
                isPopupLocked = !isPopupLocked; // Toggle lock state
                console.log(`[pointerdown] Double-click detected. Locking: ${isPopupLocked}`);
    
                activeFeature = isPopupLocked ? feature : null;
    
                if (isPopupLocked) {
                    // Keep tooltip visible
                    const coordinates = feature.getGeometry().getCoordinates();
                    tooltip.setPosition(coordinates);
                    tooltipElement.style.display = 'block';
                    console.log("[pointerdown] Tooltip locked in place.");
                }
            } else {
                console.log("[pointerdown] First click detected. Waiting for second click.");
            }
            lastClickTime = currentTime;
        }
    });
    
    // Disable OpenLayers default double-click zoom
    map.getInteractions().forEach(function (interaction) {
        if (interaction instanceof ol.interaction.DoubleClickZoom) {
            map.removeInteraction(interaction);
        }
    });
    
    // Hide tooltip when clicking outside only if locked
    document.addEventListener('click', function (event) {
        setTimeout(() => {
            if (isPopupLocked && !tooltipElement.contains(event.target)) {
                console.log("[click outside] Click detected outside tooltip. Hiding tooltip.");
            //    isPopupLocked = false;
            //    tooltipElement.style.display = 'none';
            //    activeFeature = null;
            } else {
                console.log("[click outside] Click detected but tooltip remains visible.");
            }
        }, 100);
    }, true);
    

  }










  document.addEventListener('DOMContentLoaded', () => {
    const mapElement = document.getElementById('map');
    const longitude = parseFloat(mapElement.getAttribute('data-longitude'));
    const latitude = parseFloat(mapElement.getAttribute('data-latitude'));
  
  
    
    if (!isNaN(zipLng) && !isNaN(zipLat)) {
      updateMap(zipLng, zipLat, 50);
      // Initialize or update your map using these coordinates
  
      // Use the locations array passed from PHP to add markers
      
      


       
      if (typeof combinedResults !== 'undefined') {
        combinedResults.forEach(location => {
            let lonLat = [parseFloat(location.longitude), parseFloat(location.latitude)];
            const lonLatZ = [parseFloat(location.longZ), parseFloat(location.latZ)];
  
                    // Check if lonLat is valid, else fallback to lonLatZ
          if (isNaN(lonLat[0]) || isNaN(lonLat[1])) {
            lonLat = lonLatZ;
              }
              

             
            const marker = new ol.Feature({
              geometry: new ol.geom.Point(ol.proj.fromLonLat(lonLat)),
              legalName: location.legal_business_name,
              insurance:'UHC',
              billingCode: location.billing_code,
              maxRate: location.max_rate,
              tax1 : location.tax1,
              tax2 : location.tax2,
              otherName: location.otherName,
              firstName: location.firstName
               // This should match your data structure
            });
            //console.log(marker.get('legalName'));
            //const vectorSource = new ol.source.Vector({
            //  features: [marker]
            //});
            vectorSource.clear();  // Removes old features
            vectorSource.addFeature(marker);
  
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
            updateMapWithFilteredData(combinedResults);
          });
        } else {
          // The 'locations' variable is not defined, handle accordingly
          //console.log('Locations data is not available.');
          // Consider initializing the map with a default view in this case
      }
    
    

  
  
  
  











// Extracting names (legal_business_name) for labels and limiting to first 10
const competitors = UHCfacilityResults.slice(0, 10).map(facility => facility.legal_business_name);

// Extracting actual rates from PHP variables and limiting to first 10
const prices = {
    BCBS: BCBSfacilityResults.slice(0, 15).map(facility => facility.max_rate),
    UHC: UHCfacilityResults.slice(0, 15).map(facility => facility.max_rate),
    //Aetna: AETNAfacilityResults.slice(0, 15).map(facility => facility.max_rate),
};

// Price Distribution by Competitor (Bar Chart)
const priceDistributionCtx = document.getElementById('priceDistributionChart').getContext('2d');
new Chart(priceDistributionCtx, {
    type: 'bar',
    data: {
        labels: competitors.map(label => label.substring(0, 15)), // Trim to 15 chars
        datasets: [
            { label: 'BCBS', data: prices.BCBS, backgroundColor: '#2196f3' },
            { label: 'UHC', data: prices.UHC, backgroundColor: '#1976d2' }
            //{ label: 'Aetna', data: prices.Aetna, backgroundColor: '#0d47a1' }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true }
        },
        title: {
            display: true,
            text: 'Price Distribution by Competitor'
        },
        scales: {
            x: {
                title: { display: true, text: 'Competitors' },
                ticks: {
                    autoSkip: false,
                    maxRotation: 70,  // Tilt labels 70 degrees
                    minRotation: 70
                }
            },
            y: {
                title: { display: true, text: 'Max Rate ($)' },
                beginAtZero: true
            }
        }
    }
});













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
              <td>${row.tax1}</td>
              <td>${row.tax2}</td>
              <td>${row.distance.toFixed(2)}</td>
              

          `;
          tbody.appendChild(tr);
      });
  }


  renderTable(UHCfacilityResults);

  





























// Define distance bins
const distanceBins = [5,10,15,20,25,30,35,40];

// Function to calculate average max rate for a payer within distance bins
function calculateAverageRatesByDistance(data) {
    const binSums = Array(distanceBins.length).fill(0);
    const binCounts = Array(distanceBins.length).fill(0);

    data.forEach(facility => {
        const distance = parseFloat(facility.distance);
        const rate = parseFloat(facility.max_rate);
        if (!isNaN(distance) && !isNaN(rate)) {
            for (let i = 0; i < distanceBins.length; i++) {
                if (distance <= distanceBins[i]) {
                    binSums[i] += rate;
                    binCounts[i]++;
                    break;
                }
            }
        }
    });

    return binSums.map((sum, index) => (binCounts[index] > 0 ? sum / binCounts[index] : null));
}

// Calculate average max rates for each payer
const avgBCBSRates = calculateAverageRatesByDistance(BCBSfacilityResults);
const avgUHCRates = calculateAverageRatesByDistance(UHCfacilityResults);
//const avgAetnaRates = calculateAverageRatesByDistance(AETNAfacilityResults);

// Define the chart data
const priceDistanceData = {
    labels: distanceBins.map(miles => `${miles} miles`),
    datasets: [
        {
            label: 'BCBS Average Max Rate',
            data: avgBCBSRates,
            fill: false,
            borderColor: '#2196f3', // Blue
            tension: 0.1
        },
        {
            label: 'UHC Average Max Rate',
            data: avgUHCRates,
            fill: false,
            borderColor: '#1976d2', // Darker blue
            tension: 0.1
        }
      //  {
       //     label: 'Aetna Average Max Rate',
        //    data: avgAetnaRates,
         //   fill: false,
        //    borderColor: '#0d47a1', // Even darker blue
        //    tension: 0.1
       // }
    ]
};



// Create the chart
const priceDistanceCtx = document.getElementById('priceDistanceChart').getContext('2d');
new Chart(priceDistanceCtx, {
    type: 'line',
    data: priceDistanceData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true }
        },
        scales: {
            x: {
                title: { display: true, text: 'Distance (miles)' },
                beginAtZero: true
            },
            y: {
                title: { display: true, text: 'Average Max Rate ($)' },
                beginAtZero: true
            }
        }
    }
});












// Define distance bins


// Function to calculate average max/min rates for all payers within distance bins
function calculateAverageRatesByDistance2(dataSets, rateType) {
    const binSums = Array(distanceBins.length).fill(0);
    const binCounts = Array(distanceBins.length).fill(0);

    dataSets.forEach(data => {
        data.forEach(facility => {
            const distance = parseFloat(facility.distance);
            const rate = parseFloat(facility[rateType]); // max_rate or min_rate

            if (!isNaN(distance) && !isNaN(rate)) {
                for (let i = 0; i < distanceBins.length; i++) {
                    if (distance <= distanceBins[i]) {
                        binSums[i] += rate;
                        binCounts[i]++;
                        break;
                    }
                }
            }
        });
    });

    return binSums.map((sum, index) => (binCounts[index] > 0 ? sum / binCounts[index] : null));
}

// Combine all payer data sets
const allPayersData = [BCBSfacilityResults, UHCfacilityResults];

// Calculate average max and min rates for all payers combined
const avgMaxRates = calculateAverageRatesByDistance2(allPayersData, 'max_rate');
const avgMinRates = calculateAverageRatesByDistance2(allPayersData, 'min_rate');

// Define the chart data
const priceRangeData = {
    labels: distanceBins.map(miles => `${miles} miles`),
    datasets: [
        {
            label: 'Average Max Rate',
            data: avgMaxRates,
            fill: false,
            borderColor: '#0d47a1', // Dark Blue
            tension: 0.1
        },
        {
            label: 'Average Min Rate',
            data: avgMinRates,
            fill: false,
            borderColor: '#1976d2', // Lighter Blue
            tension: 0.1
        }
    ]
};

// Create the chart
const priceRangeCtx = document.getElementById('priceRangeChart').getContext('2d');
new Chart(priceRangeCtx, {
    type: 'line',
    data: priceRangeData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true }
        },
        scales: {
            x: {
                title: { display: true, text: 'Distance (miles)' },
                beginAtZero: true
            },
            y: {
                title: { display: true, text: 'Average Rate ($)' },
                beginAtZero: true
            }
        }
    }
});
























window.addEventListener('resize', function () {
  setTimeout(() => {
      map.updateSize(); // Forces OpenLayers to recalculate map dimensions
  }, 200);
});







// Store reference to the chart instance
let bellCurveChart = null;

// Function to calculate mean (average)
function calculateMean(data) {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, value) => acc + value, 0);
    return sum / data.length;
}

// Function to calculate standard deviation
function calculateStdDev(data, mean) {
    if (data.length === 0) return 0;
    const variance = data.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
}

// Function to generate bell curve data with normalization
function generateBellCurveData(mean, stdDev, color, numPoints = 100) {
    let data = [];
    let minX = Math.max(mean - 3 * stdDev, 0); // Ensure no negative rates
    let maxX = mean + 3 * stdDev;
    let step = (maxX - minX) / numPoints;
    let maxDensity = 0;  // Track the highest peak

    // First Pass: Get max density value
    for (let x = minX; x <= maxX; x += step) {
        let yValue = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
        if (yValue > maxDensity) maxDensity = yValue;
        data.push({ x, y: yValue });
    }

    // Second Pass: Normalize density values
    data = data.map(point => ({ x: point.x, y: point.y / maxDensity })); // Normalize height to max 1

    return { data, color };
}
// Extract max_rate values from each payer dataset
const UHCrates = UHCfacilityResults.map(facility => parseFloat(facility.max_rate)).filter(rate => !isNaN(rate));
//const AETNArates = AETNAfacilityResults.map(facility => parseFloat(facility.max_rate)).filter(rate => !isNaN(rate));
const BCBSrates = BCBSfacilityResults.map(facility => parseFloat(facility.max_rate)).filter(rate => !isNaN(rate));

// Calculate mean and standard deviation for each payer
const UHCmean = calculateMean(UHCrates);
const UHCstdDev = calculateStdDev(UHCrates, UHCmean);

//const AETNAmean = calculateMean(AETNArates);
//const AETNAstdDev = calculateStdDev(AETNArates, AETNAmean);

const BCBSmean = calculateMean(BCBSrates);
const BCBSstdDev = calculateStdDev(BCBSrates, BCBSmean);

// Define payer datasets dynamically
const payers = [
    { name: 'UHC', mean: UHCmean, stdDev: UHCstdDev, color: 'rgba(33, 150, 243, 0.5)' },  // Blue
   // { name: 'Aetna', mean: AETNAmean, stdDev: AETNAstdDev, color: 'rgba(173, 184, 81, 0.53)' },  // Green
    { name: 'BCBS', mean: BCBSmean, stdDev: BCBSstdDev, color: 'rgba(255, 86, 34, 0.53)' }   // Orange
];

// Generate datasets for Chart.js
const datasets = payers.map(payer => {
    const { data, color } = generateBellCurveData(payer.mean, payer.stdDev, payer.color);
    return {
        label: `${payer.name} (Mean: ${payer.mean.toFixed(2)}, StdDev: ${payer.stdDev.toFixed(2)})`,
        data: data,
        fill: true,
        backgroundColor: color,
        borderColor: color.replace('0.5', '1'),  // Darker border
        pointRadius: 0
    };
});

// Function to destroy and reset the chart
function resetBellCurveChart() {
    if (bellCurveChart instanceof Chart) {
        //console.log("Destroying previous bellCurveChart...");
        bellCurveChart.destroy();
        bellCurveChart = null;
    }

    // Reset the canvas
    const canvas = document.getElementById('bellCurveChart');
    const parent = canvas.parentNode;
    canvas.remove();

    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'bellCurveChart';
    newCanvas.width = 600;  // Adjust as needed
    newCanvas.height = 400;  // Prevents auto-growth
    parent.appendChild(newCanvas);
}

function drawBellCurveChart() {
    resetBellCurveChart(); // Ensure old chart is removed

    // Get new canvas context
    const bellCurveCtx = document.getElementById('bellCurveChart').getContext('2d');

    // Create new chart
    bellCurveChart = new Chart(bellCurveCtx, {
        type: 'line',
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', title: { display: true, text: 'Negotiated Rate ($)' } },
                y: { title: { display: true, text: 'Normalized Density' } } // Adjusted title for clarity
            },
            plugins: { legend: { display: true } }
        }
    });

    //console.log("Normalized Bell Curve Chart Created.");
}

// Call the function to initialize the chart
drawBellCurveChart();





















// Function to convert rates array to scatter array with offsets
const convertToScatterArray = (dataArray, offset = 0) => {
    return dataArray.map(rateData => ({
        x: parseFloat(rateData.distance) + offset,  // Ensure distance is numeric
        y: parseFloat(rateData.max_rate)           // Ensure rate is numeric
    }));
};

// Apply different offsets for each dataset
const UHCratesArray = convertToScatterArray(UHCfacilityResults, 0);      // No offset
//const AETNAratesArray = convertToScatterArray(AETNAfacilityResults, 0.4);  // Slight right shift
const BCBSratesArray = convertToScatterArray(BCBSfacilityResults, -0.4);  // Slight left shift



// Generate scatter plot
const avgPaymentsCtx = document.getElementById('avgPaymentsChart').getContext('2d');
new Chart(avgPaymentsCtx, {
    type: 'scatter',
    data: {
        datasets: [
            {
                label: 'UHC Rates',
                data: UHCratesArray,
                backgroundColor: '#1976d2'
            },
           // {
           //     label: 'Aetna Rates',
           //     data: AETNAratesArray,
           //     backgroundColor: '#0d47a1'
           // },
            {
                label: 'BCBS Rates',
                data: BCBSratesArray,
                backgroundColor: '#2196f3'
            }
        ]
    },
    options: {
        title: {
            display: true,
            text: 'Payment Rates by Distance (miles)'
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Distance (miles)'
                },
                beginAtZero: true
            },
            y: {
                title: {
                    display: true,
                    text: 'Payment ($)'
                },
                beginAtZero: true
            }
        }
    }
});











// Define distance intervals
const distanceIntervals = [5,10,15,20,25,30,35,40];

// Extract distances from UHCfacilityResults
const facilityDistances = UHCfacilityResults.map(facility => parseFloat(facility.distance)).filter(distance => !isNaN(distance));

// Function to count facilities within each distance range
const facilityCounts = distanceIntervals.map(maxDistance =>
    facilityDistances.filter(distance => distance <= maxDistance).length
);

// Dynamic color gradient for bars (lightest to darkest)
const barColors = ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1'];

// Chart Data
const facilityDistanceData = {
    labels: distanceIntervals.map(miles => `${miles} miles`),
    datasets: [{
        label: 'Number of Facilities',
        data: facilityCounts,
        backgroundColor: barColors
    }]
};

// Create Chart
const facilityDistanceCtx = document.getElementById('facilityDistanceChart').getContext('2d');
new Chart(facilityDistanceCtx, {
    type: 'bar',
    data: facilityDistanceData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            datalabels: {
                anchor: 'end',
                align: 'top',
                formatter: (value) => value,  // Show the value directly on top of the bar
                font: { weight: 'bold', size: 12 },
                color: '#000'  // Black text for better visibility
            }
        },
        title: {
            display: true,
            text: 'Number of Facilities within Certain Distances'
        },
        scales: {
            x: { title: { display: true, text: 'Distance (miles)' } },
            y: { beginAtZero: true, title: { display: true, text: 'Number of Facilities' } }
        }
    },
    
});

//console.log("Facility count by distance:", facilityCounts);
















        document.addEventListener('DOMContentLoaded', function() {
            function toggleInputType() {
                const selectedType = document.querySelector('input[name="inputType"]:checked').value;
                if (selectedType === 'taxonomy') {
                    document.getElementById('taxonomyInputDiv').style.display = 'block';
                    document.getElementById('facilityTypeDiv').style.display = 'none';
                } else if (selectedType === 'facility') {
                    document.getElementById('taxonomyInputDiv').style.display = 'none';
                    document.getElementById('facilityTypeDiv').style.display = 'block';
                    document.getElementById('taxonomyCode').value = ''; // Clear taxonomy code input
                }
            }
        
            // Attach the toggle function to the radio buttons
            const radioButtons = document.querySelectorAll('input[name="inputType"]');
            radioButtons.forEach(button => button.addEventListener('click', toggleInputType));
        
            // Initial call to set the correct state on page load
            toggleInputType();
        
            // Handle form submission
            document.querySelector('form').addEventListener('submit', function(event) {
                const selectedType = document.querySelector('input[name="inputType"]:checked').value;
        
                if (selectedType === 'facility') {
                    const facilityType = document.getElementById('facilityType').value;
                    
                    // Taxonomy code prefixes for different facility types
                    const taxonomyCodesMap = {
                        urgentCare: ['261'],
                        painManagement: ['163'],
                        behavioralHealth: ['101', '103', '104', '208', '261', '320', '323', '283', '251'],
                        physicalTherapy: ['225', '261'],
                        familyPractice: ['207']
                    };
        
                    const taxonomyCode = taxonomyCodesMap[facilityType] ? taxonomyCodesMap[facilityType].join(', ') : '';
                    
                    // Set the taxonomy code in the hidden input field for form submission
                    document.getElementById('taxonomyCode').value = taxonomyCode;
                }
                
                console.log("Form inputs before submission:", {
                    zipCode: document.getElementById('zipCode').value,
                    selectedType: selectedType,
                    taxonomyCode: document.getElementById('taxonomyCode').value,
                    facilityType: document.getElementById('facilityType').value,
                    billingCode: document.getElementById('billingCode').value
                });
            });
        });

        function generateAnalytics() {
            // You can now access the selected values from both inputs
            const zipCode = document.getElementById('zipCode').value;
            const selectedType = document.querySelector('input[name="inputType"]:checked').value;
        
            let taxonomyCode = '';
            let facilityType = '';
        
            // Taxonomy code prefixes for different facility types
            const taxonomyCodesMap = {
                urgentCare: ['261'],
                painManagement: ['207','208'],
                behavioralHealth: ['101', '103', '163', '364', '363', '225', '251', '261'],
                physicalTherapy: ['225', '261'],
                familyPractice: ['207']
            };
        
            if (selectedType === 'taxonomy') {
                taxonomyCode = document.getElementById('taxonomyCode').value;
            } else if (selectedType === 'facility') {
                facilityType = document.getElementById('facilityType').value;
                // Assign taxonomy codes based on selected facility type
                taxonomyCode = taxonomyCodesMap[facilityType] ? taxonomyCodesMap[facilityType].join(', ') : '';
                
                // Set the taxonomy code in the hidden input field for form submission
                document.getElementById('taxonomyCode').value = taxonomyCode;
            }
        
            const billingCode = document.getElementById('billingCode').value;
        
            // Handle your analytics generation logic here
        
            // You can submit the data to the backend or perform other actions
        }
   

    }});




        