// document.onload = generateCheckboxButtons("naraka");

async function generateCharacterList(game) {
    try {
        const response = await fetch(`./assets/json/${game}.json`);
        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération du fichier : ${response.statusText}`);
        }
        const result = await response.json();
        return result; // Retourner les données pour pouvoir les utiliser ailleurs
    } catch (error) {
        console.error("Une erreur est survenue :", error);
        return []; // Retourner un tableau vide en cas d'erreur
    }
}

async function generateCheckboxButtons(game) {
    const container = document.getElementById("sidenav-main"); // Un conteneur où les éléments seront ajoutés

    // Récupérer les données des personnages
    const characters = await generateCharacterList(game);

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
        input.setAttribute("checked", true); // Par défaut, coché

        // Ajout de l'input au div
        checkboxDiv.appendChild(label);
        checkboxDiv.appendChild(input);

        // Ajout du div au conteneur parent
        container.appendChild(checkboxDiv);
    }
}

generateCheckboxButtons("naraka")
