/**
 * Optimized parser for tokenized JSON-like structures
 * Maintains all original functionality while improving performance
 */

const { 
    TRUE_ALIAS, 
    FALSE_ALIAS, 
    NULL_ALIAS, 
    UNDEFINED_ALIAS, 
    TOKEN_TYPES, 
    CONTAINER_TYPES, 
    RADIX 
} = require('./constants');

/**
 * Parse tokens into JavaScript objects/values
 * @param {Array} tokens - Array of token objects from tokenizer
 * @returns {*} Parsed JavaScript value
 */
function parse(tokens) {
    const stacks = [];
    let currentContainer = null;
    const tokenLength = tokens.length;

    for (let i = 0; i < tokenLength; i++) {
        const token = tokens[i];
        
        // Handle bracket tokens (container creation/closing)
        if (token.type === TOKEN_TYPES.BRACKET) {
            const result = handleBracketToken(token, currentContainer, stacks, tokens, i, tokenLength);
            
            if (result.shouldReturn) {
                return result.value;
            }
            
            if (result.newContainer !== undefined) {
                currentContainer = result.newContainer;
            }
            
            if (result.skipNext) {
                i++; // Skip next comma
            }
            
            continue;
        }

        // Handle object key parsing
        if (currentContainer && 
            currentContainer.type === CONTAINER_TYPES.OBJECT && 
            currentContainer._key === undefined) {
            
            const keyResult = handleObjectKey(token);
            if (keyResult.isKey) {
                currentContainer._key = keyResult.key;
                continue;
            } else if (keyResult.shouldContinue) {
                continue;
            } else if (keyResult.shouldThrow) {
                throw new Error(`Unexpected token "${token.value}" when expecting a key in an object`);
            }
        }

        // Handle punctuation tokens
        if (token.type === TOKEN_TYPES.PUNCTUATION) {
            const punctuationResult = handlePunctuationToken(token, tokens, i, tokenLength, currentContainer, stacks);
            
            if (punctuationResult.shouldThrow) {
                throw new Error('Unexpected punctuation outside of object or array context');
            }
            
            if (punctuationResult.shouldContinue) {
                continue;
            }
        }

        // Parse value tokens
        const value = parseValueToken(token);

        // Assign value to current container or return if top-level
        const assignResult = assignValue(value, currentContainer, tokens, i, tokenLength);
        
        if (assignResult.shouldReturn) {
            return assignResult.value;
        }
        
        if (assignResult.skipNext) {
            i++; // Skip next comma
        }
    }

    // Handle unclosed containers (same as original)
    return handleUnclosedContainers(stacks, currentContainer);
}

/**
 * Handle bracket tokens for container creation and closing
 * @param {Object} token - Current token
 * @param {Object} currentContainer - Current container context
 * @param {Array} stacks - Container stack
 * @param {Array} tokens - All tokens
 * @param {number} index - Current token index
 * @param {number} tokenLength - Total token count
 * @returns {Object} Result object with action instructions
 */
function handleBracketToken(token, currentContainer, stacks, tokens, index, tokenLength) {
    if (token.value === '{') {
        return createObjectContainer(currentContainer, stacks);
    } else if (token.value === '}') {
        return closeContainer(stacks, tokens, index, tokenLength, 'Unmatched closing brace "}"');
    } else if (token.value === '[') {
        return createArrayContainer(currentContainer, stacks);
    } else if (token.value === ']') {
        return closeContainer(stacks, tokens, index, tokenLength, 'Unmatched closing bracket "]"');
    }
    
    return { shouldReturn: false };
}

/**
 * Create new object container
 * @param {Object} currentContainer - Current container context
 * @param {Array} stacks - Container stack
 * @returns {Object} Result object
 */
function createObjectContainer(currentContainer, stacks) {
    const newContainer = {
        type: CONTAINER_TYPES.OBJECT,
        value: {}
    };
    
    // Add to parent container if exists (same logic as original)
    if (currentContainer) {
        if (currentContainer.type === CONTAINER_TYPES.OBJECT && currentContainer._key !== undefined) {
            currentContainer.value[currentContainer._key] = newContainer.value;
            delete currentContainer._key;
        } else if (currentContainer.type === CONTAINER_TYPES.ARRAY) {
            currentContainer.value.push(newContainer.value);
        }
    }
    
    stacks.push(newContainer);
    return { shouldReturn: false, newContainer };
}

