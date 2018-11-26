
function getValue(event, type, typeAttr) {
  // TODO
  return event.target.value;
}

function genNewState(oldState, value, bindingName) {
  const newState = Object.assign({}, oldState);
  let obj = newState;
  while (bindingName.length > 1) {
    obj = obj[bindingName.shift()];
  }
  obj[bindingName[0]] = value;
  return newState;
}

function genHandler(type, tagTypeAttr, self, bindingName, onChange) {
  // TODO: TYPE ATTR
  return (event) => {
    if (typeof onChange === 'function') {
      onChange(event);
    }
    self.setState(
      genNewState(
        self.state,
        getValue(event, type, tagTypeAttr),
        bindingName
      )
    )
  }
}

export {
  genHandler
}
