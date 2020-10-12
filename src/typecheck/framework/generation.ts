import * as ts from "typescript";
import * as util from "util";


import * as tree from "./types/tree";

import { Primitive } from "../implementation/primitive";
import { Intersection } from "../implementation/intersection";
import { Union } from "../implementation/union";


const GENERATORS: tree.TypecheckGenerator[] = [
    new Primitive(),
    new Union(),
    new Intersection(),
];


export function generateTypecheck(t: ts.TypeNode, ctx: ts.TransformationContext): tree.Typecheck {
    for (const generator of GENERATORS) {
        if (generator.predicate(t, ctx)) {
            return generator.generator(t, ctx);
        }
    }

    throw new Error("Unimplemented. TypeNode: " + util.inspect(t));
}
