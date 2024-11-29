const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { parseFOL, quantifyFreeVariables } = require('./FolToCNF/ParseString');
const { moveUniversalQuantifiersToFront } = require('./FolToCNF/MakePNF');
const { skolemize } = require('./FolToCNF/Skolemize');
const { dropUniversalQuantifiers } = require('./FolToCNF/DropQuantifiers');
const { toCNF } = require('./FolToCNF/MakeCNF');
const { formulaToString, extractClauses } = require('./FolToCNF/ParseFormula'); // Import extractClauses

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Helper function to convert to readable symbols
function toReadableSymbols(formula) {
    function process(formula) {
        if (formula.startsWith('and(')) {
            const [left, right] = extractArguments(formula, 'and');
            return `(${process(left)} ∧ ${process(right)})`;
        } else if (formula.startsWith('or(')) {
            const [left, right] = extractArguments(formula, 'or');
            return `(${process(left)} ∨ ${process(right)})`;
        } else if (formula.startsWith('not(')) {
            const argument = extractSingleArgument(formula, 'not');
            return `¬${process(argument)}`;
        } else if (formula.startsWith('implies(')) {
            const [antecedent, consequent] = extractArguments(formula, 'implies');
            return `(${process(antecedent)} ⇒ ${process(consequent)})`;
        } else if (formula.startsWith('every(')) {
            const [variable, subformula] = extractQuantifierArguments(formula, 'every');
            return `∀${variable} (${process(subformula)})`;
        } else if (formula.startsWith('exist(')) {
            const [variable, subformula] = extractQuantifierArguments(formula, 'exist');
            return `∃${variable} (${process(subformula)})`;
        } else {
            return formula;
        }
    }

    function extractArguments(formula, operator) {
        const inner = formula.slice(operator.length + 1, -1);
        let depth = 0, splitIndex = -1;
        for (let i = 0; i < inner.length; i++) {
            if (inner[i] === '(') depth++;
            else if (inner[i] === ')') depth--;
            else if (inner[i] === ',' && depth === 0) {
                splitIndex = i;
                break;
            }
        }
        const left = inner.slice(0, splitIndex).trim();
        const right = inner.slice(splitIndex + 1).trim();
        return [left, right];
    }

    function extractSingleArgument(formula, operator) {
        return formula.slice(operator.length + 1, -1).trim();
    }

    function extractQuantifierArguments(formula, operator) {
        const inner = formula.slice(operator.length + 1, -1);
        const splitIndex = inner.indexOf(',');
        const variable = inner.slice(0, splitIndex).trim();
        const subformula = inner.slice(splitIndex + 1).trim();
        return [variable, subformula];
    }

    return process(formula);
}

app.post('/convert-to-cnf', (req, res) => {
    const formulaString = req.body.formula;
    let steps = {};

    try {
        // Step 0: Original input formula
        steps.step0 = {
            original: formulaString,
            readable: toReadableSymbols(formulaString),
        };

        // Step 1: Quantify free variables
        let formula = parseFOL(formulaString);
        formula = quantifyFreeVariables(formula);
        steps.step1 = {
            original: formulaToString(formula),
            readable: toReadableSymbols(formulaToString(formula)),
        };

        // Step 2: Move all universal quantifiers to the front (Prenex Normal Form)
        formula = moveUniversalQuantifiersToFront(formula);
        steps.step2 = {
            original: formulaToString(formula),
            readable: toReadableSymbols(formulaToString(formula)),
        };

        // Step 3: Skolemize (replace existential quantifiers)
        formula = skolemize(formula);
        steps.step3 = {
            original: formulaToString(formula),
            readable: toReadableSymbols(formulaToString(formula)),
        };

        // Step 4: Drop universal quantifiers
        formula = dropUniversalQuantifiers(formula);
        steps.step4 = {
            original: formulaToString(formula),
            readable: toReadableSymbols(formulaToString(formula)),
        };

        // Step 5: Convert to CNF and extract clauses
        formula = toCNF(formula);
        const clauses = extractClauses(formula); // Extract individual clauses
        steps.step5 = {
            original: formulaToString(formula),
            readable: toReadableSymbols(formulaToString(formula)),
            clauses: clauses.map(clause => toReadableSymbols(clause)), // Convert clauses to readable symbols
        };

        res.json({ success: true, steps });
    } catch (error) {
        console.error("Error during processing:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
