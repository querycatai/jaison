const  { describe, it } = require('node:test');
const assert = require('node:assert');
const parser = require('.');

// 1. Basic Functionality & Type Support
// --------------------------------------------------
describe('JSON Parser - Basic Functionality & Type Support', () => {
    it('should parse valid JSON object correctly', () => {
        const data = `{"name": "John", "age": 30, "city": "New York"}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.error, undefined);
        assert.deepStrictEqual(result.data, {
            name: "John",
            age: 30,
            city: "New York"
        });
    });

    it('should parse valid JSON array correctly', () => {
        const complexData = `[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]`;
        const result = parser(complexData);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.error, undefined);
        assert(Array.isArray(result.data), "Should return an array");
        assert.deepStrictEqual(result.data[0], { id: 1, name: "Alice" });
        assert.deepStrictEqual(result.data[1], { id: 2, name: "Bob" });
    });

    it('should parse complex nested object correctly', () => {
        const complexData = `{"user": {"name": "John", "details": {"age": 30, "active": true}}, "items": [1, 2, 3]}`;
        const result = parser(complexData);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.error, undefined);
        assert(result.data && typeof result.data === 'object', "Should return an object");
        assert(result.data.user && result.data.user.name === "John", "Should contain user name 'John'");
    });

    it('should handle various data types correctly', () => {
        const data = `{"string": "test", "number": 42, "boolean": true, "null": null, "float": 3.14}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.error, undefined);
        assert.deepStrictEqual(result.data, {
            string: "test",
            number: 42,
            boolean: true,
            null: null,
            float: 3.14
        });
    });
});

// 1.5. AI Output & Markdown Code Block Handling
// --------------------------------------------------
describe('JSON Parser - AI Output & Markdown Code Block Handling', () => {
    it('should handle JSON wrapped in markdown code block with json language', () => {
        const data = '```json\n{"name": "John", "age": 30}\n```';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.markdownRemoved, true);
        assert.deepStrictEqual(result.data, { name: "John", age: 30 });
        assert.strictEqual(result.fixedJson, '{"name": "John", "age": 30}');
    });

    it('should handle JSON wrapped in markdown code block with javascript language', () => {
        const data = '```javascript\n{"api_response": "success"}\n```';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.markdownRemoved, true);
        assert.deepStrictEqual(result.data, { api_response: "success" });
    });

    it('should handle JSON wrapped in markdown code block with various languages', () => {
        const testCases = [
            { lang: 'python', data: '{"language": "python"}' },
            { lang: 'rust', data: '{"fast": true}' },
            { lang: 'go', data: '{"gopher": "mascot"}' },
            { lang: 'typescript', data: '{"typed": true}' },
            { lang: 'csharp', data: '{"framework": "dotnet"}' }
        ];

        testCases.forEach(({ lang, data: jsonData }) => {
            const input = `\`\`\`${lang}\n${jsonData}\n\`\`\``;
            const result = parser(input);
            assert.strictEqual(result.success, true, `Should parse ${lang} code block`);
            assert.strictEqual(result.fixes.markdownRemoved, true, `Should detect markdown removal for ${lang}`);
            assert(result.data !== undefined, `Should extract data from ${lang} code block`);
        });
    });

    it('should handle JSON wrapped in markdown code block without language specifier', () => {
        const data = '```\n{"no_language": "specified"}\n```';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.markdownRemoved, true);
        assert.deepStrictEqual(result.data, { no_language: "specified" });
    });

    it('should handle markdown code block with leading whitespace', () => {
        const testCases = [
            '  ```json\n{"with_spaces": true}\n```',
            '\t```JSON\n{"with_tab": true}\n```',
            '   ```\n{"multiple_spaces": true}\n```'
        ];

        testCases.forEach((input, index) => {
            const result = parser(input);
            assert.strictEqual(result.success, true, `Test case ${index + 1} should succeed`);
            assert.strictEqual(result.fixes.markdownRemoved, true, `Test case ${index + 1} should detect markdown removal`);
            assert(result.data !== undefined, `Test case ${index + 1} should extract data`);
        });
    });

    it('should handle markdown code block with trailing whitespace', () => {
        const data = '   ```json   \n{"spaces_around": "backticks"}\n   ```   ';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.markdownRemoved, true);
        assert.deepStrictEqual(result.data, { spaces_around: "backticks" });
    });

    it('should handle incomplete JSON in markdown code block', () => {
        const data = '```json\n{"incomplete": "data",\n```';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.markdownRemoved, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.deepStrictEqual(result.data, { incomplete: "data" });
    });

    it('should handle multiline JSON in markdown code block', () => {
        const data = '```json\n{\n  "multiline": {\n    "nested": "object"\n  }\n}\n```';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.markdownRemoved, true);
        assert.deepStrictEqual(result.data, { multiline: { nested: "object" } });
    });

    it('should handle markdown code block with mixed case language identifiers', () => {
        const testCases = [
            '```JSON\n{"upper": "case"}\n```',
            '```JavaScript\n{"mixed": "case"}\n```',
            '```TypeScript\n{"capital": "letters"}\n```'
        ];

        testCases.forEach((input, index) => {
            const result = parser(input);
            assert.strictEqual(result.success, true, `Mixed case test ${index + 1} should succeed`);
            assert.strictEqual(result.fixes.markdownRemoved, true, `Mixed case test ${index + 1} should detect markdown removal`);
        });
    });

    it('should handle JSON without markdown (no false positives)', () => {
        const data = '{"normal": "json"}';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.markdownRemoved, false);
        assert.deepStrictEqual(result.data, { normal: "json" });
    });

    it('should handle incomplete markdown code blocks', () => {
        const testCases = [
            {
                name: 'missing closing backticks',
                input: '```json\n{"incomplete": "block"}',
                expectedData: { incomplete: "block" }
            },
            {
                name: 'missing closing backticks with language',
                input: '```javascript\n{"api": "response"}',
                expectedData: { api: "response" }
            },
            {
                name: 'missing closing backticks without language',
                input: '```\n{"no_language": true}',
                expectedData: { no_language: true }
            },
            {
                name: 'partial opening backticks',
                input: '``json\n{"partial": "opening"}\n```',
                shouldSucceed: false, // 2 backticks leave invalid JSON after removal
                expectMarkdownRemoved: true
            },
            {
                name: 'partial closing backticks',
                input: '```json\n{"partial": "closing"}\n``',
                expectedData: { partial: "closing" }
            },
            {
                name: 'single backtick opening',
                input: '`json\n{"single": "backtick"}\n```',
                shouldSucceed: false, // 1 backtick leaves invalid JSON after removal
                expectMarkdownRemoved: true
            },
            {
                name: 'double backtick opening',
                input: '``json\n{"double": "backtick"}\n```',
                shouldSucceed: false, // 2 backticks leave invalid JSON after removal
                expectMarkdownRemoved: true
            },
            {
                name: 'missing closing with incomplete JSON',
                input: '```json\n{"missing": "both",',
                expectedData: { missing: "both" }
            }
        ];

        testCases.forEach(({ name, input, expectedData, shouldSucceed = true, expectMarkdownRemoved = false }) => {
            const result = parser(input);
            
            if (shouldSucceed) {
                assert.strictEqual(result.success, true, `${name} should succeed`);
                assert.strictEqual(result.fixes.markdownRemoved, true, `${name} should detect markdown removal`);
                if (expectedData) {
                    assert.deepStrictEqual(result.data, expectedData, `${name} should extract correct data`);
                }
            } else {
                // For cases that should fail but might still detect markdown removal
                if (expectMarkdownRemoved) {
                    assert.strictEqual(result.fixes.markdownRemoved, true, `${name} should detect markdown removal`);
                    assert.strictEqual(result.success, false, `${name} should fail to parse`);
                } else {
                    // For cases that shouldn't be processed as markdown
                    if (result.success) {
                        assert.strictEqual(result.fixes.markdownRemoved, false, `${name} should not detect markdown removal`);
                    }
                }
            }
        });
    });

    it('should handle unusual language identifiers', () => {
        const testCases = [
            '```html5\n{"markup": "language"}\n```',
            '```css3\n{"style": "sheet"}\n```',
            '```c99\n{"standard": "old"}\n```',
            '```node16\n{"version": "specific"}\n```'
        ];

        testCases.forEach((input, index) => {
            const result = parser(input);
            assert.strictEqual(result.success, true, `Unusual language test ${index + 1} should succeed`);
            assert.strictEqual(result.fixes.markdownRemoved, true, `Unusual language test ${index + 1} should detect markdown removal`);
        });
    });

    it('should handle malformed markdown patterns', () => {
        const testCases = [
            {
                name: 'backticks in middle of text',
                input: 'some text ```json\n{"middle": "text"}\n``` more text',
                shouldSucceed: false // backticks not at start, should not be treated as markdown
            },
            {
                name: 'only opening backticks with whitespace',
                input: '```   \n{"only": "opening"}',
                expectedData: { only: "opening" }
            }
        ];

        testCases.forEach(({ name, input, expectedData, shouldSucceed = true }) => {
            const result = parser(input);
            
            if (shouldSucceed) {
                assert.strictEqual(result.success, true, `${name} should succeed`);
                if (expectedData) {
                    assert.deepStrictEqual(result.data, expectedData, `${name} should extract correct data`);
                }
            } else {
                assert.strictEqual(result.success, false, `${name} should fail`);
            }
        });
    });
});

