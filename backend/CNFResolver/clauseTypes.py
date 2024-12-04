from __future__ import annotations
from dataclasses import dataclass
from types import FunctionType
from typing import Union,List,Literal,Tuple,Any

def nestedTupler(l:List[Any])->tuple:
    return tuple(nestedTupler(i) if isinstance(i, list) else i for i in l)

@dataclass(frozen=True)
class FOLFunction:
    name: str
    args: List[Union[str, FOLFunction]]
    def __hash__(self):
        tupled = nestedTupler
        return hash((self.name, tupled))
    def __eq__(self,other):
        if type(self) != type(other):
            return False
        if self.name != other.name or len(self.args) != len(other.args):
            return False
        arg_lists_equal = True
        for i in range(len(self.args)):
            arg_lists_equal = arg_lists_equal and self.args[i] == other.args[i]
        return arg_lists_equal
@dataclass(frozen=True)
class Predicate:
    name: str
    args: List[Union[str,FOLFunction]]
    is_negated : bool
    def __hash__(self):
        return hash((self.name, tuple(self.args), self.is_negated))

    def __eq__(self, other):
        if type(self) != type(other):
            return False
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

def tokenizeClause(clause: str) -> List[str]:
    tokens = ["or", "not", "(", ")", ","]
    tokenized = []
    i = 0
    while i < len(clause):
        if clause[i] in tokens:
            tokenized.append(clause[i])
            i += 1
        else:
            start = i
            while i < len(clause) and clause[i] not in tokens:
                i += 1
            tokenized.append(clause[start:i])
    return tokenized

@dataclass(frozen=True)
class Name:
    name: str

@dataclass(frozen=True)
class ArgList:
    args: List[Union[Name,Tuple[Name,ArgList]]]

@dataclass(frozen=True)
class Operator:
    op: Literal["or", "not"]

@dataclass(frozen=True)
class ClauseTree:
    node: Union[Name,ArgList,Operator,None]
    left: Union[ClauseTree,None]
    right: Union[ClauseTree,None]

def visit(tokens:List[str],first_time:bool=False) -> Tuple[ClauseTree,int]:
    if tokens[0] == "or":
        return visitOr(tokens[1:])
    elif tokens[0] == "not":
        return visitNot(tokens[1:])
    elif tokens[0] == "(" and tokens[1] != "or" and tokens[1] != "not":
        return visitArgList(tokens)
    elif tokens[0] == ")":
        tree,num = visit(tokens[1:])
        return tree,num+1
    else:
        # if we start with a name than we need to make sure we parse the whole thing
        if first_time:
            name,_ = visitName(tokens)
            node = name.node
            assert(type(node) == Name)
            args,consumed = visitArgList(tokens[1:])
            return ClauseTree(Name(node.name), args, None), consumed + 1
        return visitName(tokens)

def visitNot(tokens:List[str]) -> Tuple[ClauseTree,int]:
    not_ends = 0
    matching_parentheses = 0
    while True:
        if tokens[not_ends] == "(":
            matching_parentheses += 1
        elif tokens[not_ends] == ")":
            matching_parentheses -= 1
        not_ends += 1
        if matching_parentheses == 0:
            break

    inner_tokens = tokens[1:not_ends]
    inner_tree,consumed = visit(inner_tokens) # Name arglist thing
    node = inner_tree.node
    if isinstance(node,Name):
        print("Hoya")
        inner_tree_arglist,consumed = visit(inner_tokens[1:])
        inner_tree = ClauseTree(Name(node.name),inner_tree_arglist,None)
    tree = ClauseTree(Operator("not"), inner_tree, None)
    return tree,not_ends
def visitArgListHelper(tokens:List[str]) -> Tuple[ArgList,int]:
    matching_parentheses = 0
    arg_list_ends = 0
    args: List[Union[Name,Tuple[Name,ArgList]]] = []
    while True:
        if tokens[arg_list_ends] == "(":
            matching_parentheses += 1
        elif tokens[arg_list_ends] == ")":
            matching_parentheses -= 1
        arg_list_ends += 1
        if matching_parentheses == 0:
            break

    inner_tokens = tokens[1:arg_list_ends]
    # We always expect this input style ( )
    # after we consume the first ( we expect names until we hit another (,
    # from that point on we expect another arg list
    # which means we need to keep track of the number of parentheses we have seen
    # because this arglist has to end with a )
    last_name_consumed = None
    i = 0
    while i < len(inner_tokens):
        if inner_tokens[i] == "(":
            matching_parentheses += 1
            if matching_parentheses > 1:
                args.pop()
                assert(last_name_consumed)
                inner_arg_list, ending_position = visitArgListHelper(inner_tokens[i:])
                args.append((Name(last_name_consumed), inner_arg_list))
                i += ending_position
        elif inner_tokens[i] == ",":
            i += 1
        elif inner_tokens[i] == ")":
            i += 1
        else:
            last_name_consumed = inner_tokens[i]
            args.append(Name(last_name_consumed))
            i += 1
    return (ArgList(args),arg_list_ends)

