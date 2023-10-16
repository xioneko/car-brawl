import * as R from 'ramda'

export function rhExprToJson(expr: any) {
    const loop = (rhoExpr: any) => convert(rhoExpr)(converters)
    const converters = R.toPairs(converterMapping(loop))
    return loop(expr) as any[]
}

const convert = (rhoExpr: any) =>
    R.pipe(
        R.map(matchTypeConverter(rhoExpr)),
        R.find((x) => !R.isNil(x)),
        (x) => (R.isNil(x) ? [R.identity, []] : x),
        ([f, d]) => f(d),
    )

const converterMapping = (loop: any) => ({
    ExprInt: R.identity,
    ExprBool: R.identity,
    ExprString: R.identity,
    ExprBytes: R.identity,
    ExprUri: R.identity,
    UnforgDeploy: R.identity,
    UnforgDeployer: R.identity,
    UnforgPrivate: R.identity,
    ExprUnforg: loop,
    ExprPar: R.map(loop),
    ExprTuple: R.map(loop),
    ExprList: R.map(loop),
    ExprSet: R.map(loop),
    ExprMap: R.mapObjIndexed(loop),
})

const matchTypeConverter =
    (rhoExpr: any) =>
    ([type, f]: [string, any]) => {
        const d = R.path([type, 'data'], rhoExpr)
        return R.isNil(d) ? undefined : [f, d]
    }
