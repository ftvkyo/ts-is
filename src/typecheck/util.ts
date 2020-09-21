import * as ts from "typescript";

export function createPredicate(identifier: ts.Identifier, statements: ts.Statement[], ctx: ts.TransformationContext) {
    return ctx.factory.createArrowFunction(
        undefined, // modifiers
        undefined, // type parameters
        [ // parameters
            ctx.factory.createParameterDeclaration(
                undefined, // decorators
                undefined, // modifiers
                undefined, // `...` token
                identifier
            )
        ],
        ctx.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword), // type
        undefined, // `=>` token
        ctx.factory.createBlock(
            statements,
            true // multiline
        )
    );
}