/**
 * Create new array container
 * @param {Object} currentContainer - Current container context
 * @param {Array} stacks - Container stack
 * @returns {Object} Result object
 */
function createArrayContainer(currentContainer, stacks) {
    const newContainer = {
        type: CONTAINER_TYPES.ARRAY,
        value: []
    };
    
    // Add to parent container if exists (same logic as original)
    if (currentContainer) {
        if (currentContainer.type === CONTAINER_TYPES.OBJECT && currentContainer._key !== undefined) {
            currentContainer.value[currentContainer._key] = newContainer.value;
            delete currentContainer._key;
        } else if (currentContainer.type === CONTAINER_TYPES.ARRAY) {
            currentContainer.value.push(newContainer.value);
        }
    }
    
    stacks.push(newContainer);
    return { shouldReturn: false, newContainer };
}

/**
 * Close current container
 * @param {Array} stacks - Container stack
 * @param {Array} tokens - All tokens
 * @param {number} index - Current token index
 * @param {number} tokenLength - Total token count
 * @param {string} errorMessage - Error message if unmatched
 * @returns {Object} Result object
 */
function closeContainer(stacks, tokens, index, tokenLength, errorMessage) {
    if (stacks.length > 0) {
        const completedContainer = stacks.pop();
        
        if (stacks.length > 0) {
            const skipNext = (index + 1 < tokenLength && tokens[index + 1].value === ',');
            return { 
                shouldReturn: false, 
                newContainer: stacks[stacks.length - 1],
                skipNext 
            };
        } else {
            return { 
                shouldReturn: true, 
                value: completedContainer.value 
            };
        }
    } else {
        throw new Error(errorMessage);
    }
}

/**
 * Handle object key parsing
 * @param {Object} token - Current token
 * @returns {Object} Result object
 */
function handleObjectKey(token) {
    switch (token.type) {
        case TOKEN_TYPES.STRING:
            return { isKey: true, key: parseStringValue(token) };
            
        case TOKEN_TYPES.NUMBER:
        case TOKEN_TYPES.IDENTIFIER:
            // For number keys, include negative sign if present (same as original)
            if (token.type === TOKEN_TYPES.NUMBER && token.isNegative) {
                return { isKey: true, key: '-' + token.value };
            } else {
                return { isKey: true, key: token.value };
            }
            
        case TOKEN_TYPES.PUNCTUATION:
            if (token.value === ',') {
                // Skip consecutive commas in objects (same as original)
                return { shouldContinue: true };
            }
            return { shouldThrow: true };
            
        default:
            return { shouldThrow: true };
    }
}

/**
 * Handle punctuation tokens
 * @param {Object} token - Current token
 * @param {Array} tokens - All tokens
 * @param {number} index - Current token index
 * @param {number} tokenLength - Total token count
 * @param {Object} currentContainer - Current container context
 * @param {Array} stacks - Container stack
 * @returns {Object} Result object
 */
function handlePunctuationToken(token, tokens, index, tokenLength, currentContainer, stacks) {
    if (stacks.length === 0) {
        return { shouldThrow: true };
    }

    if (token.value === ',') {
        // Same comma handling as original
        if (currentContainer && currentContainer.type === CONTAINER_TYPES.ARRAY) {
            currentContainer.value.push(null);
        }
        return { shouldContinue: true };
    } else if (token.value === ':') {
        // Check for missing value after colon (same as original)
        if (index + 1 < tokenLength) {
            const nextToken = tokens[index + 1];
            if (nextToken.value === ',' || nextToken.value === '}') {
                // Missing value after colon, insert null
                if (currentContainer && 
                    currentContainer.type === CONTAINER_TYPES.OBJECT && 
                    currentContainer._key !== undefined) {
                    currentContainer.value[currentContainer._key] = null;
                    delete currentContainer._key;
                }
            }
        } else {
            // Colon at end of input, insert null
            if (currentContainer && 
                currentContainer.type === CONTAINER_TYPES.OBJECT && 
                currentContainer._key !== undefined) {
                currentContainer.value[currentContainer._key] = null;
                delete currentContainer._key;
            }
        }
        return { shouldContinue: true };
    }
    
    return { shouldContinue: true };
}

