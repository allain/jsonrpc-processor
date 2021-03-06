var Promise = require('bluebird');

var protocol = require('json-rpc-protocol');

var parse = protocol.parse;
var format = protocol.format;
var JsonRpcError = protocol.JsonRpcError;
var InvalidRequest = protocol.InvalidRequest;
var MethodNotFound = protocol.MehtodNotFound;

module.exports = function(src, procedures, context) {
  var invocations = protocol.parse(src);

  var batch = Array.isArray(invocations);

  return Promise.map([].concat(invocations), function(invocation) {
    if (invocation.result) {
      // Ignore responses
      return;
    }

    var method = invocation.method;
    if (!method) {
      return error(invocation.id, new InvalidRequest('no method'));
    }

    var procedure = procedures[method];
    if (!procedure) {
      return error(invocation.id, new MethodNotFound(method));
    }

    var result;
    try {
      result = Promise.resolve(procedure.apply(context, invocation.params || []));
    } catch(e) {
      result = Promise.reject(e);
    }

    return result.then(function (result) {
      return response(invocation.id, result);
    }).catch(function(err) {
      return error(invocation.id, new JsonRpcError(err.message));
    });
  }).filter(Boolean).map(JSON.parse).then(function(result) {
    return batch ? result : result[0];
  });
};

function response(id, result) {
  if (id) return format.response(id, result);
}

function error(id, err) {
  if (id) return format.error(id, err);
}