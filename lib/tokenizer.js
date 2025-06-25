/**
 * Optimized tokenizer for JSON-like strings
 * Replaces complex regex with manual character-by-character parsing
 */

const { TOKEN_TYPES, RADIX } = require('./constants');

/**
 * Tokenize JSON string using optimized manual parsing
 * @param {string} jsonString - Input string to tokenize
 * @returns {Array} Array of token objects
 */
function tokenize(jsonString) {
    const tokens = [];
    const len = jsonString.length;
    let pos = 0;

    while (pos < len) {
        const char = jsonString[pos];
        
        // Skip whitespace - optimized check
        if (char <= ' ') {
            pos++;
            continue;
        }
        
        // Skip comments (both single-line and multi-line)
        if (char === '/') {
            const commentResult = skipComment(jsonString, pos);
            if (commentResult.isComment) {
                pos = commentResult.newPos;
                continue;
            }
        }
        
        // String tokens (both double and single quotes)
        if (char === '"' || char === "'") {
            const stringToken = parseStringToken(jsonString, pos);
            tokens.push(stringToken.token);
            pos = stringToken.newPos;
            continue;
        }
        
        // Bracket tokens
        if (char === '{' || char === '}' || char === '[' || char === ']') {
            tokens.push({
                type: TOKEN_TYPES.BRACKET,
                value: char
            });
            pos++;
            continue;
        }
        
        // Punctuation tokens (including Chinese punctuation)
        if (char === ',' || char === ':' || char === '：' || char === '，') {
            const punctuationToken = parsePunctuationToken(char);
            tokens.push(punctuationToken);
            pos++;
            continue;
        }
        
        // Number tokens (with proper radix and negative sign tracking)
        if ((char >= '0' && char <= '9') || char === '-') {
            const numberToken = parseNumberToken(jsonString, pos);
            tokens.push(numberToken.token);
            pos = numberToken.newPos;
            continue;
        }
        
        // Identifier tokens
        const identifierToken = parseIdentifierToken(jsonString, pos);
        if (identifierToken.token) {
            tokens.push(identifierToken.token);
        }
        pos = identifierToken.newPos;
    }
    
    return tokens;
}

/**
 * Parse string token with proper escape handling for both single and double quotes
 * @param {string} jsonString - Input string
 * @param {number} startPos - Starting position
 * @returns {Object} Token and new position
 */
function parseStringToken(jsonString, startPos) {
    const len = jsonString.length;
    const quoteChar = jsonString[startPos]; // Can be " or '
    let pos = startPos + 1; // Skip opening quote
    
    while (pos < len) {
        const c = jsonString[pos];
        if (c === quoteChar) {
            pos++; // Include closing quote
            break;
        } else if (c === '\\') {
            pos += 2; // Skip escape sequence
        } else {
            pos++;
        }
    }
    
    let tokenValue = jsonString.slice(startPos, pos);
    
    // Handle missing closing quote (same as original logic)
    if (!tokenValue.endsWith(quoteChar)) {
        tokenValue += quoteChar;
    }
    
    // Normalize single quotes to double quotes for JSON compatibility
    if (quoteChar === "'") {
        // Properly handle single quote strings by escaping internal double quotes
        // and converting outer quotes
        const innerContent = tokenValue.slice(1, -1); // Remove outer quotes
        
        // Manually scan and escape unescaped double quotes
        let escapedContent = '';
        for (let i = 0; i < innerContent.length; i++) {
            const char = innerContent[i];
            if (char === '"') {
                // Check if this quote is already escaped
                if (i === 0 || innerContent[i - 1] !== '\\') {
                    escapedContent += '\\"'; // Escape unescaped double quote
                } else {
                    escapedContent += char; // Keep already escaped quote
                }
            } else {
                escapedContent += char;
            }
        }
        
        tokenValue = '"' + escapedContent + '"';
    }
    
    return {
        token: {
            type: TOKEN_TYPES.STRING,
            value: tokenValue
        },
        newPos: pos
    };
}

/**
 * Parse punctuation token with Chinese character normalization
 * @param {string} char - Punctuation character
 * @returns {Object} Token object
 */
function parsePunctuationToken(char) {
    let normalizedPunctuation = char;
    if (char === '：') {
        normalizedPunctuation = ':';
    } else if (char === '，') {
        normalizedPunctuation = ',';
    }
    
    return {
        type: TOKEN_TYPES.PUNCTUATION,
        value: normalizedPunctuation
    };
}

