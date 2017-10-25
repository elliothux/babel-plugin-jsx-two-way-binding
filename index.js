
const { objValueStr2AST, objPropStr2AST, objExpression2Str} = require('./lib');


module.exports = function ({types: t}) {
    let attrName = 'model';

    function JSXAttributeVisitor(node) {
        if (node.node.name.name === attrName) {
            let modelStr = objExpression2Str(node.node.value.expression).split('.');
            if (modelStr[0] !== 'this' || modelStr[1] !== 'state') return;

            modelStr = modelStr.slice(2, modelStr.length).join('.');
            const stateDeclaration = t.variableDeclaration(
                'const', [
                    t.variableDeclarator(
                        t.identifier('_state'),
                        t.memberExpression(
                            t.thisExpression(),
                            t.identifier('state')
                        )
                    )
                ]
            );
            const setStateCall = t.callExpression(
                t.memberExpression(
                    t.thisExpression(),
                    t.identifier('setState')
                ),
                [t.objectExpression(
                    [objPropStr2AST(modelStr, 'e.target.value', t)]
                )]
            );

            node.node.name.name = 'value';
            const onInput = node.parent.attributes.filter(attr => attr.name.name === 'onInput')[0];
            if (onInput) {
                const callee = onInput.value.expression;
                onInput.value = t.JSXExpressionContainer(
                    t.arrowFunctionExpression(
                        [t.identifier('e')],
                        t.blockStatement([
                            stateDeclaration,
                            t.expressionStatement(setStateCall),
                            t.expressionStatement(
                                t.callExpression(
                                    callee,
                                    [t.identifier('e')]
                                )
                            )
                        ])
                    )
                )
            } else {
                node.insertAfter(t.JSXAttribute(
                    t.jSXIdentifier('onInput'),
                    t.JSXExpressionContainer(
                        t.arrowFunctionExpression(
                            [t.identifier('e')],
                            t.blockStatement([
                                stateDeclaration,
                                t.expressionStatement(setStateCall)
                            ])
                        )
                    )
                ));
            }
        }
    }

    function JSXElementVisitor(path) {
        attrName = this.opts && this.opts.attrName || attrName;
        path.traverse({
            JSXAttribute: JSXAttributeVisitor
        });
    }

    return {
        visitor: {
            JSXElement: JSXElementVisitor
        }
    }
};
