
const { addNamed } = require('@babel/helper-module-imports');
const { error, memberExpression2Array, TreeNode } = require('./utils');


function sameLocation(node1, node2) {
  if (!node1.loc || !node2.loc) return false;
  const { loc: {
    start: { line: startLine1, column: startCol1 },
    end: { line: endLine1, column: endCol1 }
  } } = node1;
  const { loc: {
    start: { line: startLine2, column: startCol2 },
    end: { line: endLine2, column: endCol2 }
  } } = node2;
  return startLine1 === startLine2 &&
    startCol1 === startCol2 &&
    endLine1 === endLine2 &&
    endCol1 === endCol2;
}

function objectPatternToIdentifierTrees(node) {
  return node.properties.map(i => {
    const { key, value } = i;
    const treeNode = new TreeNode(key);
    switch (value.type) {
      case 'Identifier': {
        if (key.name !== value.name) {
          treeNode.appendChild(value);
        }
        break;
      }
      default: {
        treeNode.appendChildren(
          patternToIdentifierTrees(value)
        );
      }
    }
    return treeNode;
  });
}

function arrayPatternToIdentifierTrees(node) {
  return node.elements.map((i, index) => {
    const treeNode = new TreeNode(
      { type: 'ArrayPatternIndex', index }
    );
    if (i.type === 'Identifier') {
      i.inArrayPattern = true;
      treeNode.appendChild(i);
    } else {
      treeNode.appendChildren(
        patternToIdentifierTrees(i)
      );
    }
    return treeNode;
  });
}

function patternToIdentifierTrees(node) {
  switch (node.type) {
    case 'ArrayPattern': {
      debugger;
      return arrayPatternToIdentifierTrees(node);
    }
    case 'ObjectPattern': {
      return objectPatternToIdentifierTrees(node);
    }
    default: {
      console.warn('invalid type');
      return [];
    }
  }
}

function mapIdentifierTreeToIdentifiers(treeNode) {
  let identifiers = [];
  let currentNode = treeNode;
  while (currentNode) {
    const identifier = getIdentifier(currentNode);
    identifier !== null && identifiers.push(identifier);
    currentNode = currentNode.parent;
  }
  return identifiers.reverse();

  function getIdentifier(node) {
    const { value } = node;
    switch (value.type) {
      case 'Identifier': return value.inArrayPattern ? null : value.name;
      case 'ArrayPatternIndex': return value.index;
      case 'root': return null;
      default: {
        console.error(`Invalid type: ${value.type}`);
        return null;
      }
    }
  }
}

// TODO
function getRefExp(node, refName) {
  const NODE = node;
  const binding = node.scope.bindings[refName];
  if (!binding) return null;
  return getExpFromVariableDeclaration(binding);

  function getExpFromVariableDeclaration(binding) {
    const { node } = binding.path;
    if (node.type !== 'VariableDeclarator') return null;
    const { id, init } = node;
    let idExp;
    let initExp;
    switch (id.type) {
      case 'ObjectPattern':
      case 'ArrayPattern': {
        const rootNode = new TreeNode({ type: 'root' });
        rootNode.appendChildren(patternToIdentifierTrees(id));
        idExp = mapIdentifierTreeToIdentifiers(
          rootNode.find(
            binding.identifier,
            sameLocation
          )
        );
        console.log(
          rootNode,
          rootNode.find(binding.identifier, sameLocation),
          idExp
        );
        debugger;
        break;
      }
      default: {
        console.warn(`Invalid type "${node.id.type}" of getExpFromVariableDeclaration`);
        idExp = [];
      }
    }
    switch (init.type) {
      case 'MemberExpression': {
        initExp = memberExpression2Array(node.init);
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
    const result = [];
    if (Array.isArray(initExp)) {
      initExp.forEach(i => result.push(i));
    } else {
      result.push(initExp);
    }
    if (Array.isArray(idExp)) {
      idExp.forEach(i => result.push(i));
    } else {
      result.push(idExp);
    }
    return result;
  }
}


function getModelName(node) {
  const { expression } = node.node.value;
  switch (expression.type) {
    case 'Identifier': {
      return getRefExp(node, expression.name);
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
    debugger;
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
