import * as ts from "typescript";
import { isPrimitiveType, primitiveTypecheck } from "./primitives";
import { createPredicate } from "./util";


export function createTypecheck(type: ts.TypeNode, ctx: ts.TransformationContext): ts.Expression {
    // const knownChecks: Map<string, (obj: any) => boolean> = new Map();

    if (isPrimitiveType(type, ctx)) {
        const objIdentifier = ctx.factory.createIdentifier("obj");
        return createPredicate(
            objIdentifier,
            [
                ctx.factory.createReturnStatement(
                    ctx.factory.createCallExpression(
                        primitiveTypecheck(type.getText(), ctx),
                        undefined,
                        [objIdentifier],
                    )
                )
            ],
            ctx
        );
    } else {
        throw new Error("Unimplemented");
    }
}
