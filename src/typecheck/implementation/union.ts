import * as ts from "typescript";

import { generateTypecheck } from "../framework/generation";
import * as tree from "../framework/types/tree";


export class Union implements tree.TypecheckGenerator {
    predicate(t: ts.TypeNode, ctx: ts.TransformationContext): t is ts.UnionTypeNode  {
        return t.kind === ts.SyntaxKind.UnionType;
    }

    generator(t: ts.TypeNode, ctx: ts.TransformationContext): tree.Typecheck {
        if (!this.predicate(t, ctx)) {
            throw new Error("Should not be called without first checking the predicate.");
        }

        const typecheck: tree.BranchTypecheck = {
            t,
            all: [],
            any: t.types.map((val) => generateTypecheck(val, ctx))
        };
        return typecheck;
    }
}
