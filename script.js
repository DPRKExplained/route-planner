// File input element to load the Excel file
document.getElementById("findRouteButton").addEventListener("click", loadData);

async function loadData() {
    try {
        const response = await fetch("https://github.com/DPRKExplained/route-planner/blob/main/stations.xlsx");
        if (!response.ok) {
            throw new Error(`Failed to fetch file. Status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        console.log("Content-Type:", contentType);  // Log the content type to verify it's application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
        if (!contentType || !contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            throw new Error("File is not a valid Excel document.");
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        processWorkbook(workbook);
    } catch (error) {
        console.error("Error loading Excel file:", error);
    }
}

// Process stations data from JSON
function processStations(data) {
    const stations = [];

    // Skip header row
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const station = {
            name: row[0] || "Unknown",
            altName: row[1] || "Unknown",
            distance: row[2] || 0,
            transferLine: row[3] || "",
            province: row[4] || "Unknown",
        };
        stations.push(station);
    }
    console.log("Processed Stations:", stations);
}

// Mock findRoute function for testing
function findRoute(start, destination) {
    if (start && destination) {
        document.getElementById("result").textContent = `Route from ${start} to ${destination} found.`;
    } else {
        document.getElementById("result").textContent = "Please enter valid starting and destination stations.";
    }
}

// Event listener for find route button
document.getElementById("findRouteButton").addEventListener("click", () => {
    const startStation = document.getElementById("startStation").value.trim();
    const destinationStation = document.getElementById("destinationStation").value.trim();
    findRoute(startStation, destinationStation);
});
