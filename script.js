// Define the stations array globally
let stations = [];

// Load the Excel data and parse it into the stations array
function loadExcelData(workbookData) {
    const sheetNames = workbookData.SheetNames;

    sheetNames.forEach(sheetName => {
        const sheet = workbookData.Sheets[sheetName];
        const range = XLSX.utils.decode_range(sheet['!ref']);

        // Iterate over rows and map to station objects
        for (let row = 3; row <= range.e.r; row++) { // Assuming data starts from row 4 (index 3)
            const korean = sheet[`A${row + 1}`]?.v || "";
            const altName = sheet[`B${row + 1}`]?.v || "";
            const distance = sheet[`C${row + 1}`]?.v || 0;
            const transferLine = sheet[`D${row + 1}`]?.v || "None";
            const province = sheet[`E${row + 1}`]?.v || "Unknown";

            stations.push({
                korean: korean,
                name: altName,
                distance: distance,
                transferLine: transferLine,
                province: province,
                line: sheetName
            });
        }
    });

    console.log("Stations loaded:", stations); // Confirm data is loaded
}

// Function to handle the route finding based on user input
function findRoute() {
    // Get user input
    const userInputStartStation = document.getElementById("start").value.trim();
    const userInputEndStation = document.getElementById("end").value.trim();

    // Find the stations in the parsed data
    const startStation = stations.find(station => station.name === userInputStartStation);
    const endStation = stations.find(station => station.name === userInputEndStation);

    // Log for debugging
    console.log("Start Station:", startStation);
    console.log("End Station:", endStation);

    // Check if both stations are valid
    if (!startStation || !endStation) {
        alert("Please enter valid starting and destination stations.");
        return;
    }

    // Calculate and display route details
    const distance = Math.abs(endStation.distance - startStation.distance);
    const route = `From ${startStation.name} to ${endStation.name}: ${distance.toFixed(1)} km`;
    document.getElementById("output").textContent = route;
}

// Event listener for the 'Find Route' button
document.getElementById("findRouteButton").addEventListener("click", findRoute);

// Sample workbook data loading function for testing
// Replace 'data.xlsx' with your actual data file
fetch('data.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        loadExcelData(workbook);
    })
    .catch(error => console.error("Error loading Excel data:", error));
