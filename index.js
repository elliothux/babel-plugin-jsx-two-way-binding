
const { addNamed } = require('@babel/helper-module-imports');
const {ast2Code, error, memberExpression2Array} = require('./utils');


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
        return ast2Code(node.init);
      }
      case 'Identifier': {
        return getRefExp(NODE, node.init.name);
      }
    }
  }
}


function getModelName(node) {
  const { expression } = node.node.value;
  switch (expression.type) {
    case 'Identifier': {
      const ref = getRefExp(node, expression.name);
      return `${ref}.${expression.name}`.split('.');
    }
    case 'MemberExpression': {
      return memberExpression2Array(expression);
    }
    default: {
      console.warn(expression.type);
      return [];
    }
  }
}


module.exports = function ({types: t}) {
  let attrName = 'model';
  let handlerName = 'onChange';

  function JSXAttributeVisitor(state, path, node) {
    if (node.node.name.name !== attrName) { return; }

    const modelNames = getModelName(node);
    if (modelNames[0] !== 'this' || modelNames[1] !== 'state') {
      throw error('Binding to an no-state value is invalid', node.node.loc.start.line);
    }

    // TODO: Check tag type
    const tagType = t.stringLiteral(node.parent.name.name);
    const self = t.thisExpression();
    const bindingName = t.arrayExpression(
      modelNames
        .slice(2, modelNames.length)
        .map(i => typeof i === 'string' ?
          t.stringLiteral(i) :
          t.numericLiteral(i))
    );
    const onChange = node.parent.attributes
      .find(attr => (attr && attr.name && attr.name.name) === 'onChange');

    const handler = t.JSXExpressionContainer(
      t.callExpression(
          addNamed(
            path,
            'genHandler',
            'babel-plugin-jsx-two-way-binding/runtime'
          ),
          [tagType, self, bindingName, onChange || t.nullLiteral()],
      )
    );

    if (onChange) {
      onChange.value = handler;
    } else {
      node.insertAfter(
        t.JSXAttribute(
          t.jSXIdentifier(handlerName),
          handler
        )
      );
    }

    node.node.name.name = 'value';
  }

  return {
    visitor: {
      JSXElement: function (path, state) {
        const { opts } = this;
        if (opts) {
          attrName = opts.attrName || attrName;
          handlerName = opts.handlerName || handlerName;
        }
        path.traverse({
          JSXAttribute: (...args) => JSXAttributeVisitor(state, path, ...args)
        });
      }
    }
  }
};
