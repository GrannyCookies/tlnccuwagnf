'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.evaluateExpression = evaluateExpression;
exports.evaluateGetPropUsingIdentifier = evaluateGetPropUsingIdentifier;
exports.evaluateEachExpression = evaluateEachExpression;
exports.interp = interp;
var C = require('./constants');
var lib = require('./lib');
var chalk = require('chalk');
var builtins = require('./builtins');

function evaluateExpression(expression, variables) {
  if (expression[0] === C.COMMENT) {
    return;
  } else if (expression instanceof Array && expression.every(function (e) {
    return e instanceof Array;
  })) {
    return evaluateEachExpression(variables, expression);
  }if (expression[0] === C.VARIABLE_IDENTIFIER && expression[1] === 'environment') {
    return new lib.LEnvironment(variables);
  } else if (expression[0] === C.FUNCTION_CALL) {
    // Call a function: "function(arg1, arg2, arg3...)"

    // Get the function and argument expressions from the expression list.
    var fnExpression = expression[1];
    var argExpressions = expression[2];

    // Evaluate the function expression to get the actual function.
    var fn = evaluateExpression(fnExpression, variables);

    if (!(fn instanceof lib.LFunction)) {
      throw new Error('Can\'t call ' + chalk.cyan(fn) + ' because it\'s not a function');
    }

    /* This code *used* to work but it doesn't any more, because some
     * parameters of the function could be unevaluated. Now argument evaluation
     * is done from within the call method of the function.
     */
    // Evaluate all of the arguments passed to the function.
    //const args = argExpressions.map(arg => evaluateExpression(arg, variables));
    fn.argumentScope = variables;
    var args = argExpressions;

    // Use lib.call to call the function with the evaluated arguments.
    return lib.call(fn, args);
  } else if (expression[0] === C.VARIABLE_IDENTIFIER) {
    // Get a variable: "name"

    // Get the name from the expression list.
    var name = expression[1];

    // Return the variable's value, or, if the variable doesn't exist, throw an
    // error.
    if (name in variables) {
      return variables[name].value;
    } else {
      // FIXME: Change this message not to include *all* the variables within
      // the scope; maybe just say "variable (name) not found"?
      throw 'variable ' + name + ' not in [' + Object.keys(variables) + ']';
    }
  } else if (expression[0] === C.VARIABLE_ASSIGN) {
    // Set a variable to a value: "name => value"

    // Get the name and value expression from the expression list.
    var _name = expression[1];
    var valueExpression = expression[2];

    // Evaluate the value of the variable.
    var value = evaluateExpression(valueExpression, variables);

    // Set the variable in the variables object to a new variable with the
    // evaluated value.
    variables[_name] = new lib.Variable(value);
    return;
  } else if (expression[0] === C.VARIABLE_CHANGE) {
    // Change a variable to a new value: "name -> newValue"

    // Get the name and value expression from the expression list.
    var _name2 = expression[1];
    var _valueExpression = expression[2];

    // Evaluate the new value of the variable.
    var _value = evaluateExpression(_valueExpression, variables);

    // Change the value of the already defined variable.
    variables[_name2].value = _value;
    return;
  } else if (expression[0] === C.FUNCTION_PRIM) {
    // A function literal: "fn(arg1, arg2, arg3...) { code }"

    // Get the code and paramaters from the expression list.
    var paramaters = expression[1];
    var code = expression[2];

    // Create the function using the given code.
    var _fn = new lib.LFunction(code);

    // Set the scope variables for the function to a copy of the current
    // variables.
    _fn.setScopeVariables(Object.assign({}, variables));

    // Set the paramaters for the function to the paramaters taken from the
    // expression list.
    _fn.setParamaters(paramaters);

    // Return the function.
    return _fn;
  } else if (expression[0] === C.SHORTHAND_FUNCTION_PRIM) {
    var _paramaters = expression[1];
    var codeExpression = expression[2];
    var _fn2 = new lib.LFunction(codeExpression);
    _fn2.isShorthand = true;
    _fn2.setScopeVariables(Object.assign({}, variables));
    _fn2.setParamaters(_paramaters);
    return _fn2;
  } else if (expression[0] === C.STRING_PRIM) {
    // String literal: "contents"

    // Get string from expression list.
    var string = expression[1];

    // Convert string to a language-usable string, and return.
    return lib.toLString(string);
  } else if (expression[0] === C.BOOLEAN_PRIM) {
    // Boolean literal: true/false

    // Get boolean value from expression list.
    var bool = expression[1];

    // Convert boolean value to a language-usable boolean, and return.
    return lib.toLBoolean(bool);
  } else if (expression[0] === C.NUMBER_PRIM) {
    // Number primitive: 1, 2, 3, 4, 7.25, -3, etc.

    // Get number value from expression list.
    var number = expression[1];

    // Convert number value to a language-usable number, and return.
    return lib.toLNumber(number);
  } else if (expression[0] === C.SET_PROP_USING_IDENTIFIER) {
    // Set a property of an object using an identifier literal:
    // "obj.key > value"

    // Get object expression, key, and value expression from expression list.
    var objExpression = expression[1];
    var key = expression[2];
    var _valueExpression2 = expression[3];

    // Evaluate the object and value expressions.
    var obj = evaluateExpression(objExpression, variables);
    var _value2 = evaluateExpression(_valueExpression2, variables);

    // Use lib.set to set the property of the evaluated object.
    lib.set(obj, key, _value2);
    return;
  } else if (expression[0] === C.GET_PROP_USING_IDENTIFIER) {
    // Get a property of an object using an identifier literal: "obj.key"

    // Get object expression and key from the expression list.
    var _objExpression = expression[1];
    var _key = expression[2];

    // Evaluate the object expression.
    var _obj = evaluateExpression(_objExpression, variables);

    // Get the value from lib.get.
    var _value3 = lib.get(_obj, _key);

    // Return the gotten value.
    return _value3;
  } else {
    throw new Error('Invalid expression type: ' + expression[0]);
  }
}

