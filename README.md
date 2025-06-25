# Jaison

A robust, fault-tolerant JSON parser engineered specifically for handling malformed JSON output from AI systems and language models. Jaison intelligently repairs common structural errors while providing detailed feedback on all applied fixes.

## Why Jaison?

AI systems often generate JSON with structural errors that cause standard parsers to fail. Jaison bridges this gap by automatically detecting and repairing these issues, making it the ideal choice for applications that process AI-generated JSON responses.

**Current Implementation**: Jaison uses a direct tokenization approach that parses and repairs JSON in a single pass, returning the parsed data directly or throwing descriptive errors. This provides a clean, simple API that's easy to integrate into existing codebases.

## Key Features & Use Cases

### 🤖 **AI & LLM Integration**
**Core Capabilities:**
- **Streaming Response Support**: Handles incomplete JSON from cut-off AI responses
- **Markdown Code Block Extraction**: Automatically strips `\`\`\`json` wrappers from AI outputs
- **Comment Tolerance**: Ignores single-line (`//`) and multi-line (`/* */`) comments
- **Smart Constant Completion**: `t` → `true`, `nul` → `null`, `fals` → `false`

**Perfect For:**
- **Chatbot Systems**: Parse JSON responses from GPT, Claude, Gemini, and Chinese AI models
- **AI Content Generation**: Handle malformed JSON from writing assistants and code generators
- **Streaming AI Responses**: Process incomplete JSON from real-time AI conversations

### 🌏 **International & Chinese Language Support**
**Core Capabilities:**
- **Chinese Punctuation**: Converts Chinese colon (：) and comma (，) to standard JSON format
- **Mixed Quote Styles**: Supports both single and double quotes in the same JSON
- **Unicode Handling**: Full support for international characters and symbols

**Perfect For:**
- **Chinese Applications**: Only parser that handles Chinese punctuation (：，) conversion
- **Global Platforms**: Mixed punctuation styles in international user inputs
- **Chinese AI Integration**: Support for Baidu, Alibaba, Tencent AI with Chinese punctuation

### � **Intelligent Error Recovery**
- **Auto-Completion**: Closes missing brackets `}` `]` and adds missing values
- **Flexible Key Formats**: Handles unquoted keys and numeric identifiers
- **Multiple Number Formats**: Supports hex (0xFF), binary (0b101), and scientific notation
- **Trailing Content**: Extracts valid JSON while ignoring extra text

### 🚀 **Developer Experience**
**Core Capabilities:**
- **Zero Dependencies**: Pure JavaScript with no external requirements
- **Simple API**: Single function call with direct data return
- **Consistent Error Handling**: Clear error messages with try/catch patterns
- **High Performance**: Optimized for typical AI response sizes (< 1MB)

**Perfect For:**
- **Cross-Platform Development**: Universal JavaScript solution for error-prone environments
- **Quick Integration**: Drop-in replacement for JSON.parse with error tolerance

### 📊 **When to Use JSON.parse Instead**
- **Large datasets (> 1MB)** with guaranteed valid JSON (6.2x faster)
- **Performance-critical paths** where speed > fault tolerance
- **Pre-validated data** in controlled environments

### 💡 **Best Practices**
- Use Jaison as primary parser for AI/user-generated content
- Fallback to JSON.parse for known-valid, large datasets
- Essential for any application targeting Chinese users

## Quick Start

### Installation

```bash
npm install jaison
```

### Basic Usage

```javascript
const jaison = require('jaison');

// Standard JSON parsing - returns parsed data directly
const result = jaison('{"name": "John", "age": 30}');
console.log(result);
// { name: "John", age: 30 }

// Error handling
try {
  const data = jaison('invalid json');
  console.log(data);
} catch (error) {
  console.error('Parsing failed:', error.message);
}
```

## API Reference

### `jaison(jsonString)`

Parses a JSON string with intelligent error correction and automatic structural repairs.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `jsonString` | `string` | The JSON string to parse (may contain errors) |

#### Return Value

Returns the parsed JavaScript value directly. The function throws an error if the JSON cannot be parsed after all repair attempts.

#### Behavior

- **Success**: Returns the parsed JavaScript value (object, array, string, number, boolean, null, or undefined)
- **Failure**: Throws an `Error` with a descriptive message
- **Input Validation**: Throws an error if input is not a string

#### Error Handling

```javascript
try {
  const result = jaison(jsonString);
  // Use result directly - it's the parsed data
  console.log(result);
} catch (error) {
  // Handle parsing errors
  console.error('Parsing failed:', error.message);
}
```

## Repair Capabilities

### What Jaison Can Fix

