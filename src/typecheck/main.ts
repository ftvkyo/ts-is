import * as ts from "typescript";

import * as flat from "./framework/types/flat";
import * as tree from "./framework/types/tree";
import * as generation from "./framework/generation";
import * as util from "./util";


function flattenTypecheck(typecheck: tree.Typecheck, fts: flat.FunctionTypecheck[], ctx: ts.TransformationContext) {
    const obj = ctx.factory.createIdentifier("obj");

    if ("deps" in typecheck) {
        // BranchTypecheck
        if (typecheck.deps.length === 0) {
            throw new Error("BranchTypecheck can't have zero dependencies, or it's useless.");
        }

        for (const dep of typecheck.deps) {
            flattenTypecheck(dep, fts, ctx);
        }

        let processed = 1;

        let body: ts.Expression = ctx.factory.createCallExpression(
            fts[fts.length - processed].name,
            undefined,
            [obj]
        );

        while (processed < typecheck.deps.length) {
            processed += 1;

            body = ctx.factory.createLogicalAnd(
                body,
                ctx.factory.createCallExpression(
                    fts[fts.length - processed].name,
                    undefined,
                    [obj]
                )
            );
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
