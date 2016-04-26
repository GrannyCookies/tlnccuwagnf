'use strict';

var allExports = {};

var defineConstant = function defineConstant(name) {
  allExports[name] = name;
};

defineConstant('BOOLEAN_PRIM');
defineConstant('COMMENT');
defineConstant('FUNCTION_CALL');
defineConstant('FUNCTION_PRIM');
defineConstant('GET_PROP_USING_IDENTIFIER');
defineConstant('NUMBER_PRIM');
defineConstant('SET_PROP_USING_IDENTIFIER');
defineConstant('STRING_PRIM');
defineConstant('SHORTHAND_FUNCTION_PRIM');
defineConstant('VARIABLE_ASSIGN');
defineConstant('VARIABLE_CHANGE');
defineConstant('VARIABLE_IDENTIFIER');

// Characters that can't be used as parts of identifiers.
allExports.SPECIAL_CHARS = '(){}=>\'" .:;#';

// Words that can't be used as identifiers.
allExports.KEYWORDS = ['true', 'false'];

module.exports = allExports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnN0YW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksYUFBYSxFQUFqQjs7QUFFQSxJQUFNLGlCQUFpQixTQUFqQixjQUFpQixDQUFTLElBQVQsRUFBZTtBQUNwQyxhQUFXLElBQVgsSUFBbUIsSUFBbkI7QUFDRCxDQUZEOztBQUlBLGVBQWUsY0FBZjtBQUNBLGVBQWUsU0FBZjtBQUNBLGVBQWUsZUFBZjtBQUNBLGVBQWUsZUFBZjtBQUNBLGVBQWUsMkJBQWY7QUFDQSxlQUFlLGFBQWY7QUFDQSxlQUFlLDJCQUFmO0FBQ0EsZUFBZSxhQUFmO0FBQ0EsZUFBZSx5QkFBZjtBQUNBLGVBQWUsaUJBQWY7QUFDQSxlQUFlLGlCQUFmO0FBQ0EsZUFBZSxxQkFBZjs7O0FBR0EsV0FBVyxhQUFYLEdBQTJCLGdCQUEzQjs7O0FBR0EsV0FBVyxRQUFYLEdBQXNCLENBQUMsTUFBRCxFQUFTLE9BQVQsQ0FBdEI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQWpCIiwiZmlsZSI6ImNvbnN0YW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImxldCBhbGxFeHBvcnRzID0ge31cblxuY29uc3QgZGVmaW5lQ29uc3RhbnQgPSBmdW5jdGlvbihuYW1lKSB7XG4gIGFsbEV4cG9ydHNbbmFtZV0gPSBuYW1lXG59XG5cbmRlZmluZUNvbnN0YW50KCdCT09MRUFOX1BSSU0nKVxuZGVmaW5lQ29uc3RhbnQoJ0NPTU1FTlQnKVxuZGVmaW5lQ29uc3RhbnQoJ0ZVTkNUSU9OX0NBTEwnKVxuZGVmaW5lQ29uc3RhbnQoJ0ZVTkNUSU9OX1BSSU0nKVxuZGVmaW5lQ29uc3RhbnQoJ0dFVF9QUk9QX1VTSU5HX0lERU5USUZJRVInKVxuZGVmaW5lQ29uc3RhbnQoJ05VTUJFUl9QUklNJylcbmRlZmluZUNvbnN0YW50KCdTRVRfUFJPUF9VU0lOR19JREVOVElGSUVSJylcbmRlZmluZUNvbnN0YW50KCdTVFJJTkdfUFJJTScpXG5kZWZpbmVDb25zdGFudCgnU0hPUlRIQU5EX0ZVTkNUSU9OX1BSSU0nKVxuZGVmaW5lQ29uc3RhbnQoJ1ZBUklBQkxFX0FTU0lHTicpXG5kZWZpbmVDb25zdGFudCgnVkFSSUFCTEVfQ0hBTkdFJylcbmRlZmluZUNvbnN0YW50KCdWQVJJQUJMRV9JREVOVElGSUVSJylcblxuLy8gQ2hhcmFjdGVycyB0aGF0IGNhbid0IGJlIHVzZWQgYXMgcGFydHMgb2YgaWRlbnRpZmllcnMuXG5hbGxFeHBvcnRzLlNQRUNJQUxfQ0hBUlMgPSAnKCl7fT0+XFwnXCIgLjo7IydcblxuLy8gV29yZHMgdGhhdCBjYW4ndCBiZSB1c2VkIGFzIGlkZW50aWZpZXJzLlxuYWxsRXhwb3J0cy5LRVlXT1JEUyA9IFsndHJ1ZScsICdmYWxzZSddXG5cbm1vZHVsZS5leHBvcnRzID0gYWxsRXhwb3J0c1xuIl19