/**
 * Parse value from token
 * @param {Object} token - Token to parse
 * @returns {*} Parsed value
 */
function parseValueToken(token) {
    switch (token.type) {
        case TOKEN_TYPES.IDENTIFIER:
            return parseIdentifierValue(token);
            
        case TOKEN_TYPES.STRING:
            return parseStringValue(token);
            
        case TOKEN_TYPES.NUMBER:
            return parseNumberValue(token);
            
        default:
            return null;
    }
}

/**
 * Parse identifier value with alias support
 * @param {Object} token - Identifier token
 * @returns {*} Parsed value
 */
function parseIdentifierValue(token) {
    const tokenValue = token.value;
    const tokenValueLower = tokenValue.toLowerCase();
    
    // Same alias handling as original
    if (TRUE_ALIAS.has(tokenValueLower)) {
        return true;
    } else if (FALSE_ALIAS.has(tokenValueLower)) {
        return false;
    } else if (NULL_ALIAS.has(tokenValueLower)) {
        return null;
    } else if (UNDEFINED_ALIAS.has(tokenValueLower)) {
        return undefined;
    } else {
        // Same error message as original
        throw new Error(`Unexpected identifier "${tokenValue}" in value position. Only recognized constants (true, false, null, undefined, etc.) are allowed.`);
    }
}

/**
 * Parse string value with control character escaping
 * @param {Object} token - String token
 * @returns {string} Parsed string value
 */
function parseStringValue(token) {
    // Same string escape handling as original
    let stringValue = token.value;
    
    // Escape unescaped control characters (ASCII 0-31) using \u format
    stringValue = stringValue.replace(/[\x00-\x1F]/g, function(match) {
        const code = match.charCodeAt(0);
        // Use \u format for all control characters
        return '\\u' + ('000' + code.toString(16)).slice(-4);
    });
    
    return JSON.parse(stringValue);
}

/**
 * Parse number value with radix support
 * @param {Object} token - Number token
 * @returns {number} Parsed number value
 */
function parseNumberValue(token) {
    const numValue = token.value;
    let value;
    
    // Same number parsing logic as original
    if (token.radix === RADIX.HEXADECIMAL) {
        // Hexadecimal
        value = parseInt(numValue, 16);
    } else if (token.radix === RADIX.OCTAL) {
        // Octal - parse without prefix
        value = parseInt(numValue.slice(2), 8);
    } else if (token.radix === RADIX.BINARY) {
        // Binary - parse without prefix
        value = parseInt(numValue.slice(2), 2);
    } else {
        // Decimal (including scientific notation)
        value = parseFloat(numValue);
    }
    
    if (token.isNegative) {
        value = -value;
    }
    
    return value;
}

/**
 * Assign parsed value to container or return as top-level value
 * @param {*} value - Parsed value
 * @param {Object} currentContainer - Current container context
 * @param {Array} tokens - All tokens
 * @param {number} index - Current token index
 * @param {number} tokenLength - Total token count
 * @returns {Object} Result object
 */
function assignValue(value, currentContainer, tokens, index, tokenLength) {
    // Same value assignment logic as original
    if (currentContainer) {
        if (currentContainer.type === CONTAINER_TYPES.OBJECT) {
            currentContainer.value[currentContainer._key] = value;
            delete currentContainer._key;
        } else {
            currentContainer.value.push(value);
        }
        
        const skipNext = (index + 1 < tokenLength && tokens[index + 1].value === ',');
        return { shouldReturn: false, skipNext };
    } else {
        return { shouldReturn: true, value };
    }
}

/**
 * Handle unclosed containers at end of parsing
 * @param {Array} stacks - Container stack
 * @param {Object} currentContainer - Current container context
 * @returns {*} Final parsed value
 */
function handleUnclosedContainers(stacks, currentContainer) {
    // Same ending logic as original
    if (stacks.length > 0) {
        // Handle any pending keys with null values
        if (currentContainer && 
            currentContainer.type === CONTAINER_TYPES.OBJECT && 
            currentContainer._key !== undefined) {
            currentContainer.value[currentContainer._key] = null;
            delete currentContainer._key;
        }
        return stacks[0].value;
    }

    // If no containers and no values were processed, return undefined
    return undefined;
}

module.exports = {
    parse
};
