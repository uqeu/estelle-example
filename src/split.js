// Bill splitting. All money is handled in whole cents so floating point
// never decides who owes what.

const MAX_PEOPLE = 50;
const MAX_TIP_PERCENT = 100;

// "12.5" -> 1250, "12.34" -> 1234. Throws on anything that is not a
// plain non-negative amount with at most two decimals, and on amounts
// whose cents cannot be held exactly as a safe integer.
export function parseAmount(text) {
  const trimmed = String(text).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error(`not an amount: "${text}"`);
  }
  const [whole, fraction = ""] = trimmed.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) {
    throw new Error(`amount is not a safe integer of cents: "${text}"`);
  }
  return cents;
}

export function formatCents(cents) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, "0");
  return `${sign}$${dollars}.${rest}`;
}

// "18" -> 1800, "18.5" -> 1850. Percentages are held in hundredths of a
// percent so a fractional rate is an exact integer too.
function percentInHundredths(tipPercent) {
  const hundredths = Math.round(tipPercent * 100);
  if (!(hundredths >= 0) || Math.abs(tipPercent * 100 - hundredths) > 1e-6) {
    throw new Error("tip must have at most two decimal places");
  }
  return hundredths;
}

export function splitBill(subtotalCents, tipPercent, people) {
  if (!Number.isSafeInteger(subtotalCents) || subtotalCents < 0) {
    throw new Error("subtotal must be a whole number of cents");
  }
  if (!(tipPercent >= 0 && tipPercent <= MAX_TIP_PERCENT)) {
    throw new Error(`tip must be between 0 and ${MAX_TIP_PERCENT} percent`);
  }
  if (!Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) {
    throw new Error(`people must be between 1 and ${MAX_PEOPLE}`);
  }
  const tipNumerator = percentInHundredths(tipPercent);
  const tipScaled = BigInt(subtotalCents) * BigInt(tipNumerator);
  const tipCents = Number((tipScaled + 5000n) / 10000n);
  const totalCents = subtotalCents + tipCents;
  if (!Number.isSafeInteger(totalCents)) {
    throw new Error("total is not a safe integer of cents");
  }
  return { tipCents, totalCents, perPersonCents: totalCents / people };
}
