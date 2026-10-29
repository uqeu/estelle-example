import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount, formatCents, splitBill, shareOf } from "../src/split.js";

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

test("shareOf gives the extra cent to the first `remainder` people", () => {
  assert.equal(shareOf(1000, 3, 0), 334);
  assert.equal(shareOf(1000, 3, 1), 333);
  assert.equal(shareOf(1000, 3, 2), 333);
  const shares = [0, 1, 2].map((i) => shareOf(1000, 3, i));
  assert.equal(shares.reduce((a, b) => a + b, 0), 1000);
});
