// Bill splitting. All money is handled in whole cents so floating point
// never decides who owes what.

const MAX_PEOPLE = 50;
const MAX_TIP_PERCENT = 100;

// "12.5" -> 1250, "12.34" -> 1234. Throws on anything that is not a
// plain non-negative amount with at most two decimals.
export function parseAmount(text) {
  const trimmed = String(text).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error(`not an amount: "${text}"`);
  }
  const [whole, fraction = ""] = trimmed.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function formatCents(cents) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, "0");
  return `${sign}$${dollars}.${rest}`;
}

export function splitBill(subtotalCents, tipPercent, people) {
  if (!Number.isInteger(subtotalCents) || subtotalCents < 0) {
    throw new Error("subtotal must be a whole number of cents");
  }
  if (!(tipPercent >= 0 && tipPercent <= MAX_TIP_PERCENT)) {
    throw new Error(`tip must be between 0 and ${MAX_TIP_PERCENT} percent`);
  }
  if (!Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) {
    throw new Error(`people must be between 1 and ${MAX_PEOPLE}`);
  }
  // Keep the exact tip and round once, at the total, so the bill is not rounded twice.
  const tipCents = (subtotalCents * tipPercent) / 100;
  const totalCents = Math.round(subtotalCents + tipCents);
  return { tipCents, totalCents, perPersonCents: totalCents / people };
}
