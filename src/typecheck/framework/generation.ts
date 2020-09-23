import * as ts from "typescript";


import * as tree from "./types/tree";
import { Primitive } from "../implementation/primitive";


const GENERATORS: tree.TypecheckGenerator[] = [
    new Primitive()
];


export function generateTypecheck(t: ts.TypeNode, ctx: ts.TransformationContext): tree.Typecheck {
    for (const generator of GENERATORS) {
        if (generator.predicate(t, ctx)) {
            return generator.generator(t, ctx);
        }
    }

    throw new Error("Unimplemented");
}
