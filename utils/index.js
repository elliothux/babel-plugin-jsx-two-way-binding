
const generate = require("@babel/generator").default;


function ast2Code(ast) {
  return generate(ast).code;
}

function isSameLocation(node1, node2) {
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

function log(...args) {
  args.forEach(i => {
    console.log(JSON.stringify(i, '', 4));
  })
}

function error(info, line) {
  return new Error(`[babel-plugin-jsx-two-way-binding] [At lint ${line}] ${info}`)
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
  isSameLocation,
  mapIdentifierTreeToIdentifiers,
  TreeNode
};
