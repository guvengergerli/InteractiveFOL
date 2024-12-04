from enum import Enum
from dataclasses import dataclass
import clauseTypes as CT
import z3
from typing import Dict,List,Set,Tuple,Union
import re

U = z3.DeclareSort("U")

def convertToPrologPred(predicate:CT.Predicate) -> str:
    return predicate.name + "(" + ",".join(predicate.args) + ")"

def convertToPrologHorn(clause:CT.HornClause) -> str:
    prolog_line = ""
    if type(clause.head) == CT.Predicate:
        assert(not clause.head.is_negated)
        prolog_line += clause.head.name + "(" + ",".join(clause.head.args) + ")"
    prolog_line += ":- "
    prolog_line += ", ".join([convertToPrologPred(pred) for pred in clause.predicates])
    prolog_line += "."
    return prolog_line

def convertToZ3Horn(clause:CT.HornClause, fp: z3.Fixedpoint):
    # We will actually solve the horn clauses using the fixedpoint engine of z3
    # So we need to convert the horn clauses to datalog rules
    head = False
    if type(clause.head) == CT.Predicate:
        assert(not clause.head.is_negated)
        # Turn into a z3 function
        sig = [U]*len(clause.head.args)+[z3.BoolSort()]
        head = z3.Function(clause.head.name, *sig)(*[z3.Const(arg, U) for arg in clause.head.args])

    fp.rule(head, [z3.Function(pred.name,
        *[U]*len(pred.args)+[z3.BoolSort()]
        )(*[z3.Const(arg, U) for arg in pred.args])
        for pred in clause.predicates])


def convertToZ3Sat(clause:CT.SatClause, solver: z3.Solver):
    z3_preds = []
    z3_pred_free_vars = {}
    z3_pred_literals = {}
    for pred in clause.predicates:
        # Go throught the arguments of the predicate and create a free variable if uppercase,
        # otherwise create a constant
        # Also create a z3 function for the predicate
        for arg in pred.args:
            if arg.isupper():
                if arg not in z3_pred_free_vars:
                    z3_pred_free_vars[arg] = z3.Const(arg, U)
            else:
                if arg not in z3_pred_literals:
                    z3_pred_literals[arg] = z3.Const(arg, U)
        sig = [U]*len(pred.args)+[z3.BoolSort()]
        z3_preds.append(z3.Function(pred.name, *sig)(*[z3_pred_free_vars[arg] if arg.isupper() else z3_pred_literals[arg] for arg in pred.args]))
    solver.add(z3.Function(clause.head, z3.BoolSort()) == z3.Or(z3_preds))

# If horn solver says we can satisfy the horn clauses,
# we need to ask if the heads of the sat clauses are satisfiable
# A list of unsatisfied heads is held,
# Each iteration we add the facts
# (all that is going into each negative head predicate is added as a fact to horn solver)
# If there is unsat answer, we just return unsat
# if there is a sat answer, we query remaining heads, if the negative heads list did not change break out of iteration.
# for each positive head, we will query each predicate in the or clause, at least one should return sat for each head.

class TruthRepresentation(Enum):
    TRUE = 1
    FALSE = 2
    UNKNOWN = 3

class Satisfaction(Enum):
    SAT = 1
    UNSAT = 2

@dataclass(frozen=True)
class Valuation:
    predicate: CT.Predicate
    truth: TruthRepresentation

def isVariable(arg:str) -> bool:
    return arg.isupper() and not isFunction(arg)

def isConstant(arg:str) -> bool:
    return arg.islower() and not isFunction(arg)

def isFunction(arg:str) -> bool:
    # regex [A-Z]+ "(" .* ")"
    return re.match(r"[A-Z]+\(.*\)", arg) is not None


@dataclass(frozen=True)
class KnowledgeBase:
    clauses: CT.Clauses
    facts: Dict[CT.Predicate,Valuation]

@dataclass(frozen=True)
class FOLKnowledgeBase:
    clauses: List[List[CT.Predicate]]

