const {
  isSameLocation,
  mapIdentifierTreeToIdentifiers,
  error,
  TreeNode
} = require("../utils");
const { getMemberExpressionIdentifiers } = require("./transformDestructuring");
const { patternToIdentifierTrees } = require("./transformDestructuring");

function getRefIdentifiers(node, refName) {
  const NODE = node;
  const binding = node.scope.bindings[refName];
  if (!binding) return null;
  return getIdentifiersFromVariableDeclaration(binding);

  function getIdentifiersFromVariableDeclaration(binding) {
    const { node } = binding.path;
    if (node.type !== "VariableDeclarator") return null;
    const { id, init } = node;
    let idIdentifiers;
    let initIdentifiers;
    debugger;
    switch (id.type) {
      case "ObjectPattern":
      case "ArrayPattern": {
        const rootNode = new TreeNode({ type: "root" });
        rootNode.appendChildren(patternToIdentifierTrees(id));
        idIdentifiers = mapIdentifierTreeToIdentifiers(
          rootNode.find(binding.identifier, isSameLocation)
        );
        break;
      }
      case 'Identifier': {
        idIdentifiers = [];
        break;
      }
      default: {
        throw error(
          `Invalid id type "${id.type}" of "VariableDeclaration".`,
          id.loc
        );
      }
    }
    switch (init.type) {
      case "MemberExpression": {
        initIdentifiers = getMemberExpressionIdentifiers(init);
        break;
      }
      case "Identifier": {
        initIdentifiers = getRefIdentifiers(NODE, init.name);
        break;
      }
      case "ThisExpression": {
        initIdentifiers = "this";
        break;
      }
      default: {
        throw error(
          `Invalid init type "${init.type}" of "VariableDeclaration".`,
          init.loc
        );
      }
    }
    const result = [];
    if (Array.isArray(initIdentifiers)) {
      initIdentifiers.forEach(i => result.push(i));
    } else {
      result.push(initIdentifiers);
    }
    if (Array.isArray(idIdentifiers)) {
      idIdentifiers.forEach(i => result.push(i));
    } else {
      result.push(idIdentifiers);
    }
    console.log(result);
    return result;
  }
}

module.exports = {
  getRefIdentifiers
};
