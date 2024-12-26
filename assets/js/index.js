const btn = document.getElementById("roll-btn");
const checkboxes = document.querySelectorAll("input[name=checkbox-btn]");
const radiobuttons = document.querySelectorAll("input[name=radio-btn]");
const displayContainer = document.getElementById("display-container");
const charList = [];
let lastRoll = [];
let nbChar = 1;

init();

function init() {
  editCharList();
  createdisplay(nbChar);
  // Add event for all radio btn
  for (let i = 0; i < radiobuttons.length; i++) {
    radiobuttons[i].addEventListener(
      "change",
      createdisplay,
      radiobuttons[i].value
    );
  }

  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener("change", editCharList);
  }

  btn.addEventListener("click", () => roll(nbChar));
}

function createdisplay(nb) {
  displayContainer.innerHTML = "";
  nbChar = nb;

  for (let i = 0; i < nb; i++) {
    displayContainer.innerHTML += `<div class="wrapper"><div class="character-display">${createCharImg()}${createCharImg()}</div></div>`;
  }
}

function editCharList() {
  charList.length = 0;
  for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      charList.push(checkboxes[i].value);
    }
  }
}

function createCharImg() {
  let list = "";

  for (let i = 0; i < charList.length; i++) {
    list += `<img src="./assets/img/full/${charList[i]}.png" alt="${charList[i]}" data-index="${i}"/>`;
  }

  return list;
}

function roll(nb) {
  const tempLastRoll = [];
  let random;
  let canPass = false;
  btn.disabled = true;

  for (let i = 0; i < nb; i++) {
    while (!canPass) {
      random = Math.floor(Math.random() * charList.length);
      if (tempLastRoll.indexOf(random) === -1) {
        tempLastRoll.push(random);
        canPass = true;
      }
    }
    canPass = false;

    rollAnimation(3, i, random);
  }

  lastRoll = [...tempLastRoll];
}

function rollAnimation(speed, containerIndex, lastPos) {
  const characters =
    displayContainer.children[containerIndex].children[0].querySelectorAll(
      "img"
    );

  characters.forEach((character) => {
    character.style.display = "block";
    character.style.animation = `slide ${speed}s linear infinite`;
  });

  setTimeout(() => {
    btn.disabled = false;

    characters.forEach((character) => {
      character.style.animation = "";
      character.style.display = "none";
    });

    displayContainer.children[containerIndex].children[0].children[
      lastPos
    ].style.display = "block";
  }, (speed - 1) * 1000);
}

// btn.addEventListener("click", () => {
//   btn.disabled = true; // Désactive le bouton pendant le roulement
//   const containers = document.querySelectorAll(".character-display");

//   containers.forEach((display, containerIndex) => {
//     const images = display.querySelectorAll("img");
//     const totalImages = images.length;
//     const lastPos = Math.floor(Math.random() * totalImages); // Image finale aléatoire

//     // Appliquer l'animation
//     display.style.animation = `spin ${2 + containerIndex}s linear infinite`;

//     // Arrêter après un certain temps
//     setTimeout(() => {
//       display.style.animation = "none"; // Stoppe l'animation
//       images.forEach((img) => (img.style.display = "none")); // Cache toutes les images
//       images[lastPos].style.display = "block"; // Affiche l'image finale
//       if (containerIndex === containers.length - 1) {
//         btn.disabled = false; // Réactive le bouton après toutes les animations
//       }
//     }, 2000 + containerIndex * 1000); // Délai dépendant du conteneur
//   });
// });
