# Jaison

A robust, fault-tolerant JSON parser engineered specifically for handling malformed JSON output from AI systems and language models. Jaison intelligently repairs common structural errors while providing detailed feedback on all applied fixes.

## Why Jaison?

AI systems often generate JSON with structural errors that cause standard parsers to fail. Jaison bridges this gap by automatically detecting and repairing these issues, making it the ideal choice for applications that process AI-generated JSON responses.

## Key Features

### 🤖 **AI-First Design**
- Optimized for common AI output patterns and errors
- Handles streaming responses from language models
- Processes incomplete JSON from interrupted AI responses

### 🔧 **Intelligent Error Repair**
- **Bracket Completion**: Automatically closes missing `}` and `]` brackets
- **String Repair**: Fixes unescaped newlines and unclosed string literals
- **Comma Normalization**: Removes trailing commas and handles consecutive commas
- **Value Completion**: Adds missing values after colons (defaults to `null`)
- **Chinese Punctuation**: Converts Chinese punctuation (：；) to English equivalents

### 📝 **Markdown Integration**
- Automatically strips markdown code block wrappers (\`\`\`json, \`\`\`js, etc.)
- Supports various language identifiers (javascript, typescript, python, etc.)
- Removes extra text before and after JSON content

### 🚀 **Developer Experience**
- **Zero Dependencies**: Pure JavaScript implementation
- **Comprehensive Reporting**: Detailed information about all applied fixes
- **Graceful Fallback**: Returns original content and error details when repair fails
- **Type Safety**: Consistent return format for reliable error handling

## Quick Start

### Installation

```bash
npm install jaison
```

### Basic Usage

```javascript
const jaison = require('jaison');

// Standard JSON parsing
const result = jaison('{"name": "John", "age": 30}');
console.log(result);
// {
//   success: true,
//   data: { name: "John", age: 30 },
//   fixes: {},
//   fixedJson: '{"name": "John", "age": 30}',
//   error: undefined
// }
```

### Real-World AI Scenario

```javascript
// Typical AI response with multiple issues
const aiResponse = `
Here's the data you requested:
\`\`\`json
{
  "status": "success",
  "message": "Analysis complete",
  "results": [
    {"id": 1, "score": 0.95},
    {"id": 2, "score": 0.87,
  ]
\`\`\`
Hope this helps!
`;

const parsed = jaison(aiResponse);
console.log(parsed);
// {
//   success: true,
//   data: {
//     status: "success",
//     message: "Analysis complete", 
//     results: [
//       {id: 1, score: 0.95},
//       {id: 2, score: 0.87}
//     ]
//   },
//   fixes: {
//     markdownRemoved: true,
//     bracketCompleted: true,
//     extraCharsRemoved: true
//   },
//   fixedJson: '{"status":"success","message":"Analysis complete","results":[{"id":1,"score":0.95},{"id":2,"score":0.87}]}',
//   error: undefined
// }
```

## Repair Capabilities

Jaison provides the following automatic repair features:

| Issue Type | Description | Example | Fix Applied |
|------------|-------------|---------|-------------|
| **Markdown Removal** | Strips code block wrappers | \`\`\`json\n{...}\n\`\`\` | Extracts pure JSON |
| **Bracket Completion** | Closes missing brackets | `{"items": [1, 2, 3` | Adds `]}` |
| **String Closing** | Closes unclosed strings | `{"msg": "hello` | Adds closing `"` |
| **Newline Escaping** | Escapes raw newlines | `{"text": "line1\nline2"}` | Becomes `"line1\\nline2"` |
| **Comma Normalization** | Removes trailing commas | `{"a": 1, "b": 2,}` | Removes final `,` |
| **Value Completion** | Adds missing values | `{"key":}` | Becomes `{"key": null}` |
| **Chinese Punctuation** | Converts Chinese punctuation | `{"key"："value"；"num"：1}` | Becomes `{"key":"value","num":1}` |
| **Extra Text Removal** | Removes trailing non-JSON content | `{"data": 1} // comment` | Keeps only JSON |

## Common AI JSON Problems & Examples

Jaison automatically handles the most frequent issues encountered in AI-generated JSON:

### 1. Markdown Code Block Wrappers
```javascript
// Very common in ChatGPT and other AI responses
const wrapped = '```json\n{"data": "value", "count": 42}\n```';
const result = jaison(wrapped);
// ✅ result.success === true
// ✅ result.fixes.markdownRemoved === true
// ✅ result.data === { data: "value", count: 42 }

// Works with various language identifiers  
const jsWrapper = '```javascript\n{"result": "success"}\n```';
jaison(jsWrapper); // ✅ Supports js, typescript, python, etc.
```

### 2. Incomplete Streaming Responses
```javascript
// Common when AI response is cut off
const incomplete = '{"thinking": "Let me analyze this", "result":';
const result = jaison(incomplete);
// ✅ result.success === true
// ✅ result.fixes.bracketCompleted === true
// ✅ result.fixes.valueCompleted === true
// ✅ result.data === { thinking: "Let me analyze this", result: null }
```

### 3. Extra Text After JSON
```javascript
// AI often adds explanatory text after JSON
const withTrailingText = '{"answer": 42} // This is the result';
const result = jaison(withTrailingText);
// ✅ result.success === true
// ✅ result.fixes.extraCharsRemoved === true
// ✅ result.data === { answer: 42 }

// Also works with longer trailing content
const withComment = '{"status": "success"} <- This indicates success';
jaison(withComment); // ✅ Removes trailing text
```

### 4. Unescaped Newlines in Strings
```javascript
// Multiline AI responses often have this issue
const multiline = '{"explanation": "This is a\nmultiline response"}';
const result = jaison(multiline);
// ✅ result.success === true
// ✅ result.fixes.newlineFixed === true
// ✅ result.data.explanation === "This is a\nmultiline response"
```

### 5. Trailing Commas and Bracket Issues
```javascript
// Missing closing brackets
const missingBrackets = '{"items": [1, 2, 3';
const result = jaison(missingBrackets);
// ✅ result.success === true
// ✅ result.fixes.bracketCompleted === true
// ✅ result.data === { items: [1, 2, 3] }

// Trailing commas
const trailingComma = '{"name": "John", "age": 30,}';
const result2 = jaison(trailingComma);
// ✅ result2.success === true
// ✅ result2.fixes.commaFixed === true
// ✅ result2.data === { name: "John", age: 30 }
```

### 6. Chinese Punctuation Conversion
```javascript
// Chinese colon and semicolon in JSON structure
const chinesePunctuation = '{"name"："张三"；"age"：25}';
const result = jaison(chinesePunctuation);
// ✅ result.success === true
// ✅ result.fixes.chinesePunctuationFixed === true
// ✅ result.data === { name: "张三", age: 25 }

// Mixed Chinese and English punctuation
const mixed = '{"title"："测试数据"；"count"：10, "active": true}';
jaison(mixed); // ✅ Converts Chinese punctuation while preserving content

// Preserves Chinese punctuation inside strings
const preserved = '{"text": "这是一个测试：包含中文标点；符号"}';
const result3 = jaison(preserved);
// ✅ result3.fixes.chinesePunctuationFixed === false (no structural changes)
// ✅ String content remains unchanged
```

### 7. Complex Cases with Multiple Issues
```javascript
// Example with comprehensive fixes
const complexCase = '{"name": "John", "items": [1, 2, 3,}';
const result = jaison(complexCase);
// ✅ result.success === true
// ✅ result.fixes.commaFixed === true
// ✅ result.data === { name: "John", items: [1, 2, 3] }

// Example with parsing failure
const brokenCase = 'completely broken {{{ json';
const failed = jaison(brokenCase);
// ❌ failed.success === false
// ❌ failed.error === "JSON parsing failed: ..."
// ℹ️ failed.fixedJson === attempted repair string
```

## API Reference

### `jaison(jsonString)`

Parses a JSON string with intelligent error correction and detailed repair reporting.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `jsonString` | `string` | The JSON string to parse (may contain errors) |

#### Return Value

Returns an object with the following structure:

```typescript
{
  success: boolean;           // Whether parsing was successful
  data: any;                  // Parsed JSON data (undefined if failed)
  fixes: {                    // Details of all applied fixes
    bracketCompleted: boolean;       // Missing brackets were added
    stringClosed: boolean;           // Unclosed strings were fixed
    newlineFixed: boolean;           // Unescaped newlines were escaped
    commaFixed: boolean;             // Comma issues were resolved
    valueCompleted: boolean;         // Missing values were added
    extraCharsRemoved: boolean;      // Extra characters were removed
    markdownRemoved: boolean;        // Markdown wrapper was removed
    chinesePunctuationFixed: boolean; // Chinese punctuation was converted
  };
  fixedJson: string;          // The repaired JSON string
  error?: string;             // Error message if parsing failed
}
```

## Advanced Usage Examples

### Complex Scenarios with Multiple Fixes

```javascript
// Real-world scenario: AI response with multiple issues
const messyAiResponse = `
\`\`\`json
{"analysis"："数据分析完成"；"results": [
  {"score": 0.95, "category": "good",
  {"score": 0.87, "category": "ok"；
\`\`\`
Additional notes: The analysis is complete.
`;

const result = jaison(messyAiResponse);
// ✅ Fixes: markdown removal, Chinese punctuation, missing brackets
// result.success === true
// result.fixes.markdownRemoved === true
// result.fixes.chinesePunctuationFixed === true
// result.fixes.bracketCompleted === true
// result.fixes.extraCharsRemoved === true
```

### Error Recovery and Fallback Handling

```javascript
// Graceful error handling
function parseAiResponse(response) {
  const result = jaison(response);
  
  if (result.success) {
    console.log('Parsed successfully:', result.data);
    if (Object.keys(result.fixes).some(key => result.fixes[key])) {
      console.log('Applied fixes:', result.fixes);
    }
    return result.data;
  } else {
    console.error('Parse failed:', result.error);
    console.log('Attempted repair:', result.fixedJson);
    return null; // or default value
  }
}
```

## Error Handling and Limitations

### What Jaison Can Fix
- ✅ Structural JSON errors (brackets, commas, strings)
- ✅ Markdown code block wrappers
- ✅ Incomplete streaming responses
- ✅ Unescaped newlines in strings
- ✅ Missing values after colons
- ✅ Chinese punctuation in JSON structure (：→: and ；→;)

### What Jaison Cannot Fix
- ❌ Fundamentally broken JSON structure
- ❌ Unquoted object keys (requires preprocessing)
- ❌ Text before JSON (only trailing text can be removed)
- ❌ Complex syntax errors beyond structural issues
- ❌ Semantic validation of data content

### Performance Considerations
- Optimized for typical AI response sizes (< 1MB)
- May be slower than native `JSON.parse()` for very large inputs
- Includes safeguards against malicious input patterns

## Testing

Run the comprehensive test suite:

```bash
npm test
```

### Test Coverage

The test suite validates:

- **Core Functionality**: Basic JSON parsing and error handling
- **AI Scenarios**: Real-world AI output patterns and edge cases  
- **Markdown Handling**: Various code block formats (\`\`\`json, \`\`\`js, etc.)
- **Error Recovery**: Bracket completion, string repair, comma fixes
- **Chinese Punctuation**: Conversion of Chinese punctuation marks (：；) to English equivalents
- **Performance**: Large input handling and DoS prevention
- **Security**: Input sanitization and safe error handling
- **Unicode Support**: Proper handling of international characters
- **Edge Cases**: Boundary conditions and unusual input patterns

## Use Cases

### Perfect for AI Applications
- **Chatbot Responses**: Parse JSON from GPT, Claude, and other LLMs
- **API Integration**: Handle malformed responses from AI services
- **Data Processing**: Clean up JSON from automated content generation
- **Streaming Responses**: Parse incomplete JSON from real-time AI streams
- **International AI**: Handle Chinese AI responses with mixed punctuation

### Development and Testing
- **Robust Parsing**: Graceful handling of malformed test data
- **Error Recovery**: Continue processing despite JSON syntax errors
- **Debugging**: Detailed fix reporting for troubleshooting
- **Integration**: Drop-in replacement for `JSON.parse()` with fault tolerance

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the AI development community**
