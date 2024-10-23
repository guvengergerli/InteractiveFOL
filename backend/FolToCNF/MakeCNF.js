module.exports = {toCNF};

// Function to convert a formula to Conjunctive Normal Form (CNF)
function toCNF(formula) {
    // Step 1: Eliminate implications
    formula = eliminateImplications(formula);

    // Step 2: Move negations inward
    formula = moveNegationsInward(formula);

    // Step 3: Distribute disjunction over conjunction
    formula = distributeOrOverAnd(formula);

    return formula;
}

// Step 1: Eliminate implications (A ⇒ B becomes ¬A ∨ B)
function eliminateImplications(formula) {
    if (formula.type === 'implication') {
        return {
            type: 'disjunction',
            left: {
                type: 'negation',
                formula: eliminateImplications(formula.left)
            },
            right: eliminateImplications(formula.right)
        };
    } else if (formula.type === 'conjunction' || formula.type === 'disjunction') {
        return {
            type: formula.type,
            left: eliminateImplications(formula.left),
            right: eliminateImplications(formula.right)
        };
    } else if (formula.type === 'negation') {
        return {
            type: 'negation',
            formula: eliminateImplications(formula.formula)
        };
    }
    return formula;
}

// Step 2: Move negations inward using De Morgan's laws
function moveNegationsInward(formula) {
    if (formula.type === 'negation') {
        const inner = formula.formula;
        if (inner.type === 'negation') {
            // Double negation: ¬¬A becomes A
            return moveNegationsInward(inner.formula);
        } else if (inner.type === 'conjunction') {
            // ¬(A ∧ B) becomes ¬A ∨ ¬B
            return {
                type: 'disjunction',
                left: moveNegationsInward({ type: 'negation', formula: inner.left }),
                right: moveNegationsInward({ type: 'negation', formula: inner.right })
            };
        } else if (inner.type === 'disjunction') {
            // ¬(A ∨ B) becomes ¬A ∧ ¬B
            return {
                type: 'conjunction',
                left: moveNegationsInward({ type: 'negation', formula: inner.left }),
                right: moveNegationsInward({ type: 'negation', formula: inner.right })
            };
        }
    } else if (formula.type === 'conjunction' || formula.type === 'disjunction') {
        return {
            type: formula.type,
            left: moveNegationsInward(formula.left),
            right: moveNegationsInward(formula.right)
        };
    }
    return formula;
}

// Step 3: Distribute OR over AND to convert to CNF form
function distributeOrOverAnd(formula) {
    if (formula.type === 'disjunction') {
        const left = distributeOrOverAnd(formula.left);
        const right = distributeOrOverAnd(formula.right);

        // A ∨ (B ∧ C) becomes (A ∨ B) ∧ (A ∨ C)
        if (left.type === 'conjunction') {
            return {
                type: 'conjunction',
                left: distributeOrOverAnd({ type: 'disjunction', left: left.left, right: right }),
                right: distributeOrOverAnd({ type: 'disjunction', left: left.right, right: right })
            };
        } else if (right.type === 'conjunction') {
            return {
                type: 'conjunction',
                left: distributeOrOverAnd({ type: 'disjunction', left: left, right: right.left }),
                right: distributeOrOverAnd({ type: 'disjunction', left: left, right: right.right })
            };
        }

        return {
            type: 'disjunction',
            left: left,
            right: right
        };
    } else if (formula.type === 'conjunction') {
        return {
            type: 'conjunction',
            left: distributeOrOverAnd(formula.left),
            right: distributeOrOverAnd(formula.right)
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

// Example usage: input formula without quantifiers
const formulaWithoutQuantifiers = {
    type: 'implication',
    left: {
        type: 'predicate',
        name: 'P',
        arguments: [
            { type: 'variable', name: 'X' }
        ]
    },
    right: {
        type: 'conjunction',
        left: {
            type: 'predicate',
            name: 'Q',
            arguments: [
                { type: 'variable', name: 'Y' }
            ]
        },
        right: {
            type: 'predicate',
            name: 'R',
            arguments: [
                { type: 'variable', name: 'Z' }
            ]
        }
    }
};

// Convert the formula to CNF
const cnfFormula = toCNF(formulaWithoutQuantifiers);

// Convert the CNF formula back to a string
const cnfString = formulaToString(cnfFormula);
console.log(cnfString);