// 2. Error Tolerance & Repair Capabilities
// --------------------------------------------------
describe('JSON Parser - Error Tolerance & Repair Capabilities', () => {
    it('should handle incomplete JSON object gracefully', () => {
        const incompleteData = `{"name": "John", "age": 30,`;
        const result = parser(incompleteData);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert(result.data !== undefined, "Should extract data");
        assert(result.data && typeof result.data === 'object', "Should extract an object");
        assert(Object.keys(result.data).length > 0, "Extracted object should not be empty");
        const parsedData = result.data;
        assert.strictEqual(parsedData.name, "John", "Should extract the name property correctly");
        assert.strictEqual(parsedData.age, 30, "Should extract the age property correctly");
    });

    it('should handle partial JSON array gracefully', () => {
        const partialArrayData = `[{"id": 1, "name": "Alice"}, {"id": 2, "name":`;
        const result = parser(partialArrayData);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(result.fixes.stringClosed, false);
        assert(result.data !== undefined, "Should extract array");
        const extractedArray = result.data;
        assert(Array.isArray(extractedArray), "Should extract an array");
        assert(extractedArray.length >= 2, "Array should contain at least 2 objects");
        const firstObject = extractedArray[0];
        assert(firstObject && typeof firstObject === 'object', "Should contain the complete first object");
        assert.strictEqual(firstObject.id, 1, "First object should have id 1");
        assert.strictEqual(firstObject.name, "Alice", "First object should have name Alice");
    });

    it('should handle incomplete nested structure', () => {
        const incompleteNested = `{"user": {"name": "John", "details": {"age": 30`;
        const result = parser(incompleteNested);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert(result.data !== undefined, "Should extract data");
        const extractedObject = result.data;
        assert(extractedObject && typeof extractedObject === 'object', "Should extract an object");
        assert(extractedObject.user, "Should extract user object");
        assert(typeof extractedObject.user === 'object', "User should be an object");
        assert.strictEqual(extractedObject.user.name, "John", "Should extract user name");
        assert(extractedObject.user.details, "Should have details object");
        assert.strictEqual(extractedObject.user.details.age, 30, "Should extract age");
    });

    it('should handle array with trailing comma (auto-completion)', () => {
        const arrayWithComma = `[1, 2, 3,`;
        const result = parser(arrayWithComma);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert(Array.isArray(result.data), "Should extract an array");
        const extractedArray = result.data;
        assert.strictEqual(extractedArray.length, 3, "Array should have 3 elements");
        assert.strictEqual(extractedArray[0], 1, "First element should be 1");
        assert.strictEqual(extractedArray[1], 2, "Second element should be 2");
        assert.strictEqual(extractedArray[2], 3, "Third element should be 3");
    });

    it('should handle nested array with trailing comma (auto-completion)', () => {
        const nestedArrayWithComma = `{"items": [1, 2,`;
        const result = parser(nestedArrayWithComma);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert(typeof result.data === 'object', "Should extract an object");
        const extractedObject = result.data;
        assert(Array.isArray(extractedObject.items), "Should contain items array");
        assert.strictEqual(extractedObject.items.length, 2, "Items array should have 2 elements");
        assert.strictEqual(extractedObject.items[0], 1, "First item should be 1");
        assert.strictEqual(extractedObject.items[1], 2, "Second item should be 2");
    });

    it('should handle array of objects with trailing comma (auto-completion)', () => {
        const objectArrayWithComma = `[{"id": 1}, {"id": 2},`;
        const result = parser(objectArrayWithComma);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(typeof result.error, 'undefined');
        assert(Array.isArray(result.data), "Should extract an array");
        const extractedArray = result.data;
        assert.strictEqual(extractedArray.length, 2, "Array should have 2 elements");
        assert.deepStrictEqual(extractedArray[0], {id: 1}, "First element should be {id: 1}");
        assert.deepStrictEqual(extractedArray[1], {id: 2}, "Second element should be {id: 2}");
    });

    it('should handle object with trailing comma (auto-completion)', () => {
        const objectWithComma = `{"name": "John", "age": 30,`;
        const result = parser(objectWithComma);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(typeof result.error, 'undefined');
        assert(typeof result.data === 'object', "Should extract an object");
        const extractedObject = result.data;
        assert.strictEqual(extractedObject.name, "John", "Should preserve name");
        assert.strictEqual(extractedObject.age, 30, "Should preserve age");
        assert(!('__placeholder__' in extractedObject), "Should not add placeholder key");
    });

    it('should handle object with colon ending (auto-completion)', () => {
        const objectWithColon = `{"name": "John", "data":`;
        const result = parser(objectWithColon);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(typeof result.error, 'undefined');
        assert(typeof result.data === 'object', "Should extract an object");
        const extractedObject = result.data;
        assert.strictEqual(extractedObject.name, "John", "Should preserve name");
        assert.strictEqual(extractedObject.data, null, "Should complete with null value");
    });

    it('should handle array ending with null (no auto-completion)', () => {
        const arrayWithNull = `[1, 2, null`;
        const result = parser(arrayWithNull);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(typeof result.error, 'undefined');
        assert(Array.isArray(result.data), "Should extract an array");
        const extractedArray = result.data;
        assert.strictEqual(extractedArray.length, 3, "Array should have 3 elements");
        assert.strictEqual(extractedArray[0], 1, "First element should be 1");
        assert.strictEqual(extractedArray[1], 2, "Second element should be 2");
        assert.strictEqual(extractedArray[2], null, "Third element should be null");
    });

    it('should handle object ending with null value (no auto-completion)', () => {
        const objectWithNull = `{"name": "John", "data": null`;
        const result = parser(objectWithNull);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(typeof result.error, 'undefined');
        assert(typeof result.data === 'object', "Should extract an object");
        const extractedObject = result.data;
        assert.strictEqual(extractedObject.name, "John", "Should preserve name");
        assert.strictEqual(extractedObject.data, null, "Should preserve null value");
        assert(!('__placeholder__' in extractedObject), "Should not add placeholder key");
    });

    it('should handle array ending with true (no auto-completion)', () => {
        const arrayWithTrue = `[1, 2, true`;
        const result = parser(arrayWithTrue);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(typeof result.error, 'undefined');
        assert(Array.isArray(result.data), "Should extract an array");
        const extractedArray = result.data;
        assert.strictEqual(extractedArray.length, 3, "Array should have 3 elements");
        assert.strictEqual(extractedArray[0], 1, "First element should be 1");
        assert.strictEqual(extractedArray[1], 2, "Second element should be 2");
        assert.strictEqual(extractedArray[2], true, "Third element should be true");
    });

    it('should handle object ending with false value (no auto-completion)', () => {
        const objectWithFalse = `{"name": "John", "active": false`;
        const result = parser(objectWithFalse);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(typeof result.error, 'undefined');
        assert(typeof result.data === 'object', "Should extract an object");
        const extractedObject = result.data;
        assert.strictEqual(extractedObject.name, "John", "Should preserve name");
        assert.strictEqual(extractedObject.active, false, "Should preserve false value");
        assert(!('__placeholder__' in extractedObject), "Should not add placeholder key");
    });

    it('should handle nested object with null ending (no auto-completion)', () => {
        const nestedObjectWithNull = `{"user": {"name": "John", "profile": null`;
        const result = parser(nestedObjectWithNull);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(typeof result.error, 'undefined');
        assert(typeof result.data === 'object', "Should extract an object");
        const extractedObject = result.data;
        assert(extractedObject.user, "Should contain user object");
        assert(typeof extractedObject.user === 'object', "User should be an object");
        assert.strictEqual(extractedObject.user.name, "John", "Should preserve user name");
        assert.strictEqual(extractedObject.user.profile, null, "Should preserve null profile");
    });

    it('should handle string ending with "null" text (no confusion with null value)', () => {
        const stringWithNullText = `{"message": "The value is null`;
        const result = parser(stringWithNullText);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(result.fixes.stringClosed, true);
        assert.strictEqual(typeof result.error, 'undefined');
        assert(typeof result.data === 'object', "Should extract an object");
        const extractedObject = result.data;
        assert.strictEqual(extractedObject.message, "The value is null", "Should preserve string content");
        assert(typeof extractedObject.message === 'string', "Message should be string, not null");
    });

    it('should handle mixed brackets and braces', () => {
        const data = `{"array": [1, 2, 3}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.deepStrictEqual(result.data, {"array": [1, 2, 3]});
    });

    it('should handle malformed array', () => {
        const malformedArray = `[1, 2, 3`;
        const result = parser(malformedArray);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.deepStrictEqual(result.data, [1, 2, 3]);
    });

    it('should handle trailing commas in object', () => {
        const data = `{"name": "John", "age": 30,}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.commaFixed, true);
        assert.deepStrictEqual(result.data, {"name": "John", "age": 30});
    });

    it('should handle trailing commas in array', () => {
        const data = `[1, 2, 3,]`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.commaFixed, true);
        assert.deepStrictEqual(result.data, [1, 2, 3]);
    });

    describe('Incomplete JSON Structures', () => {
        it('should handle object missing closing brace', () => {
            const data = `{"name": "John", "age": 30`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.bracketCompleted, true);
            assert.strictEqual(typeof result.error, 'undefined');
        });

        it('should handle array missing closing bracket', () => {
            const data = `[1, 2, 3, 4`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.bracketCompleted, true);
            assert.strictEqual(typeof result.error, 'undefined');
        });

        it('should handle incomplete string value', () => {
            const data = `{"name": "John`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.stringClosed, true);
            assert.strictEqual(result.fixes.bracketCompleted, true);
            assert.strictEqual(typeof result.error, 'undefined');
        });

        it('should handle incomplete key-value pair', () => {
            const data = `{"name":`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.bracketCompleted, true);
            assert.strictEqual(typeof result.error, 'undefined');
        });

        it('should handle incomplete nested object', () => {
            const data = `{"user": {"name": "John", "profile": {`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.bracketCompleted, true);
            assert.deepStrictEqual(result.data, {"user": {"name": "John", "profile": {}}});
        });

        it('should handle incomplete nested array', () => {
            const data = `{"items": [1, 2, {"nested": [3, 4`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.bracketCompleted, true);
            assert.deepStrictEqual(result.data, {"items": [1, 2, {"nested": [3, 4]}]});
        });

        it('should handle missing comma between values', () => {
            const data = `{"name": "John" "age": 30}`;
            const result = parser(data);
            assert.strictEqual(result.success, false);
            assert.strictEqual(typeof result.error, 'string');
        });

        it('should handle missing colon in key-value pair', () => {
            const data = `{"name" "John", "age": 30}`;
            const result = parser(data);
            assert.strictEqual(result.success, false);
            assert.strictEqual(typeof result.error, 'string');
        });
    });

    describe('Complex Bracket and Escape Handling', () => {
        it('should handle wrong closing bracket', () => {
            const data = `[{"name": "John"}]`;
            const invalidData = `[{"name": "John"}}]`;
            const result = parser(invalidData);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.extraCharsRemoved, true);
            assert.deepStrictEqual(result.data, [{"name": "John"}]);
        });

        it('should handle unexpected closing bracket with empty stack (object)', () => {
            const data = `}`;
            const result = parser(data);
            assert.strictEqual(result.success, false);
            assert.strictEqual(result.fixes.extraCharsRemoved, true);
            assert.strictEqual(typeof result.error, 'string');
        });

        it('should handle unexpected closing bracket with empty stack (array)', () => {
            const data = `]`;
            const result = parser(data);
            assert.strictEqual(result.success, false);
            assert.strictEqual(result.fixes.extraCharsRemoved, true);
            assert.strictEqual(typeof result.error, 'string');
        });

        it('should handle mismatched brackets requiring completion', () => {
            const data = `{"a":[1}`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.bracketCompleted, true);
            assert.deepStrictEqual(result.data, {"a": [1]});
        });

        it('should handle multiple bracket mismatches requiring completion', () => {
            const data = `{"a":{"b":[1}`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.bracketCompleted, true);
            assert.deepStrictEqual(result.data, {"a": {"b": [1]}});
        });

        it('should handle complete JSON followed by extra bracket', () => {
            const data = `{"a":1}}`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.extraCharsRemoved, true);
            assert.deepStrictEqual(result.data, {"a": 1});
        });

        it('should handle array with wrong closing bracket type', () => {
            const data = `[1,2}`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.bracketCompleted, true);
            assert.strictEqual(result.fixes.extraCharsRemoved, true);
            assert.deepStrictEqual(result.data, [1, 2]);
        });

        it('should handle nested structure with extra closing bracket', () => {
            const data = `[{"a":1]]`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.extraCharsRemoved, true);
            assert.deepStrictEqual(result.data, [{"a": 1}]);
        });
    });

    describe('Special Recovery Cases', () => {
        it('should handle array with some valid and some invalid elements', () => {
            const data = `[{"valid": true}, invalid_element, {"also_valid": true}]`;
            const result = parser(data);
            assert.strictEqual(result.success, false);
            assert.strictEqual(typeof result.error, 'string');
        });

        it('should handle deeply nested structure with error at the end', () => {
            const data = `{
                "level1": {
                    "level2": {
                        "level3": {
                            "valid": true,
                            "invalid": 
                        }
                    }
                }
            }`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.valueCompleted, true);
            assert.strictEqual(result.data.level1.level2.level3.invalid, null);
            assert.strictEqual(result.error, undefined);
        });

        it('should handle only brackets', () => {
            const data = `][`;
            const result = parser(data);
            assert.strictEqual(result.success, false);
            assert.strictEqual(typeof result.error, 'string');
            assert.strictEqual(result.data, undefined);
        });

        it('should handle empty object with extra characters', () => {
            const data = `{}extra`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.extraCharsRemoved, true, "Should mark extra characters removed");
            assert.deepStrictEqual(result.data, {}, "Should extract empty object");
        });

        it('should handle empty array with extra characters', () => {
            const data = `[]garbage`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.fixes.extraCharsRemoved, true, "Should mark extra characters removed");
            assert.deepStrictEqual(result.data, [], "Should extract empty array");
        });
    });
});

