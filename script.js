const V_MIN = Math.min(window.innerWidth, window.innerHeight);
const DOT_DISTANCE = V_MIN / 80;

sfxCut.currentTime = 1;

let cut = [];
let isMouseDown = false;

document.addEventListener("pointerdown", (e) => {
	e.target.releasePointerCapture(e.pointerId);
	setElementPosition(cursor, e.pageX, e.pageY);
	isMouseDown = true;
});

document.addEventListener("pointerup", stopCutting);

document.addEventListener("pointermove", (e) => {
	setElementPosition(cursor, e.pageX, e.pageY);

	if (!isMouseDown) return;

	if (e.target !== mask) {
		stopCutting();
		return;
	}

	const newPoint = {
		x: e.pageX,
		y: e.pageY
	};

	if (cut.length) {
		const distanceToFirst = calculateDistance(cut.at(0), newPoint);

		if (cut.length > 3 && distanceToFirst < DOT_DISTANCE * 1.5) {
			drawHole();
			stopCutting();
			return;
		}

		const distanceToPrevious = calculateDistance(cut.at(-1), newPoint);
		if (distanceToPrevious < DOT_DISTANCE) return;
	}

	const dot = createDivWithClass("dot");
	setElementPosition(dot, e.pageX, e.pageY);
	document.body.appendChild(dot);

	sfxCut.play();

	cut.push(newPoint);
});

function drawHole() {
	const hole = createDivWithClass("hole");
	const cutout = createDivWithClass("cutout");

	const clipPoints = cut.map((p) => `${p.x}px ${p.y}px`).join(", ");
	const clipPath = `polygon(${clipPoints})`;
	hole.style.clipPath = clipPath;
	cutout.style.clipPath = clipPath;
	const firstPoint = cut.at(0);
	cutout.style.transformOrigin = `${firstPoint.x}px ${firstPoint.y}px`;

	document.body.appendChild(hole);
	document.body.appendChild(cutout);

	sfxHole.currentTime = 0;
	sfxHole.play();

	setTimeout(() => {
		cutout.remove();
	}, 1000);
}

function stopCutting() {
	sfxCut.pause();
	sfxCut.currentTime = 1;
	isMouseDown = false;
	document.querySelectorAll(".dot").forEach((el) => el.remove());
	cut = [];
}

function createDivWithClass(className) {
	const div = document.createElement("div");
	div.classList.add(className);
	return div;
}

function setElementPosition(el, x, y) {
	el.style.left = `${x}px`;
	el.style.top = `${y}px`;
}

function calculateDistance(a, b) {
	return Math.hypot(b.x - a.x, b.y - a.y);
}