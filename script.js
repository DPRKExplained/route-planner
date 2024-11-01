let stations = [];

// Load the Excel file and parse data
async function loadExcel() {
    const filePath = 'stations.xlsx';

    // Fetch the file as a Blob
    const response = await fetch(filePath);
    const data = await response.arrayBuffer();

    // Read the Excel file using SheetJS
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert sheet data to JSON format with updated column names and split names
    stations = XLSX.utils.sheet_to_json(sheet).map(station => {
        // Check if English and Korean names exist, then split
        const englishNames = station["English (Alternative Name)"] ? station["English (Alternative Name)"].split(" (") : [""];
        const primaryEnglish = englishNames[0].trim();
        const alternateEnglish = englishNames[1] ? englishNames[1].replace(")", "").trim() : null;

        const koreanNames = station["Korean (Hanja)"] ? station["Korean (Hanja)"].split(" (") : [""];
        const primaryKorean = koreanNames[0].trim();
        const alternateKorean = koreanNames[1] ? koreanNames[1].replace(")", "").trim() : null;

        return {
            name: primaryEnglish,
            altName: alternateEnglish,
            korean: primaryKorean,
            altKorean: alternateKorean,
            distance: station["Distance from Start"],
            line: station["Transfer Line"],
            province: station["Province"]
        };
    });

    // Log the stations data to check if it loaded correctly
    console.log(stations);

    // Populate autocomplete with stations
    populateAutocomplete();
}

// Populate autocomplete dropdown for station selection
function populateAutocomplete() {
    const startInput = document.getElementById('startStation');
    const endInput = document.getElementById('endStation');
    const datalist = document.createElement("datalist");
    datalist.id = "stationsList";

    stations.forEach(station => {
        const option = document.createElement("option");
        option.value = station.name;
        datalist.appendChild(option);

        // Add alternate name if it exists
        if (station.altName) {
            const altOption = document.createElement("option");
            altOption.value = station.altName;
            datalist.appendChild(altOption);
        }
    });

    startInput.setAttribute("list", "stationsList");
    endInput.setAttribute("list", "stationsList");
    document.body.appendChild(datalist);
}

// Find and display the route between two stations with line and transfer details
function findRoute() {
    const startStation = document.getElementById('startStation').value.trim();
    const endStation = document.getElementById('endStation').value.trim();
    const routeOutput = document.getElementById('routeOutput');

    // Find start and end stations, matching either primary or alternate names
    const start = stations.find(station => 
        station.name.toLowerCase() === startStation.toLowerCase() ||
        (station.altName && station.altName.toLowerCase() === startStation.toLowerCase())
    );
    const end = stations.find(station => 
        station.name.toLowerCase() === endStation.toLowerCase() ||
        (station.altName && station.altName.toLowerCase() === endStation.toLowerCase())
    );

    if (!start || !end) {
        routeOutput.innerText = "Please enter valid starting and destination stations.";
        return;
    }

    const distance = Math.abs(end.distance - start.distance);
    const isSameLine = start.line === end.line;
    const transferMessage = isSameLine ? "" : `<br>Transfer from ${start.line} to ${end.line} at ${start.name}`;

    // Display route details with transfer information
    routeOutput.innerHTML = `
        <strong>Route from ${start.name} (${start.line}) to ${end.name} (${end.line})</strong><br>
        Distance: ${distance} km ${transferMessage}
    `;
}

// Load the Excel data on page load
window.onload = loadExcel;