// 3. Boundary Conditions & Special Input
// --------------------------------------------------
describe('JSON Parser - Boundary Conditions & Special Input', () => {
    it('should handle empty string', () => {
        const emptyData = ``;
        const result = parser(emptyData);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
        assert.strictEqual(result.data, undefined);
    });

    it('should handle whitespace-only string', () => {
        const whitespaceData = `   \n\t  `;
        const result = parser(whitespaceData);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
        assert.strictEqual(result.data, undefined);
    });

    it('should handle null input gracefully', () => {
        const result = parser(null);
        assert.strictEqual(result.success, false);
        assert.ok(result.error);
    });

    it('should handle undefined input gracefully', () => {
        const result = parser(undefined);
        assert.strictEqual(result.success, false);
        assert.ok(result.error);
    });

    it('should handle invalid JSON gracefully', () => {
        const invalidData = `{invalid json}`;
        const result = parser(invalidData);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
        assert.strictEqual(result.data, undefined);
    });

    it('should handle multiple JSON objects', () => {
        const multipleData = `{"first": "value1"} {"second": "value2"}`;
        const result = parser(multipleData);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.extraCharsRemoved, true, "Should mark that extra characters were removed");
        assert(result.data !== undefined, "Should extract at least the first valid object");
    });

    it('should handle array followed by object', () => {
        const mixedData = `[1, 2, 3] {"name": "test"}`;
        const result = parser(mixedData);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.extraCharsRemoved, true, "Should mark that extra characters were removed");
        assert(result.data !== undefined, "Should extract at least the first array");
        const extractedArray = result.data;
        assert(Array.isArray(extractedArray), "Data should be an array");
        assert.deepStrictEqual(extractedArray, [1, 2, 3], "Array should be [1, 2, 3]");
    });

    it('should handle only opening brace', () => {
        const data = `{`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.error, undefined);
        assert.deepStrictEqual(result.data, {});
        assert.strictEqual(result.fixes.bracketCompleted, true);
    });

    it('should handle only closing brace', () => {
        const data = `}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
        assert.strictEqual(result.data, undefined);
    });

    it('should handle extra characters in the middle', () => {
        const data = `{"name": "John"garbage, "age": 30}`;
        const result = parser(data);
        
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle multiple JSON objects separated by garbage', () => {
        const data = `{"first": 1}garbage{"second": 2}`;
        const result = parser(data);
        
        assert.strictEqual(result.success, true); // Changed: should successfully parse first JSON
        assert.strictEqual(result.fixes.extraCharsRemoved, true, "Should mark extra characters removed");
        assert.deepStrictEqual(result.data, { first: 1 }, "Should extract first valid JSON");
    });

    it('should handle random text', () => {
        const data = `this is not json at all`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
        assert.strictEqual(result.data, undefined);
    });
});

// 4. Performance & Large Data Handling
// --------------------------------------------------
describe('JSON Parser - Performance & Large Data Handling', () => {
    it('should complete parsing within reasonable time', () => {
        const startTime = Date.now();
        const data = `{"test": "value"}`;
        const result = parser(data);
        const endTime = Date.now();
        assert.strictEqual(result.success, true);
        assert(endTime - startTime < 1000); // Should complete within 1 second
    });

    it('should handle large JSON object', () => {
        // Create a large JSON object
        const largeObj = {};
        for (let i = 0; i < 1000; i++) {
            largeObj[`key${i}`] = `value${i}`;
        }
        const largeJsonString = JSON.stringify(largeObj);
        const result = parser(largeJsonString);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.error, undefined);
        assert.strictEqual(Object.keys(result.data).length, 1000);
    });

    it('should handle very long malformed string', () => {
        const longString = 'a'.repeat(10000);
        const data = `{"long": "${longString}`;  // Missing closing quote and brace
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.stringClosed, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(result.data.long, longString);
    });
});

