import * as ts from "typescript";


export interface LeafTypecheck {
    t: ts.TypeNode;
    f: ts.ArrowFunction; // (obj: any) => bool
}


export interface BranchTypecheck {
    t: ts.TypeNode;
    all: (LeafTypecheck | BranchTypecheck)[];
    any: (LeafTypecheck | BranchTypecheck)[];
}


export type Typecheck = LeafTypecheck | BranchTypecheck;


export interface TypecheckGenerator {
    predicate: (t: ts.TypeNode, ctx: ts.TransformationContext) => boolean;
    generator: (t: ts.TypeNode, ctx: ts.TransformationContext) => Typecheck;
}
