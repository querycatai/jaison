/**
 * Constants and aliases for jaison parser
 */

// Boolean aliases for flexible parsing
const TRUE_ALIAS = new Set(['t', 'tr', 'tru', 'true']);
const FALSE_ALIAS = new Set(['f', 'fa', 'fal', 'fals', 'false']);

// Null value aliases
const NULL_ALIAS = new Set(['n', 'nu', 'nul', 'null', 'no', 'non', 'none', 'nil', 'nill']);

// Undefined value aliases  
const UNDEFINED_ALIAS = new Set(['u', 'un', 'und', 'unde', 'undef', 'undefi', 'undefin', 'undefined']);

// Token types
const TOKEN_TYPES = {
    STRING: 'string',
    BRACKET: 'bracket',
    PUNCTUATION: 'punctuation', 
    NUMBER: 'number',
    IDENTIFIER: 'identifier',
    COMMENT: 'comment'
};

// Container types
const CONTAINER_TYPES = {
    OBJECT: 'object',
    ARRAY: 'array'
};

// Number radix constants
const RADIX = {
    BINARY: 2,
    OCTAL: 8,
    DECIMAL: 10,
    HEXADECIMAL: 16
};

module.exports = {
    TRUE_ALIAS,
    FALSE_ALIAS,
    NULL_ALIAS,
    UNDEFINED_ALIAS,
    TOKEN_TYPES,
    CONTAINER_TYPES,
    RADIX
};
