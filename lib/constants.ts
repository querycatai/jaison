/**
 * Constants and aliases for jaison parser
 */

// Boolean aliases for flexible parsing
export const TRUE_ALIAS = new Set(['t', 'tr', 'tru', 'true']);
export const FALSE_ALIAS = new Set(['f', 'fa', 'fal', 'fals', 'false']);

// Null value aliases
export const NULL_ALIAS = new Set(['n', 'nu', 'nul', 'null', 'no', 'non', 'none', 'nil', 'nill']);

// Undefined value aliases  
export const UNDEFINED_ALIAS = new Set(['u', 'un', 'und', 'unde', 'undef', 'undefi', 'undefin', 'undefined']);

// Token types
export const TOKEN_TYPES = {
    STRING: 'string',
    BRACKET: 'bracket',
    PUNCTUATION: 'punctuation', 
    NUMBER: 'number',
    IDENTIFIER: 'identifier',
    COMMENT: 'comment'
} as const;

// Container types
export const CONTAINER_TYPES = {
    OBJECT: 'object',
    ARRAY: 'array'
} as const;

// Number radix constants
export const RADIX = {
    BINARY: 2,
    OCTAL: 8,
    DECIMAL: 10,
    HEXADECIMAL: 16
} as const;
