import * as ts from "typescript";

import { createPredicate } from "../util";
import * as tree from "../framework/types/tree";


function getType(t: ts.TypeNode): string | undefined {
    switch (t.kind) {
        case ts.SyntaxKind.UndefinedKeyword:
            return "undefined";
        case ts.SyntaxKind.BooleanKeyword:
            return "boolean";
        case ts.SyntaxKind.NumberKeyword:
            return "number";
        case ts.SyntaxKind.StringKeyword:
            return "string";
        case ts.SyntaxKind.BigIntKeyword:
            return "bigint";
        case ts.SyntaxKind.SymbolKeyword:
            return "symbol";
        default:
            return undefined;
    }
}


export class Primitive implements tree.TypecheckGenerator {
    predicate(t: ts.TypeNode, ctx: ts.TransformationContext): boolean {
        return getType(t) !== undefined;
    }

    generator(t: ts.TypeNode, ctx: ts.TransformationContext): tree.Typecheck {
        const typeString = getType(t)!;

        const objIdentifier = ctx.factory.createIdentifier("obj");
        const typecheck: tree.LeafTypecheck = {
            t,
            f: createPredicate(
                objIdentifier,
                [
                    ctx.factory.createReturnStatement(
                        ctx.factory.createStrictEquality(
                            ctx.factory.createTypeOfExpression(
                                objIdentifier
                            ),
                            ctx.factory.createStringLiteral(typeString)
                        )
                    )
                ],
                ctx
            )
        };
        return typecheck;
    }
}