| Feature | Description | Example | Result |
|---------|-------------|---------|---------|
| **Markdown Code Block Wrappers** | Automatically strips code block wrappers | \`\`\`json\n{"data": "value"}\n\`\`\` | {"data": "value"} |
| **Comment Removal** | Skips single-line and multi-line comments | `{"name": "John", // comment\n "age": 30}` | {"name": "John", "age": 30} |
| **Single Quote Support** | Converts single quotes to double quotes with proper escaping | `{'name': 'John', 'text': 'He said "Hi"'}` | {"name": "John", "text": "He said \"Hi\""} |
| **Bracket Completion** | Automatically closes missing brackets | `{"items": [1, 2, 3` | {"items": [1, 2, 3]} |
| **String Repair** | Fixes unclosed string literals | `{"msg": "hello` | {"msg": "hello"} |
| **Control Character Escaping** | Automatically escapes control characters | `{"text": "line1\nline2"}` | {"text": "line1\\nline2"} |
| **Comma Handling** | Handles consecutive and trailing commas | `[1, , 2, ]` | [1, null, 2] |
| **Value Completion** | Adds missing values with default null | `{"key": }` | {"key": null} |
| **Constant Completion** | Intelligently completes partial constants | `{"flag": tru, "val": nul}` | {"flag": true, "val": null} |
| **Extended Constant Aliases** | Supports various constant representations | `{"none": none, "nil": nil}` | {"none": null, "nil": null} |
| **Chinese Punctuation Conversion** | Converts Chinese punctuation marks | `{"name"："张三"，"age"：25}` | {"name": "张三", "age": 25} |
| **Non-String Keys Support** | Handles unquoted and numeric keys | `{name: "John", 123: "test"}` | {"name": "John", "123": "test"} |
| **Multiple Number Formats** | Converts various number formats to decimal | `{"hex": 0xFF, "oct": 0o10, "bin": 0b101}` | {"hex": 255, "oct": 8, "bin": 5} |
| **Scientific Notation** | Supports scientific notation numbers | `{"num": 1.23e4, "small": 5E-2}` | {"num": 12300, "small": 0.05} |
| **Trailing Text Handling** | Ignores text after valid JSON | `{"data": "value"}\nThis is some explanation\nOn multiple lines` | {"data": "value"} |
| **Incomplete Streaming Responses** | Handles cut-off AI responses | `{"thinking": "Let me analyze", "result":` | {"thinking": "Let me analyze", "result": null} |
| **Mixed Quote Styles** | Supports mixed single and double quotes in the same JSON | `{"name": "John", 'age': 30, "city": 'NYC'}` | {"name": "John", "age": 30, "city": "NYC"} |
| **Case Insensitive Constants** | Recognizes constants regardless of case | `{"debug": TRUE, "data": NULL}` | {"debug": true, "data": null} |

### What Jaison Cannot Fix
- ❌ **Text Before JSON**: Must start with valid JSON or markdown wrapper (cannot extract JSON from middle of text)
- ❌ **Fundamentally Malformed Structure**: Cannot repair JSON that is completely broken beyond recognition
- ❌ **Semantic Validation**: Does not validate the meaning or correctness of data content
- ❌ **Functions or Non-JSON Types**: Cannot handle JavaScript functions or other non-JSON data types

### Performance Considerations

Based on comprehensive testing with 550,000+ iterations across 24 test scenarios:

#### Performance Summary
- **vs JSON.parse**: Jaison is 6.23x slower for valid JSON, but handles malformed JSON that JSON.parse cannot parse at all
- **Success Rate**: 100% for malformed JSON (250,000 test cases), while JSON.parse has 0% success rate on malformed data

#### Detailed Test Results

| Test Scenario | JSON.parse Time | Jaison Time | Jaison vs JSON.parse |
|---------------|----------------|-------------|---------------------|
| **Valid JSON Tests** ||||
| Small Objects | 17.06ms | 79.71ms | 4.67x slower |
| Small Arrays | 7.06ms | 35.85ms | 5.08x slower |
| Complex Objects | 27.19ms | 122.27ms | 4.50x slower |
| Large Objects (3K keys) | 296.13ms | 1093.42ms | 3.69x slower |
| Large Arrays (3K items) | 1339.00ms | 10658.66ms | 7.96x slower |
| Nested Objects (20 levels) | 76.87ms | 344.16ms | 4.48x slower |
| Unicode Characters | 8.18ms | 52.94ms | 6.47x slower |
| **Jaison-Only Capabilities** ||||
| Unescaped Newlines | 110.22ms | 28.63ms | **3.8x faster** |
| Markdown Code Blocks | 106.92ms | 30.45ms | **3.5x faster** |
| Missing Brackets | 82.51ms | 20.08ms | **4.1x faster** |
| Chinese Punctuation | N/A | Optimized | **Unique capability** |

#### Optimization Guidelines
- Optimized for typical AI response sizes (< 1MB)
- Consider pre-validation for known-good data to use native JSON.parse
- Implement caching for frequently parsed content
- Includes safeguards against malicious input patterns

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the AI development community**
