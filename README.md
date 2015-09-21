# jsonrpc-processor

A tool for performing jsonrpc calls in a transport agnostic way. It exists, because the packages I was able to find
conflated the transport and the processing, or did not support asynchronous computation of the responses.

It supports asynchronous responses by having them return promises or simple values.

Handles thrown exceptions and rejected promises by generating valid jsonrpc 2.0 errors.

As per the jsonrpc spec, notifications do not produce any responses for errors or otherwise.

## Installation

```bash
npm install jsonrpc-processor
```

## Usage

```js
var process = require('jsonrpc-processor');

// Define some methods for use later
var methods = {
    echo: function(val) { return val; }
    asyncEcho: function(val) { return Promise.resolve(val); },
    dump: function(msg) { }
};

// Single invocation:
process({jsonrpc: '2.0', method: 'echo', params: [1], id: 1}).then(function(result) {
    console.log(result);
    // outputs:
    // {
    //   "jsonrpc": "2.0",
    //   "id": 1,
    //   "result": 1
    // },
});


// Single Notification (no id in request):
process({jsonrpc: '2.0', method: 'dump', params: ['hello']}).then(function(result) {
    console.log(result);
    // outputs empty array since notifications do not expect a response
    // []
});

// Array of invocations:
process([
    {jsonrpc: '2.0', method: 'echo', params: [1], id: 1},
    {jsonrpc: '2.0', method: 'asyncEcho', params: [2], id: 2},
]).then(function(result) {
    console.log(result);
    // outputs:
    // [
    //   {
    //     "jsonrpc": "2.0",
    //     "id": 1,
    //     "result": 1
    //   },
    //   {
    //     "jsonrpc": "2.0",
    //     "id": 2,
    //     "result": 2
    //   }
    // ]
});
```

## API

### process(invocation, methods[, context]) => Promise

#### invocation
is one or more jsonrpc requests or notifications

#### methods
an object where the keys are the method names and the values are the functions to invoke.

#### context
object to bind `this` while invoking methods

#### returns
a Promise which resolves into a Response object, undefined, or an array of Response objects for the case of a Single Request, a Notification, or an array of one or more Requests or notifications respectively. 

Note that nofications will not be found in the array since by definition the server must not respond at all, even in the case of an error.