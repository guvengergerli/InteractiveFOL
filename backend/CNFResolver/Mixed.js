const Cnf = require('./Cnf');
const Clause = require('./Clause');

let number_of_heads = 0;
function getNewHead() {
  return `head_${number_of_heads++}`;
}
  


class OrClause {
    constructor(predicates) {
        this.predicates = predicates;
        this.head = getNewHead();
    }
    getHead() {
        return this.head;
    }
}
class AndClause {
    constructor(head, predicates) {
        this.predicates = predicates;
        this.head = head;
    }
    toProlog() {
        return `${this.head}:- ${this.predicates.map(p => p.toProlog()).join(', ')}.`;
    }
}
class MixedClause {
    constructor(clause) {
        if (!(clause instanceof Clause)) {
            throw new Error('Only instances of Clause can be added.');
        }
        this.clause = clause;
        this.horns = [];
        this.orClausesForSAT = [];
        let predicates = clause.getPredicates();
        let positivePredicates = predicates.filter(p => !p.isNegated);
        let negativePredicates = predicates.filter(p => p.isNegated);
        let negatedNegativePredicates = negativePredicates.map(p => p.negate());
        // console.log(positivePredicates);
        // console.log(negativePredicates);
        // console.log(negatedNegativePredicates);
        // console.log(predicates);
        if (positivePredicates.length == 1) {
            this.horns.push(new AndClause(positivePredicates[0], negatedNegativePredicates));
        }
        else if (positivePredicates.length == 0) {
            this.horns.push(new AndClause("", negatedNegativePredicates));
        }
        else {
            let orClause = new OrClause(positivePredicates);
            this.orClausesForSAT.push(orClause);
            this.horns.push(new AndClause(orClause.getHead(), negatedNegativePredicates));
        }
    }
    getHorns() {
        return this.horns;
    }
    getOrClausesForSAT() {
        return this.orClausesForSAT;
    }
}

module.exports = MixedClause;