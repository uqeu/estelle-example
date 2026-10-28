import { parseAmount, formatCents, splitBill } from "./split.js";

const form = document.querySelector("#bill");
const result = document.querySelector("#result");
const error = document.querySelector("#error");

function render() {
  error.textContent = "";
  try {
    const subtotal = parseAmount(form.subtotal.value);
    const tip = Number(form.tip.value);
    const people = Number(form.people.value);
    const { tipCents, totalCents, shares } = splitBill(subtotal, tip, people);
    result.querySelector("[data-tip]").textContent = formatCents(tipCents);
    result.querySelector("[data-total]").textContent = formatCents(totalCents);
    result.querySelector("[data-each]").textContent = formatCents(shares[0]);
    result.querySelector("[data-collected]").textContent =
      formatCents(shares.reduce((sum, cents) => sum + cents, 0));
    result.hidden = false;
  } catch (err) {
    result.hidden = true;
    error.textContent = err.message;
  }
}

form.addEventListener("input", render);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});
render();
