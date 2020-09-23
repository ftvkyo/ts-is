import * as ts from "typescript";


export interface FunctionTypecheck {
    name: ts.Identifier;
    body: ts.Expression;
}
