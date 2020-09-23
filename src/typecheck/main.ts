import * as ts from "typescript";

import * as flat from "./framework/types/flat";
import * as tree from "./framework/types/tree";
import * as generation from "./framework/generation";
import * as util from "./util";


function flattenTypecheck(typecheck: tree.Typecheck, fts: flat.FunctionTypecheck[], ctx: ts.TransformationContext) {
    const obj = ctx.factory.createIdentifier("obj");

    if ("all" in typecheck) {
        // BranchTypecheck
        if (typecheck.all.length === 0 && typecheck.any.length === 0) {
            throw new Error("BranchTypecheck can't have zero dependencies, or it's useless.");
        }

        let allBody: ts.Expression | undefined;
        let anyBody: ts.Expression | undefined;

        // TODO: move to a function
        if (typecheck.all.length !== 0) {
            for (const dep of typecheck.all) {
                flattenTypecheck(dep, fts, ctx);
            }

            let allProcessed = 1;
            allBody = ctx.factory.createCallExpression(
                fts[fts.length - allProcessed].name,
                undefined,
                [obj]
            );

            while (allProcessed < typecheck.all.length) {
                allProcessed += 1;

                allBody = ctx.factory.createLogicalAnd(
                    allBody,
                    ctx.factory.createCallExpression(
                        fts[fts.length - allProcessed].name,
                        undefined,
                        [obj]
                    )
                );
            }
        }

        if (typecheck.any.length !== 0) {
            for (const dep of typecheck.any) {
                flattenTypecheck(dep, fts, ctx);
            }

            let anyProcessed = 1;
            anyBody = ctx.factory.createCallExpression(
                fts[fts.length - anyProcessed].name,
                undefined,
                [obj]
            );

            while (anyProcessed < typecheck.any.length) {
                anyProcessed += 1;

                anyBody = ctx.factory.createLogicalOr(
                    anyBody,
                    ctx.factory.createCallExpression(
                        fts[fts.length - anyProcessed].name,
                        undefined,
                        [obj]
                    )
                );
            }
        }


        let body: ts.Expression | undefined = allBody;
        if (body === undefined) {
            body = anyBody;
        } else if (anyBody !== undefined) {
            body = ctx.factory.createLogicalAnd(
                body,
                anyBody
            );
        }

        if (body === undefined) {
            throw new Error("Unreachable");
        }


        fts.push({
            name: ctx.factory.createIdentifier(util.makeUniqueId("typecheck_")),
            body,
        });
        return;
    } else {
        // LeafTypecheck
        fts.push({
            name: ctx.factory.createIdentifier(util.makeUniqueId("typecheck_")),
            body: ctx.factory.createCallExpression(
                typecheck.f,
                undefined,
                [obj]
            )
        });
        return;
    }
}


export function getTypecheckExpression(t: ts.TypeNode, ctx: ts.TransformationContext): ts.Expression {
    const treeTypecheck = generation.generateTypecheck(t, ctx);

    const flatTypechecks: flat.FunctionTypecheck[] = [];
    flattenTypecheck(treeTypecheck, flatTypechecks, ctx);
    if (flatTypechecks.length === 0) {
        throw new Error("We have got 0 typechecks generated. Should not be possible.");
    }

    const obj = ctx.factory.createIdentifier("obj");

    const statements: ts.Statement[] = [];
    for (const tc of flatTypechecks) {
        statements.push(ctx.factory.createVariableStatement(
            undefined,
            ctx.factory.createVariableDeclarationList(
                [
                    ctx.factory.createVariableDeclaration(
                        tc.name,
                        undefined,
                        undefined,
                        util.createPredicate(
                            obj,
                            [
                                ctx.factory.createReturnStatement(tc.body)
                            ],
                            ctx
                        )
                    )
                ],
                ts.NodeFlags.Const
              )
        ));
    }

    statements.push(ctx.factory.createReturnStatement(
        ctx.factory.createCallExpression(
            flatTypechecks[flatTypechecks.length - 1].name,
            undefined,
            [obj]
        )
    ));

    return util.createPredicate(
        obj,
        statements,
        ctx
    );
}
