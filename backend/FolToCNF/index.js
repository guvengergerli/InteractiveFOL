const swipl = require('swipl');
const path = require('path');
const fs = require('fs');

// Get the absolute path of the Prolog file
const prologFilePath = path.resolve(__dirname, 'fol_transformations.pl');

// Check if the Prolog file exists before consulting it
if (fs.existsSync(prologFilePath)) {
    console.log('Prolog file exists at:', prologFilePath);

    // Ensure single quotes around the file path
    const consultQuery = `consult('${prologFilePath.replace(/\\/g, '\\\\')}')`;

    const consultResult = swipl.call(consultQuery);
    if (consultResult) {
        console.log('Prolog file successfully consulted.');

        // Call the tocnf predicate with numbervars to name unbound variables
        const result = swipl.call(`
            tocnf(every(Z, implies(and(p(X), q(Y)), or(r(Z), not(s(W))))), FCNF), 
            numbervars(FCNF, 0, _).
        `);
        if (result && result.FCNF) {
            // Format the Prolog term using the custom formatter
            const formattedResult = formatPrologTerm(result.FCNF);
            console.log(`FCNF = ${formattedResult}`);
        } else {
            console.log('Failed to retrieve FCNF.');
        }
    } else {
        console.log('Consultation of Prolog file failed.');
    }

} else {
    console.error('Prolog file does not exist at:', prologFilePath);
}

// Recursive function to format Prolog terms safely
function formatPrologTerm(term) {
    // Handle unbound variables (represented as null)
    if (term === null) {
        return '_'; // Return underscore for unbound variables
    }

    // Handle compound terms (with 'name' and 'args')
    if (typeof term === 'object' && term.name && term.args) {
        const functor = term.name;
        const args = term.args.map(arg => formatPrologTerm(arg)).join(', ');
        return `${functor}(${args})`;
    }

    // Handle constants (numbers, atoms, etc.)
    return term.toString();
}

