const PERIOD_SCALE = 0.5;
const PLANET_COLORS = [
    "#9E9E9E", // Mercury
    "#FFFACD", // Venus
    "#87CEEB", // Earth
    "#B22222", // Mars
    "#FFD700", // Jupiter
    "#DAA520", // Saturn
    "#00FFFF", // Uranus
    "#0000CD", // Neptune
    "#8B4513", // Pluto
];
const PLANET_RADIUS = [
    5, 8, 10,
    10, 20, 30, 10, 40,
];

let canvas = document.getElementById('simulationCanvas');
let ctx = canvas.getContext('2d');
let planets = [];

function setupPlanets() {
    let numPlanets = document.getElementById('numPlanets').value;
    planets = [];
    for (let i = 0; i < numPlanets; i++) {
	planets.push({ radius: 100 + i * 50, period: 100 + i * 50, angle: 0 });
    }
    renderPlanetSettings();
}

function renderPlanetSettings() {
    let settingsDiv = document.getElementById('planetSettings');
    settingsDiv.innerHTML = '';
    planets.forEach((planet, index) => {
    settingsDiv.innerHTML += `<div>
    <label>Planet ${index + 1} - Radius: </label>
    <input type="number" onchange="updatePlanetRadius(${index}, this.value)" value="${planet.radius}">
    </div>`;
    });
}

function updatePlanetRadius(index, value) {
    planets[index].radius = planets[index].period = parseInt(value);
}


function draw() {
    //canvas.height = canvas.width = (maxRadius*2)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    // Draw the star
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI); // Slightly larger circle for the star
    ctx.fillStyle = 'yellow';
    ctx.fill();

    // Draw the planets
    planets.forEach((planet, i) => {
	    let x = centerX + planet.radius * Math.cos(planet.angle);
	    let y = centerY + planet.radius * Math.sin(planet.angle);
	    ctx.beginPath();
	    ctx.arc(x, y, PLANET_RADIUS[i % PLANET_RADIUS.length], 0, 2 * Math.PI); // Draw planet
	    ctx.fillStyle = PLANET_COLORS[i % PLANET_COLORS.length];
	    ctx.fill();

	    planet.angle += PERIOD_SCALE * 2 * Math.PI / planet.period; // Update angle for next frame
    });

    requestAnimationFrame(draw);
}

window.onload = (ev) => {
    setupPlanets();
    requestAnimationFrame(draw);
};

function usePreset() {
    let preset = document.getElementById('presets').value;
    if (!preset) return;
    const fractions = preset.split(" ");
    setPlanetsFromScale(fractions.map((fractionString) => {
        const [num, denom] = fractionString.split("/");
        const decimal = parseInt(num) / parseInt(denom);
        return decimal;
    }));
}

function setPlanetsFromScale(ratios) {
    let cum = 50;
    planets = [];
    planets.push({ radius: cum, period: cum, angle: 0 });
    for (let ratio of ratios) {
        cum *= ratio;
        planets.push({ radius: cum, period: cum, angle: 0 });
    }
    renderPlanetSettings();
}
