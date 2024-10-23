// Function to perform Skolemization
function skolemize(formula, universals = []) {
    if (formula.type === 'existential') {
        const skolemFunctionName = `f_${formula.variable}`; // Create a Skolem function name

        // Replace the existential variable with a Skolem function based on universal variables
        return skolemize(
            replaceVariableWithSkolem(formula.formula, formula.variable, skolemFunctionName, universals),
            universals
        );
    } else if (formula.type === 'universal') {
        // Collect the universal quantifiers as we encounter them
        return {
            type: 'universal',
            variable: formula.variable,
            formula: skolemize(formula.formula, universals.concat(formula.variable)) // Pass the universal variables down
        };
    } else if (formula.type === 'conjunction' || formula.type === 'disjunction' || formula.type === 'implication') {
        // Recursively skolemize both sides of the logical operators
        return {
            type: formula.type,
            left: skolemize(formula.left, universals),
            right: skolemize(formula.right, universals)
        };
    } else if (formula.type === 'negation') {
        // Recursively skolemize the negated formula
        return {
            type: 'negation',
            formula: skolemize(formula.formula, universals)
        };
    } else {
        // Base case: predicate or other formulas that do not involve quantifiers
        return formula;
    }
}

// Helper function to replace a variable with a Skolem function
function replaceVariableWithSkolem(formula, variable, skolemFunctionName, universals) {
    if (formula.type === 'predicate') {
        // Replace occurrences of the variable in the predicate arguments
        const args = formula.arguments.map(arg => {
            if (arg.type === 'variable' && arg.name === variable) {
                // Replace the variable with the Skolem function
                return {
                    type: 'function',
                    name: skolemFunctionName,
                    arguments: universals.map(v => ({ type: 'variable', name: v }))
                };
            }
            return arg;
        });
        return {
            type: 'predicate',
            name: formula.name,
            arguments: args
        };
    } else if (formula.type === 'conjunction' || formula.type === 'disjunction' || formula.type === 'implication') {
        return {
            type: formula.type,
            left: replaceVariableWithSkolem(formula.left, variable, skolemFunctionName, universals),
            right: replaceVariableWithSkolem(formula.right, variable, skolemFunctionName, universals)
        };
    } else if (formula.type === 'negation') {
        return {
            type: 'negation',
            formula: replaceVariableWithSkolem(formula.formula, variable, skolemFunctionName, universals)
        };
    } else if (formula.type === 'universal' || formula.type === 'existential') {
        return {
            type: formula.type,
            variable: formula.variable,
            formula: replaceVariableWithSkolem(formula.formula, variable, skolemFunctionName, universals)
        };
    }
    return formula;
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
        case 'function':
            const args = formula.arguments.map(arg => termToString(arg)).join(', ');
            return `${formula.name}(${args})`;
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

// Example usage: formula object with an existential quantifier
const formulaWithExist = {
    type: 'universal',
    variable: 'X',
    formula: {
        type: 'existential',
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
                type: 'predicate',
                name: 'Q',
                arguments: [
                    {
                        type: 'variable',
                        name: 'Y'
                    }
                ]
            }
        }
    }
};

// Skolemize the formula (replace 'exist' with Skolem function)

const skolemizedFormula = skolemize(formulaWithExist);

// Convert the skolemized formula back to a string
const skolemizedString = formulaToString(skolemizedFormula);
console.log(skolemizedString);
