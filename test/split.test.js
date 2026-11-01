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

test("splitBill rounds a safe-integer subtotal's tip exactly to whole cents", () => {
  // Reported defect: a safe subtotal whose tip lands just below a half cent
  // must round up exactly once, not lose a cent to floating point.
  const out = splitBill(4503599627370495, 11, 1);
  assert.equal(out.tipCents, 495395959010754);
  assert.equal(out.totalCents, 4998995586381249);
});

test("splitBill keeps fractional tip percentages exact at the half-cent boundary", () => {
  assert.equal(splitBill(10000, 18.5, 1).tipCents, 1850);
  assert.equal(splitBill(10, 5, 1).tipCents, 1);
  assert.equal(splitBill(10, 14.99, 1).tipCents, 1);
  assert.equal(splitBill(10, 15, 1).tipCents, 2);
  assert.equal(splitBill(15, 10, 1).tipCents, 2);
});