function evaluateGetPropUsingIdentifier(variables, _ref) {
  var _ref2 = _slicedToArray(_ref, 3);

  var _ = _ref2[0];
  var objExpr = _ref2[1];
  var key = _ref2[2];

  var obj = evaluateExpression(objExpr, variables);
  return lib.get(obj, key);
}

function evaluateEachExpression(variables, expressions) {
  return expressions.map(function (e) {
    return evaluateExpression(e, variables);
  });
}

function interp(ast, dir) {
  if (ast) {
    var variables = {};

    Object.assign(variables, builtins.makeBuiltins(dir));

    var result = evaluateEachExpression(variables, ast);

    return { result: result, variables: variables };
  } else {
    console.error('Haha, you didn\'t pass me a tree!');
  }
}
//# sourceMappingURL=data:application/json;base64,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UztBQUNQLFFBQUksWUFBWSxFQUFoQjs7QUFFQSxXQUFPLE1BQVAsQ0FBYyxTQUFkLEVBQXlCLFNBQVMsWUFBVCxDQUFzQixHQUF0QixDQUF6Qjs7QUFFQSxRQUFJLFNBQVMsdUJBQXVCLFNBQXZCLEVBQWtDLEdBQWxDLENBQWI7O0FBRUEsV0FBTyxFQUFFLGNBQUYsRUFBVSxvQkFBVixFQUFQO0FBQ0QsR0FSRCxNQVFPO0FBQ0wsWUFBUSxLQUFSLENBQWMsbUNBQWQ7QUFDRDtBQUNGIiwiZmlsZSI6ImludGVycC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5jb25zdCBsaWIgPSByZXF1aXJlKCcuL2xpYicpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IGJ1aWx0aW5zID0gcmVxdWlyZSgnLi9idWlsdGlucycpXG5cbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbiwgdmFyaWFibGVzKSB7XG4gIGlmIChleHByZXNzaW9uWzBdID09PSBDLkNPTU1FTlQpIHtcbiAgICByZXR1cm5cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uIGluc3RhbmNlb2YgQXJyYXkgJiZcbiAgICAgICAgICAgICBleHByZXNzaW9uLmV2ZXJ5KGUgPT4gZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIHJldHVybiBldmFsdWF0ZUVhY2hFeHByZXNzaW9uKHZhcmlhYmxlcywgZXhwcmVzc2lvbilcbiAgfSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5WQVJJQUJMRV9JREVOVElGSUVSICYmIGV4cHJlc3Npb25bMV0gPT09ICdlbnZpcm9ubWVudCcpIHtcbiAgICByZXR1cm4gbmV3IGxpYi5MRW52aXJvbm1lbnQodmFyaWFibGVzKVxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuRlVOQ1RJT05fQ0FMTCkge1xuICAgIC8vIENhbGwgYSBmdW5jdGlvbjogXCJmdW5jdGlvbihhcmcxLCBhcmcyLCBhcmczLi4uKVwiXG5cbiAgICAvLyBHZXQgdGhlIGZ1bmN0aW9uIGFuZCBhcmd1bWVudCBleHByZXNzaW9ucyBmcm9tIHRoZSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgZm5FeHByZXNzaW9uID0gZXhwcmVzc2lvblsxXVxuICAgIGNvbnN0IGFyZ0V4cHJlc3Npb25zID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIGZ1bmN0aW9uIGV4cHJlc3Npb24gdG8gZ2V0IHRoZSBhY3R1YWwgZnVuY3Rpb24uXG4gICAgY29uc3QgZm4gPSBldmFsdWF0ZUV4cHJlc3Npb24oZm5FeHByZXNzaW9uLCB2YXJpYWJsZXMpXG5cbiAgICBpZiAoIShmbiBpbnN0YW5jZW9mIGxpYi5MRnVuY3Rpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGNhbGwgJHtjaGFsay5jeWFuKGZuKX0gYmVjYXVzZSBpdCdzIG5vdCBhIGZ1bmN0aW9uYClcbiAgICB9XG5cbiAgICAvKiBUaGlzIGNvZGUgKnVzZWQqIHRvIHdvcmsgYnV0IGl0IGRvZXNuJ3QgYW55IG1vcmUsIGJlY2F1c2Ugc29tZVxuICAgICAqIHBhcmFtZXRlcnMgb2YgdGhlIGZ1bmN0aW9uIGNvdWxkIGJlIHVuZXZhbHVhdGVkLiBOb3cgYXJndW1lbnQgZXZhbHVhdGlvblxuICAgICAqIGlzIGRvbmUgZnJvbSB3aXRoaW4gdGhlIGNhbGwgbWV0aG9kIG9mIHRoZSBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICAvLyBFdmFsdWF0ZSBhbGwgb2YgdGhlIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uLlxuICAgIC8vY29uc3QgYXJncyA9IGFyZ0V4cHJlc3Npb25zLm1hcChhcmcgPT4gZXZhbHVhdGVFeHByZXNzaW9uKGFyZywgdmFyaWFibGVzKSk7XG4gICAgZm4uYXJndW1lbnRTY29wZSA9IHZhcmlhYmxlc1xuICAgIGNvbnN0IGFyZ3MgPSBhcmdFeHByZXNzaW9uc1xuXG4gICAgLy8gVXNlIGxpYi5jYWxsIHRvIGNhbGwgdGhlIGZ1bmN0aW9uIHdpdGggdGhlIGV2YWx1YXRlZCBhcmd1bWVudHMuXG4gICAgcmV0dXJuIGxpYi5jYWxsKGZuLCBhcmdzKVxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuVkFSSUFCTEVfSURFTlRJRklFUikge1xuICAgIC8vIEdldCBhIHZhcmlhYmxlOiBcIm5hbWVcIlxuXG4gICAgLy8gR2V0IHRoZSBuYW1lIGZyb20gdGhlIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBuYW1lID0gZXhwcmVzc2lvblsxXVxuXG4gICAgLy8gUmV0dXJuIHRoZSB2YXJpYWJsZSdzIHZhbHVlLCBvciwgaWYgdGhlIHZhcmlhYmxlIGRvZXNuJ3QgZXhpc3QsIHRocm93IGFuXG4gICAgLy8gZXJyb3IuXG4gICAgaWYgKG5hbWUgaW4gdmFyaWFibGVzKSB7XG4gICAgICByZXR1cm4gdmFyaWFibGVzW25hbWVdLnZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZJWE1FOiBDaGFuZ2UgdGhpcyBtZXNzYWdlIG5vdCB0byBpbmNsdWRlICphbGwqIHRoZSB2YXJpYWJsZXMgd2l0aGluXG4gICAgICAvLyB0aGUgc2NvcGU7IG1heWJlIGp1c3Qgc2F5IFwidmFyaWFibGUgKG5hbWUpIG5vdCBmb3VuZFwiP1xuICAgICAgdGhyb3cgYHZhcmlhYmxlICR7bmFtZX0gbm90IGluIFske09iamVjdC5rZXlzKHZhcmlhYmxlcyl9XWBcbiAgICB9XG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5WQVJJQUJMRV9BU1NJR04pIHtcbiAgICAvLyBTZXQgYSB2YXJpYWJsZSB0byBhIHZhbHVlOiBcIm5hbWUgPT4gdmFsdWVcIlxuXG4gICAgLy8gR2V0IHRoZSBuYW1lIGFuZCB2YWx1ZSBleHByZXNzaW9uIGZyb20gdGhlIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBuYW1lID0gZXhwcmVzc2lvblsxXVxuICAgIGNvbnN0IHZhbHVlRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25bMl1cblxuICAgIC8vIEV2YWx1YXRlIHRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgY29uc3QgdmFsdWUgPSBldmFsdWF0ZUV4cHJlc3Npb24odmFsdWVFeHByZXNzaW9uLCB2YXJpYWJsZXMpXG5cbiAgICAvLyBTZXQgdGhlIHZhcmlhYmxlIGluIHRoZSB2YXJpYWJsZXMgb2JqZWN0IHRvIGEgbmV3IHZhcmlhYmxlIHdpdGggdGhlXG4gICAgLy8gZXZhbHVhdGVkIHZhbHVlLlxuICAgIHZhcmlhYmxlc1tuYW1lXSA9IG5ldyBsaWIuVmFyaWFibGUodmFsdWUpXG4gICAgcmV0dXJuXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5WQVJJQUJMRV9DSEFOR0UpIHtcbiAgICAvLyBDaGFuZ2UgYSB2YXJpYWJsZSB0byBhIG5ldyB2YWx1ZTogXCJuYW1lIC0+IG5ld1ZhbHVlXCJcblxuICAgIC8vIEdldCB0aGUgbmFtZSBhbmQgdmFsdWUgZXhwcmVzc2lvbiBmcm9tIHRoZSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgbmFtZSA9IGV4cHJlc3Npb25bMV1cbiAgICBjb25zdCB2YWx1ZUV4cHJlc3Npb24gPSBleHByZXNzaW9uWzJdXG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgbmV3IHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICBjb25zdCB2YWx1ZSA9IGV2YWx1YXRlRXhwcmVzc2lvbih2YWx1ZUV4cHJlc3Npb24sIHZhcmlhYmxlcylcblxuICAgIC8vIENoYW5nZSB0aGUgdmFsdWUgb2YgdGhlIGFscmVhZHkgZGVmaW5lZCB2YXJpYWJsZS5cbiAgICB2YXJpYWJsZXNbbmFtZV0udmFsdWUgPSB2YWx1ZVxuICAgIHJldHVyblxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuRlVOQ1RJT05fUFJJTSkge1xuICAgIC8vIEEgZnVuY3Rpb24gbGl0ZXJhbDogXCJmbihhcmcxLCBhcmcyLCBhcmczLi4uKSB7IGNvZGUgfVwiXG5cbiAgICAvLyBHZXQgdGhlIGNvZGUgYW5kIHBhcmFtYXRlcnMgZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IHBhcmFtYXRlcnMgPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgY29kZSA9IGV4cHJlc3Npb25bMl1cblxuICAgIC8vIENyZWF0ZSB0aGUgZnVuY3Rpb24gdXNpbmcgdGhlIGdpdmVuIGNvZGUuXG4gICAgY29uc3QgZm4gPSBuZXcgbGliLkxGdW5jdGlvbihjb2RlKVxuXG4gICAgLy8gU2V0IHRoZSBzY29wZSB2YXJpYWJsZXMgZm9yIHRoZSBmdW5jdGlvbiB0byBhIGNvcHkgb2YgdGhlIGN1cnJlbnRcbiAgICAvLyB2YXJpYWJsZXMuXG4gICAgZm4uc2V0U2NvcGVWYXJpYWJsZXMoT2JqZWN0LmFzc2lnbih7fSwgdmFyaWFibGVzKSlcblxuICAgIC8vIFNldCB0aGUgcGFyYW1hdGVycyBmb3IgdGhlIGZ1bmN0aW9uIHRvIHRoZSBwYXJhbWF0ZXJzIHRha2VuIGZyb20gdGhlXG4gICAgLy8gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGZuLnNldFBhcmFtYXRlcnMocGFyYW1hdGVycylcblxuICAgIC8vIFJldHVybiB0aGUgZnVuY3Rpb24uXG4gICAgcmV0dXJuIGZuXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5TSE9SVEhBTkRfRlVOQ1RJT05fUFJJTSkge1xuICAgIGNvbnN0IHBhcmFtYXRlcnMgPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgY29kZUV4cHJlc3Npb24gPSBleHByZXNzaW9uWzJdXG4gICAgY29uc3QgZm4gPSBuZXcgbGliLkxGdW5jdGlvbihjb2RlRXhwcmVzc2lvbilcbiAgICBmbi5pc1Nob3J0aGFuZCA9IHRydWVcbiAgICBmbi5zZXRTY29wZVZhcmlhYmxlcyhPYmplY3QuYXNzaWduKHt9LCB2YXJpYWJsZXMpKVxuICAgIGZuLnNldFBhcmFtYXRlcnMocGFyYW1hdGVycylcbiAgICByZXR1cm4gZm5cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLlNUUklOR19QUklNKSB7XG4gICAgLy8gU3RyaW5nIGxpdGVyYWw6IFwiY29udGVudHNcIlxuXG4gICAgLy8gR2V0IHN0cmluZyBmcm9tIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBzdHJpbmcgPSBleHByZXNzaW9uWzFdXG5cbiAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBhIGxhbmd1YWdlLXVzYWJsZSBzdHJpbmcsIGFuZCByZXR1cm4uXG4gICAgcmV0dXJuIGxpYi50b0xTdHJpbmcoc3RyaW5nKVxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuQk9PTEVBTl9QUklNKSB7XG4gICAgLy8gQm9vbGVhbiBsaXRlcmFsOiB0cnVlL2ZhbHNlXG5cbiAgICAvLyBHZXQgYm9vbGVhbiB2YWx1ZSBmcm9tIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBib29sID0gZXhwcmVzc2lvblsxXVxuXG4gICAgLy8gQ29udmVydCBib29sZWFuIHZhbHVlIHRvIGEgbGFuZ3VhZ2UtdXNhYmxlIGJvb2xlYW4sIGFuZCByZXR1cm4uXG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGJvb2wpXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5OVU1CRVJfUFJJTSkge1xuICAgIC8vIE51bWJlciBwcmltaXRpdmU6IDEsIDIsIDMsIDQsIDcuMjUsIC0zLCBldGMuXG5cbiAgICAvLyBHZXQgbnVtYmVyIHZhbHVlIGZyb20gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG51bWJlciA9IGV4cHJlc3Npb25bMV1cblxuICAgIC8vIENvbnZlcnQgbnVtYmVyIHZhbHVlIHRvIGEgbGFuZ3VhZ2UtdXNhYmxlIG51bWJlciwgYW5kIHJldHVybi5cbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihudW1iZXIpXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5TRVRfUFJPUF9VU0lOR19JREVOVElGSUVSKSB7XG4gICAgLy8gU2V0IGEgcHJvcGVydHkgb2YgYW4gb2JqZWN0IHVzaW5nIGFuIGlkZW50aWZpZXIgbGl0ZXJhbDpcbiAgICAvLyBcIm9iai5rZXkgPiB2YWx1ZVwiXG5cbiAgICAvLyBHZXQgb2JqZWN0IGV4cHJlc3Npb24sIGtleSwgYW5kIHZhbHVlIGV4cHJlc3Npb24gZnJvbSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3Qgb2JqRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25bMV1cbiAgICBjb25zdCBrZXkgPSBleHByZXNzaW9uWzJdXG4gICAgY29uc3QgdmFsdWVFeHByZXNzaW9uID0gZXhwcmVzc2lvblszXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIG9iamVjdCBhbmQgdmFsdWUgZXhwcmVzc2lvbnMuXG4gICAgY29uc3Qgb2JqID0gZXZhbHVhdGVFeHByZXNzaW9uKG9iakV4cHJlc3Npb24sIHZhcmlhYmxlcylcbiAgICBjb25zdCB2YWx1ZSA9IGV2YWx1YXRlRXhwcmVzc2lvbih2YWx1ZUV4cHJlc3Npb24sIHZhcmlhYmxlcylcblxuICAgIC8vIFVzZSBsaWIuc2V0IHRvIHNldCB0aGUgcHJvcGVydHkgb2YgdGhlIGV2YWx1YXRlZCBvYmplY3QuXG4gICAgbGliLnNldChvYmosIGtleSwgdmFsdWUpXG4gICAgcmV0dXJuXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5HRVRfUFJPUF9VU0lOR19JREVOVElGSUVSKSB7XG4gICAgLy8gR2V0IGEgcHJvcGVydHkgb2YgYW4gb2JqZWN0IHVzaW5nIGFuIGlkZW50aWZpZXIgbGl0ZXJhbDogXCJvYmoua2V5XCJcblxuICAgIC8vIEdldCBvYmplY3QgZXhwcmVzc2lvbiBhbmQga2V5IGZyb20gdGhlIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBvYmpFeHByZXNzaW9uID0gZXhwcmVzc2lvblsxXVxuICAgIGNvbnN0IGtleSA9IGV4cHJlc3Npb25bMl1cblxuICAgIC8vIEV2YWx1YXRlIHRoZSBvYmplY3QgZXhwcmVzc2lvbi5cbiAgICBjb25zdCBvYmogPSBldmFsdWF0ZUV4cHJlc3Npb24ob2JqRXhwcmVzc2lvbiwgdmFyaWFibGVzKVxuXG4gICAgLy8gR2V0IHRoZSB2YWx1ZSBmcm9tIGxpYi5nZXQuXG4gICAgY29uc3QgdmFsdWUgPSBsaWIuZ2V0KG9iaiwga2V5KVxuXG4gICAgLy8gUmV0dXJuIHRoZSBnb3R0ZW4gdmFsdWUuXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGV4cHJlc3Npb24gdHlwZTogJHtleHByZXNzaW9uWzBdfWApXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlR2V0UHJvcFVzaW5nSWRlbnRpZmllcih2YXJpYWJsZXMsIFtfLCBvYmpFeHByLCBrZXldKSB7XG4gIGxldCBvYmogPSBldmFsdWF0ZUV4cHJlc3Npb24ob2JqRXhwciwgdmFyaWFibGVzKVxuICByZXR1cm4gbGliLmdldChvYmosIGtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlRWFjaEV4cHJlc3Npb24odmFyaWFibGVzLCBleHByZXNzaW9ucykge1xuICByZXR1cm4gZXhwcmVzc2lvbnMubWFwKGUgPT4gZXZhbHVhdGVFeHByZXNzaW9uKGUsIHZhcmlhYmxlcykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnAoYXN0LCBkaXIpIHtcbiAgaWYgKGFzdCkge1xuICAgIGxldCB2YXJpYWJsZXMgPSB7fVxuXG4gICAgT2JqZWN0LmFzc2lnbih2YXJpYWJsZXMsIGJ1aWx0aW5zLm1ha2VCdWlsdGlucyhkaXIpKVxuXG4gICAgbGV0IHJlc3VsdCA9IGV2YWx1YXRlRWFjaEV4cHJlc3Npb24odmFyaWFibGVzLCBhc3QpXG5cbiAgICByZXR1cm4geyByZXN1bHQsIHZhcmlhYmxlcyB9XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcignSGFoYSwgeW91IGRpZG5cXCd0IHBhc3MgbWUgYSB0cmVlIScpXG4gIH1cbn1cbiJdfQ==