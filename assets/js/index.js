const btn = document.getElementById("roll-btn");
const checkboxes = document.querySelectorAll("input[name=checkbox-btn]");
const radiobuttons = document.querySelectorAll("input[name=radio-btn]");
const displayContainer = document.getElementById("display-container");
const charList = [];
let lastRoll = [];
let nbChar = 1;

init();

function init() {
  // Add event for all radio btn
  for (let i = 0; i < radiobuttons.length; i++) {
    radiobuttons[i].addEventListener(
      "change",
      createdisplay,
      radiobuttons[i].value
    );
  }

  editCharList();
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener("change", editCharList);
  }

  btn.addEventListener("click", () => roll(nbChar));
}

function createdisplay(nb) {
  displayContainer.innerHTML = "";
  nbChar = nb;

  for (let i = 0; i < nb; i++) {
    displayContainer.innerHTML += '<div class="character-display"></div>';
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

    rollAnimation(5, 100, i, random);
  }

  lastRoll = [...tempLastRoll];
}

function rollAnimation(time, speed, containerIndex, lastPos) {
  let random;
  const interval = setInterval(() => {
    random = Math.floor(Math.random() * charList.length);

    displayContainer.children[
      containerIndex
    ].innerHTML = `<img src="./assets/img/full/${charList[random]}.png" alt="${charList[random]}"/>`;
  }, speed);

  setTimeout(() => {
    clearInterval(interval);
    displayContainer.children[
      containerIndex
    ].innerHTML = `<img src="./assets/img/full/${charList[lastPos]}.png" alt="${charList[lastPos]}"/>`;
    btn.disabled = false;
  }, time * 1000);
}