def visitArgList(tokens:List[str]) -> Tuple[ClauseTree,int]:
    arglist,consumed_count = visitArgListHelper(tokens)
    return ClauseTree(arglist, None, None),consumed_count

def visitName(tokens:List[str]) -> Tuple[ClauseTree,int]:
    return ClauseTree(Name(tokens[0]),None,None), 1

def visitOr(tokens:List[str]) -> Tuple[ClauseTree,int]:
    or_ends = 0
    matching_parentheses = 0
    while True:
        if tokens[or_ends] == "(":
            matching_parentheses += 1
        elif tokens[or_ends] == ")":
            matching_parentheses -= 1
        or_ends += 1
        if matching_parentheses == 0:
            break

    inner_tokens = tokens[0:or_ends]
    # We should find the comma that seperates the ored predicates:
    # or? not? Name ArgList , Name ArgList
    # this is a top down parser so:
    end = 0
    children: List[Union[None,ClauseTree]] = [None,None]

    while end < len(inner_tokens):
        if inner_tokens[end] == "or":
            child, consumed_by_child = visitOr(inner_tokens[end+1:])
            end += consumed_by_child
            if children[0] == None:
                children[0] = child
            else:
                children[1] = child
                break
        elif inner_tokens[end] == "not":
            child, consumed_by_child = visitNot(inner_tokens[end+1:])
            end += consumed_by_child
            if children[0] == None:
                children[0] = child
            else:
                children[1] = child
                break
        elif inner_tokens[end] == ",":
            end+=1
        elif inner_tokens[end] == "(":
            end+=1
        elif inner_tokens[end] == ")":
            end+=1
        else:
            # Name ArgList
            assert(inner_tokens[end] != "or" and inner_tokens[end] != "not")
            print(inner_tokens)
            name,_ = visitName([inner_tokens[end]])
            arglist,consumed_by_child = visitArgList(inner_tokens[end+1:])
            child = ClauseTree(name.node,arglist,None)
            end+= consumed_by_child + 1
            if children[0] == None:
                children[0] = child
            else:
                children[1] = child
                break
    assert(children[0] != None and children[1] != None)
    return ClauseTree(Operator("or"),children[0],children[1]), or_ends

def nameArgListToFunc(name:Name, args: ArgList)-> FOLFunction:
    name_of_func = name.name
    arguments:List[Union[str,FOLFunction]] = []
    for arg in args.args:
        if type(arg) == Name:
            arguments.append(arg.name)
        else:
            arguments.append(nameArgListToFunc(arg[0],arg[1]))
    return FOLFunction(name_of_func,arguments)

def nameArglistToPred(name:Name, args:ArgList,negation:bool)->Predicate:
    name_of_pred = name.name
    arguments:List[Union[str,FOLFunction]] = []
    for arg in args.args:
        if type(arg) == Name:
            arguments.append(arg.name)
        else:
            arguments.append(nameArgListToFunc(arg[0],arg[1]))
    return Predicate(name_of_pred,arguments,negation)

def treeToPredList(tree:ClauseTree, current_parent:bool = False) -> List[Predicate]:
    if type(tree.node) == Name:
        arglist_child = tree.left
        print(tree)
        assert(type(arglist_child) == ClauseTree)
        arglist = arglist_child.node
        assert(type(arglist) == ArgList)
        return [nameArglistToPred(tree.node, arglist,current_parent)]
    if type(tree.node) == Operator:
        node = tree.node
        if node.op == "or":
            left = tree.left
            right = tree.right
            assert(left != None and right != None)
            return treeToPredList(left) + treeToPredList(right)
        if node.op == "not":
            left = tree.left
            assert(left != None)
            print(tree)
            return treeToPredList(left,True)
    assert(False)






def parseClause(clause: str) -> List[Predicate]:
    clause = clause.replace(" ", "")
    tokens = tokenizeClause(clause)
    tree,_ = visit(tokens,True)
    return treeToPredList(tree)

def parseClauses(clauses:List[str]) -> List[List[Predicate]]:
    return [parseClause(clause) for clause in clauses]

def functionToString(func:FOLFunction) -> str:
    return f"{func.name}({','.join([functionToString(arg) if type(arg) == FOLFunction else arg for arg in func.args])})"
def predicateToString(predicate:Predicate) -> str:
    start = ""
    end = ""
    if predicate.is_negated:
        start = "not("
        end = ")"
    return f"{start}{predicate.name}({','.join([functionToString(arg) if type(arg) == FOLFunction else arg for arg in predicate.args])}{end}"
def clauseToString(clause:List[Predicate]) -> str:
    if len(clause) == 0:
        return ""
    if len(clause) == 1:
        return predicateToString(clause[0])
    return f"or({','.join([predicateToString(clause[0]),clauseToString(clause[1:])])})"
def clausesToString(clauses:List[List[Predicate]]) -> List[str]:
    return [clauseToString(clause) for clause in clauses]
