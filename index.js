
const { addNamed } = require('@babel/helper-module-imports');
const { ast2Code, error, memberExpression2Array, TreeNode } = require('./utils');


// TODO
function getRefExp(node, refName) {
  const NODE = node;
  const binding = node.scope.bindings[refName];
  if (!binding) return null;
  return getExpFromVariableDeclaration(binding);

  function objectPatternToIdentifierTree(node, parentNode) {
    const root = parentNode || new TreeNode('root');
    node.properties.forEach(i => {
      switch (node.type) {
        case 'ObjectPattern': {

        }
      }
    });
  }

  function getExpFromVariableDeclaration(binding) {
    const { node } = binding.path;
    if (node.type !== 'VariableDeclarator') return null;
    const { id, init } = node;
    let idExp;
    let initExp;
    debugger;
    switch (id.type) {
      case 'ObjectPattern': {
        break;
      }
      default: {
        console.warn(`Invalid type "${node.id.type}" of getExpFromVariableDeclaration`);
        idExp = [];
      }
    }
    switch (init.type) {
      case 'MemberExpression': {
        initExp = ast2Code(node.init);
        break;
      }
      case 'Identifier': {
        initExp = getRefExp(NODE, node.init.name);
        break;
      }
      default: {
        console.warn(`Invalid type "${node.init.type}" of getExpFromVariableDeclaration`);
        initExp = [];
      }
    }
    return [...initExp, ...idExp]
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
      console.warn(`Invalid type "${expression.type}" of getModelName`);
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
    name: "jsx-two-way-binding",
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
