import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount, formatCents, splitBill, shareOut } from "../src/split.js";

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
  assert.deepEqual(out.shares, [2950, 2950, 2950, 2950]);
});

test("shareOut gives everyone a whole-cent share that adds up to the total", () => {
  const shares = shareOut(9000, 3);
  assert.deepEqual(shares, [3000, 3000, 3000]);
  assert.equal(shares.reduce((a, b) => a + b, 0), 9000);
});

test("splitBill validates its inputs", () => {
  assert.throws(() => splitBill(-1, 10, 2), /subtotal/);
  assert.throws(() => splitBill(1000, 150, 2), /tip/);
  assert.throws(() => splitBill(1000, 10, 0), /people/);
  assert.throws(() => splitBill(1000, 10, 2.5), /people/);
});
