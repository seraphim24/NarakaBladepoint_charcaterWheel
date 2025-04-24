const player1 = document.getElementById("player-1");
const player2 = document.getElementById("player-2");
const player3 = document.getElementById("player-3");

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

// === SIDENAV TOGGLE ===
const sidenavBtn = document.getElementById("sidenav-icon");
sidenavBtn.addEventListener("click", () => {
    sidenavBtn.textContent = sidenavBtn.textContent === "menu" ? "close" : "menu";
    document.getElementById("sidenav").classList.toggle("closed");
});

// === GENERATE CHECKBOX LIST ===
function generateCheckboxButtons() {
    const container = document.getElementById("sidenav-main");
    container.innerHTML = ""; // Clear existing content

    data.forEach((item, index) => {
        const checkboxDiv = document.createElement("div");
        checkboxDiv.classList.add("checkbox-btn");

        const label = document.createElement("label");
        label.setAttribute("for", item.label.toLowerCase());

        const img = document.createElement("img");
        img.setAttribute("src", item.image);
        img.setAttribute("alt", `${item.label} Ning`);
        label.appendChild(img);

        const input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("name", "checkbox-btn");
        input.setAttribute("id", item.label.toLowerCase());
        input.setAttribute("value", index);
        input.checked = true;

        input.addEventListener("change", updateWheel); // 👈 Update wheel when changed

        checkboxDiv.appendChild(label);
        checkboxDiv.appendChild(input);
        container.appendChild(checkboxDiv);
    });
}

// === GET CHECKED CHARACTERS ===
function getAllCheckboxInputs() {
    const checkboxInputs = document.querySelectorAll('input[name="checkbox-btn"]');
    const selected = [];
    checkboxInputs.forEach((input) => {
        if (input.checked) {
            selected.push(data[input.value]);
        }
    });
    return selected;
}

// === CREATE WHEEL ===
function createWheel(charList) {
    const wheel = document.getElementById("wheel");
    wheel.innerHTML = ""; // 🧹 Clean up the SVG

    const center = 200;
    const radius = 190;
    const anglePerSection = 360 / charList.length;

    const toRad = (deg) => (deg * Math.PI) / 180;

    // Border
    const border = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    border.setAttribute("cx", center);
    border.setAttribute("cy", center);
    border.setAttribute("r", radius);
    border.setAttribute("fill", "none");
    border.setAttribute("stroke", "#222");
    border.setAttribute("stroke-width", "10");
    wheel.appendChild(border);

    charList.forEach((item, i) => {
        const startAngle = i * anglePerSection;
        const endAngle = (i + 1) * anglePerSection;
        const midAngle = startAngle + anglePerSection / 2;

        const x1 = center + radius * Math.cos(toRad(startAngle));
        const y1 = center + radius * Math.sin(toRad(startAngle));
        const x2 = center + radius * Math.cos(toRad(endAngle));
        const y2 = center + radius * Math.sin(toRad(endAngle));
        const largeArc = anglePerSection > 180 ? 1 : 0;

        const path = `
M ${center} ${center}
L ${x1} ${y1}
A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
Z
`;

        const slice = document.createElementNS("http://www.w3.org/2000/svg", "path");
        slice.setAttribute("d", path);
        slice.setAttribute("fill", `hsl(${i * (360 / charList.length)}, 70%, 50%)`);
        wheel.appendChild(slice);

        const textX = center + (radius / 1.6) * Math.cos(toRad(midAngle));
        const textY = center + (radius / 1.6) * Math.sin(toRad(midAngle));

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", textX);
        text.setAttribute("y", textY);
        text.setAttribute("transform", `rotate(${midAngle}, ${textX}, ${textY})`);
        text.textContent = item.label;
        wheel.appendChild(text);

        const imageRadius = radius * 0.92;
        const imgX = center + imageRadius * Math.cos(toRad(midAngle)) - 15;
        const imgY = center + imageRadius * Math.sin(toRad(midAngle)) - 15;

        const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        img.setAttribute("href", item.image);
        img.setAttribute("x", imgX);
        img.setAttribute("y", imgY);
        img.setAttribute("width", "30");
        img.setAttribute("height", "30");
        img.setAttribute("transform", `rotate(${midAngle}, ${imgX + 15}, ${imgY + 15})`);
        wheel.appendChild(img);
    });

    // Spin logic
    let rotating = false;
    let rotation = 0;
    const wheelWrapper = document.getElementById("wheel-wrapper");
    wheelWrapper.onclick = () => {
        if (rotating) return; // ✋ Empêche le spam
        if (charList.length === 0) return alert("❗Sélectionne au moins un personnage.");

        rotating = true; // 🚫 Bloque le clic

        const rand = Math.floor(Math.random() * 360 + 3600);
        rotation += rand;
        wheel.style.transition = "transform 4s ease-out";
        wheel.style.transform = `rotate(${rotation}deg)`;

        setTimeout(() => {
            const normalized = rotation % 360;
            const pointerAngle = (360 - normalized) % 360;
            const index = Math.floor(pointerAngle / anglePerSection);
            const selected = charList[index];
            rotating = false; // ✅ On peut re-cliquer
            player1.textContent = selected.label;
        }, 4000);
    };
}

// === UPDATE WHEEL ON CHECKBOX CHANGE ===
function updateWheel() {
    const selectedChars = getAllCheckboxInputs();
    createWheel(selectedChars);
}

// === INIT ===
generateCheckboxButtons();
updateWheel(); // Génère la roue au chargement
