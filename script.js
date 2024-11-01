// Data structure to store parsed Excel data
let stationsData = {};

// Load data from Excel sheets
async function loadData() {
    // Load the XLSX library if not already available
    if (typeof XLSX === 'undefined') {
        console.error("XLSX library not loaded.");
        return;
    }
    
    try {
        const response = await fetch('path/to/your/excel-file.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        // Iterate over each sheet
        workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Parse each row of the sheet
            const lineData = [];
            jsonData.forEach((row, index) => {
                if (index > 1) { // Skip headers
                    const [korean, english, distance, transferLine, province] = row;
                    lineData.push({
                        korean: korean || '',
                        english: english || '',
                        distance: parseFloat(distance) || 0,
                        transferLine: transferLine || '',
                        province: province || ''
                    });
                }
            });
            stationsData[sheetName] = lineData;
        });

        console.log("Data loaded successfully:", stationsData);
    } catch (error) {
        console.error("Error loading Excel file:", error);
    }
}

// Function to find route between two stations
function findRoute() {
    const startStation = document.getElementById("startStation").value.trim();
    const destinationStation = document.getElementById("destinationStation").value.trim();

    if (!startStation || !destinationStation) {
        displayResult("Please enter valid starting and destination stations.");
        return;
    }

    // Search for route within the dataset
    let startFound = null;
    let destinationFound = null;
    let distance = 0;

    // Search through each line in stationsData
    for (let line in stationsData) {
        const lineStations = stationsData[line];

        for (let i = 0; i < lineStations.length; i++) {
            const station = lineStations[i];

            if (station.english === startStation || station.korean === startStation) {
                startFound = { station, line, index: i };
            }

            if (station.english === destinationStation || station.korean === destinationStation) {
                destinationFound = { station, line, index: i };
            }

            // If both stations found on the same line, calculate distance
            if (startFound && destinationFound && startFound.line === destinationFound.line) {
                distance = Math.abs(destinationFound.station.distance - startFound.station.distance);
                displayResult(`Route found on ${startFound.line}. Distance: ${distance} km.`);
                return;
            }
        }
    }

    // If a route wasn't found
    if (!startFound || !destinationFound) {
        displayResult("One or both stations could not be found.");
    } else {
        displayResult(`No direct route found between ${startStation} and ${destinationStation}.`);
    }
}

// Display result in the result div
function displayResult(message) {
    const resultDiv = document.getElementById("result");
    resultDiv.textContent = message;
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    const findRouteButton = document.getElementById("findRouteButton");

    // Load Excel data on page load
    loadData();

    // Bind button click to findRoute function
    if (findRouteButton) {
        findRouteButton.addEventListener("click", findRoute);
    }
});
