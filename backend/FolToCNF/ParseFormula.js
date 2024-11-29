// Exporting necessary functions
module.exports = { formulaToString, extractClauses };

// Function to convert a parsed formula back to a string
function formulaToString(formula) {
    switch (formula.type) {
        case 'predicate':
            if (formula.arguments.length > 0) {
                const args = formula.arguments.map(arg => termToString(arg)).join(', ');
                return `${formula.name}(${args})`;
            } else {
                return formula.name;
            }

        case 'constant':
            return formula.value;

        case 'variable':
            return formula.name;

        case 'negation':
            return `not(${formulaToString(formula.formula)})`;

        case 'conjunction':
            return `and(${formulaToString(formula.left)}, ${formulaToString(formula.right)})`;

        case 'disjunction':
            return `or(${formulaToString(formula.left)}, ${formulaToString(formula.right)})`;

        case 'implication':
            return `implies(${formulaToString(formula.left)}, ${formulaToString(formula.right)})`;

        case 'universal':
            return `every(${formula.variable}, ${formulaToString(formula.formula)})`;

        case 'existential':
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

// Function to extract individual clauses from a CNF formula
function extractClauses(cnfFormula) {
    // Check if the formula is a conjunction (AND operator)
    if (cnfFormula.type === 'conjunction') {
        return [
            ...extractClauses(cnfFormula.left), // Recursively extract from the left
            ...extractClauses(cnfFormula.right), // Recursively extract from the right
        ];
    }

    // Otherwise, it's a single clause
    return [formulaToString(cnfFormula)];
}

// Example usage: A quantified formula represented as an object
const quantifiedFormula = {
    type: 'universal',
    variable: 'W',
    formula: {
        type: 'universal',
        variable: 'Y',
        formula: {
            type: 'implication',
            left: {
                type: 'predicate',
                name: 'P',
                arguments: [
                    {
                        type: 'variable',
                        name: 'X',
                    },
                ],
            },
            right: {
                type: 'disjunction',
                left: {
                    type: 'predicate',
                    name: 'Q',
                    arguments: [
                        {
                            type: 'variable',
                            name: 'Y',
                        },
                    ],
                },
                right: {
                    type: 'universal',
                    variable: 'X',
                    formula: {
                        type: 'predicate',
                        name: 'Z',
                        arguments: [
                            {
                                type: 'variable',
                                name: 'W',
                            },
                        ],
                    },
                },
            },
        },
    },
};

// Convert the quantified formula back to a string
const formulaString = formulaToString(quantifiedFormula);
console.log('Formula String:', formulaString);

// Test extractClauses
const cnfFormula = {
    type: 'conjunction',
    left: {
        type: 'disjunction',
        left: { type: 'predicate', name: 'P', arguments: [{ type: 'variable', name: 'X' }] },
        right: { type: 'predicate', name: 'Q', arguments: [{ type: 'variable', name: 'Y' }] },
    },
    right: {
        type: 'disjunction',
        left: { type: 'negation', formula: { type: 'predicate', name: 'R', arguments: [{ type: 'variable', name: 'Z' }] } },
        right: { type: 'predicate', name: 'S', arguments: [{ type: 'variable', name: 'W' }] },
    },
};

const clauses = extractClauses(cnfFormula);
console.log('Extracted Clauses:', clauses);
