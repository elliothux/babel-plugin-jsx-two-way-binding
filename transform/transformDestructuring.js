
const { TreeNode } = require('../utils');


function getMemberExpressionIdentifiers(node) {
  const { property, object } = node;
  const propIdentifiers = getNodeText(property);
  const objIdentifiers = getNodeText(object);
  const result = [];
  if (Array.isArray(objIdentifiers)) {
    objIdentifiers.forEach(i => result.push(i));
  } else {
    result.push(objIdentifiers);
  }
  if (Array.isArray(propIdentifiers)) {
    propIdentifiers.forEach(i => result.push(i));
  } else {
    result.push(propIdentifiers);
  }
  return result;
}

function getNodeText(node) {
  switch (node.type) {
    case 'ThisExpression': return 'this';
    case 'Identifier': return node.name;
    case 'NumericLiteral': return node.value;
    case 'StringLiteral': return node.value;
    case 'MemberExpression': return getMemberExpressionIdentifiers(node);
    default: {
      console.warn(`Invalid type "${node.type}" of getText`);
      return [];
    }
  }
}

function objectPatternToIdentifierTrees(node) {
  return node.properties.map(i => {
    const { key, value } = i;

    // Handle destructuring: { a: b }
    if (value.type === 'Identifier') {
      value.aliasKeyNode = new TreeNode(key);
      return new TreeNode(value);
    }

    const treeNode = new TreeNode(key);
    treeNode.appendChildren(patternToIdentifierTrees(value));
    return treeNode;
  });
}

function arrayPatternToIdentifierTrees(node) {
  return node.elements.map((i, index) => {
    const treeNode = new TreeNode({ type: "ArrayPatternIndex", index });
    if (i.type === "Identifier") {
      i.inArrayPattern = true;
      treeNode.appendChild(i);
    } else {
      treeNode.appendChildren(patternToIdentifierTrees(i));
    }
    return treeNode;
  });
}

function patternToIdentifierTrees(node) {
  switch (node.type) {
    case "ArrayPattern": {
      return arrayPatternToIdentifierTrees(node);
    }
    case "ObjectPattern": {
      return objectPatternToIdentifierTrees(node);
    }
    default: {
      console.warn("invalid type");
      return [];
    }
  }
}


module.exports = {
  getMemberExpressionIdentifiers,
  patternToIdentifierTrees
};
