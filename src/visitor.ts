import * as ts from "typescript";
import * as path from "path";
import * as assert from "assert";

import { log } from "./debug";
import * as typecheck from "./typecheck/main";


type Entrypoint = ts.CallExpression;

/**
 * Validate that a call expression is used correctly.
 *
 * Checks that number of arguments and type arguments is correct.
 *
 * @throws when entrypoint is used incorrectly.
 */
function validateEntrypoint(node: Entrypoint, signature: ts.SignatureDeclaration) {
    const typeArgs = signature.typeParameters ?? [];
    const args = signature.parameters;

    if (typeArgs.length === 0
        || node.typeArguments === undefined
        || node.typeArguments.length !== typeArgs.length) {
        throw new Error(`Expected function to have ${typeArgs.length} type arguments. Got ${node.typeArguments?.length}`);
    }

    if (node.arguments.length !== args.length) {
        throw new Error(`Expected function to have ${args.length} arguments. Got ${node.arguments.length}`);
    }
}


/**
 * Check if a node requires transformation.
 *
 * When true, we know that the node is also
 * a valid entrypoint with a correct amount of arguments.
 */
function isEntrypoint(node: ts.Node, typeChecker: ts.TypeChecker): node is Entrypoint {
    if (ts.isCallExpression(node)) {
        log("");

        const file = node.getSourceFile();
        log(`Found call expression at ${file?.fileName}, ${node.pos}`);
        const fSignature = typeChecker.getResolvedSignature(node);
        if (fSignature === undefined) {
            log("Its signature is undefined, skipping");
            return false;
        }

        const fDeclaration = fSignature.getDeclaration();
        const fName = typeChecker.getTypeAtLocation(fDeclaration).symbol?.name;
        if (fName === undefined) {
            log("Its name is undefined, skipping");
            return false;
        }

        const fFilename = path.resolve(fDeclaration.getSourceFile().fileName);
        const indexDTS = path.resolve(path.join(__dirname, "..", "index.d.ts"));

        if (fFilename !== indexDTS) {
            log(`It's from ${fFilename}, not from our index.d.ts`);
            return false;
        }

        // It may look like all unneeded functions are excluded on the previous check, but
        // 1) we have TypeAssertError exported
        // 2) previous check still matches some internal `__type` function.
        if (!(["createIs", "createAssertType"].includes(fName))) {
            log(`It's ${fName}, not a function to transform`);
            return false;
        }

        validateEntrypoint(node, fDeclaration);

        return true;
    }

    return false;
}

/**
 * Adds an argument to an argument list of the node.
 * This argument is a typecheck implementation.
 */
function entrypointTransformer(node: Entrypoint, ctx: ts.TransformationContext): ts.Node {
    assert.ok(node.typeArguments !== undefined);
    assert.ok(node.typeArguments.length === 1);

    return ctx.factory.createCallExpression(
        node.expression,
        node.typeArguments,
        node.arguments.concat([
            typecheck.getTypecheckExpression(node.typeArguments[0], ctx)
        ])
    );
}

/**
 * Create a root visitor that we feed the program to.
 * It will automatically determine all nodes that require transformation,
 * using a separate visitor for them.
 */
export default function visitorFactory(program: ts.Program, ctx: ts.TransformationContext): ts.Visitor {
    const typeChecker = program.getTypeChecker();

    const rootVisitor: ts.Visitor = (node: ts.Node) => {
        if (isEntrypoint(node, typeChecker)) {

            node = entrypointTransformer(node, ctx);
        }
        return ts.visitEachChild(node, rootVisitor, ctx);
    };

    return rootVisitor;
}
