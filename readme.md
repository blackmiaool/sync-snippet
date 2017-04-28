# sync-snippet

Synchronize code snippet among files.

[![NPM version][npm-image]][npm-url]

### How to use it?

`npm i -D sync-snippet`

#### 1.Use `////sync-code-snippet:ws:start` and `////sync-code-snippet:ws:end` to mark snippet area in files.


Before:

**a.js**:
```javascript
////sync-code-snippet:ws:start
////sync-code-snippet:ws:end
```
**b.js**:
```javascript
////sync-code-snippet:ws:start
var a=1;
////sync-code-snippet:ws:end
```

**c.js**:
```javascript
////sync-code-snippet:ws:start
////sync-code-snippet:ws:end
```

After:


**a.js**:
```javascript
////sync-code-snippet:ws:start
var a=1;
////sync-code-snippet:ws:end
```
**b.js**:
```javascript
////sync-code-snippet:ws:start
var a=1;
////sync-code-snippet:ws:end
```

**c.js**:
```javascript
////sync-code-snippet:ws:start
var a=1;
////sync-code-snippet:ws:end
```


#### 2.Invoke it in nodejs:

```javascript
const sync = require("sync-snippet")

sync({
    name: "ws", //should be unique in this pc
    regexp: /\/\/\/\/sync-code-snippet:(\w+):(\w+) */g, //should be like this:  ////sync-code-snippet:ws:end
    files: [
        {
            path: "/home/blackmiaool/a.js"
        },
        {
            path: "/home/blackmiaool/b.js"
        },
        {
            path: "/home/blackmiaool/c.js"
        },
    ]
});
```



####  3.Try to edit the code in the snippet area and check the area in other files

### Does it support indent?
Yes. It get the indentation by calculating the spaces between the column0 and the *start mark* and synchronize the snippet area accordingly.
Remember to make the snippet area and the *start mark* have the same indent.

**Wrong:**
```javascript
////sync-code-snippet:ws:start
  var a=1;
////sync-code-snippet:ws:end
```

**Right:**
```javascript
  ////sync-code-snippet:ws:start
  var a=1;
  ////sync-code-snippet:ws:end
```

### How to test it?
Clone the repo, run the **start.js** and try to edit the files in ./test folder.


[npm-url]: https://npmjs.org/package/sync-snippet
[npm-image]: http://img.shields.io/npm/v/sync-snippet.svg

