const items = document.querySelectorAll(".item");
const root = document.querySelector(":root");
const soloBtn = document.getElementById("spin-button-solo");
const duoBtn = document.getElementById("spin-button-duo");
const trioBtn = document.getElementById("spin-button-trio");
const segment = 360 / items.length;
const offset = 15;
let animation;
let previousEndDegree = 0;

root.style.setProperty("--items", items.length);

items.forEach((item, index) => {
  item.style.setProperty("--index", index);
  // item.style.height = `${360 / items.length}%`;
});

soloBtn.addEventListener("click", () => {
  rotateWheel();
});
duoBtn.addEventListener("click", () => {
  rotateWheel();
  rotateWheel();
});
trioBtn.addEventListener("click", () => {
  rotateWheel();
  rotateWheel();
  rotateWheel();
});

function rotateWheel() {
  const randomAdditionalDegrees = Math.random() * 360 + 1800;
  const newEndDegree = previousEndDegree + randomAdditionalDegrees;

  animation = wheel.animate(
    [
      { transform: `rotate(${previousEndDegree}deg)` },
      { transform: `rotate(${newEndDegree}deg)` },
    ],
    {
      duration: 4000,
      direction: "normal",
      easing: "cubic-bezier(0.440, -0.205, 0.000, 1.130)",
      fill: "forwards",
      iterations: 1,
    }
  );

  previousEndDegree = newEndDegree;

  animation.onfinish = () => {
    const finalAngle = newEndDegree % 360;
    const normalizedAngle = normalizeAngle(finalAngle);
    const winner = Math.floor(((normalizedAngle + offset) % 360) / segment);
    console.log(wheel.children[winner].textContent.trim());
  };
}

const normalizeAngle = (finalAngle) => {
  return (360 - finalAngle + 90) % 360;
};
