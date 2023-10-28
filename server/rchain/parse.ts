import _ from 'lodash'
/**
 * Test: https://runkit.com/xioneko/test-rhoexpr-parasing
 */
export function parseRhoExpr(expr: any) {
    return _.chain(expr)
        .entries()
        .map(([type, { data }]) => converterMapping[type]?.(data))
        .first()
        .value()
}

const converterMapping: any = {
    ExprInt: _.identity,
    ExprBool: _.identity,
    ExprString: _.identity,
    ExprBytes: _.identity,
    ExprUri: _.identity,
    UnforgDeploy: _.identity,
    UnforgDeployer: _.identity,
    UnforgPrivate: _.identity,
    ExprUnforg: parseRhoExpr,
    ExprPar: _.curryRight(_.map<any, any>)(parseRhoExpr),
    ExprTuple: _.curryRight(_.map<any, any>)(parseRhoExpr),
    ExprList: _.curryRight(_.map<any, any>)(parseRhoExpr),
    ExprSet: _.curryRight(_.map<any, any>)(parseRhoExpr),
    ExprMap: _.curryRight(_.mapValues<any, any>)(parseRhoExpr),
}
/**
return!((42, true, "Hello from blockchain!", {"a": 1, "b": 2}, [1, 2, 3], ("a", "b", "c")))

parse result: [42, true, "Hello from blockchain!", {"a": 1, "b": 2}, [1, 2, 3], ("a", "b", "c")]

"expr": {
    "ExprTuple": {
        "data": [
            {
                "ExprInt": {
                    "data": 42
                }
            },
            {
                "ExprBool": {
                    "data": true
                }
            },
            {
                "ExprString": {
                    "data": "Hello from blockchain!"
                }
            },
            {
                "ExprMap": {
                    "data": {
                        "a": {
                            "ExprInt": {
                                "data": 1
                            }
                        },
                        "b": {
                            "ExprInt": {
                                "data": 2
                            }
                        }
                    }
                }
            },
            {
                "ExprList": {
                    "data": [
                        {
                            "ExprInt": {
                                "data": 1
                            }
                        },
                        {
                            "ExprInt": {
                                "data": 2
                            }
                        },
                        {
                            "ExprInt": {
                                "data": 3
                            }
                        }
                    ]
                }
            },
            {
                "ExprTuple": {
                    "data": [
                        {
                            "ExprString": {
                                "data": "a"
                            }
                        },
                        {
                            "ExprString": {
                                "data": "b"
                            }
                        },
                        {
                            "ExprString": {
                                "data": "c"
                            }
                        }
                    ]
                }
            }
        ]
    }
}
 */
