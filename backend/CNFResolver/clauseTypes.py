from dataclasses import dataclass
from types import FunctionType
from typing import Union,List

@dataclass(frozen=True)
class Predicate:
    name: str
    args: List[str]
    is_negated : bool
    def __hash__(self):
        return hash((self.name, tuple(self.args), self.is_negated))

    def __eq__(self, other):
        if self.name !=other.name or self.is_negated != other.is_negated or len(self.args) != len(other.args):
            return False
        if self.args == other.args and self.is_negated == other.is_negated and self.name == other.name:
            return True
        arg_lists_equal = len(self.args) == len(other.args)
        if not arg_lists_equal:
            return False
        for i in range(len(self.args)):
            arg_lists_equal = arg_lists_equal and self.args[i] == other.args[i]
        return arg_lists_equal

@dataclass(frozen=True)
class HornClause:
    head : Union[Predicate,None]
    predicates : List[Predicate]

@dataclass(frozen=True)
class SatClause:
    head: str
    predicates : List[Predicate]

@dataclass(frozen=True)
class Clauses:
    horns: List[HornClause]
    sats: List[SatClause]
