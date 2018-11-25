
const { TreeNode } = require('../utils');


function getMemberExpressionIdentifiers(node) {
  const { property, object } = node;
  const propText = getNodeText(property);
  const objText = getNodeText(object);
  const result = [];
  if (Array.isArray(propText)) {
    propText.forEach(i => result.push(i));
  } else {
    result.push(propText);
  }
  if (Array.isArray(objText)) {
    objText.forEach(i => result.push(i));
  } else {
    result.push(objText);
  }
  return result.reverse();
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
    const treeNode = new TreeNode(key);
    switch (value.type) {
      case "Identifier": {
        if (key.name !== value.name) {
          treeNode.appendChild(value);
        }
        break;
      }
      default: {
        treeNode.appendChildren(patternToIdentifierTrees(value));
      }
    }
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
      debugger;
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
