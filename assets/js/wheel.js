const players = Array.from({ length: 3 }, (_, i) => document.getElementById(`player-${i + 1}`));

const data = [
    { label: "Viper", image: "./assets/img/icon/cropped-viper.png" },
    { label: "Feria", image: "./assets/img/icon/cropped-feria.png" },
    { label: "Tianhai", image: "./assets/img/icon/cropped-tianhai.png" },
    { label: "Ziping", image: "./assets/img/icon/cropped-ziping.png" },
    { label: "Temulch", image: "./assets/img/icon/cropped-temulch.png" },
    { label: "Tarka", image: "./assets/img/icon/cropped-tarka.png" },
    { label: "Kurumi", image: "./assets/img/icon/cropped-kurumi.png" },
    { label: "Yoto", image: "./assets/img/icon/cropped-yoto.png" },
    { label: "Valda", image: "./assets/img/icon/cropped-valda.png" },
    { label: "Yueshan", image: "./assets/img/icon/cropped-yueshan.png" },
    { label: "Wuchen", image: "./assets/img/icon/cropped-wuchen.png" },
    { label: "Justina", image: "./assets/img/icon/cropped-justina.png" },
    { label: "Takeda", image: "./assets/img/icon/cropped-takeda.png" },
    { label: "Matari", image: "./assets/img/icon/cropped-matari.png" },
    { label: "Akos", image: "./assets/img/icon/cropped-akos.png" },
    { label: "Zaï", image: "./assets/img/icon/cropped-zai.png" },
    { label: "Tessa", image: "./assets/img/icon/cropped-tessa.png" },
    { label: "Hadi", image: "./assets/img/icon/cropped-hadi.png" },
    { label: "Shayol", image: "./assets/img/icon/cropped-shayol.png" },
    { label: "Lyam", image: "./assets/img/icon/cropped-lyam.png" },
    { label: "Kylin", image: "./assets/img/icon/cropped-kylin.png" },
    { label: "Cyra", image: "./assets/img/icon/cropped-cyra.png" },
    { label: "Lannie", image: "./assets/img/icon/cropped-lannie.png" },
];

// === TOGGLE SIDENAV ===
document.getElementById("sidenav-icon").addEventListener("click", () => {
    const sidenav = document.getElementById("sidenav");
    const icon = document.getElementById("sidenav-icon");
    icon.textContent = icon.textContent === "menu" ? "close" : "menu";
    sidenav.classList.toggle("closed");
});

// === STORAGE ===
const STORAGE_KEY = "character";

function saveToStorage() {
    const checkboxStates = [...document.querySelectorAll('input[name="checkbox-btn"]')].map((input) => input.checked);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkboxStates));
}

function loadFromStorage(defaultLength) {
    let stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) {
        stored = Array(defaultLength).fill(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
    return stored;
}

// === UI GENERATION ===
function generateCheckboxButtons() {
    const container = document.getElementById("sidenav-main");
    const savedStates = loadFromStorage(data.length);

    container.innerHTML = data
        .map(
            (item, index) => `
        <div class="checkbox-btn">
            <label for="${item.label.toLowerCase()}">
                <img src="${item.image}" alt="${item.label} Ning">
            </label>
            <input 
                type="checkbox" 
                name="checkbox-btn" 
                id="${item.label.toLowerCase()}" 
                value="${index}" 
                ${savedStates[index] ? "checked" : ""}>
        </div>
    `
        )
        .join("");

    container.querySelectorAll('input[name="checkbox-btn"]').forEach((input) => {
        input.addEventListener("change", () => {
            updateWheel();
            saveToStorage();
        });
    });
}

function getSelectedCharacters() {
    return [...document.querySelectorAll('input[name="checkbox-btn"]:checked')].map((input) => data[input.value]);
}

// === WHEEL CREATION ===
function createWheel(characters) {
    const wheel = document.getElementById("wheel");
    wheel.innerHTML = "";

    const center = 200,
        radius = 190,
        anglePerSection = 360 / characters.length;

    wheel.appendChild(createSvgElement("circle", { cx: center, cy: center, r: radius, fill: "#000", stroke: "#222", "stroke-width": 5 }));

    characters.forEach((character, i) => {
        const startAngle = i * anglePerSection;
        const endAngle = startAngle + anglePerSection;
        const largeArc = anglePerSection > 180 ? 1 : 0;

        const [x1, y1] = polarToCartesian(center, radius, startAngle);
        const [x2, y2] = polarToCartesian(center, radius, endAngle);

        const colors = ["#111", "#333", "#600"];
        const pathData = [`M ${center} ${center}`, `L ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, "Z"].join(" ");

        wheel.appendChild(createSvgElement("path", { d: pathData, fill: colors[i % colors.length], stroke: "#000", "stroke-width": 1 }));

        const midAngle = startAngle + anglePerSection / 2;
        const [textX, textY] = polarToCartesian(center, radius * 0.625, midAngle);

        wheel.appendChild(
            createSvgElement(
                "text",
                {
                    x: textX,
                    y: textY,
                    transform: `rotate(${midAngle}, ${textX}, ${textY})`,
                    "text-anchor": "middle",
                    "dominant-baseline": "middle",
                    fill: "white",
                    "font-size": "12",
                },
                character.label
            )
        );
    });

    setupSpin(wheel, characters, anglePerSection);
}

function polarToCartesian(center, radius, angle) {
    const rad = (angle * Math.PI) / 180;
    return [center + radius * Math.cos(rad), center + radius * Math.sin(rad)];
}

function createSvgElement(tag, attributes, textContent = "") {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
    if (textContent) el.textContent = textContent;
    return el;
}

// === SPINNING LOGIC ===
function setupSpin(wheel, characters, anglePerSection) {
    let rotating = false;
    let rotation = 0;

    document.getElementById("wheel-wrapper").onclick = () => {
        if (rotating) return;
        rotating = true;

        const spinAmount = Math.floor(Math.random() * 360 + 3600);
        rotation += spinAmount;

        wheel.style.transition = "transform 4s ease-out";
        wheel.style.transform = `rotate(${rotation}deg)`;

        setTimeout(() => {
            const normalizedRotation = (360 - (rotation % 360)) % 360;
            const selectedIndex = Math.floor(normalizedRotation / anglePerSection);
            const selectedCharacter = characters[selectedIndex];

            if (players.length > 0) players[0].textContent = selectedCharacter.label;
            rotating = false;
        }, 4000);
    };
}

// === INIT ===
function updateWheel() {
    const selectedCharacters = getSelectedCharacters();
    if (selectedCharacters.length) {
        createWheel(selectedCharacters);
    }
}

generateCheckboxButtons();
updateWheel();