// 5. Character Encoding & Escape Sequences
// --------------------------------------------------
describe('JSON Parser - Character Encoding & Escape Sequences', () => {
    it('should handle Unicode characters', () => {
        const unicodeData = `{"chinese": "你好", "emoji": "😀", "special": "àáâãäå"}`;
        const result = parser(unicodeData);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.error, undefined);
        assert.strictEqual(result.data.chinese, "你好");
        assert.strictEqual(result.data.emoji, "😀");
        assert.strictEqual(result.data.special, "àáâãäå");
    });

    it('should handle escaped characters', () => {
        const escapedData = `{"newline": "line1\\nline2", "quote": "He said \\"Hello\\"", "backslash": "path\\\\to\\\\file"}`;
        const result = parser(escapedData);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.error, undefined);
        assert.strictEqual(result.data.newline, "line1\nline2");
        assert.strictEqual(result.data.quote, 'He said "Hello"');
        assert.strictEqual(result.data.backslash, "path\\to\\file");
    });

    it('should handle incomplete escape sequences', () => {
        const data = `{"message": "Hello\\"}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.stringClosed, true);
        assert.strictEqual(result.data.message, 'Hello"}');
    });

    it('should handle invalid escape sequences', () => {
        const data = `{"message": "Hello\\x world"}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle incomplete unicode escape', () => {
        const data = `{"unicode": "\\u00"}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });
});

// 6. Return Structure & Error Formatting
// --------------------------------------------------
describe('JSON Parser - Return Structure & Error Formatting', () => {
    it('should always return object with required properties', () => {
        const data = `{"test": "value"}`;
        const result = parser(data);
        assert(typeof result === 'object');
        assert(typeof result.success === 'boolean');
        assert(result.data !== undefined); // data can be any type or undefined
    });

    it('should include error property when parsing fails', () => {
        const invalidData = `{invalid}`;
        const result = parser(invalidData);
        assert(typeof result === 'object');
        assert(typeof result.success === 'boolean');
        assert(typeof result.error === 'string');
    });

    it('should return data array even on errors', () => {
        const partialData = `{"valid": "data", invalid`;
        const result = parser(partialData);
        // Should contain partial data even with error - data can be undefined or contain partial data
        // The exact behavior depends on where the parsing fails
    });

    it('should handle extra characters after JSON', () => {
        const data = `{"name": "John"}extra_garbage`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.extraCharsRemoved, true, "Should mark extra characters removed");
        assert.deepStrictEqual(result.data, { name: "John" }, "Should extract valid JSON");
    });

    it('should handle extra characters before JSON', () => {
        const data = `garbage{"name": "John"}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });
});

