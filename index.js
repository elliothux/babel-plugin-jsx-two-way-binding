
const {objPropStr2AST, objExpression2Str, objExpression2Str2, log} = require('./utils');


function getRefExp(node, refName) {
  const binding = node.scope.bindings[refName];
  if (!binding) return null;
  return getExpFromVariableDeclaration(binding);

  function getExpFromVariableDeclaration(binding) {
    const { node } = binding.path;
    if (node.type !== 'VariableDeclarator') return null;
    switch (node.init.type) {
      case 'MemberExpression': {
        return objExpression2Str2(node.init);
      }
    }
  }
}

function getModelExp(node) {
  // log(node.node.value.expression);
  const { expression } = node.node.value;
  switch (expression.type) {
    case 'Identifier': {
      const ref = getRefExp(node, expression.name);
      return `${ref}.${expression.name}`
    }
  }
}


module.exports = function ({types: t}) {
  let attrName = 'model';

  function JSXAttributeVisitor(node) {
    if (node.node.name.name === attrName) {
      let modelExp = getModelExp(node);
      debugger;
      return;
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
      const onChange = node.parent.attributes.filter(attr => (attr && attr.name && attr.name.name) === 'onChange')[0];
      if (onChange) {
        const callee = onChange.value.expression;
        onChange.value = t.JSXExpressionContainer(
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
          t.jSXIdentifier('onChange'),
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
