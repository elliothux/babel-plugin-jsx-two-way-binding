
const generate = require("@babel/generator").default;

function memberExpression2Array(node) {
  const { property, object } = node;
  const propText = getText(property);
  const objText = getText(object);
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

  function getText(node) {
    switch (node.type) {
      case 'ThisExpression': return 'this';
      case 'Identifier': return node.name;
      case 'NumericLiteral': return node.value;
      case 'StringLiteral': return node.value;
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
  constructor(rootValue) {
    this.value = rootValue;
    this.parent = null;
    this.children = [];

    this.appendChild = this.appendChild.bind(this);
    this.appendChildren = this.appendChildren.bind(this);
    this.find = this.find.bind(this);
  }

  appendChildren(values) {
    values.forEach(this.appendChild)
  }

  appendChild(value) {
    const child = value instanceof TreeNode ?
      value : new TreeNode(value, this);
    child.parent = this;
    this.children.push(child);
  };

  find(value, compare) {
    if (typeof compare !== 'function') {
      compare = (a, b) => a === b;
    }

    if (value === this.value) return this;
    if (compare(value, this.value)) return this;

    for (let i=0; i < this.children.length; i++) {
      const result = this.children[i].find(value, compare);
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
