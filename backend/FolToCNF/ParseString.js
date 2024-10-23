module.exports = { parseFOL, quantifyFreeVariables};
// Tokenizer: Convert input string into meaningful tokens
function tokenize(input) {
    return input.match(/[a-zA-Z0-9_]+|[(),]/g);
}

// Parser: Parse the tokens according to the grammar rules
function parseFOL(input) {
    const tokens = tokenize(input);
    let index = 0;

    function peek() {
        return tokens[index];
    }

    function consume() {
        return tokens[index++];
    }

    // Parse a term: constant or variable
    function parseTerm() {
        const token = consume();
        if (token.match(/^[a-z][a-zA-Z0-9_]*$/)) {
            // It's a constant (lowercase starts are constants)
            return { type: 'constant', value: token };
        } else if (token.match(/^[A-Z_][a-zA-Z0-9_]*$/)) {
            // It's a variable (uppercase starts are variables)
            return { type: 'variable', name: token };
        } else {
            throw new Error(`Unexpected token in term: ${token}`);
        }
    }

    // Parse a predicate
    function parsePredicate() {
        const token = consume();
        if (peek() === '(') {
            consume(); // consume '('
            const args = [];
            while (peek() !== ')') {
                args.push(parseTerm());
                if (peek() === ',') {
                    consume(); // consume ','
                }
            }
            consume(); // consume ')'
            return { type: 'predicate', name: token, arguments: args };
        } else {
            return { type: 'predicate', name: token, arguments: [] };
        }
    }

    // Parse a wff (well-formed formula)
    function parseWff() {
        const token = peek();

        if (token === 'not') {
            consume();
            consume(); // consume '('
            const formula = parseWff();
            consume(); // consume ')'
            return { type: 'negation', formula };
        }

        if (token === 'and') {
            consume();
            consume(); // consume '('
            const left = parseWff();
            consume(); // consume ','
            const right = parseWff();
            consume(); // consume ')'
            return { type: 'conjunction', left, right };
        }

        if (token === 'or') {
            consume();
            consume(); // consume '('
            const left = parseWff();
            consume(); // consume ','
            const right = parseWff();
            consume(); // consume ')'
            return { type: 'disjunction', left, right };
        }

        if (token === 'implies') {
            consume();
            consume(); // consume '('
            const left = parseWff();
            consume(); // consume ','
            const right = parseWff();
            consume(); // consume ')'
            return { type: 'implication', left, right };
        }

        if (token === 'every') {
            consume();
            consume(); // consume '('
            const variable = consume();
            consume(); // consume ','
            const formula = parseWff();
            consume(); // consume ')'
            return { type: 'universal', variable, formula };
        }

        if (token === 'exist') {
            consume();
            consume(); // consume '('
            const variable = consume();
            consume(); // consume ','
            const formula = parseWff();
            consume(); // consume ')'
            return { type: 'existential', variable, formula };
        }

        // Otherwise, it's a predicate
        return parsePredicate();
    }

    // Start parsing the input as a wff (the top-level formula)
    const result = parseWff();

    // Ensure all tokens were consumed
    if (index < tokens.length) {
        throw new Error('Unexpected tokens remaining');
    }

    return result;
}

// Helper function to collect bound variables (those already quantified)
function collectBoundVariables(formula, boundVars = new Set()) {
    if (formula.type === 'universal' || formula.type === 'existential') {
        boundVars.add(formula.variable);
        collectBoundVariables(formula.formula, boundVars);
    } else if (formula.type === 'conjunction' || formula.type === 'disjunction' || formula.type === 'implication') {
        collectBoundVariables(formula.left, boundVars);
        collectBoundVariables(formula.right, boundVars);
    } else if (formula.type === 'negation') {
        collectBoundVariables(formula.formula, boundVars);
    }
    return boundVars;
}

// Helper function to collect all variables in predicates (free and bound)
function collectAllVariables(formula, variables = new Set()) {
    if (formula.type === 'predicate') {
        formula.arguments.forEach(arg => {
            if (arg.type === 'variable') {
                variables.add(arg.name);
            }
        });
    } else if (formula.type === 'conjunction' || formula.type === 'disjunction' || formula.type === 'implication') {
        collectAllVariables(formula.left, variables);
        collectAllVariables(formula.right, variables);
    } else if (formula.type === 'negation') {
        collectAllVariables(formula.formula, variables);
    } else if (formula.type === 'universal' || formula.type === 'existential') {
        collectAllVariables(formula.formula, variables);
    }
    return variables;
}

// Main function to quantify free variables
function quantifyFreeVariables(formula) {
    // Collect all bound variables (those already quantified)
    const boundVariables = collectBoundVariables(formula);

    // Collect all variables in the formula (including free variables)
    const allVariables = collectAllVariables(formula);

    // Identify free variables (those not in bound variables)
    const freeVariables = [...allVariables].filter(v => !boundVariables.has(v));

    // Add universal quantifiers for each free variable
    freeVariables.forEach(freeVar => {
        formula = {
            type: 'universal',
            variable: freeVar,
            formula: formula
        };
    });

    return formula;
}

// Example usage with a formula containing free variables
const formula1 = "implies(P(X), or(Q(Y), every(X, Z(W))))";
const parsedFormula = parseFOL(formula1);
const quantifiedFormula = quantifyFreeVariables(parsedFormula);
console.log(JSON.stringify(parsedFormula, null, 2));
// Output the parsed formula with quantified free variables
console.log(JSON.stringify(quantifiedFormula, null, 2));
