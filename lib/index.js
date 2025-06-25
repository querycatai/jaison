/**
 * Jaison - Optimized JSON parser with error tolerance
 * High-performance modular implementation
 * 
 * @description Fault-tolerant JSON parser that handles malformed JSON,
 * markdown code blocks, Chinese punctuation, and various number formats
 * @version 2.0.0 (Optimized)
 */

const { tokenize } = require('./tokenizer');
const { parse } = require('./parser');

/**
 * Parse JSON-like string with high fault tolerance
 * 
 * @param {string} jsonString - Input string to parse
 * @returns {*} Parsed JavaScript value
 * @throws {Error} When input is invalid or contains unrecognized patterns
 * 
 * @example
 * // Basic usage
 * jaison('{"name": "test"}') // → { name: "test" }
 * 
 * // Malformed JSON
 * jaison('{"name": "test"') // → { name: "test" }
 * 
 * // Markdown code blocks
 * jaison('```json\n{"api": "success"}\n```') // → { api: "success" }
 * 
 * // Chinese punctuation
 * jaison('{"name"："测试"}') // → { name: "测试" }
 * 
 * // Various number formats
 * jaison('{"hex": 0xff, "bin": 0b1010}') // → { hex: 255, bin: 10 }
 */
function jaison(jsonString) {
    // Input validation
    if (jsonString === null || jsonString === undefined || typeof jsonString !== 'string') {
        throw new Error('Invalid input: jsonString must be a string');
    }

    // Remove markdown code block markers (common in AI responses)
    // Remove opening ```<language> or ``` at the beginning (with optional leading whitespace)
    // Language identifier should only contain letters, numbers, hyphens, plus signs
    jsonString = jsonString.replace(/^\s*```[\w+\-]*\s*\n?/, '');
    // Remove closing ``` at the end (with optional trailing whitespace)
    jsonString = jsonString.replace(/\n?\s*```\s*$/i, '');

    // Tokenize input string using optimized tokenizer
    const tokens = tokenize(jsonString);

    // Parse tokens into JavaScript values
    return parse(tokens);
}

// Export main function
module.exports = jaison;
