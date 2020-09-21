import * as ts from "typescript";
import { createPredicate } from "./util";


export function isPrimitiveType(type: ts.TypeNode, ctx: ts.TransformationContext) {
    switch (type.kind) {
        case ts.SyntaxKind.UndefinedKeyword:
        case ts.SyntaxKind.BooleanKeyword:
        case ts.SyntaxKind.NumberKeyword:
        case ts.SyntaxKind.StringKeyword:
        case ts.SyntaxKind.BigIntKeyword:
        case ts.SyntaxKind.SymbolKeyword:
            return true;
        default:
            return false;
    }
}


export function primitiveTypecheck(type: string, ctx: ts.TransformationContext) {
    const objIdentifier = ctx.factory.createIdentifier("obj");
    return createPredicate(
        objIdentifier,
        [
            ctx.factory.createReturnStatement(
                ctx.factory.createStrictEquality(
                    ctx.factory.createTypeOfExpression(
                        objIdentifier
                    ),
                    ctx.factory.createStringLiteral(type)
                )
            )
        ],
        ctx
    );
}
