from dataclasses import dataclass
from types import FunctionType
from typing import Union,List

@dataclass(frozen=True)
class Predicate:
    name: str
    args: List[str]
    is_negated : bool

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