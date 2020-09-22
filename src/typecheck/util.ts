import * as ts from "typescript";


/**
 * Creates function that looks like:
 *
 * ```
 * (identifier: any): boolean => { ...statements }
 * ```
 */
export function createPredicate(identifier: ts.Identifier, statements: ts.Statement[], ctx: ts.TransformationContext) {
    return ctx.factory.createArrowFunction(
        undefined, // modifiers
        undefined, // type parameters
        [ // parameters
            ctx.factory.createParameterDeclaration(
                undefined, // decorators
                undefined, // modifiers
                undefined, // `...` token
                identifier,
                undefined, // `?` token
                ctx.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
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


let LAST_ID = 0;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";


function numToString(num: number): string {
    let result = "";
    for (; num > 0; num = Math.trunc(num / ALPHABET.length)) {
        result = result + ALPHABET.charAt((num - 1) % ALPHABET.length);
    }
    return result;
}


export function makeUniqueId(prefix?: string) {
    LAST_ID += 1;
    return (prefix ?? "") + numToString(LAST_ID);
}
