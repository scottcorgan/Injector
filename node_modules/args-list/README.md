# Args list

Extract method arguments names into array. Commonly used for dependency injection.

## Install

```
npm install args-list --save
```

## Usage

```javascript

var argsList = require('args-list');

function someMethod (arg1, arg2, arg3) {
  // do something here
}

var list = argsList(someMethod); // Outputs ['arg1', 'arg2', 'arg3']

```