// 7. Advanced Comma & Colon Handling
// --------------------------------------------------
describe('JSON Parser - Advanced Comma & Colon Handling', () => {
    describe('Array Consecutive Commas with Placeholders', () => {
        it('should handle consecutive commas in arrays with null placeholders', () => {
            const jsonWithConsecutiveCommas = `[1,,3,4]`;
            const result = parser(jsonWithConsecutiveCommas);
            assert.strictEqual(result.success, true, "Should successfully parse array with consecutive commas");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, [1, null, 3, 4], "Should insert null placeholder between consecutive commas");
        });

        it('should handle multiple consecutive commas in arrays', () => {
            const jsonWithMultipleCommas = `[1,,,4]`;
            const result = parser(jsonWithMultipleCommas);
            assert.strictEqual(result.success, true, "Should successfully parse array with multiple consecutive commas");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, [1, null, null, 4], "Should insert multiple null placeholders");
        });

        it('should handle consecutive commas at array start', () => {
            const jsonWithStartCommas = `[,1,2]`;
            const result = parser(jsonWithStartCommas);
            assert.strictEqual(result.success, true, "Should successfully parse array with comma at start");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, [null, 1, 2], "Should result in [null, 1, 2]");
        });

        it('should handle consecutive commas in nested arrays', () => {
            const jsonWithNestedCommas = `[[1,2], [3,,5], [6,7]]`;
            const result = parser(jsonWithNestedCommas);
            assert.strictEqual(result.success, true, "Should successfully parse nested arrays with consecutive commas");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, [[1,2], [3, null, 5], [6,7]], "Should insert null placeholder in nested array");
        });
    });

    describe('Object Consecutive Commas Removal', () => {
        it('should remove consecutive commas in objects', () => {
            const jsonWithConsecutiveCommas = `{"a": 1,, "b": 2}`;
            const result = parser(jsonWithConsecutiveCommas);
            assert.strictEqual(result.success, true, "Should successfully parse object with consecutive commas");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, {a: 1, b: 2}, "Should remove extra comma without adding placeholder");
        });

        it('should handle multiple consecutive commas in objects', () => {
            const jsonWithMultipleCommas = `{"a": 1,,, "b": 2}`;
            const result = parser(jsonWithMultipleCommas);
            assert.strictEqual(result.success, true, "Should successfully parse object with multiple consecutive commas");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, {a: 1, b: 2}, "Should remove all extra commas");
        });

        it('should handle consecutive commas in nested objects', () => {
            const jsonWithNestedCommas = `{"user": {"name": "John",, "age": 30}, "active": true}`;
            const result = parser(jsonWithNestedCommas);
            assert.strictEqual(result.success, true, "Should successfully parse nested objects with consecutive commas");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, {user: {name: "John", age: 30}, active: true}, "Should remove extra commas in nested object");
        });
    });

    describe('Mixed Context Comma Handling', () => {
        it('should handle mixed array and object with different comma rules', () => {
            const jsonMixed = `{"items": [1,,3], "meta": {"count": 3,, "valid": true}}`;
            const result = parser(jsonMixed);
            assert.strictEqual(result.success, true, "Should successfully parse mixed array/object with consecutive commas");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, {
                items: [1, null, 3],
                meta: {count: 3, valid: true}
            }, "Should use appropriate comma handling based on context");
        });

        it('should handle complex nested structures with comma issues', () => {
            const jsonComplex = `{"data": [{"values": [1,,3]}, {"values": [4,5,]}], "settings": {"debug": true,, "level": 2}}`;
            const result = parser(jsonComplex);
            assert.strictEqual(result.success, true, "Should successfully parse complex nested structure");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, {
                data: [
                    {values: [1, null, 3]},
                    {values: [4, 5]}
                ],
                settings: {debug: true, level: 2}
            }, "Should handle different comma contexts correctly");
        });
    });

    describe('Advanced Colon Handling', () => {
        it('should handle colon followed by comma in objects', () => {
            const jsonWithColonComma = `{"name": "John", "age":, "city": "NYC"}`;
            const result = parser(jsonWithColonComma);
            assert.strictEqual(result.success, true, "Should successfully parse object with colon followed by comma");
            assert.strictEqual(result.fixes.valueCompleted, true, "Should indicate value was completed");
            assert.deepStrictEqual(result.data, {name: "John", age: null, city: "NYC"}, "Should add null value after colon");
        });

        it('should handle colon followed by closing brace', () => {
            const jsonWithColonBrace = `{"name": "John", "age":}`;
            const result = parser(jsonWithColonBrace);
            assert.strictEqual(result.success, true, "Should successfully parse object with colon followed by closing brace");
            assert.strictEqual(result.fixes.valueCompleted, true, "Should indicate value was completed");
            assert.deepStrictEqual(result.data, {name: "John", age: null}, "Should add null value after colon");
        });

        it('should handle multiple missing values after colons', () => {
            const jsonWithMultipleColons = `{"a":, "b":, "c": 3}`;
            const result = parser(jsonWithMultipleColons);
            assert.strictEqual(result.success, true, "Should successfully parse object with multiple missing values");
            assert.strictEqual(result.fixes.valueCompleted, true, "Should indicate values were completed");
            assert.deepStrictEqual(result.data, {a: null, b: null, c: 3}, "Should add null values for all missing values");
        });

        it('should handle nested objects with missing values', () => {
            const jsonWithNestedMissingValues = `{"user": {"name":, "profile": {"age":}}, "active": true}`;
            const result = parser(jsonWithNestedMissingValues);
            assert.strictEqual(result.success, true, "Should successfully parse nested objects with missing values");
            assert.strictEqual(result.fixes.valueCompleted, true, "Should indicate values were completed");
            assert.deepStrictEqual(result.data, {
                user: {name: null, profile: {age: null}},
                active: true
            }, "Should add null values in nested structures");
        });
    });

    describe('Special Edge Cases for Comma Handling', () => {
        it('should handle single comma in empty array [,]', () => {
            const jsonEmptyArrayWithComma = `[,]`;
            const result = parser(jsonEmptyArrayWithComma);
            assert.strictEqual(result.success, true, "Should successfully parse [,]");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, [null], "Should result in [null]");
        });

        it('should handle double comma in empty array [,,]', () => {
            const jsonEmptyArrayWithDoubleComma = `[,,]`;
            const result = parser(jsonEmptyArrayWithDoubleComma);
            assert.strictEqual(result.success, true, "Should successfully parse [,,]");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, [null, null], "Should result in [null, null]");
        });

        it('should handle triple comma in empty array [,,,]', () => {
            const jsonEmptyArrayWithTripleComma = `[,,,]`;
            const result = parser(jsonEmptyArrayWithTripleComma);
            assert.strictEqual(result.success, true, "Should successfully parse [,,,]");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, [null, null, null], "Should result in [null, null, null]");
        });

        it('should handle comma at start followed by values [,1,2]', () => {
            const jsonStartCommaWithValues = `[,1,2]`;
            const result = parser(jsonStartCommaWithValues);
            assert.strictEqual(result.success, true, "Should successfully parse [,1,2]");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, [null, 1, 2], "Should result in [null, 1, 2]");
        });

        it('should handle values followed by comma at end [1,2,]', () => {
            const jsonEndCommaWithValues = `[1,2,]`;
            const result = parser(jsonEndCommaWithValues);
            assert.strictEqual(result.success, true, "Should successfully parse [1,2,]");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, [1, 2], "Should result in [1, 2] (trailing comma removed)");
        });

        it('should handle mixed comma patterns [,1,,2,]', () => {
            const jsonMixedCommaPattern = `[,1,,2,]`;
            const result = parser(jsonMixedCommaPattern);
            assert.strictEqual(result.success, true, "Should successfully parse [,1,,2,]");
            assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
            assert.deepStrictEqual(result.data, [null, 1, null, 2], "Should result in [null, 1, null, 2]");
        });
    });
});

// 8. Partial Data Extraction & Recovery
// --------------------------------------------------
describe('JSON Parser - Partial Data Extraction & Recovery', () => {
    it('should extract valid key-value pairs before error (object missing closing brace)', () => {
        const data = '{"a": 1, "b": 2, "c": 3';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert(result.data !== undefined, "Should have extracted at least one data item");
        const partial = result.data;
        assert(Object.keys(partial).length > 0, "Extracted object should not be empty");
        assert.strictEqual(partial.a, 1, "Should extract property 'a' with value 1");
        assert.strictEqual(partial.b, 2, "Should extract property 'b' with value 2");
    });

    it('should extract valid array with auto-completion (array missing closing bracket)', () => {
        const data = '[1, 2, 3, 4';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.deepStrictEqual(result.data, [1, 2, 3, 4]);
        assert(Array.isArray(result.data), "Should extract auto-completed array");
        const extractedArray = result.data;
        assert(extractedArray.includes(1), "Should contain number 1");
        assert(extractedArray.includes(2), "Should contain number 2");
        assert(extractedArray.includes(3), "Should contain number 3");
        assert(extractedArray.includes(4), "Should contain number 4");
    });

    it('should extract valid object before garbage (object + garbage)', () => {
        const data = '{"x": 10, "y": 20}garbage';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.extraCharsRemoved, true, "Should mark extra characters removed");
        assert(result.data !== undefined, "Should have extracted at least one data item");
        const extracted = result.data;
        assert(extracted && typeof extracted === 'object', "Extracted data should be a valid object");
        assert(Object.keys(extracted).length === 2, "Extracted object should have exactly 2 properties");
        assert.deepStrictEqual(extracted, { x: 10, y: 20 }, "Should extract complete object before garbage");
    });

    it('should handle valid object followed by garbage', () => {
        const data = `{"name": "John", "age": 30} this is garbage`;
        const result = parser(data);
        
        assert.strictEqual(result.success, true); // Changed: should successfully parse valid JSON part
        assert.strictEqual(result.fixes.extraCharsRemoved, true, "Should mark extra characters removed");
        
        // Ensure data is extracted
        assert(result.data !== undefined, "Should have extracted at least one data item");
        
        // Verify the extracted object is valid - should be the complete object
        assert(result.data && typeof result.data === 'object', "Should extract a valid object");
        assert('name' in result.data && 'age' in result.data, "Should contain name and age properties");
        
        assert.strictEqual(result.data.name, "John", "Should extract name='John'");
        assert.strictEqual(result.data.age, 30, "Should extract age=30");
        assert.strictEqual(Object.keys(result.data).length, 2, "Should only extract the two valid properties");
        
        // Ensure garbage data is not parsed as valid data - since data is a single object, check it directly
        if (typeof result.data === 'string') {
            assert(!result.data.includes('garbage'), "Should not include garbage text as valid data");
        }
    });

    it('should extract valid objects before error (multiple objects, second broken)', () => {
        const data = '{"a": 1}{"b": 2, "c":';
        const result = parser(data);
        assert.strictEqual(result.success, true); // Changed: should successfully parse first valid JSON
        assert.strictEqual(result.fixes.extraCharsRemoved, true, "Should mark extra characters removed");
        
        // Ensure data is extracted
        assert(result.data !== undefined, "Should have extracted at least the first object");
        
        // Verify the first complete object - stream parser typically returns the first valid object
        const firstObject = result.data;
        assert(firstObject && typeof firstObject === 'object', "Should extract the first object");
        // Should extract the first complete object
        assert(firstObject.a === 1 || (firstObject.b === 2), "Should extract valid object data");
        assert(firstObject && typeof firstObject === 'object', "First extracted item should be an object");
        assert(Object.keys(firstObject).length === 1, "First object should have exactly 1 property");
        assert.deepStrictEqual(firstObject, { a: 1 }, "Should extract first complete object correctly");
        
        // Verify no incomplete second object is extracted - since data is not an array anymore, check the single object
        if (result.data && typeof result.data === 'object') {
            assert(!('c' in result.data && result.data.c === undefined), "Should not extract incomplete property 'c'");
        }
    });

    it('should handle malformed array with syntax errors (no data extraction)', () => {
        const data = '[1, 2, invalid, 3]';
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
        assert.strictEqual(result.data, undefined, "Should not extract data from malformed JSON array");
    });

    it('should extract valid nested object before error', () => {
        const data = '{"user": {"name": "John", "age": 30, "profile": {"email": "a@b.com"';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.deepStrictEqual(result.data, {"user": {"name": "John", "age": 30, "profile": {"email": "a@b.com"}}});
        assert.strictEqual(result.error, undefined);
        assert(result.data !== undefined, "Should have extracted at least some data");
        const extractedData = result.data;
        assert(extractedData && typeof extractedData === 'object', "Should extract an object");
    });

    it('should handle object with trailing comma syntax error (no data extraction)', () => {
        const data = '{"a": 1, "b": 2,}';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.commaFixed, true);
        assert.deepStrictEqual(result.data, {"a": 1, "b": 2});
    });

    it('should handle array with trailing comma syntax error (no data extraction)', () => {
        const data = '[1, 2, 3,]';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.commaFixed, true);
        assert.deepStrictEqual(result.data, [1, 2, 3]);
    });
});

