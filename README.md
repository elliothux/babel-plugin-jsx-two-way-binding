# A two-way data binding solution for JSX

[![GitHub stars](https://img.shields.io/github/stars/HuQingyang/babel-plugin-jsx-two-way-binding.svg?style=social&label=Stars&style=plastic)]()
[![GitHub forks](https://img.shields.io/github/forks/HuQingyang/babel-plugin-jsx-two-way-binding.svg?style=social&label=Fork&style=plastic)]()
[![npm](https://img.shields.io/npm/dw/babel-plugin-jsx-two-way-binding.svg)]()
[![npm](https://img.shields.io/npm/v/babel-plugin-jsx-two-way-binding.svg)]()
[![npm](https://img.shields.io/npm/l/babel-plugin-jsx-two-way-binding.svg)]()

A easy-to-use two-way data binding solution for front-end frameworks using JSX with "setState" api like React.

## 1. Install
`npm install --save-dev babel-plugin-jsx-two-way-binding`

## 2. Basic Usage
Edit your __.babelrc__ file:
```json
{
  "plugins": [
    "jsx-two-way-binding"
  ]
}
```
In your jsx file:
```jsx harmony
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Joe'
        }
    }

    render() { return (
        <div>
            <h1>I'm {this.state.name}</h1>
            <input type="text" model={this.state.name}/>
        </div>
    )}
}
```

And it's will be compiled to:
```jsx harmony
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Joe'
        }
    }

    render() { return (
        <div>
            <h1>I'm {this.state.name}</h1>
            <input
                type="text"
                value={this.state.name}
                onChange={e => this.setState({ name: e.target.value })}
            />
        </div>
    )}
}
```

## 3. Usage with custom "onChange" event handler
In your jsx file:
```jsx harmony
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Joe'
        }
    }

    render() { return (
        <div>
            <h1>I'm {this.state.name}</h1>
            <input
                type="text"
                model={this.state.name}
                onChange={() => console.log(`Changed at ${(new Date()).toLocaleString()}`)}
            />
        </div>
    )}
}
```

Then it's will be compiled to:
```jsx harmony
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Joe'
        }
    }
    
    render() { return (
        <div>
            <h1>I'm {this.state.name}</h1>
            <input
                type="text"
                value={this.state.name}
                onChange={e => {
                    this.setState({ name: e.target.value });
                    (() => console.log(`Changed at ${(new Date()).toLocaleString()}`))(e);
                }}
            />
        </div>
    )}
}
```

## 4. Usage with nested state object
In your jsx file:
```jsx harmony
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            profile: {
                name: {
                    type: 'string',
                    value: 'Joe'
                },
                age: {
                    type: 'number',
                    value: 21
                }
            }
        }
    }

    render() { return (
        <div>
            <h1>I'm {this.state.profile.name.value}</h1>
            <input type="text" model={this.state.profile.name.value}/>
        </div>
    )}
}
```

Then it's will be compiled to:
```jsx harmony
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Joe'
        }
    }
    
    render() { return (
        <div>
            <h1>I'm {this.state.profile.name.value}</h1>
            <input
                type="text"
                value={this.state.profile.name.value}
                onChange={e => this.setState({
                    profile: Object.assign({}, this.state.profile, {
                        name: Object.assign({}, this.state.profile.name, {
                            value: e.target.value
                        })
                    })
                })}
            />
        </div>
    )}
}
```

## 5. Usage with custom attribute
Edit your __.babelrc__ file:
```json
{
  "plugins": [
    "jsx-two-way-binding", 
    { 
      "attrName": "binding" 
    }
  ]
}
```

In your jsx file:
```jsx harmony
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Joe'
        }
    }

    render() { return (
        <div>
            <h1>I'm {this.state.name}</h1>
            <input type="text" binding={this.state.name}/>
        </div>
    )}
}
```