import * as ts from "typescript";
import * as path from "path";

import { log } from "./debug";


function validateEntrypoint(node: ts.CallExpression, signature: ts.SignatureDeclaration) {
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


type Entrypoint = ts.CallExpression;


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
        log(`Found call expression at ${file.fileName}: ${node.getText()}`);
        const fSignature = typeChecker.getResolvedSignature(node);
        if (fSignature === undefined) {
            log("Its signature is undefined");
            return false;
        }

        const fDeclaration = fSignature.getDeclaration();
        const fName = typeChecker.getTypeAtLocation(fDeclaration).symbol?.name;
        if (fName === undefined) {
            log("Its name is undefined");
            return false;
        }

        const fFilename = path.resolve(fDeclaration.getSourceFile().fileName);
        const indexDTS = path.resolve(path.join(__dirname, "..", "index.d.ts"));

        if (fFilename !== indexDTS) {
            log(`It's from ${fFilename} not from our index.d.ts`);
            return false;
        }

        if (!(["createIs", "createAssertType"].includes(fName))) {
            log(`It's ${fName}, not a function to transform`);
            return false;
        }

        validateEntrypoint(node, fDeclaration);

        return true;
    }

    return false;
}

function entrypointTransformer(node: Entrypoint, ctx: ts.TransformationContext): ts.Node {
    return ctx.factory.createCallExpression(
        node.expression,
        undefined,
        node.arguments.concat(
            [
                ctx.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ctx.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ctx.factory.createIdentifier("obj")
                        )
                    ],
                    undefined,
                    undefined,
                    ctx.factory.createBlock(
                        [
                            ctx.factory.createReturnStatement(
                                ctx.factory.createTrue()
                            )
                        ]
                    )
                )
            ]
        )
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
