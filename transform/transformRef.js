
const {
  isSameLocation,
  mapIdentifierTreeToIdentifiers,
  TreeNode
} = require("../utils");
const { getMemberExpressionIdentifiers } = require('./transformDestructuring');
const { patternToIdentifierTrees } = require('./transformDestructuring');


function getRefIdentifiers(node, refName) {
  const NODE = node;
  const binding = node.scope.bindings[refName];
  if (!binding) return null;
  return getExpFromVariableDeclaration(binding);

  function getExpFromVariableDeclaration(binding) {
    const { node } = binding.path;
    if (node.type !== "VariableDeclarator") return null;
    const { id, init } = node;
    let idExp;
    let initExp;
    switch (id.type) {
      case "ObjectPattern":
      case "ArrayPattern": {
        const rootNode = new TreeNode({ type: "root" });
        rootNode.appendChildren(patternToIdentifierTrees(id));
        idExp = mapIdentifierTreeToIdentifiers(
          rootNode.find(binding.identifier, isSameLocation)
        );
        console.log(
          rootNode,
          rootNode.find(binding.identifier, isSameLocation),
          idExp
        );
        break;
      }
      default: {
        console.warn(
          `Invalid type "${node.id.type}" of getExpFromVariableDeclaration`
        );
        idExp = [];
      }
    }
    switch (init.type) {
      case "MemberExpression": {
        initExp = getMemberExpressionIdentifiers(node.init);
        break;
      }
      case "Identifier": {
        initExp = getRefIdentifiers(NODE, node.init.name);
        break;
      }
      default: {
        console.warn(
          `Invalid type "${node.init.type}" of getExpFromVariableDeclaration`
        );
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

module.exports = {
  getRefIdentifiers
};