/**
 * Parse number token with radix detection and negative sign tracking
 * @param {string} jsonString - Input string
 * @param {number} startPos - Starting position
 * @returns {Object} Token and new position
 */
function parseNumberToken(jsonString, startPos) {
    const len = jsonString.length;
    let pos = startPos;
    let isNegative = false;
    let radix = RADIX.DECIMAL;
    
    // Handle negative sign
    if (jsonString[pos] === '-') {
        isNegative = true;
        pos++;
    }
    
    // Determine number format and radix
    if (pos < len) {
        if (jsonString[pos] === '0' && pos < len - 1) {
            const nextChar = jsonString[pos + 1];
            if (nextChar === 'x' || nextChar === 'X') {
                // Hexadecimal
                radix = RADIX.HEXADECIMAL;
                pos += 2;
                while (pos < len && /[0-9a-fA-F]/.test(jsonString[pos])) pos++;
            } else if (nextChar === 'o' || nextChar === 'O') {
                // Octal
                radix = RADIX.OCTAL;
                pos += 2;
                while (pos < len && /[0-7]/.test(jsonString[pos])) pos++;
            } else if (nextChar === 'b' || nextChar === 'B') {
                // Binary
                radix = RADIX.BINARY;
                pos += 2;
                while (pos < len && /[01]/.test(jsonString[pos])) pos++;
            } else {
                // Regular decimal starting with 0
                pos++;
                while (pos < len && /[\d.eE+-]/.test(jsonString[pos])) pos++;
            }
        } else {
            // Regular decimal number
            while (pos < len && /[\d.eE+-]/.test(jsonString[pos])) pos++;
        }
    }
    
    const numberValue = jsonString.slice(isNegative ? startPos + 1 : startPos, pos);
    
    return {
        token: {
            type: TOKEN_TYPES.NUMBER,
            value: numberValue,
            radix: radix,
            isNegative: isNegative
        },
        newPos: pos
    };
}

/**
 * Parse identifier token
 * @param {string} jsonString - Input string
 * @param {number} startPos - Starting position
 * @returns {Object} Token and new position
 */
function parseIdentifierToken(jsonString, startPos) {
    const len = jsonString.length;
    let pos = startPos;
    
    while (pos < len && !/["{}[\],:：，\s]/.test(jsonString[pos])) {
        pos++;
    }
    
    if (pos > startPos) {
        return {
            token: {
                type: TOKEN_TYPES.IDENTIFIER,
                value: jsonString.slice(startPos, pos)
            },
            newPos: pos
        };
    } else {
        return {
            token: null,
            newPos: pos + 1 // Skip unrecognized character
        };
    }
}

/**
 * Skip comment tokens (both single-line and multi-line)
 * @param {string} jsonString - Input string
 * @param {number} startPos - Starting position (should be '/')
 * @returns {Object} isComment flag and new position
 */
function skipComment(jsonString, startPos) {
    const len = jsonString.length;
    
    if (startPos + 1 >= len) {
        return { isComment: false, newPos: startPos + 1 };
    }
    
    const nextChar = jsonString[startPos + 1];
    
    // Single-line comment: //
    if (nextChar === '/') {
        let pos = startPos + 2;
        // Skip until end of line or end of string
        while (pos < len && jsonString[pos] !== '\n' && jsonString[pos] !== '\r') {
            pos++;
        }
        // Skip the newline character if present
        if (pos < len && (jsonString[pos] === '\n' || jsonString[pos] === '\r')) {
            pos++;
            // Handle Windows-style \r\n
            if (pos < len && jsonString[pos - 1] === '\r' && jsonString[pos] === '\n') {
                pos++;
            }
        }
        return { isComment: true, newPos: pos };
    }
    
    // Multi-line comment: /* ... */
    if (nextChar === '*') {
        let pos = startPos + 2;
        // Skip until */ or end of string
        while (pos < len - 1) {
            if (jsonString[pos] === '*' && jsonString[pos + 1] === '/') {
                pos += 2; // Skip the closing */
                break;
            }
            pos++;
        }
        // If we reached the end without finding closing */, treat as unterminated comment
        if (pos >= len - 1 && !(jsonString[pos - 1] === '*' && jsonString[pos] === '/')) {
            pos = len; // Skip to end of string
        }
        return { isComment: true, newPos: pos };
    }
    
    // Not a comment, just a forward slash
    return { isComment: false, newPos: startPos };
}

module.exports = {
    tokenize
};
