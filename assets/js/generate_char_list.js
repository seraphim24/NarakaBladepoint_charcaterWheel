

document.onload = generateCheckboxButtons(GAME);

function saveToLocalStorage() {
    const checkboxStates = [...document.querySelectorAll('input[name="checkbox-btn"]')].map((input) => input.checked);
    localStorage.setItem(`${STORAGE_KEY}-${GAME}`, JSON.stringify(checkboxStates));
}

function updateLocalStorage(index) {
    let stored = JSON.parse(localStorage.getItem(`${STORAGE_KEY}-${GAME}`));
    if (!stored) {
        stored = Array(defaultLength).fill(true);
        localStorage.setItem(`${STORAGE_KEY}-${GAME}`, JSON.stringify(stored));
    }
    stored[index] = !stored[index];
    localStorage.setItem(`${STORAGE_KEY}-${GAME}`, JSON.stringify(stored));
}

function loadFromStorage(defaultLength) {
    let stored = JSON.parse(localStorage.getItem(`${STORAGE_KEY}-${GAME}`));
    if (!stored) {
        stored = Array(defaultLength).fill(true);
        localStorage.setItem(`${STORAGE_KEY}-${GAME}`, JSON.stringify(stored));
    }
    return stored;
}

async function generateCheckboxButtons(game) {
    const container = document.getElementById("sidenav-main"); // Un conteneur où les éléments seront ajoutés

    // Récupérer les données des personnages
    const characters = await getData(game, "icon");
    const savedStates = loadFromStorage(characters.length);

    // Vérifier si des données ont été récupérées avant de continuer
    if (characters.length === 0) {
        console.error("Aucun personnage trouvé.");
        return;
    }

    // Parcourir les données des personnages pour créer les éléments
    for (const [index, item] of characters.entries()) {
        // Création du div principal avec la classe "checkbox-btn"
        const checkboxDiv = document.createElement("div");
        checkboxDiv.classList.add("checkbox-btn");

        // Création de l'élément label
        const label = document.createElement("label");
        label.setAttribute("for", item.label.toLowerCase()); // L'attribut 'for' correspond à l'ID de l'input

        // Création de l'image à l'intérieur du label
        const img = document.createElement("img");
        img.setAttribute("src", item.image);
        img.setAttribute("alt", `${item.label} Ning`);

        // Ajout de l'image au label
        label.appendChild(img);

        // Création de l'élément input
        const input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("name", "checkbox-btn");
        input.setAttribute("id", item.label.toLowerCase()); // ID de l'input
        input.setAttribute("value", index); // Valeur de l'input
        if (savedStates[index]) input.setAttribute("checked", true);
        input.addEventListener("change", async () => {
            updateLocalStorage(index);
            const data = await getData(GAME, "wheel");
            const newState = loadFromStorage(data.length);
            const filteredData = data.filter((_, index) => newState[index]);
            wheel.updateData(filteredData);
        });

        // Ajout de l'input au div
        checkboxDiv.appendChild(label);
        checkboxDiv.appendChild(input);

        // Ajout du div au conteneur parent
        container.appendChild(checkboxDiv);
    }
}
