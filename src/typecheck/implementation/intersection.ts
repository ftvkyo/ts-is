import * as ts from "typescript";

import { generateTypecheck } from "../framework/generation";
import * as tree from "../framework/types/tree";


export class Intersection implements tree.TypecheckGenerator {
    predicate(t: ts.TypeNode, ctx: ts.TransformationContext): t is ts.IntersectionTypeNode  {
        return t.kind === ts.SyntaxKind.IntersectionType;
    }

    generator(t: ts.TypeNode, ctx: ts.TransformationContext): tree.Typecheck {
        if (!this.predicate(t, ctx)) {
            throw new Error("Should not be called without first checking the predicate.");
        }

        const typecheck: tree.BranchTypecheck = {
            t,
            all: t.types.map((val) => generateTypecheck(val, ctx)),
            any: []
        };
        return typecheck;
    }
}