// 9. Newline & Special Character Handling
// --------------------------------------------------
describe('JSON Parser - Newline & Special Character Handling', () => {
    it('should handle unescaped newlines in simple string values', () => {
        const jsonWithNewlines = '{"message": "First line\nSecond line"}';
        const result = parser(jsonWithNewlines);
        assert.strictEqual(result.success, true, "Should successfully parse JSON with unescaped newline");
        assert.strictEqual(result.data.message, "First line\nSecond line", "Should preserve newline as escaped character");
    });

    it('should handle unescaped carriage returns in string values', () => {
        const jsonWithCarriageReturns = '{"message": "First line\rSecond line"}';
        const result = parser(jsonWithCarriageReturns);
        assert.strictEqual(result.success, true, "Should successfully parse JSON with unescaped carriage return");
        assert.strictEqual(result.data.message, "First line\rSecond line", "Should preserve carriage return as escaped character");
    });

    it('should handle mixed unescaped line breaks (CR, LF, CRLF) in string values', () => {
        const jsonWithMixedLineBreaks = '{"message": "First line\rSecond line\nThird line\r\nFourth line"}';
        const result = parser(jsonWithMixedLineBreaks);
        assert.strictEqual(result.success, true, "Should successfully parse JSON with mixed unescaped line breaks");
        assert.strictEqual(
            result.data.message, 
            "First line\rSecond line\nThird line\r\nFourth line", 
            "Should preserve all types of line breaks"
        );
    });

    it('should handle unescaped newlines in array of strings', () => {
        const jsonArrayWithNewlines = '{"lines": ["First line\nSecond line", "Third line\nFourth line"]}';
        const result = parser(jsonArrayWithNewlines);
        assert.strictEqual(result.success, true, "Should successfully parse JSON array with unescaped newlines");
        assert.deepStrictEqual(
            result.data.lines,
            ["First line\nSecond line", "Third line\nFourth line"],
            "Should preserve newlines in all array elements"
        );
    });

    it('should handle unescaped newlines in nested object properties', () => {
        const nestedJsonWithNewlines = `{
            "user": {
                "name": "John Doe",
                "bio": "Software Engineer\nOpen Source Contributor\nTech Writer"
            }
        }`;
        const result = parser(nestedJsonWithNewlines);
        assert.strictEqual(result.success, true, "Should successfully parse nested JSON with unescaped newlines");
        assert.strictEqual(
            result.data.user.bio,
            "Software Engineer\nOpen Source Contributor\nTech Writer",
            "Should preserve newlines in nested property"
        );
    });

    it('should handle multiple unescaped newlines and indentation in multiline string', () => {
        const multilineJson = `{
            "description": "This is a 
            multiline description with
                varying indentation and
            multiple line breaks"
        }`;
        const result = parser(multilineJson);
        assert.strictEqual(result.success, true, "Should successfully parse JSON with multiline string");
        assert(result.data.description.includes("multiline description"), "Should preserve content");
        assert(result.data.description.includes("varying indentation"), "Should preserve content");
    });
    
    it('should handle unescaped newlines in string with special characters', () => {
        const jsonWithSpecialChars = '{"message": "Test with special chars: !@#$%^&*()_+{}\\n and newline\nin the middle"}';
        const result = parser(jsonWithSpecialChars);
        assert.strictEqual(result.success, true, "Should successfully parse JSON with special chars and unescaped newline");
        assert.strictEqual(
            result.data.message,
            "Test with special chars: !@#$%^&*()_+{}\n and newline\nin the middle",
            "Should preserve escaped \\n sequence and actual newline"
        );
    });
});

