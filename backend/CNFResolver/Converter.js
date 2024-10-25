const Clause = require('./Clause');
const CnfFormula = require('./Cnf');
const MixedClause = require('./Mixed');
const Predicate = require('./Predicate');

function processCNF(cnf) {
    if (!(cnf instanceof CnfFormula)) {
        throw new Error('Only instances of CnfFormula can be processed.');
    }
    const mixedClauses = Array(cnf.getClauses()).map(clause => new MixedClause(clause));
    const hornClauses = mixedClauses.map(mixed => mixed.getHorns());
    const satClauses = mixedClauses.map(mixed => mixed.getOrClausesForSAT());
    // flatten the arrays
    const flatHornClauses = [].concat.apply([], hornClauses);
    const flatSatClauses = [].concat.apply([], satClauses);

    return {
        flatHornClauses,
        flatSatClauses
    };
}
function prologify(hornClauses) {
    return hornClauses.map(c => c.toProlog()).join('\n');
}

function invokeProlog(prologString) {
    console.log(prologString);
}

function resetPrologContext() {
    console.log('reset not yet implemented');
}

function queryProlog(query) {
    console.log('query not yet implemented');
    return false;
}

function resolveCNF(cnf) {
    const processed = processCNF(cnf);
    if (processed.flatSatClauses.length > 0) {
        throw new Error('This is not implemented yet.');
    }
    resetPrologContext();
    invokeProlog(prologify(processed.flatHornClauses));
}
function valuationEncoder(valuation, resolvedOrs) {
    console.log('Resolved ors not yet discarded');
    return Object.keys(valuation).map(key => `${key.getPositiveDisjuction()}<=>${valuation[key]}`).join(', ');
}
function invokeZ3(z3String) {
    console.log(z3String);
    return 'UNSAT';
}
function augmentWithIndividualValues(individualValues) {
    // Turn into prolog
    console.log('augmentation not yet implemented');
}
function resolveCNFWithZ3(cnf) {
    const processed = processCNF(cnf);
    resetPrologContext();
    invokeProlog(prologify(processed.flatHornClauses));
    const valuations = {};
    for (const clause of processed.flatSatClauses) {
        valuations[clause] = queryProlog(clause.getHead());
    }
    let individual_values = invokeZ3(valuationEncoder(valuations));
    if (individual_values == 'UNSAT') {
        return "IMPOSSIBLE";
    }
    augmentWithIndividualValues(individual_values);
    return "POSSIBLE";
}
function augmentStill(valuation, resolvedOrs) {
    let individual_values = invokeZ3(valuationEncoder(valuation), resolvedOrs);
    if (individual_values == 'UNSAT') {
        return "IMPOSSIBLE";
    }
    augmentWithIndividualValues(individual_values);
    return "POSSIBLE";
}
function queryResolution(resolution, query) {
    let iterationResolution = resolution;
    while (iterationResolution === "POSSIBLE") {
        if (queryProlog(query)) {
            return true;
        }
        iterationResolution = augmentStill(query);
    }
    return false; // No way to interpret ors left and we did not find a solution
}
const cnf = new CnfFormula(new Clause([new Predicate('P', ['x'], false), new Predicate('Q', ['x'], true)]));
resolveCNF(cnf);



