module.exports = {moveUniversalQuantifiersToFront};
// Function to move all 'every' quantifiers to the front
function moveUniversalQuantifiersToFront(formula) {
    const universals = []; // To store the 'every' quantifiers

    // Recursive function to traverse the formula and collect 'every' quantifiers
    function collectUniversals(formula) {
        if (formula.type === 'universal') {
            // Collect 'every' quantifier and continue traversing the inner formula
            universals.push(formula.variable);
            return collectUniversals(formula.formula);
        } else if (formula.type === 'conjunction' || formula.type === 'disjunction' || formula.type === 'implication') {
            // Recursively process both sides of the binary logical operators
            return {
                type: formula.type,
                left: collectUniversals(formula.left),
                right: collectUniversals(formula.right)
            };
        } else if (formula.type === 'negation') {
            // Recursively process negation
            return {
                type: 'negation',
                formula: collectUniversals(formula.formula)
            };
        } else if (formula.type === 'existential') {
            // Existential quantifiers are not moved; just recurse into the body
            return {
                type: 'existential',
                variable: formula.variable,
                formula: collectUniversals(formula.formula)
            };
        } else {
            // Base case: predicate, constant, variable, or function
            return formula;
        }
    }

    // Step 1: Collect 'every' quantifiers and modify the inner formula
    const innerFormula = collectUniversals(formula);

    // Step 2: Rebuild the formula by adding all 'every' quantifiers at the front
    let result = innerFormula;
    universals.reverse().forEach(variable => {
        result = {
            type: 'universal',
            variable: variable,
            formula: result
        };
    });

    return result;
}

// Function to convert a parsed formula back to a string (reuse from before)
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

// Helper function to convert terms to a string (reuse from before)
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

// Example_SWIProlog usage: formula object representing the string
const formula = {
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
                        name: 'X'
                    }
                ]
            },
            right: {
                type: 'disjunction',
                left: {
                    type: 'predicate',
                    name: 'Q',
                    arguments: [
                        {
                            type: 'variable',
                            name: 'Y'
                        }
                    ]
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
                                name: 'W'
                            }
                        ]
                    }
                }
            }
        }
    }
};

// Move 'every' quantifiers to the front
const pnfFormula = moveUniversalQuantifiersToFront(formula);

// Convert the PNF formula back to a string
const pnfString = formulaToString(pnfFormula);
console.log(pnfString);
