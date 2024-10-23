module.exports = {formulaToString};

// Function to convert a parsed formula back to a string
function formulaToString(formula) {
    switch (formula.type) {
        case 'predicate':
            // If the predicate has arguments, format it as: P(x, y, ...)
            if (formula.arguments.length > 0) {
                const args = formula.arguments.map(arg => termToString(arg)).join(', ');
                return `${formula.name}(${args})`;
            } else {
                // If no arguments, just return the predicate name: P
                return formula.name;
            }

        case 'constant':
            // Return the constant as is
            return formula.value;

        case 'variable':
            // Return the variable as is
            return formula.name;

        case 'negation':
            // Return negation formatted as: not(formula)
            return `not(${formulaToString(formula.formula)})`;

        case 'conjunction':
            // Return conjunction formatted as: and(formula1, formula2)
            return `and(${formulaToString(formula.left)}, ${formulaToString(formula.right)})`;

        case 'disjunction':
            // Return disjunction formatted as: or(formula1, formula2)
            return `or(${formulaToString(formula.left)}, ${formulaToString(formula.right)})`;

        case 'implication':
            // Return implication formatted as: implies(formula1, formula2)
            return `implies(${formulaToString(formula.left)}, ${formulaToString(formula.right)})`;

        case 'universal':
            // Return universal quantification formatted as: every(variable, formula)
            return `every(${formula.variable}, ${formulaToString(formula.formula)})`;

        case 'existential':
            // Return existential quantification formatted as: exist(variable, formula)
            return `exist(${formula.variable}, ${formulaToString(formula.formula)})`;

        default:
            throw new Error(`Unknown formula type: ${formula.type}`);
    }
}

// Helper function to convert a term (constant or variable) to a string
function termToString(term) {
    if (term.type === 'constant') {
        return term.value;
    } else if (term.type === 'variable') {
        return term.name;
    } else if (term.type === 'function') {
        const args = term.arguments.map(arg => termToString(arg)).join(', ');
        return `${term.name}(${args})`;
    } else {
        throw new Error(`Unknown term type: ${term.type}`);
    }
}

// Example_SWIProlog usage with a quantified formula
const quantifiedFormula =
{
    "type": "universal",
    "variable": "W",
    "formula": {
    "type": "universal",
        "variable": "Y",
        "formula": {
        "type": "implication",
            "left": {
            "type": "predicate",
                "name": "P",
                "arguments": [
                {
                    "type": "variable",
                    "name": "X"
                }
            ]
        },
        "right": {
            "type": "disjunction",
                "left": {
                "type": "predicate",
                    "name": "Q",
                    "arguments": [
                    {
                        "type": "variable",
                        "name": "Y"
                    }
                ]
            },
            "right": {
                "type": "universal",
                    "variable": "X",
                    "formula": {
                    "type": "predicate",
                        "name": "Z",
                        "arguments": [
                        {
                            "type": "variable",
                            "name": "W"
                        }
                    ]
                }
            }
        }
    }
}
};

// Convert the quantified formula back to a string
const formulaString = formulaToString(quantifiedFormula);
console.log(formulaString);
