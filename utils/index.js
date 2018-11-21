
const generate = require("@babel/generator").default;

function memberExpression2Array(node) {
  const { property, object } = node;
  return [...getText(object), ...getText(property)];

  function getText(node) {
    switch (node.type) {
      case 'ThisExpression': return ['this'];
      case 'Identifier': return [node.name];
      case 'NumericLiteral': return [node.value];
      case 'StringLiteral': return [node.value];
      case 'MemberExpression': return memberExpression2Array(node);
      default: {
        console.warn(`Invalid type "${node.type}" of getText`);
        return [];
      }
    }
  }
}

function ast2Code(ast) {
  return generate(ast).code;
}

function log(...args) {
  args.forEach(i => {
    console.log(JSON.stringify(i, '', 4));
  })
}

function error(info, line) {
  return new Error(`[babel-plugin-jsx-two-way-binding] [At lint ${line}] ${info}`)
}

class TreeNode {
  constructor(rootValue, parent) {
    this.value = rootValue;
    this.parent = parent;
  }

  value = null;
  parent = null;
  children = [];

  appendChild = (value) => {
    const child = value instanceof TreeNode ?
      value : new TreeNode(value, this);
    if (this.children.includes(child)) {
      this.children.push(child);
    }
  };

  find = (value) => {
    if (value === this.value) return this;
    for (let i=0; i < this.children.length; i++) {
      const result = this.children[i].find(value);
      if (result) return result;
    }
    return null;
  }
}

module.exports = {
  ast2Code,
  log,
  error,
  memberExpression2Array,
  TreeNode
};
