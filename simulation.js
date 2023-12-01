const PERIOD_SCALE = 0.2;
const SMALLEST_PLANET = 50;
const RADIUS_SCALE = 1.2;
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
let trail = [];

function seededRandom(seed) {
    let s = Math.sin(seed) * 10000;
    return s - Math.floor(s);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

	// Starry background
	for (let i=0; i<1000; i++) {
		const x = seededRandom(i) * canvas.width;
		const y = seededRandom(i+5000) * canvas.height;
		ctx.fillStyle = "white";
		ctx.fillRect(x, y, 1, 1);
	}

    // Draw the star
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI); // Slightly larger circle for the star
    ctx.fillStyle = 'yellow';
    ctx.fill();

    // Draw the planets
    planets.forEach((planet, i) => {
	    let x = centerX + planet.radius * Math.cos(planet.angle);
	    let y = centerY + planet.radius * Math.sin(planet.angle);
        let planetRadius = PLANET_RADIUS[i % PLANET_RADIUS.length];
        const planetColor = PLANET_COLORS[i % PLANET_COLORS.length];
        if (planet.highlight) {
            planetRadius *= 1.5;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, planetRadius+5, 0, 2 * Math.PI); // Draw planet
            ctx.strokeStyle = "green";
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, planetRadius+10, 0, 2 * Math.PI); // Draw planet
            ctx.strokeStyle = planetColor;
            ctx.stroke();
            ctx.lineWidth = 1;
        }
	    ctx.beginPath();
	    ctx.arc(x, y, planetRadius, 0, 2 * Math.PI); // Draw planet
	    ctx.fillStyle = planetColor;
	    ctx.fill();

	    planet.angle += PERIOD_SCALE * 2 * Math.PI / planet.period; // Update angle for next frame
    });
	trail.forEach(planet => {
	    let x = centerX + planet.radius * Math.cos(planet.angle);
	    let y = centerY + planet.radius * Math.sin(planet.angle);
		ctx.lineWidth = 3;
	    ctx.beginPath();
	    ctx.arc(x, y, planet.size, 0, 2 * Math.PI); // Draw planet
	    ctx.strokeStyle = planet.color;
	    ctx.stroke();
		ctx.globalAlpha = 0.5;
		ctx.fillStyle = planet.color
	    ctx.fill();
		ctx.globalAlpha = 1;
		ctx.lineWidth = 1;
	});

    requestAnimationFrame(draw);
}

window.onload = (ev) => {
    requestAnimationFrame(draw);
};

function usePreset() {
    let preset = document.getElementById('presets').value;
    if (!preset) return;
    const ratios = preset.split(" ").map((fractionString) => {
        const [num, denom] = fractionString.split("/");
        const decimal = parseInt(num) / parseInt(denom);
        return decimal;
    });
    setPlanetsFromScale(ratios)
    playSong();
}

function setPlanetsFromScale(ratios) {
    let period = SMALLEST_PLANET;
	let radius = SMALLEST_PLANET;
    planets = [];
	trail = [];
    for (let ratio of ratios) {
        period *= ratio;
        radius *= ratio * RADIUS_SCALE;
		planets.push({ radius, period, angle: 0 });
    }
}

function sleep(timeMs) {
  return new Promise((resolve) => setTimeout(resolve, timeMs));
}

function playTone(frequency, ms) {
    // Create an audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Create an oscillator (a sound wave)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    // Set the frequency (pitch) of the tone
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.005, audioContext.currentTime); // Adjust the volume here (0.0 to 1.0)

    // Connect the oscillator to the gain node, and the gain node to the audio context's destination
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start the oscillator to play the tone
    oscillator.start();
    // Stop the oscillator after a certain duration (in this case, after 1 second)
    oscillator.stop(audioContext.currentTime + ms/1000);
    return sleep(ms);
}

function freqFromNote(note, planet) {
	return scale = planet.period / SMALLEST_PLANET * 261;
}

async function playNote(note, length) {
    const planet = planets[note-1] || {};
	trail.push({
		angle: planet.angle,
		radius: planet.radius,
		size: PLANET_RADIUS[note-1],
		color: PLANET_COLORS[note-1],
	});
    planet.highlight = 1;
    const freq = freqFromNote(note, planet);
    await playTone(freq, length*420);
	planet.highlight = 0;
    await sleep(length*80);
}

async function playSong() {
	let melody = [
		[3, 1], [2, 1], [1, 1], [2, 1],  // Mary had a 
		[3, 1], [3, 1], [3, 2],          // little lamb, 
		[2, 1], [2, 1], [2, 2],          // little lamb,
		[3, 1], [5, 1], [5, 2],          // little lamb. Its 
		[3, 1], [2, 1], [1, 1], [2, 1],  // Mary had a 
		[3, 1], [3, 1], [3, 1], [3, 1],  // little lamb. It's fleece
		[2, 1], [2, 1], [3, 1], [2, 1],  // fleece was white as 
		[1, 4],                          // snow.
	];
    for (let [note, length] of melody) {
        await playNote(note, length);
    }
}
