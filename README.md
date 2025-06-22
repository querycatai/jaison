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

### 📝 **Markdown Integration**
- Automatically strips markdown code block wrappers (`\`\`\`json`, `\`\`\`js`, etc.)
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

## Common AI JSON Problems Solved

Jaison automatically handles the most frequent issues encountered in AI-generated JSON:

### 1. Markdown Code Block Wrappers
```javascript
// Very common in ChatGPT and other AI responses
const wrapped = '```json\n{"data": "value", "count": 42}\n```';
jaison(wrapped); // ✅ Automatically extracts and parses JSON

// Works with various language identifiers  
const jsWrapper = '```javascript\n{"result": "success"}\n```';
jaison(jsWrapper); // ✅ Supports js, typescript, python, etc.
```

### 2. Incomplete Streaming Responses
```javascript
// Common when AI response is cut off
const incomplete = '{"thinking": "Let me analyze this", "result":';
jaison(incomplete); // ✅ Adds missing value and closing brace
// Result: {"thinking": "Let me analyze this", "result": null}
```

### 3. Extra Text After JSON
```javascript
// AI often adds explanatory text after JSON
const withTrailingText = '{"answer": 42} // This is the result';
jaison(withTrailingText); // ✅ Extracts clean JSON

// Also works with longer trailing content
const withComment = '{"status": "success"} <- This indicates success';
jaison(withComment); // ✅ Removes trailing text
```

### 4. Unescaped Newlines in Strings
```javascript
// Multiline AI responses often have this issue
const multiline = '{"explanation": "This is a\nmultiline response"}';
jaison(multiline); // ✅ Escapes to: {"explanation": "This is a\\nmultiline response"}
```

### 5. Trailing Commas and Bracket Issues
```javascript
// Missing closing brackets
const missingBrackets = '{"items": [1, 2, 3';
jaison(missingBrackets); // ✅ Adds: {"items": [1, 2, 3]}

// Trailing commas
const trailingComma = '{"name": "John", "age": 30,}';
jaison(trailingComma); // ✅ Removes trailing comma
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
    bracketCompleted: boolean;    // Missing brackets were added
    stringClosed: boolean;        // Unclosed strings were fixed
    newlineFixed: boolean;        // Unescaped newlines were escaped
    commaFixed: boolean;          // Comma issues were resolved
    valueCompleted: boolean;      // Missing values were added
    extraCharsRemoved: boolean;   // Extra characters were removed
    markdownRemoved: boolean;     // Markdown wrapper was removed
  };
  fixedJson: string;          // The repaired JSON string
  error?: string;             // Error message if parsing failed
}
```

#### Examples

```javascript
// Successful parsing with fixes
const result = jaison('{"name": "John", "items": [1, 2, 3,}');
// result.success === true
// result.fixes.commaFixed === true
// result.data === { name: "John", items: [1, 2, 3] }

// Failed parsing (returns repair attempt)
const failed = jaison('completely broken {{{ json');
// failed.success === false
// failed.error === "JSON parsing failed: ..."
// failed.fixedJson === attempted repair
```

## Detailed Examples

### Working with Markdown-Wrapped JSON

```javascript
// Standard markdown JSON block
const result1 = jaison('```json\n{"name": "John", "age": 30}\n```');
// ✅ Automatically removes wrapper and parses

// Different language identifiers work too
const result2 = jaison('```javascript\n{"data": [1, 2, 3]}\n```');
// ✅ Supports js, typescript, python, and more
```

### Handling Structural Issues

```javascript
// Missing closing brackets
const incomplete = jaison('{"name": "John", "items": [1, 2, 3');
// ✅ Result: {"name": "John", "items": [1, 2, 3]}
// fixes.bracketCompleted === true

// Trailing commas
const trailing = jaison('{"name": "John", "age": 30,}');
// ✅ Removes trailing comma
// fixes.commaFixed === true

// Missing values after colons
const missingValue = jaison('{"name": "John", "age":}');
// ✅ Result: {"name": "John", "age": null}
// fixes.valueCompleted === true
```

### String and Content Fixes

```javascript
// Unescaped newlines in strings
const newlines = jaison('{"message": "Hello\nWorld"}');
// ✅ Result: {"message": "Hello\\nWorld"}
// fixes.newlineFixed === true

// Unclosed strings
const unclosed = jaison('{"name": "John", "message": "Hello');
// ✅ Result: {"name": "John", "message": "Hello"}
// fixes.stringClosed === true
```

## Repair Capabilities

Jaison provides the following automatic repair features:

| Issue Type | Description | Example | Fix Applied |
|------------|-------------|---------|-------------|
| **Markdown Removal** | Strips code block wrappers | `\`\`\`json\n{...}\n\`\`\`` | Extracts pure JSON |
| **Bracket Completion** | Closes missing brackets | `{"items": [1, 2, 3` | Adds `]}` |
| **String Closing** | Closes unclosed strings | `{"msg": "hello` | Adds closing `"` |
| **Newline Escaping** | Escapes raw newlines | `{"text": "line1\nline2"}` | Becomes `"line1\\nline2"` |
| **Comma Normalization** | Removes trailing commas | `{"a": 1, "b": 2,}` | Removes final `,` |
| **Value Completion** | Adds missing values | `{"key":}` | Becomes `{"key": null}` |
| **Extra Text Removal** | Removes trailing non-JSON content | `{"data": 1} // comment` | Keeps only JSON |

## Error Handling and Limitations

### What Jaison Can Fix
- ✅ Structural JSON errors (brackets, commas, strings)
- ✅ Markdown code block wrappers
- ✅ Incomplete streaming responses
- ✅ Unescaped newlines in strings
- ✅ Missing values after colons

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
- **Markdown Handling**: Various code block formats (`\`\`\`json`, `\`\`\`js`, etc.)
- **Error Recovery**: Bracket completion, string repair, comma fixes
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

### Development and Testing
- **Robust Parsing**: Graceful handling of malformed test data
- **Error Recovery**: Continue processing despite JSON syntax errors
- **Debugging**: Detailed fix reporting for troubleshooting
- **Integration**: Drop-in replacement for `JSON.parse()` with fault tolerance

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the AI development community**
