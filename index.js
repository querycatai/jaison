/**
 * Fix and normalize JSON string by handling brackets and escaping newlines
 * @param {string} jsonString - The JSON string to fix
 * @returns {{fixed: string, fixes: {bracketCompleted: boolean, stringClosed: boolean, newlineFixed: boolean, commaFixed: boolean, valueCompleted: boolean, extraCharsRemoved: boolean, markdownRemoved: boolean, chinesePunctuationFixed: boolean}}} Fix result
 */
function fixJsonString(jsonString) {
    const originalString = jsonString;
    
    // Remove markdown code block markers (common in AI responses)
    // Remove opening ```<language> or ``` at the beginning (with optional leading whitespace)
    // Language identifier should only contain letters, numbers, hyphens, plus signs
    jsonString = jsonString.replace(/^\s*```[\w+\-]*\s*\n?/, '');
    // Remove closing ``` at the end (with optional trailing whitespace)
    jsonString = jsonString.replace(/\n?\s*```\s*$/i, '');
    
    const markdownRemoved = originalString !== jsonString;
    
    // Enhanced pattern to match: strings, brackets, commas, colons (including Chinese punctuation), other chars
    const tokenPattern = /"((?:[^"\\]|\\[\s\S])*)(?:"|$)|([{}[\]])|([,:：；])|([\s]+)|([^"{}[\],:：；]+)/g;

    // First, collect all tokens into an array
    const tokens = [];
    let match;
    let chinesePunctuationFixed = false; // Track if we converted Chinese punctuation
    
    while ((match = tokenPattern.exec(jsonString)) !== null) {
        const [fullMatch, stringContents, bracket, punctuation, whitespace, otherChars] = match;

        if (stringContents !== undefined) {
            tokens.push({
                type: 'string',
                value: fullMatch,
                stringContents // Keep this for processing unescaped content
            });
        } else if (bracket) {
            tokens.push({
                type: 'bracket',
                value: bracket
            });
        } else if (punctuation) {
            // Convert Chinese punctuation to English equivalents
            let normalizedPunctuation = punctuation;
            if (punctuation === '：') {
                normalizedPunctuation = ':';
                chinesePunctuationFixed = true;
            } else if (punctuation === '；') {
                normalizedPunctuation = ',';
                chinesePunctuationFixed = true;
            }
            
            tokens.push({
                type: 'punctuation',
                value: normalizedPunctuation
            });
        } else if (whitespace) {
            tokens.push({
                type: 'whitespace',
                value: whitespace
            });
        } else if (otherChars) {
            tokens.push({
                type: 'other',
                value: otherChars
            });
        }
    }

    let result = '';
    let stack = [];
    let resultIsEmpty = true; // Track if result has any non-whitespace content
    const fixes = {
        bracketCompleted: false,
        stringClosed: false,
        newlineFixed: false,
        commaFixed: false, // Track if we removed trailing commas
        valueCompleted: false, // Track if we added missing values after colons
        extraCharsRemoved: false, // Track if we removed extra characters after complete JSON
        markdownRemoved, // Track if we removed markdown code block markers
        chinesePunctuationFixed // Track if we converted Chinese punctuation
    };
    let lastToken = null; // Track the last meaningful token

    // Process each token
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (resultIsEmpty) {
            if (token.type !== 'whitespace') {
                resultIsEmpty = false;
            }
        } else if (stack.length === 0 && token.type !== 'whitespace') {
            fixes.extraCharsRemoved = true;
            break; // Stop processing and return the complete JSON
        }

        if (token.type === 'string') {
            // Handle string tokens - escape newlines
            const isUnclosed = !token.value.endsWith('"') || token.value.endsWith('\\"');

            // Check if contains unescaped newlines
            if (token.stringContents && token.stringContents.match(/(?<!\\)[\n\r]/)) {
                fixes.newlineFixed = true;
            }

            // Check if string needs closing
            if (isUnclosed) {
                fixes.stringClosed = true;
            }

            const fixedContents = token.stringContents ? token.stringContents.replace(/(?<!\\)\n/g, '\\n').replace(/(?<!\\)\r/g, '\\r') : '';
            result += isUnclosed ? `"${fixedContents}"` : `"${fixedContents}"`;
            lastToken = 'string';

        } else if (token.type === 'bracket') {
            // Handle brackets with stack management
            if (token.value === '{' || token.value === '[') {
                stack.push(token.value);
                result += token.value;
                lastToken = token.value;

            } else if (token.value === '}' || token.value === ']') {
                const expected = token.value === '}' ? '{' : '[';

                // Handle unexpected closing brackets
                if (stack.length === 0) {
                    // Stack is empty, treat as unexpected character
                    fixes.extraCharsRemoved = true;
                    break; // Stop processing and return result
                }

                // If current bracket doesn't match the expected one, try to fix by completing missing brackets
                if (stack[stack.length - 1] !== expected) {
                    fixes.bracketCompleted = true;
                    
                    // Complete missing brackets until we find a match or stack is empty
                    while (stack.length > 0 && stack[stack.length - 1] !== expected) {
                        const toClose = stack.pop();
                        const closeChar = toClose === '{' ? '}' : ']';
                        result += closeChar;
                    }
                    
                    // After completion, check if stack is empty
                    if (stack.length === 0) {
                        // Stack is now empty, treat current bracket as unexpected character
                        fixes.extraCharsRemoved = true;
                        break; // Stop processing and return result
                    }
                }

                // Now we should have a matching bracket
                if (stack.length > 0) {
                    stack.pop();
                    result += token.value;
                    lastToken = token.value;
                    
                    // If stack becomes empty after this bracket, check for extra characters
                    if (stack.length === 0) {
                        // Continue processing but will break on next non-whitespace token
                    }
                }
            }

        } else if (token.value === ',') {
            // Handle comma punctuation
            // Check if comma should be omitted by looking at next non-whitespace tokens
            let shouldSkipComma = false;
            let shouldAddPlaceholder = false;
            let shouldPrependNull = false;

            // Check if comma is at the start of array (missing value before comma)
            if (lastToken === '[' && stack.length > 0 && stack[stack.length - 1] === '[') {
                shouldPrependNull = true;
            }

            if (i === tokens.length - 1) {
                shouldSkipComma = true; // If it's the last token, skip comma
            } else {
                let j = i + 1;

                // Skip single whitespace token if present
                if (tokens[j] && tokens[j].type === 'whitespace') {
                    j++;
                }

                // Check if we found a closing bracket, another comma, or reached the end
                if (j >= tokens.length) {
                    shouldSkipComma = true; // End of tokens after whitespace
                } else {
                    const nextToken = tokens[j];
                    if (nextToken.value === '}' || nextToken.value === ']' || nextToken.value === ',') {
                        shouldSkipComma = true;

                        // For consecutive commas in arrays, add null placeholder
                        if (nextToken.value === ',' && stack.length > 0 && stack[stack.length - 1] === '[') {
                            shouldAddPlaceholder = true;
                            shouldSkipComma = false; // Don't skip the comma, but add placeholder before it
                        }
                    }
                }
            }

            if (shouldPrependNull) {
                result += 'null';
                fixes.commaFixed = true;
                // Let the comma be processed by normal logic below
            }

            if (shouldAddPlaceholder) {
                result += ',null';
                fixes.commaFixed = true;
            } else if (shouldSkipComma) {
                fixes.commaFixed = true;
            } else {
                result += token.value;
            }
            lastToken = 'comma';

        } else if (token.value === ':') {
            // Handle colon punctuation
            result += token.value;

            // Check if colon should have a value added by looking at next non-whitespace tokens
            let shouldAddValue = false;

            if (i === tokens.length - 1) {
                shouldAddValue = true; // If it's the last token, add null value
            } else {
                let j = i + 1;

                // Skip single whitespace token if present
                if (tokens[j] && tokens[j].type === 'whitespace') {
                    j++;
                }

                // Check if we found a closing bracket, comma, or reached the end
                if (j >= tokens.length) {
                    shouldAddValue = true; // End of tokens after whitespace
                } else {
                    const nextToken = tokens[j];
                    if (nextToken.value === '}' || nextToken.value === ']' || nextToken.value === ',') {
                        shouldAddValue = true;
                    }
                }
            }

            if (shouldAddValue) {
                result += 'null';
                fixes.valueCompleted = true;
            }
            lastToken = 'colon';

        } else if (token.type === 'whitespace') {
            // Preserve whitespace
            result += token.value;

        } else if (token.type === 'other') {
            // Handle other characters in chunks
            result += token.value;
            lastToken = 'other';
        }
    }

    // Close remaining unclosed brackets in reverse order
    if (stack.length > 0) {
        fixes.bracketCompleted = true;
        const closeChars = stack.reverse().map(char => char === '{' ? '}' : ']').join('');
        result += closeChars;
    }

    return {
        fixed: result,
        fixes
    };
}

/**
 * Parse JSON string with error tolerance and auto-completion
 * @param {string} jsonString - The JSON string to parse
 * @returns {{success: boolean, data: any, fixes: {bracketCompleted: boolean, stringClosed: boolean, newlineFixed: boolean, commaFixed: boolean, valueCompleted: boolean, extraCharsRemoved: boolean, markdownRemoved: boolean, chinesePunctuationFixed: boolean}, fixedJson: string, error?: string}} Parsing result
 */
function parseJson(jsonString) {
    if (!jsonString || typeof jsonString !== 'string') {
        return {
            success: false,
            data: undefined,
            fixes: {},
            fixedJson: '',
            error: 'Invalid input: jsonString must be a non-empty string'
        };
    }

    // First, try to fix the JSON string
    const fixResult = fixJsonString(jsonString);

    try {
        // Try to parse the fixed JSON
        const parsedData = JSON.parse(fixResult.fixed);

        // JSON.parse succeeded, so success is always true
        return {
            success: true,
            data: parsedData,
            fixes: fixResult.fixes,
            fixedJson: fixResult.fixed,
            error: undefined
        };

    } catch (parseError) {
        // If JSON.parse fails, still preserve the fix information
        return {
            success: false,
            data: undefined,
            fixes: fixResult.fixes,
            fixedJson: fixResult.fixed,
            error: `JSON parsing failed: ${parseError.message}`
        };
    }
}

module.exports = parseJson;
