const t = require("@babel/types");
const { addNamed } = require("@babel/helper-module-imports");
const { getRefIdentifiers } = require("./transform/transformRef");
const {
  getMemberExpressionIdentifiers
} = require("./transform/transformDestructuring");
const { types, error } = require("./utils");

function getModelIdentifiers(node) {
  const { expression } = node.node.value;
  switch (expression.type) {
    case "Identifier": {
      return getRefIdentifiers(node, expression.name);
    }
    case "MemberExpression": {
      return getMemberExpressionIdentifiers(expression);
    }
    default: {
      throw error(
        `Can not binding to an invalid type "${expression.type}".`,
        expression.loc
      );
    }
  }
}

function JSXAttributeVisitor(opts, state, path, node) {
  const { attrName, handlerName } = opts;
  if (node.node.name.name !== attrName) {
    return;
  }

  const modelIdentifiers = getModelIdentifiers(node);
  if (modelIdentifiers[0] !== "this" || modelIdentifiers[1] !== "state") {
    throw error("Can not binding to an invalid no-state value.", node.node.loc);
  }

  // Check tag type
  const tagType = node.parent.name.name;
  if (!types.VALID_TAG_TYPES.includes(tagType)) {
    throw error(
      `Can not binding to invalid tag type "${tagType}", using "input" or "textarea".`,
      node.parent.name.loc
    );
  }

  let tagTypeAttr = node.parent.attributes.find(
    i => i.name.name === "type"
  ) || { value: { value: "" } };
  const { value: { loc: tagTypeAttrLoc } } = tagTypeAttr;
  tagTypeAttr = tagTypeAttr.value.value;
  if (tagType === "input" && !types.VALID_TYPES.includes(tagTypeAttr)) {
    throw error(
      `Can not binding to invalid input type "${tagTypeAttr}", using one of ${types.VALID_TYPES.map(i => `"${i}"`).join("、")}`,
      tagTypeAttrLoc
    );
  }

  const self = t.thisExpression();
  const bindingName = t.arrayExpression(
    modelIdentifiers
      .slice(2, modelIdentifiers.length)
      .map(
        i => (typeof i === "string" ? t.stringLiteral(i) : t.numericLiteral(i))
      )
  );
  const onChange = node.parent.attributes.find(
    attr => (attr && attr.name && attr.name.name) === "onChange"
  );

  const handler = t.jsxExpressionContainer(
    t.callExpression(
      addNamed(path, "genHandler", "babel-plugin-jsx-two-way-binding/runtime"),
      [
        t.stringLiteral(tagType),
        t.stringLiteral(tagTypeAttr),
        self,
        bindingName,
        onChange || t.nullLiteral()
      ]
    )
  );

  if (onChange) {
    onChange.value = handler;
  } else {
    node.insertAfter(t.jsxAttribute(t.jsxIdentifier(handlerName), handler));
  }

  node.node.name.name = "value";
}

module.exports = function() {
  let attrName = "model";
  let handlerName = "onChange";

  return {
    name: "jsx-two-way-binding",
    visitor: {
      JSXElement: function(path, state) {
        const { opts } = this;
        if (opts) {
          attrName = opts.attrName || attrName;
          handlerName = opts.handlerName || handlerName;
        }
        path.traverse({
          JSXAttribute: (...args) => {
            return JSXAttributeVisitor(
              { attrName, handlerName },
              state,
              path,
              ...args
            );
          }
        });
      }
    }
  };
};