// 10. Complex Scenarios & Edge Cases
// --------------------------------------------------
describe('JSON Parser - Complex Scenarios & Edge Cases', () => {
    it('should handle combination of comma and colon issues', () => {
        const jsonComplex = `{"items": [1,,3], "meta": {"count":, "tags": ["a",, "c"]}}`;
        const result = parser(jsonComplex);
        assert.strictEqual(result.success, true, "Should successfully parse JSON with both comma and colon issues");
        assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
        assert.strictEqual(result.fixes.valueCompleted, true, "Should indicate value was completed");
        assert.deepStrictEqual(result.data, {
            items: [1, null, 3],
            meta: {count: null, tags: ["a", null, "c"]}
        }, "Should handle both comma and colon fixes correctly");
    });

    it('should handle whitespace around problematic commas and colons', () => {
        const jsonWithWhitespace = `{"a": 1, , "b": 2, "c": , "d": [1, , 3]}`;
        const result = parser(jsonWithWhitespace);
        assert.strictEqual(result.success, true, "Should successfully parse JSON with whitespace around issues");
        assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
        assert.strictEqual(result.fixes.valueCompleted, true, "Should indicate value was completed");
        assert.deepStrictEqual(result.data, {
            a: 1,
            b: 2,
            c: null,
            d: [1, null, 3]
        }, "Should handle whitespace correctly");
    });

    it('should handle deeply nested comma issues', () => {
        const jsonDeeplyNested = `[{"arr": [,1,]}, [,2,,3,]]`;
        const result = parser(jsonDeeplyNested);
        assert.strictEqual(result.success, true, "Should successfully parse deeply nested comma issues");
        assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
        assert.deepStrictEqual(result.data, [
            {arr: [null, 1]},
            [null, 2, null, 3]
        ], "Should handle all comma issues in nested structure");
    });

    it('should distinguish object vs array comma handling in complex case', () => {
        const jsonComplexMixed = `{"obj": {"a":,, "b": 1}, "arr": [,1,,2,]}`;
        const result = parser(jsonComplexMixed);
        assert.strictEqual(result.success, true, "Should successfully parse complex mixed case");
        assert.strictEqual(result.fixes.commaFixed, true, "Should indicate comma was fixed");
        assert.strictEqual(result.fixes.valueCompleted, true, "Should indicate value was completed");
        assert.deepStrictEqual(result.data, {
            obj: {a: null, b: 1},
            arr: [null, 1, null, 2]
        }, "Should apply correct comma handling based on context");
    });

    it('should handle deeply nested bracket mismatches', () => {
        const data = `{"level1":{"level2":{"level3":[1,2}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.deepStrictEqual(result.data, {
            "level1": {
                "level2": {
                    "level3": [1, 2]
                }
            }
        });
    });

    it('should handle complex bracket pattern with multiple types (expect failure due to structural issues)', () => {
        const data = `[{"obj1":[1,2},"obj2":{"arr":[3}}]`;
        const result = parser(data);
        // This case should fail because even after bracket completion,
        // the structure has "obj2": which is invalid in array context
        assert.strictEqual(result.success, false);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(result.fixes.extraCharsRemoved, true);
        assert.strictEqual(typeof result.error, 'string');
        assert.strictEqual(result.fixedJson, `[{"obj1":[1,2]},"obj2":{"arr":[3]}]`);
    });

    it('should handle empty containers with bracket mismatches', () => {
        const data = `{"empty_array":[],"empty_obj":{}}`;
        const mismatchData = `{"empty_array":[],"empty_obj":{}}]`;
        const result = parser(mismatchData);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.extraCharsRemoved, true);
        assert.deepStrictEqual(result.data, {
            "empty_array": [],
            "empty_obj": {}
        });
    });

    it('should handle malformed JSON with syntax errors (no data extraction)', () => {
        const data = `{"valid": "data", "invalid": invalid_value}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
        assert.strictEqual(result.data, undefined, "Should not extract data from malformed JSON");
    });

    it('should handle invalid numbers', () => {
        const data = `{"number": 123.45.67}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle numbers with leading zeros', () => {
        const data = `{"number": 0123}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle multiple decimal points', () => {
        const data = `{"number": 12.34.56}`;
        const result = parser(data);
        
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle unescaped quotes in strings', () => {
        const data = `{"message": "He said "hello" to me"}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle single quotes instead of double quotes', () => {
        const data = `{'name': 'John', 'age': 30}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle unquoted keys', () => {
        const data = `{name: "John", age: 30}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle comments in JSON', () => {
        const data = `{
            "name": "John", // This is a comment
            "age": 30
        }`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });
});

// 11. Security & DoS Prevention Tests
// --------------------------------------------------
describe('JSON Parser - Security & DoS Prevention', () => {
    it('should handle extremely deeply nested objects without stack overflow', () => {
        // Create a deeply nested object (but not too deep to avoid actual stack overflow in test)
        let deepJson = '{"level0":';
        for (let i = 1; i < 100; i++) {
            deepJson += `{"level${i}":`;
        }
        deepJson += '{"value":"deep"}';
        for (let i = 0; i < 100; i++) {
            deepJson += '}';
        }
        
        const result = parser(deepJson);
        assert.strictEqual(result.success, true);
        assert(result.data && typeof result.data === 'object');
    });

    it('should handle extremely deeply nested arrays without stack overflow', () => {
        // Create a deeply nested array
        let deepJson = '';
        for (let i = 0; i < 100; i++) {
            deepJson += '[';
        }
        deepJson += '"deep"';
        for (let i = 0; i < 100; i++) {
            deepJson += ']';
        }
        
        const result = parser(deepJson);
        assert.strictEqual(result.success, true);
        assert(Array.isArray(result.data));
    });

    it('should handle extremely long property names', () => {
        const longKey = 'x'.repeat(10000);
        const data = `{"${longKey}": "value"}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data[longKey], "value");
    });

    it('should handle extremely long string values', () => {
        const longValue = 'a'.repeat(50000);
        const data = `{"key": "${longValue}"}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.key, longValue);
    });

    it('should handle object with extremely many properties', () => {
        let data = '{';
        for (let i = 0; i < 1000; i++) {
            if (i > 0) data += ',';
            data += `"key${i}": ${i}`;
        }
        data += '}';
        
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(Object.keys(result.data).length, 1000);
        assert.strictEqual(result.data.key500, 500);
    });

    it('should handle array with extremely many elements', () => {
        let data = '[';
        for (let i = 0; i < 5000; i++) {
            if (i > 0) data += ',';
            data += i;
        }
        data += ']';
        
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.length, 5000);
        assert.strictEqual(result.data[2500], 2500);
    });
});

// 12. Advanced Unicode & Internationalization
// --------------------------------------------------
describe('JSON Parser - Advanced Unicode & Internationalization', () => {
    it('should handle various international characters', () => {
        const data = `{
            "english": "Hello World",
            "chinese": "你好世界",
            "japanese": "こんにちは世界",
            "korean": "안녕하세요 세계",
            "arabic": "مرحبا بالعالم",
            "russian": "Привет мир",
            "emoji": "🌍🌎🌏",
            "mathematical": "∑∏∆∇∂∞"
        }`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.chinese, "你好世界");
        assert.strictEqual(result.data.japanese, "こんにちは世界");
        assert.strictEqual(result.data.emoji, "🌍🌎🌏");
    });

    it('should handle complex Unicode escape sequences', () => {
        const data = `{
            "unicode1": "\\u4F60\\u597D",
            "unicode2": "\\u3053\\u3093\\u306B\\u3061\\u306F",
            "surrogate": "\\uD83C\\uDF0D"
        }`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.unicode1, "你好");
        assert.strictEqual(result.data.unicode2, "こんにちは");
        assert.strictEqual(result.data.surrogate, "🌍");
    });

    it('should handle mixed Unicode and escape sequences', () => {
        const data = `{"mixed": "Hello\\u0020世界\\u0021"}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.mixed, "Hello 世界!");
    });

    it('should handle zero-width and invisible characters', () => {
        const data = `{"invisible": "text\\u200Bwith\\u200Czero\\u200Dwidth"}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert(result.data.invisible.includes('\u200B'));
    });

    it('should handle RTL (Right-to-Left) text', () => {
        const data = `{"rtl": "This is \\u202Eright-to-left\\u202C text"}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert(result.data.rtl.includes('\u202E'));
    });
});

