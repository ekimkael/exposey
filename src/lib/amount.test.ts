import assert from "node:assert";
import { applyKey, splitAmount } from "./amount";

// applyKey
assert.equal(applyKey("", "1"), "1");
assert.equal(applyKey("0", "5"), "5"); // no leading zero
assert.equal(applyKey("10", "0"), "100");
assert.equal(applyKey("100", "."), "100.");
assert.equal(applyKey("100.", "."), "100."); // single dot
assert.equal(applyKey("100.2", "5"), "100.25");
assert.equal(applyKey("100.25", "9"), "100.25"); // max 2 cents
assert.equal(applyKey("100.25", "del"), "100.2");
assert.equal(applyKey("", "."), "0.");

// splitAmount
assert.deepEqual(splitAmount("100.25"), { dollars: "100", cents: ".25" });
assert.deepEqual(splitAmount("100"), { dollars: "100", cents: "" });
assert.deepEqual(splitAmount(""), { dollars: "0", cents: "" });

console.log("ok");
