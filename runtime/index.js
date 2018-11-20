
function getValue(event, type) {
  // TODO
  return event.target.value;
}

function genNewState(oldState, value, bindingName, index) {
  const newState = Object.assign({}, oldState);
  let obj = newState;
  while (bindingName.length > 1) {
    obj = obj[bindingName.shift()];
  }
  obj[bindingName[0]] = index >= 0 ?
    value[index] : value;
  return newState;
}

function genHandler(type, self, bindingName, index, onChange) {
  return (event) => {
    if (typeof onChange === 'function') {
      onChange(event);
    }
    self.setState(
      genNewState(
        self.state,
        getValue(event, type),
        bindingName,
        index
      )
    )
  }
}

export {
  genHandler
}
