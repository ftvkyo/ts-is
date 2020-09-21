import * as ts from "typescript";

import visitorFactory from "./visitor";


export default function(program: ts.Program, pluginOptions: {}) {
    return (ctx: ts.TransformationContext) => {
        const rootVisitor = visitorFactory(program, ctx);
        return (sourceFile: ts.SourceFile) => {
            return ts.visitEachChild(sourceFile, rootVisitor, ctx);
        };
    };
}
