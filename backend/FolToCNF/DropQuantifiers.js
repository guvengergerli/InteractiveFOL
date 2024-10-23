// Function to drop all universal quantifiers ('every') and return the internal formula
function dropUniversalQuantifiers(formula) {
    if (formula.type === 'universal') {
        // Skip the universal quantifier and return the inner formula
        return dropUniversalQuantifiers(formula.formula);
    } else if (formula.type === 'conjunction' || formula.type === 'disjunction' || formula.type === 'implication') {
        // Recursively drop quantifiers from both sides of binary operators
        return {
            type: formula.type,
            left: dropUniversalQuantifiers(formula.left),
            right: dropUniversalQuantifiers(formula.right)
        };
    } else if (formula.type === 'negation') {
        // Recursively drop quantifiers from the negated formula
        return {
            type: 'negation',
            formula: dropUniversalQuantifiers(formula.formula)
        };
    } else {
        // Base case: predicate, constant, variable, or function
        return formula;
    }
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

// Example usage: formula object with universal quantifiers
const formulaWithUniversals = {
    type: 'universal',
    variable: 'X',
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

// Drop universal quantifiers
const formulaWithoutQuantifiers = dropUniversalQuantifiers(formulaWithUniversals);

// Convert the result back to a string
const formulaString = formulaToString(formulaWithoutQuantifiers);
console.log(formulaString);
