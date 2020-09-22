import * as ts from "typescript";

import * as types from "./types";
import * as util from "./util";

import { Primitive } from "./primitive";


const GENERATORS: types.tree.TypecheckGenerator[] = [
    new Primitive()
];


function generateTypecheck(t: ts.TypeNode, ctx: ts.TransformationContext): types.tree.Typecheck {
    for (const generator of GENERATORS) {
        if (generator.predicate(t, ctx)) {
            return generator.generator(t, ctx);
        }
    }

    throw new Error("Unimplemented");
}


function flattenTypecheck(typecheck: types.tree.Typecheck, fts: types.flat.FunctionTypecheck[], ctx: ts.TransformationContext) {
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
    const treeTypecheck = generateTypecheck(t, ctx);

    const flatTypechecks: types.flat.FunctionTypecheck[] = [];
    flattenTypecheck(treeTypecheck, flatTypechecks, ctx);
    if (flatTypechecks.length === 0) {
        throw new Error("We have got 0 typechecks generated. Should not be possible.");
    }

    const obj = ctx.factory.createIdentifier("obj");

    flatTypechecks.reverse();
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
            flatTypechecks[0].name,
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
