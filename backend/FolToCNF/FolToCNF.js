// Assuming you have separate files for each function, import them here
const { parseFOL, quantifyFreeVariables } = require('./ParseString');
const { moveUniversalQuantifiersToFront } = require('./MakePNF');
const { skolemize } = require('./skolemize');
const { toCNF } = require('./MakeCNF');
const {dropUniversalQuantifiers} = require('./DropQuantifiers');
const { formulaToString } = require('./ParseFormula'); // Function to convert the formula back to a string

// Input formula string with free variables
const formulaString = "implies(P(X), and(Q(Y), R(Z)))";

// Step 1: Parse the formula
let formula = parseFOL(formulaString);
console.log("After Parsing:", formulaToString(formula));

// Step 2: Quantify free variables
formula = quantifyFreeVariables(formula);
console.log("After Quantifying Free Variables:", formulaToString(formula));

// Step 3: Move all universal quantifiers to the front (Prenex Normal Form)
formula = moveUniversalQuantifiersToFront(formula);
console.log("After Moving Universal Quantifiers to Front (Prenex Normal Form):", formulaToString(formula));

// Step 4: Skolemize (replace existential quantifiers)
formula = skolemize(formula);
console.log("After Skolemization:", formulaToString(formula));

// Step 4: Skolemize (replace existential quantifiers)
formula = dropUniversalQuantifiers(formula);
console.log("After droping universal quantifiers:", formulaToString(formula));

// Step 5: Convert to CNF (Conjunctive Normal Form)
formula = toCNF(formula);
console.log("After Converting to CNF:", formulaToString(formula));
