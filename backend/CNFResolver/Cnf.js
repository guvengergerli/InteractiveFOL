const Predicate = require('./Predicate');
const Clause = require('./Clause');


class CnfFormula {
    constructor(clauses = []) {
        this.clauses = clauses;
    }

    addClause(clause) {
        if (clause instanceof Clause) {
            this.clauses.push(clause);
        } else {
            throw new Error('Only instances of Clause can be added.');
        }
    }

    removeClause(clause) {
        this.clauses = this.clauses.filter(c => c !== clause);
    }

    getClauses() {
        return this.clauses;
    }

    toString() {
        return this.clauses.map(c => c.toString()).join(' ∧ ');
    }
}

module.exports = CnfFormula;