def prepareForBackchaining(clauses:CT.Clauses) -> KnowledgeBase:
    facts = {clause.head: Valuation(clause.head, TruthRepresentation.TRUE) for clause in clauses.horns if len(clause.predicates) == 0 and clause.head is not None}
    return KnowledgeBase(clauses, facts)

def prepareForResolution(clauses:CT.Clauses) -> FOLKnowledgeBase:
    resulting_clauses = []
    for clause in clauses.horns:
        # each of this is one clause
        preds = []
        if clause.head is not None:
            for sclause in clauses.sats:
                if sclause.head == clause.head.name:
                    preds.extend(sclause.predicates)
        preds.extend([CT.Predicate(pred.name, pred.args, False) for pred in clause.predicates])
        resulting_clauses.append(preds)
    return FOLKnowledgeBase(resulting_clauses)

def unifyExp(expressions : Tuple[str, str],
        substition_till_here:Union[Dict[str,str],None] = {}) -> Union[Dict[str,str],None]:
    exp1 = expressions[0]
    exp2 = expressions[1]
    if exp1 == exp2:
        return substition_till_here
    if substition_till_here is None:
        return None
    if isVariable(exp1):
        return unifyVar((exp1, exp2), substition_till_here)
    elif isVariable(exp2):
        return unifyVar((exp2, exp1), substition_till_here)
    elif isFunction(exp1) and isFunction(exp2):
        # we need to check if the function names are the same
        # then we need to check if the arguments are the same
        # if they are the same, we need to unify the arguments
        # if they are not the same, we need to return None
        # if the function names are not the same, we need to return None
        func1 = re.match(r"([A-Za-z]+)\((.*)\)", exp1)
        func2 = re.match(r"([A-Za-z]+)\((.*)\)", exp2)
        if func1 is None or func2 is None:
            return None
        if func1[1] != func2[1]:
            return None
        args1 = func1[2].split(",")
        args2 = func2[2].split(",")
        if len(args1) != len(args2):
            return None
        for i in range(len(args1)):
            substition_till_here = unifyExp((args1[i], args2[i]), substition_till_here)
        return substition_till_here
    return None

def unifyVar(expressions : Tuple[str, str],
        substition_till_here:Union[Dict[str,str],None] = {}) -> Union[Dict[str,str],None]:
    exp1 = expressions[0]
    exp2 = expressions[1]
    if exp1 == exp2:
        return substition_till_here
    if substition_till_here is None:
        return None
    if exp1 in substition_till_here:
        return unifyVar((substition_till_here[exp1], exp2), substition_till_here)
    elif exp2 in substition_till_here:
        return unifyVar((exp1, substition_till_here[exp2]), substition_till_here)
    else:
        substition_till_here[exp1] = exp2
        return substition_till_here


def unify(set_of_pairs_of_clauses: List[Tuple[CT.Predicate,CT.Predicate]],
        substition_till_here: Dict[str,str]={}) -> Dict[str,str]:
    if len(set_of_pairs_of_clauses) == 0:
        return {}
    first_set = set_of_pairs_of_clauses[0]
    if first_set[0] == first_set[1]:
        return unify(set_of_pairs_of_clauses[1:], substition_till_here)
    if first_set[0].name == first_set[1].name:
        # These predicates have the same name
        for i in range(len(first_set[0].args)):
            substition_till_here = unifyExp((first_set[0].args[i], first_set[1].args[i]), substition_till_here)
            if (substition_till_here is None):
                substition_till_here = {} 
    return unify(set_of_pairs_of_clauses[1:], substition_till_here) | substition_till_here

def resolution(kb:FOLKnowledgeBase) -> Satisfaction:
    satisfaction_up_to_now = Satisfaction.SAT
    while Satisfaction.SAT == satisfaction_up_to_now:
        #this is our regular resolution-refutation procedure for FOL
        #we need to check every unifiable pair of clauses
        return satisfaction_up_to_now


def backchain(kb: KnowledgeBase, q:CT.Predicate) -> TruthRepresentation:
    assert(not q.is_negated)
    if q.name in kb.facts:
        return kb.facts[q.name].truth
    return TruthRepresentation.UNKNOWN


def resolve(clauses:CT.Clauses):
    # if the bool is true, the predicate can be evaluated to true
    pass
