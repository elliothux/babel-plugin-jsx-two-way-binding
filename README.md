### ⚠️ It‘s unstable！DO NOT use it on production environment.

# A two-way data binding solution for JSX

[![GitHub stars](https://img.shields.io/github/stars/HuQingyang/babel-plugin-jsx-two-way-binding.svg?style=social&label=Stars&style=plastic)](https://github.com/HuQingyang/babel-plugin-jsx-two-way-binding)
[![GitHub forks](https://img.shields.io/github/forks/HuQingyang/babel-plugin-jsx-two-way-binding.svg?style=social&label=Fork&style=plastic)](https://github.com/HuQingyang/babel-plugin-jsx-two-way-binding)
[![npm](https://img.shields.io/npm/dw/babel-plugin-jsx-two-way-binding.svg)](https://www.npmjs.com/package/babel-plugin-jsx-two-way-binding)
[![npm](https://img.shields.io/npm/v/babel-plugin-jsx-two-way-binding.svg)](https://www.npmjs.com/package/babel-plugin-jsx-two-way-binding)
[![npm](https://img.shields.io/npm/l/babel-plugin-jsx-two-way-binding.svg)](https://www.npmjs.com/package/babel-plugin-jsx-two-way-binding)

A easy-to-use two-way data binding solution for front-end frameworks using JSX with "setState" api like React.

**See Also:**
* Using for-directive in JSX: [babel-plugin-jsx-for-directive](https://github.com/HuQingyang/babel-plugin-jsx-for-directive)
* Using if-directive in JSX: [babel-plugin-jsx-if-directive](https://github.com/HuQingyang/babel-plugin-jsx-if-directive)

**实现原理系列教程：**
* [手把手教你为 React 添加双向数据绑定（一）](https://juejin.im/post/59f2e9b16fb9a04529360146)
* [手把手教你为 React 添加双向数据绑定（二）](https://juejin.im/post/59f3655b6fb9a0452a3b93b2)


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

And it will be compiled to:
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

Then it will be compiled to:
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

Then it will be compiled to:
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
