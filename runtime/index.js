
function getValue(event, type) {
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

function genHandler(type, self, bindingName, onChange) {
  return (event) => {
    if (typeof onChange === 'function') {
      onChange(event);
    }
    self.setState(
      genNewState(
        self.state,
        getValue(event, type),
        bindingName
      )
    )
  }
}

export {
  genHandler
}
