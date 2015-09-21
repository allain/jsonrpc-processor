var test = require('blue-tape');
var Promise = require('bluebird');
var jsonRpcProcess = require('..');

test('exports a function', function (t) {
  t.equal(typeof jsonRpcProcess, 'function');
  t.end();
});

test('performs simple single invocation', function (t) {
  return jsonRpcProcess({jsonrpc: '2.0', method: 'echo', params: ['bar'], 'id': 1}, {
    echo: function (val) {
      return val;
    }
  }).then(function (result) {
    t.deepEqual(result, {
      id: 1,
      jsonrpc: '2.0',
      result: 'bar'
    });
  });
});

test('performs simple single invocation that returns a promise', function (t) {
  return jsonRpcProcess({jsonrpc: '2.0', method: 'echo', params: ['bar'], 'id': 1}, {
    echo: function (val) {
      return Promise.resolve(val);
    }
  }).then(function (result) {
    t.deepEqual(result, {
      id: 1,
      jsonrpc: '2.0',
      result: 'bar'
    });
  });
});

test('performs simple single invocation as array', function (t) {
  return jsonRpcProcess('[{"jsonrpc":"2.0", "method": "echo", "params": [1], "id": 1}]', {
    echo: function (val) {
      return val;
    }
  }).then(function (result) {
    t.deepEqual(result, [{
      id: 1,
      jsonrpc: '2.0',
      result: 1
    }]);
  });
});

test('handles thrown exceptions', function (t) {
  return jsonRpcProcess('{"jsonrpc":"2.0", "method": "yell", "id": 1}', {
    yell: function () {
      throw new Error('expected');
    }
  }).then(function (result) {
    t.deepEqual(result, {
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'expected'
      }
    });
  });
});

test('performs simple invocations as array', function (t) {
  return jsonRpcProcess('[{"jsonrpc":"2.0", "method": "echo", "params": [1], "id": 1},{"jsonrpc":"2.0", "method": "echo", "params": [2], "id": 2}]', {
    echo: function (val) {
      return val;
    }
  }).then(function (result) {
    t.deepEqual(result, [{
      id: 1,
      jsonrpc: '2.0',
      result: 1
    }, {
      id: 2,
      jsonrpc: '2.0',
      result: 2
    }]);
  });
});

test('supports notification invocations', function(t) {
  return jsonRpcProcess({jsonrpc: '2.0', 'method': 'echo', params: [1]}, {
    echo: function (val) {
      return val;
    }
  }).then(function(result) {
    t.deepEqual(result, undefined);
  });
});

test('supports array of notification invocations', function(t) {
  return jsonRpcProcess([{jsonrpc: '2.0', 'method': 'echo', params: [1]}], {
    echo: function (val) {
      return val;
    }
  }).then(function(result) {
    t.deepEqual(result, []);
  });
});