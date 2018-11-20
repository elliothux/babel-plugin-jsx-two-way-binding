
const { addNamed } = require('@babel/helper-module-imports');
const {objPropStr2AST, objExpression2Str, objExpression2Str2, log, error} = require('./utils');


function getRefExp(node, refName) {
  const NODE = node;
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
      case 'Identifier': {
        return getRefExp(NODE, node.init.name);
      }
    }
  }
}


function getModelExp(node) {
  const { expression } = node.node.value;
  switch (expression.type) {
    case 'Identifier': {
      const ref = getRefExp(node, expression.name);
      return [`${ref}.${expression.name}`, null]
    }
  }
}


module.exports = function ({types: t}) {
  let attrName = 'model';

  function JSXAttributeVisitor(state, path, node) {
    if (node.node.name.name !== attrName) { return; }

    const [modelExp, modelIndex] = getModelExp(node);
    const modelStr = modelExp.split('.');
    if (modelStr[0] !== 'this' || modelStr[1] !== 'state') {
      throw error('Binding to an no-state value is invalid', node.node.loc.start.line);
    }

    // TODO: Check tag type
    const tagType = t.stringLiteral(node.parent.name.name);
    const self = t.thisExpression();
    const bindingName = t.arrayExpression(
      modelStr
        .slice(2, modelStr.length)
        .map(i => t.stringLiteral(i))
    );
    // TODO: Binding to Array
    const index = t.numericLiteral(-1);
    const onChange = node.parent.attributes
      .find(attr => (attr && attr.name && attr.name.name) === 'onChange');

    const handler = t.JSXExpressionContainer(
      t.callExpression(
          addNamed(
            path,
            'genHandler',
            'babel-plugin-jsx-two-way-binding/runtime'
          ),
          [tagType, self, bindingName, index, onChange || t.nullLiteral()],
      )
    );

    if (onChange) {
      onChange.value = handler;
    } else {
      // TODO: Customize eventName
      node.insertAfter(
        t.JSXAttribute(
          t.jSXIdentifier('onChange'),
          handler
        )
      );
    }

    node.node.name.name = 'value';
    return console.log(modelExp);
  }

  return {
    visitor: {
      JSXElement: function (path, state) {
        attrName = this.opts && this.opts.attrName || attrName;
        path.traverse({
          JSXAttribute: (...args) => JSXAttributeVisitor(state, path, ...args)
        });
      }
    }
  }
};
