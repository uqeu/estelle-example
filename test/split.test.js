import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount, formatCents, splitBill } from "../src/split.js";

test("parseAmount reads dollars into cents", () => {
  assert.equal(parseAmount("12"), 1200);
  assert.equal(parseAmount("12.5"), 1250);
  assert.equal(parseAmount(" 0.07 "), 7);
});

test("parseAmount refuses what is not an amount", () => {
  for (const bad of ["", "abc", "-3", "1.234", "1,000"]) {
    assert.throws(() => parseAmount(bad), /not an amount/);
  }
});

test("formatCents", () => {
  assert.equal(formatCents(0), "$0.00");
  assert.equal(formatCents(1205), "$12.05");
  assert.equal(formatCents(-5), "-$0.05");
});

test("splitBill adds the tip and divides the total", () => {
  const out = splitBill(10000, 18, 4);
  assert.equal(out.tipCents, 1800);
  assert.equal(out.totalCents, 11800);
  assert.equal(out.perPersonCents, 2950);
});

test("splitBill rounds a large subtotal's tip exactly, as QA found f-36bf2dc1cbb0", () => {
  // 4,503,599,627,370,495 * 11 = 49,539,595,901,075,445 exceeds 2^53, so the
  // product is not an exact double. Dividing in floating point loses the
  // half-cent: Math.round(subtotal * 11 / 100) gave 49,539,595,901,075,5
  // cents, one cent too many. Rounded exactly, half up, it is ...54.
  const subtotalCents = 4503599627370495;
  const out = splitBill(subtotalCents, 11, 1);
  assert.equal(out.tipCents, 495395959010754);
  assert.equal(out.totalCents, 4998995586381249);
  assert.equal(formatCents(out.totalCents), "$49989955863812.49");
});

test("splitBill rounds a tip below half a cent down", () => {
  assert.equal(splitBill(149, 1, 1).tipCents, 1);
  assert.equal(splitBill(1000, 10, 2).tipCents, 100);
  assert.equal(splitBill(10000, 18, 4).tipCents, 1800);
});

test("splitBill validates its inputs", () => {
  assert.throws(() => splitBill(-1, 10, 2), /subtotal/);
  assert.throws(() => splitBill(1000, 150, 2), /tip/);
  assert.throws(() => splitBill(1000, 10, 0), /people/);
  assert.throws(() => splitBill(1000, 10, 2.5), /people/);
});

test("parseAmount refuses an amount whose cents are not a safe integer", () => {
  // A 17-digit dollar amount times 100 overflows 2^53: the cents lose
  // precision, so the displayed amount would not be the one supplied.
  for (const bad of ["99999999999999999", "90071992547409.92", "1" + "0".repeat(17)]) {
    assert.throws(() => parseAmount(bad), /safe integer/);
  }
});

test("splitBill refuses a subtotal that is not a safe integer", () => {
  assert.throws(() => splitBill(2 ** 53, 10, 2), /subtotal/);
  assert.throws(() => splitBill(2 ** 53 + 2, 10, 2), /subtotal/);
});

test("splitBill refuses a total that overflows a safe subtotal", () => {
  assert.equal(splitBill(Number.MAX_SAFE_INTEGER, 0, 1).totalCents, Number.MAX_SAFE_INTEGER);
  assert.throws(() => splitBill(Number.MAX_SAFE_INTEGER, 1, 1), /total/);
});