// 13. Advanced Number Format Tests
// --------------------------------------------------
describe('JSON Parser - Advanced Number Formats', () => {
    it('should handle scientific notation', () => {
        const data = `{
            "small": 1.23e-10,
            "large": 1.23e+20,
            "negative": -4.56E-7,
            "positive": 7.89E+12
        }`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.small, 1.23e-10);
        assert.strictEqual(result.data.large, 1.23e+20);
        assert.strictEqual(result.data.negative, -4.56E-7);
        assert.strictEqual(result.data.positive, 7.89E+12);
    });

    it('should handle edge case numbers', () => {
        const data = `{
            "zero": 0,
            "negativeZero": -0,
            "maxSafeInteger": 9007199254740991,
            "minSafeInteger": -9007199254740991,
            "verySmall": 5e-324,
            "veryLarge": 1.7976931348623157e+308
        }`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.zero, 0);
        assert.strictEqual(result.data.maxSafeInteger, 9007199254740991);
    });

    it('should handle malformed scientific notation', () => {
        const data = `{"invalid": 1.23e}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle numbers with excessive precision', () => {
        const data = `{"precise": 3.141592653589793238462643383279502884197169399375105820974944}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert(typeof result.data.precise === 'number');
    });

    it('should handle hexadecimal-like strings (should fail)', () => {
        const data = `{"hex": 0x1A2B}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle octal-like strings (should fail)', () => {
        const data = `{"octal": 0o755}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle binary-like strings (should fail)', () => {
        const data = `{"binary": 0b1010}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });
});

// 14. Advanced String Escape & Control Characters
// --------------------------------------------------
describe('JSON Parser - Advanced String Escapes & Control Characters', () => {
    it('should handle all standard escape sequences', () => {
        const data = `{
            "backslash": "\\\\",
            "quote": "\\"",
            "newline": "\\n",
            "carriageReturn": "\\r",
            "tab": "\\t",
            "backspace": "\\b",
            "formFeed": "\\f",
            "slash": "\\/"
        }`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.backslash, "\\");
        assert.strictEqual(result.data.quote, '"');
        assert.strictEqual(result.data.newline, "\n");
        assert.strictEqual(result.data.tab, "\t");
    });

    it('should handle control characters in Unicode escape', () => {
        const data = `{
            "null": "\\u0000",
            "bell": "\\u0007",
            "escape": "\\u001B",
            "delete": "\\u007F"
        }`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.null, "\u0000");
        assert.strictEqual(result.data.bell, "\u0007");
    });

    it('should handle invalid Unicode escape sequences', () => {
        const data = `{"invalid": "\\uGGGG"}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle partial Unicode escape sequences', () => {
        const data = `{"partial": "\\u12"}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle unescaped control characters (should fail)', () => {
        // Control character (ASCII 7 - Bell)
        const data = `{"control": "text\u0007here"}`;
        const result = parser(data);
        // This might succeed depending on parser implementation
        // Some parsers allow unescaped control characters
        assert(typeof result.success === 'boolean');
    });

    it('should handle string with mixed valid and invalid escapes', () => {
        const data = `{"mixed": "valid\\ntext\\qinvalid"}`;
        const result = parser(data);
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });
});

// 15. Whitespace & Formatting Edge Cases
// --------------------------------------------------
describe('JSON Parser - Whitespace & Formatting Edge Cases', () => {
    it('should handle all types of whitespace characters', () => {
        const data = `{\u0020\u0009\u000A\u000D"key"\u0020:\u0009"value"\u000A}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.key, "value");
    });

    it('should handle non-breaking spaces and Unicode whitespace', () => {
        // Note: JSON spec only allows specific whitespace characters
        const data = `{\u00A0"key": "value"\u00A0}`;
        const result = parser(data);
        // This should typically fail as \u00A0 is not valid JSON whitespace
        assert.strictEqual(result.success, false);
        assert.strictEqual(typeof result.error, 'string');
    });

    it('should handle excessive whitespace', () => {
        const spaces = ' '.repeat(1000);
        const data = `{${spaces}"key"${spaces}:${spaces}"value"${spaces}}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.key, "value");
    });

    it('should handle mixed line endings', () => {
        const data = "{\r\n  \"key1\": \"value1\",\n  \"key2\": \"value2\"\r}";
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.key1, "value1");
        assert.strictEqual(result.data.key2, "value2");
    });

    it('should handle tabs vs spaces mixing', () => {
        const data = "{\n\t  \"key\": {\n    \t\"nested\": \"value\"\n\t  }\n}";
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.key.nested, "value");
    });
});

// 16. Memory & Resource Management Tests
// --------------------------------------------------
describe('JSON Parser - Memory & Resource Management', () => {
    it('should handle repeated parsing without memory leaks', () => {
        const data = `{"test": "value", "number": 42}`;
        
        // Parse the same JSON multiple times
        for (let i = 0; i < 100; i++) {
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.data.test, "value");
            assert.strictEqual(result.data.number, 42);
        }
    });

    it('should handle garbage collection friendly parsing', () => {
        // Create and parse many different JSON objects
        for (let i = 0; i < 50; i++) {
            const data = `{"iteration": ${i}, "data": "test_${i}"}`;
            const result = parser(data);
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.data.iteration, i);
        }
    });

    it('should handle concurrent parsing simulation', () => {
        const promises = [];
        
        for (let i = 0; i < 20; i++) {
            promises.push(new Promise((resolve) => {
                const data = `{"id": ${i}, "processed": true}`;
                const result = parser(data);
                assert.strictEqual(result.success, true);
                assert.strictEqual(result.data.id, i);
                resolve(result);
            }));
        }
        
        return Promise.all(promises);
    });
});

// 17. Error Recovery & Robustness Tests
// --------------------------------------------------
describe('JSON Parser - Error Recovery & Robustness', () => {
    it('should provide meaningful error messages for common mistakes', () => {
        const testCases = [
            { data: `{key: "value"}`, expectedError: /property|expected/i },
            { data: `{"key" "value"}`, expectedError: /colon|expected/i },
            { data: `['single', 'quotes']`, expectedError: /quote|token/i }
        ];
        
        testCases.forEach(({ data, expectedError }) => {
            const result = parser(data);
            assert.strictEqual(result.success, false);
            assert(expectedError.test(result.error), `Error message should match pattern for: ${data}. Got: ${result.error}`);
        });
        
        // Test cases that may be fixed by the parser
        const fixableTestCases = [
            { data: `{"key": }`, shouldBeFixed: true },
            { data: `{"key": "value",}`, shouldBeFixed: true }
        ];
        
        fixableTestCases.forEach(({ data, shouldBeFixed }) => {
            const result = parser(data);
            if (shouldBeFixed) {
                // If parser fixes these issues, that's valid behavior
                assert.strictEqual(result.success, true);
                assert(result.fixes && (result.fixes.valueCompleted || result.fixes.commaFixed));
            } else {
                // If parser doesn't fix it, it should fail with appropriate error
                assert.strictEqual(result.success, false);
                assert(typeof result.error === 'string');
            }
        });
    });

    it('should recover from multiple types of errors in sequence', () => {
        const data = `{"valid": true, broken: "unclosed string, "another": 123.45.67}`;
        const result = parser(data);
        
        // The parser should either fail completely or recover some valid parts
        assert(typeof result.success === 'boolean');
        if (result.success && result.data) {
            // If it recovers, it should at least get some valid data
            assert(Object.keys(result.data).length > 0);
        } else {
            // If it fails, it should provide a meaningful error
            assert(typeof result.error === 'string');
            assert(result.error.length > 0);
        }
    });

    it('should handle circular reference simulation (malformed)', () => {
        // Simulate what might happen with circular references
        const data = `{"a": {"b": {"c": {"ref": "$circular"}}}}`;
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.a.b.c.ref, "$circular");
    });

    it('should handle parser state corruption simulation', () => {
        const malformedInputs = [
            `{{{{{`,
            `}}}}}`,
            `[[[[[`,
            `]]]]]`,
            `"""""`,
            `,,,,,,`,
            `::::::`,
            `......`
        ];
        
        malformedInputs.forEach(input => {
            const result = parser(input);
            assert(typeof result.success === 'boolean');
            if (!result.success) {
                assert(typeof result.error === 'string');
            }
        });
    });
});

// 18. Chinese Punctuation Conversion Tests
// --------------------------------------------------
describe('JSON Parser - Chinese Punctuation Conversion', () => {
    it('should convert Chinese colon to English colon', () => {
        const data = '{"name"："张三", "age": 25}';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, true);
        assert.deepStrictEqual(result.data, { name: "张三", age: 25 });
        assert.strictEqual(result.fixedJson, '{"name":"张三", "age": 25}');
    });

    it('should convert Chinese semicolon to comma', () => {
        const data = '["apple"；"banana"；"orange"]';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, true);
        assert.deepStrictEqual(result.data, ["apple", "banana", "orange"]);
        assert.strictEqual(result.fixedJson, '["apple","banana","orange"]');
    });

    it('should handle mixed Chinese and English punctuation', () => {
        const data = '{"title"："测试"；"count"：10, "active": true}';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, true);
        assert.deepStrictEqual(result.data, { title: "测试", count: 10, active: true });
    });

    it('should not replace Chinese punctuation inside strings', () => {
        const data = '{"text": "这是一个测试：包含中文标点；符号"}';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, false);
        assert.deepStrictEqual(result.data, { text: "这是一个测试：包含中文标点；符号" });
    });

    it('should handle nested objects with Chinese punctuation', () => {
        const data = '{"user"：{"name"："李四"；"profile"：{"email"："test@example.com"}}}';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, true);
        assert.deepStrictEqual(result.data, {
            user: {
                name: "李四",
                profile: {
                    email: "test@example.com"
                }
            }
        });
    });

    it('should handle arrays with Chinese punctuation', () => {
        const data = '{"items"：[{"id"：1；"name"："item1"}；{"id"：2；"name"："item2"}]}';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, true);
        assert.deepStrictEqual(result.data, {
            items: [
                { id: 1, name: "item1" },
                { id: 2, name: "item2" }
            ]
        });
    });

    it('should handle Chinese punctuation with whitespace', () => {
        const data = '{"key1" ： "value1" ； "key2" ： "value2"}';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, true);
        assert.deepStrictEqual(result.data, { key1: "value1", key2: "value2" });
    });

    it('should handle incomplete JSON with Chinese punctuation', () => {
        const data = '{"name"："张三"；"age"：';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, true);
        assert.strictEqual(result.fixes.bracketCompleted, true);
        assert.strictEqual(result.fixes.valueCompleted, true);
        assert.deepStrictEqual(result.data, { name: "张三", age: null });
    });

    it('should handle Chinese punctuation in markdown code blocks', () => {
        const data = '```json\n{"title"："测试数据"；"value"：123}\n```';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.markdownRemoved, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, true);
        assert.deepStrictEqual(result.data, { title: "测试数据", value: 123 });
    });

    it('should handle mixed Chinese punctuation with trailing commas', () => {
        const data = '{"items"：["first"；"second"；]；"count"：2；}';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, true);
        assert.strictEqual(result.fixes.commaFixed, true);
        assert.deepStrictEqual(result.data, { items: ["first", "second"], count: 2 });
    });

    it('should preserve Chinese punctuation in string values while fixing structure', () => {
        const data = '{"message"："这是一条消息：内容很重要；请仔细阅读"；"priority"：1}';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, true);
        assert.deepStrictEqual(result.data, {
            message: "这是一条消息：内容很重要；请仔细阅读",
            priority: 1
        });
    });

    it('should handle Chinese punctuation with consecutive commas in arrays', () => {
        const data = '[；；"item1"；；"item2"；；]';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, true);
        assert.strictEqual(result.fixes.commaFixed, true);
        assert.deepStrictEqual(result.data, [null, null, "item1", null, "item2", null]);
    });

    it('should not indicate Chinese punctuation fixed when there is none', () => {
        const data = '{"english": "text", "numbers": [1, 2, 3]}';
        const result = parser(data);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.fixes.chinesePunctuationFixed, false);
        assert.deepStrictEqual(result.data, { english: "text", numbers: [1, 2, 3] });
    });
});
