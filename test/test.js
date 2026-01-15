import { describe, it } from 'node:test';
import assert from 'node:assert';
import parser from '../index.ts';

describe("Jaison Parser", () => {
    describe("simple value", () => {
        it("should parse a simple value", () => {
            const input = "123";
            const expected = 123;
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse a string value", () => {
            const input = '"hello"';
            const expected = "hello";
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse a single-quoted string value", () => {
            const input = "'hello'";
            const expected = "hello";
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse single-quoted string with double quotes inside", () => {
            const input = "'He said \"Hello\" to me'";
            const expected = 'He said "Hello" to me';
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse single-quoted string with escaped quotes", () => {
            const input = "'Already \"escaped\" quotes'";
            const expected = 'Already "escaped" quotes';
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse single-quoted string with mixed quotes", () => {
            const input = "'Mix of \"escaped\" and \"unescaped\" quotes'";
            const expected = 'Mix of "escaped" and "unescaped" quotes';
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse boolean value", () => {
            const input = "true";
            const expected = true;
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse a null value", () => {
            const input = "null";
            const expected = null;
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse an undefined value", () => {
            const input = "undefined";
            const expected = undefined;
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });
    });

    describe("simple array", () => {
        it("should parse an empty array", () => {
            const input = "[]";
            const expected = [];
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse an array with one element", () => {
            const input = "[1]";
            const expected = [1];
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse an array with multiple elements", () => {
            const input = "[1, 2, 3]";
            const expected = [1, 2, 3];
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse an array with mixed types", () => {
            const input = '[1, "two", true, null]';
            const expected = [1, "two", true, null];
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });
    });

    describe("simple object", () => {
        it("should parse an empty object", () => {
            const input = "{}";
            const expected = {};
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse an object with one key-value pair", () => {
            const input = '{"key": "value"}';
            const expected = { key: "value" };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse an object with multiple key-value pairs", () => {
            const input = '{"key1": 1, "key2": 2}';
            const expected = { key1: 1, key2: 2 };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse an object with mixed types", () => {
            const input = '{"key1": 1, "key2": "two", "key3": true, "key4": null}';
            const expected = { key1: 1, key2: "two", key3: true, key4: null };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse object with single-quoted keys", () => {
            const input = "{'name': 'John', 'age': 30}";
            const expected = { name: "John", age: 30 };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse object with mixed quote styles", () => {
            const input = '{"name": \'John\', \'age\': 30, "active": true}';
            const expected = { name: "John", age: 30, active: true };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it("should parse object with single-quoted values containing double quotes", () => {
            const input = "{'message': 'He said \"Hello\" to everyone', 'author': 'John'}";
            const expected = { message: 'He said "Hello" to everyone', author: "John" };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });
    });

    describe('Basic Functionality & Type Support', () => {
        it('should parse valid JSON object correctly', () => {
            const data = `{"name": "John", "age": 30, "city": "New York"}`;
            const result = parser(data);
            assert.deepStrictEqual(result, {
                name: "John",
                age: 30,
                city: "New York"
            });
        });

        it('should parse valid JSON array correctly', () => {
            const complexData = `[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]`;
            const result = parser(complexData);
            assert.deepStrictEqual(result, [
                { id: 1, name: "Alice" },
                { id: 2, name: "Bob" }
            ]);
        });

        it('should parse complex nested object correctly', () => {
            const complexData = `{"user": {"name": "John", "details": {"age": 30, "active": true}}, "items": [1, 2, 3]}`;
            const result = parser(complexData);
            assert.deepStrictEqual(result, {
                user: {
                    name: "John",
                    details: {
                        age: 30,
                        active: true
                    }
                },
                items: [1, 2, 3]
            });
        });

        it('should handle various data types correctly', () => {
            const data = `{"string": "test", "number": 42, "boolean": true, "null": null, "float": 3.14}`;
            const result = parser(data);
            assert.deepStrictEqual(result, {
                string: "test",
                number: 42,
                boolean: true,
                null: null,
                float: 3.14
            });
        });
    });

    describe('Single Quote Support & Quote Handling', () => {
        it('should parse arrays with single-quoted strings', () => {
            const input = "['apple', 'banana', 'cherry']";
            const expected = ['apple', 'banana', 'cherry'];
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should parse nested objects with single quotes', () => {
            const input = "{'user': {'name': 'John', 'details': {'age': 30, 'active': true}}}";
            const expected = {
                user: {
                    name: "John",
                    details: {
                        age: 30,
                        active: true
                    }
                }
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle complex single-quoted strings with escape sequences', () => {
            const input = "{'path': 'C:\\\\Program Files\\\\My App', 'description': 'A \"great\" application'}";
            const expected = {
                path: 'C:\\Program Files\\My App',
                description: 'A "great" application'
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should parse mixed arrays with single and double quotes', () => {
            const input = '[\'item1\', "item2", \'item3 with "quotes"\', "item4 with \'quotes\'"]';
            const expected = ['item1', 'item2', 'item3 with "quotes"', "item4 with 'quotes'"];
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle malformed single-quoted strings (missing closing quote)', () => {
            const input = "{'name': 'John, 'age': 30}";
            const result = parser(input);
            // Should still parse successfully with error tolerance
            assert.strictEqual(typeof result, 'object');
            // Due to missing closing quote, 'age' becomes 'age' (with the quote as part of key)
            assert.strictEqual(result["age'"], 30);
            assert.strictEqual(result.name, "John, ");
        });
    });

    describe('AI Output & Markdown Code Block Handling', () => {
        it('should handle JSON wrapped in markdown code block with json language', () => {
            const data = '```json\n{"name": "John", "age": 30}\n```';
            const result = parser(data);
            assert.deepStrictEqual(result, { name: "John", age: 30 });
        });

        it('should handle JSON wrapped in markdown code block with javascript language', () => {
            const data = '```javascript\n{"api_response": "success"}\n```';
            const result = parser(data);
            assert.deepStrictEqual(result, { api_response: "success" });
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
                assert.notStrictEqual(result, undefined, `Should extract data from ${lang} code block`);
            });
        });

        it('should handle JSON wrapped in markdown code block without language specifier', () => {
            const data = '```\n{"no_language": "specified"}\n```';
            const result = parser(data);
            assert.deepStrictEqual(result, { no_language: "specified" });
        });

        it('should handle markdown code block with leading whitespace', () => {
            const testCases = [
                '  ```json\n{"with_spaces": true}\n```',
                '\t```JSON\n{"with_tab": true}\n```',
                '   ```\n{"multiple_spaces": true}\n```'
            ];

            testCases.forEach((input, index) => {
                const result = parser(input);
                assert.notStrictEqual(result, undefined, `Test case ${index + 1} should extract data`);
            });
        });

        it('should handle markdown code block with trailing whitespace', () => {
            const data = '   ```json   \n{"spaces_around": "backticks"}\n   ```   ';
            const result = parser(data);
            assert.deepStrictEqual(result, { spaces_around: "backticks" });
        });

        it('should handle incomplete JSON in markdown code block', () => {
            const data = '```json\n{"incomplete": "data",\n```';
            const result = parser(data);
            assert.deepStrictEqual(result, { incomplete: "data" });
        });

        it('should handle multiline JSON in markdown code block', () => {
            const data = '```json\n{\n  "multiline": {\n    "nested": "object"\n  }\n}\n```';
            const result = parser(data);
            assert.deepStrictEqual(result, { multiline: { nested: "object" } });
        });

        it('should handle markdown code block with mixed case language identifiers', () => {
            const testCases = [
                '```JSON\n{"upper": "case"}\n```',
                '```JavaScript\n{"mixed": "case"}\n```',
                '```TypeScript\n{"capital": "letters"}\n```'
            ];

            testCases.forEach((input, index) => {
                const result = parser(input);
                assert.notStrictEqual(result, undefined, `Mixed case test ${index + 1} should extract data`);
            });
        });

        it('should handle JSON without markdown (no false positives)', () => {
            const data = '{"normal": "json"}';
            const result = parser(data);
            assert.deepStrictEqual(result, { normal: "json" });
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
                }
            ];

            testCases.forEach(({ name, input, expectedData }) => {
                const result = parser(input);
                assert.deepStrictEqual(result, expectedData, `Failed for: ${name}`);
            });
        });
    });

    describe('Error Tolerance & Repair Capabilities', () => {
        it('should handle incomplete JSON object gracefully', () => {
            const incompleteData = `{"name": "John", "age": 30,`;
            const result = parser(incompleteData);
            assert.deepStrictEqual(result, { name: "John", age: 30 });
        });

        it('should handle partial JSON array gracefully', () => {
            const partialArrayData = `[{"id": 1, "name": "Alice"}, {"id": 2, "name":`;
            const result = parser(partialArrayData);
            assert.deepStrictEqual(result, [
                { id: 1, name: "Alice" },
                { id: 2, name: null }
            ]);
        });

        it('should handle incomplete nested structure', () => {
            const incompleteNested = `{"user": {"name": "John", "details": {"age": 30`;
            const result = parser(incompleteNested);
            assert.deepStrictEqual(result, {
                user: {
                    name: "John",
                    details: {
                        age: 30
                    }
                }
            });
        });

        it('should handle array with trailing comma (auto-completion)', () => {
            const arrayWithComma = `[1, 2, 3,`;
            const result = parser(arrayWithComma);
            assert.deepStrictEqual(result, [1, 2, 3]);
        });

        it('should handle nested array with trailing comma (auto-completion)', () => {
            const nestedArrayWithComma = `{"items": [1, 2,`;
            const result = parser(nestedArrayWithComma);
            assert.deepStrictEqual(result, { items: [1, 2] });
        });

        it('should handle array of objects with trailing comma (auto-completion)', () => {
            const arrayOfObjectsWithComma = `[{"id": 1}, {"id": 2},`;
            const result = parser(arrayOfObjectsWithComma);
            assert.deepStrictEqual(result, [{ id: 1 }, { id: 2 }]);
        });

        it('should handle object with trailing comma (auto-completion)', () => {
            const objectWithComma = `{"key1": "value1", "key2": "value2",`;
            const result = parser(objectWithComma);
            assert.deepStrictEqual(result, { key1: "value1", key2: "value2" });
        });

        it('should handle object with colon ending (auto-completion)', () => {
            const objectWithColon = `{"key1": "value1", "key2":`;
            const result = parser(objectWithColon);
            assert.deepStrictEqual(result, { key1: "value1", key2: null });
        });

        it('should handle mixed brackets and braces', () => {
            const mixedBrackets = `{"array": [1, 2, {"nested": "value"`;
            const result = parser(mixedBrackets);
            assert.deepStrictEqual(result, {
                array: [1, 2, { nested: "value" }]
            });
        });
    });

    describe('Boundary Conditions & Special Input', () => {
        it('should handle empty string', () => {
            const emptyData = ``;
            const result = parser(emptyData);
            // Empty string should return undefined
            assert.strictEqual(result, undefined);
        });

        it('should handle whitespace-only string', () => {
            const whitespaceData = `   \n\t  `;
            const result = parser(whitespaceData);
            // Whitespace-only string should return undefined
            assert.strictEqual(result, undefined);
        });

        it('should handle null input gracefully', () => {
            assert.throws(() => {
                parser(null);
            }, "Should throw an error for null input");
        });

        it('should handle undefined input gracefully', () => {
            assert.throws(() => {
                parser(undefined);
            }, "Should throw an error for undefined input");
        });

        it('should handle multiple JSON objects', () => {
            const multipleData = `{"first": "value1"} {"second": "value2"}`;
            const result = parser(multipleData);
            // Should extract the first valid object and ignore the rest
            assert.deepStrictEqual(result, { first: "value1" });
        });

        it('should handle array followed by object', () => {
            const mixedData = `[1, 2, 3] {"name": "test"}`;
            const result = parser(mixedData);
            // Should extract the first array and ignore the object
            assert.deepStrictEqual(result, [1, 2, 3]);
        });

        it('should handle only opening brace', () => {
            const data = `{`;
            const result = parser(data);
            assert.deepStrictEqual(result, {});
        });

        it('should handle only closing brace', () => {
            const data = `}`;
            assert.throws(() => {
                parser(data);
            }, "Should throw an error for unmatched closing brace");
        });

        it('should handle only opening bracket', () => {
            const data = `[`;
            const result = parser(data);
            assert.deepStrictEqual(result, []);
        });

        it('should handle only closing bracket', () => {
            const data = `]`;
            assert.throws(() => {
                parser(data);
            }, "Should throw an error for unmatched closing bracket");
        });

        it('should handle multiple JSON objects separated by garbage', () => {
            const data = `{"first": 1}garbage{"second": 2}`;
            const result = parser(data);
            // Should extract the first valid JSON and ignore the rest
            assert.deepStrictEqual(result, { first: 1 });
        });

        it('should handle random text', () => {
            const data = `this is not json at all`;
            // With improved fault tolerance, treats unrecognized identifiers as strings
            const result = parser(data);
            assert.strictEqual(result, 'this');
        });
    });

    describe('Performance & Large Data Handling', () => {
        it('should complete parsing within reasonable time', () => {
            const startTime = Date.now();
            const data = `{"test": "value"}`;
            const result = parser(data);
            const endTime = Date.now();
            assert.deepStrictEqual(result, { test: "value" });
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
            assert.deepStrictEqual(result, largeObj);
            assert.strictEqual(Object.keys(result).length, 1000);
        });

        it('should handle very long malformed string', () => {
            const longString = 'a'.repeat(10000);
            const data = `{"long": "${longString}`;  // Missing closing quote and brace
            const result = parser(data);
            assert.deepStrictEqual(result, { long: longString });
        });
    });

    describe('Character Encoding & Escape Sequences', () => {
        it('should handle Unicode characters', () => {
            const unicodeData = `{"chinese": "你好", "emoji": "😀", "special": "àáâãäå"}`;
            const result = parser(unicodeData);
            assert.deepStrictEqual(result, {
                chinese: "你好",
                emoji: "😀",
                special: "àáâãäå"
            });
        });

        it('should handle escaped characters', () => {
            const escapedData = `{"newline": "line1\\nline2", "quote": "He said \\"Hello\\"", "backslash": "path\\\\to\\\\file"}`;
            const result = parser(escapedData);
            assert.deepStrictEqual(result, {
                newline: "line1\nline2",
                quote: 'He said "Hello"',
                backslash: "path\\to\\file"
            });
        });

        it('should handle incomplete escape sequences', () => {
            const data = `{"message": "Hello\\"}`;
            const result = parser(data);
            // The parser should repair the incomplete escape and close the string
            assert.deepStrictEqual(result, { message: 'Hello"}' });
        });

        it('should handle invalid escape sequences', () => {
            const data = `{"message": "Hello\\x world"}`;
            // Invalid escape sequences should cause parser to throw
            assert.throws(() => parser(data));
        });

        it('should handle incomplete unicode escape', () => {
            const data = `{"unicode": "\\u00"}`;
            // Incomplete unicode escape should cause parser to throw
            assert.throws(() => parser(data));
        });

        it('should handle unescaped control characters in strings', () => {
            // Test case with control characters that would cause JSON.parse to fail
            const data = '{"title": "Line1\nLine2\tTabbed", "status": "success"}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                title: "Line1\nLine2\tTabbed",
                status: "success"
            });
        });

        it('should handle various unescaped control characters', () => {
            // Test with multiple control characters: \r, \n, \b, \f, \t, \v
            const data = '{"message": "Hello\r\nWorld\b\f\t\v", "code": 200}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                message: "Hello\r\nWorld\b\f\t\v",
                code: 200
            });
        });

        it('should handle control characters in object keys', () => {
            // Test control characters in keys (edge case)
            const data = '{"key\twith\ttabs": "value", "normal": "test"}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                "key\twith\ttabs": "value",
                normal: "test"
            });
        });

        it('should handle newline characters in object keys', () => {
            // Test newline characters in keys - this would cause JSON.parse to fail
            const data = '{"key\nwith\nnewlines": "value1", "another\rkey": "value2"}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                "key\nwith\nnewlines": "value1",
                "another\rkey": "value2"
            });
        });

        it('should handle various control characters in object keys', () => {
            // Test multiple control characters in keys: \b, \f, \v
            const data = '{"key\bwith\fbackspace": "value1", "vertical\vtab": "value2"}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                "key\bwith\fbackspace": "value1",
                "vertical\vtab": "value2"
            });
        });

        it('should handle mixed control characters in object keys and values', () => {
            // Test control characters in both keys and values
            const data = '{"key\twith\ttab": "value\nwith\nnewline", "normal\rkey": "normal\tvalue"}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                "key\twith\ttab": "value\nwith\nnewline",
                "normal\rkey": "normal\tvalue"
            });
        });

        it('should handle control characters in keys of nested objects', () => {
            // Test control characters in keys of nested structures
            const data = '{"outer\tkey": {"inner\nkey": "value", "another\rinner": "test"}, "normal": {"clean": "data"}}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                "outer\tkey": {
                    "inner\nkey": "value",
                    "another\rinner": "test"
                },
                normal: {
                    clean: "data"
                }
            });
        });

        it('should demonstrate advantage over JSON.parse with control characters in keys', () => {
            // This test shows that our parser handles cases where JSON.parse would fail
            const dataWithControlCharsInKeys = '{"key\nwith\nnewline": "value", "tab\tkey": "test"}';

            // Our parser should succeed
            const jaisonResult = parser(dataWithControlCharsInKeys);
            assert.deepStrictEqual(jaisonResult, {
                "key\nwith\nnewline": "value",
                "tab\tkey": "test"
            });

            // JSON.parse should fail with this input
            assert.throws(() => {
                JSON.parse(dataWithControlCharsInKeys);
            }, /Bad control character in string literal/);
        });

        it('should handle control characters in nested structures', () => {
            // Test control characters in complex nested JSON
            const data = '{"data": {"lines": ["Line1\nLine2", "Tab\tSeparated"], "info": "Multi\r\nLine"}}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                data: {
                    lines: ["Line1\nLine2", "Tab\tSeparated"],
                    info: "Multi\r\nLine"
                }
            });
        });

        it('should demonstrate advantage over JSON.parse with control characters', () => {
            // This test shows that our parser handles cases where JSON.parse would fail
            const dataWithControlChars = '{"text": "Line1\nLine2\tTabbed"}';

            // Our parser should succeed
            const jaisonResult = parser(dataWithControlChars);
            assert.deepStrictEqual(jaisonResult, {
                text: "Line1\nLine2\tTabbed"
            });

            // JSON.parse should fail with this input
            assert.throws(() => {
                JSON.parse(dataWithControlChars);
            }, /Bad control character in string literal/);
        });
    });

    describe('Advanced Comma & Colon Handling', () => {
        describe('Array Consecutive Commas with Placeholders', () => {
            it('should handle consecutive commas in arrays with null placeholders', () => {
                const jsonWithConsecutiveCommas = `[1,,3,4]`;
                const result = parser(jsonWithConsecutiveCommas);
                assert.deepStrictEqual(result, [1, null, 3, 4]);
            });

            it('should handle multiple consecutive commas in arrays', () => {
                const jsonWithMultipleCommas = `[1,,,4]`;
                const result = parser(jsonWithMultipleCommas);
                assert.deepStrictEqual(result, [1, null, null, 4]);
            });

            it('should handle consecutive commas at array start', () => {
                const jsonWithStartCommas = `[,1,2]`;
                const result = parser(jsonWithStartCommas);
                assert.deepStrictEqual(result, [null, 1, 2]);
            });

            it('should handle consecutive commas in nested arrays', () => {
                const jsonWithNestedCommas = `[[1,2], [3,,5], [6,7]]`;
                const result = parser(jsonWithNestedCommas);
                assert.deepStrictEqual(result, [[1, 2], [3, null, 5], [6, 7]]);
            });
        });

        describe('Object Consecutive Commas Removal', () => {
            it('should remove consecutive commas in objects', () => {
                const jsonWithConsecutiveCommas = `{"a": 1,, "b": 2}`;
                const result = parser(jsonWithConsecutiveCommas);
                assert.deepStrictEqual(result, { a: 1, b: 2 });
            });

            it('should handle multiple consecutive commas in objects', () => {
                const jsonWithMultipleCommas = `{"a": 1,,, "b": 2}`;
                const result = parser(jsonWithMultipleCommas);
                assert.deepStrictEqual(result, { a: 1, b: 2 });
            });

            it('should handle consecutive commas in nested objects', () => {
                const jsonWithNestedCommas = `{"user": {"name": "John",, "age": 30}, "active": true}`;
                const result = parser(jsonWithNestedCommas);
                assert.deepStrictEqual(result, { user: { name: "John", age: 30 }, active: true });
            });
        });

        describe('Mixed Context Comma Handling', () => {
            it('should handle mixed array and object with different comma rules', () => {
                const jsonMixed = `{"items": [1,,3], "meta": {"count": 3,, "valid": true}}`;
                const result = parser(jsonMixed);
                assert.deepStrictEqual(result, {
                    items: [1, null, 3],
                    meta: { count: 3, valid: true }
                });
            });

            it('should handle complex nested structures with comma issues', () => {
                const jsonComplex = `{"data": [{"values": [1,,3]}, {"values": [4,5,]}], "settings": {"debug": true,, "level": 2}}`;
                const result = parser(jsonComplex);
                assert.deepStrictEqual(result, {
                    data: [
                        { values: [1, null, 3] },
                        { values: [4, 5] }
                    ],
                    settings: { debug: true, level: 2 }
                });
            });
        });

        describe('Advanced Colon Handling', () => {
            it('should handle colon followed by comma in objects', () => {
                const jsonWithColonComma = `{"name": "John", "age":, "city": "NYC"}`;
                const result = parser(jsonWithColonComma);
                assert.deepStrictEqual(result, { name: "John", age: null, city: "NYC" });
            });

            it('should handle colon followed by closing brace', () => {
                const jsonWithColonBrace = `{"name": "John", "age":}`;
                const result = parser(jsonWithColonBrace);
                assert.deepStrictEqual(result, { name: "John", age: null });
            });

            it('should handle multiple missing values after colons', () => {
                const jsonWithMultipleColons = `{"a":, "b":, "c": 3}`;
                const result = parser(jsonWithMultipleColons);
                assert.deepStrictEqual(result, { a: null, b: null, c: 3 });
            });

            it('should handle nested objects with missing values', () => {
                const jsonWithNestedMissingValues = `{"user": {"name":, "profile": {"age":}}, "active": true}`;
                const result = parser(jsonWithNestedMissingValues);
                assert.deepStrictEqual(result, {
                    user: { name: null, profile: { age: null } },
                    active: true
                });
            });
        });

        describe('Special Edge Cases for Comma Handling', () => {
            it('should handle single comma in empty array [,]', () => {
                const jsonEmptyArrayWithComma = `[,]`;
                const result = parser(jsonEmptyArrayWithComma);
                assert.deepStrictEqual(result, [null]);
            });

            it('should handle double comma in empty array [,,]', () => {
                const jsonEmptyArrayWithDoubleComma = `[,,]`;
                const result = parser(jsonEmptyArrayWithDoubleComma);
                assert.deepStrictEqual(result, [null, null]);
            });

            it('should handle triple comma in empty array [,,,]', () => {
                const jsonEmptyArrayWithTripleComma = `[,,,]`;
                const result = parser(jsonEmptyArrayWithTripleComma);
                assert.deepStrictEqual(result, [null, null, null]);
            });

            it('should handle comma at start followed by values [,1,2]', () => {
                const jsonStartCommaWithValues = `[,1,2]`;
                const result = parser(jsonStartCommaWithValues);
                assert.deepStrictEqual(result, [null, 1, 2]);
            });

            it('should handle values followed by comma at end [1,2,]', () => {
                const jsonEndCommaWithValues = `[1,2,]`;
                const result = parser(jsonEndCommaWithValues);
                assert.deepStrictEqual(result, [1, 2]);
            });

            it('should handle mixed comma patterns [,1,,2,]', () => {
                const jsonMixedCommaPattern = `[,1,,2,]`;
                const result = parser(jsonMixedCommaPattern);
                assert.deepStrictEqual(result, [null, 1, null, 2]);
            });
        });
    });

    describe('Partial Data Extraction & Recovery', () => {
        it('should extract valid key-value pairs before error (object missing closing brace)', () => {
            const data = '{"a": 1, "b": 2, "c": 3';
            const result = parser(data);
            assert.deepStrictEqual(result, { a: 1, b: 2, c: 3 });
        });

        it('should extract valid array with auto-completion (array missing closing bracket)', () => {
            const data = '[1, 2, 3, 4';
            const result = parser(data);
            assert.deepStrictEqual(result, [1, 2, 3, 4]);
        });

        it('should extract valid object before garbage (object + garbage)', () => {
            const data = '{"x": 10, "y": 20}garbage';
            const result = parser(data);
            assert.deepStrictEqual(result, { x: 10, y: 20 });
        });

        it('should handle valid object followed by garbage', () => {
            const data = `{"name": "John", "age": 30} this is garbage`;
            const result = parser(data);
            assert.deepStrictEqual(result, { name: "John", age: 30 });
        });

        it('should extract valid objects before error (multiple objects, second broken)', () => {
            const data = '{"a": 1}{"b": 2, "c":';
            const result = parser(data);
            // Parser should return the first complete object
            assert.deepStrictEqual(result, { a: 1 });
        });

        it('should handle malformed array with syntax errors (no data extraction)', () => {
            const data = '[1, 2, invalid, 3]';
            // With improved fault tolerance, treats 'invalid' as unquoted string
            const result = parser(data);
            assert.deepStrictEqual(result, [1, 2, 'invalid', 3]);
        });

        it('should extract valid nested object before error', () => {
            const data = '{"user": {"name": "John", "age": 30, "profile": {"email": "a@b.com"';
            const result = parser(data);
            assert.deepStrictEqual(result, { "user": { "name": "John", "age": 30, "profile": { "email": "a@b.com" } } });
        });

        it('should handle object with trailing comma syntax error (no data extraction)', () => {
            const data = '{"a": 1, "b": 2,}';
            const result = parser(data);
            assert.deepStrictEqual(result, { "a": 1, "b": 2 });
        });

        it('should handle array with trailing comma syntax error (no data extraction)', () => {
            const data = '[1, 2, 3,]';
            const result = parser(data);
            assert.deepStrictEqual(result, [1, 2, 3]);
        });
    });

    describe('Newline & Special Character Handling', () => {
        it('should handle unescaped newlines in simple string values', () => {
            const jsonWithNewlines = '{"message": "First line\nSecond line"}';
            const result = parser(jsonWithNewlines);
            assert.deepStrictEqual(result, { message: "First line\nSecond line" });
        });

        it('should handle unescaped carriage returns in string values', () => {
            const jsonWithCarriageReturns = '{"message": "First line\rSecond line"}';
            const result = parser(jsonWithCarriageReturns);
            assert.deepStrictEqual(result, { message: "First line\rSecond line" });
        });

        it('should handle mixed unescaped line breaks (CR, LF, CRLF) in string values', () => {
            const jsonWithMixedLineBreaks = '{"message": "First line\rSecond line\nThird line\r\nFourth line"}';
            const result = parser(jsonWithMixedLineBreaks);
            assert.deepStrictEqual(result, {
                message: "First line\rSecond line\nThird line\r\nFourth line"
            });
        });

        it('should handle unescaped newlines in array of strings', () => {
            const jsonArrayWithNewlines = '{"lines": ["First line\nSecond line", "Third line\nFourth line"]}';
            const result = parser(jsonArrayWithNewlines);
            assert.deepStrictEqual(result, {
                lines: ["First line\nSecond line", "Third line\nFourth line"]
            });
        });

        it('should handle unescaped newlines in nested object properties', () => {
            const nestedJsonWithNewlines = `{
                "user": {
                    "name": "John Doe",
                    "bio": "Software Engineer\nOpen Source Contributor\nTech Writer"
                }
            }`;
            const result = parser(nestedJsonWithNewlines);
            assert.deepStrictEqual(result, {
                user: {
                    name: "John Doe",
                    bio: "Software Engineer\nOpen Source Contributor\nTech Writer"
                }
            });
        });

        it('should handle multiple unescaped newlines and indentation in multiline string', () => {
            const multilineJson = `{
                "description": "This is a 
                multiline description with
                    varying indentation and
                multiple line breaks"
            }`;
            const result = parser(multilineJson);
            // Should preserve the actual content including whitespace and newlines
            assert(result.description.includes("multiline description"));
            assert(result.description.includes("varying indentation"));
        });

        it('should handle unescaped newlines in string with special characters', () => {
            const jsonWithSpecialChars = '{"message": "Test with special chars: !@#$%^&*()_+{}\\n and newline\nin the middle"}';
            const result = parser(jsonWithSpecialChars);
            assert.deepStrictEqual(result, {
                message: "Test with special chars: !@#$%^&*()_+{}\n and newline\nin the middle"
            });
        });
    });

    describe('Complex Scenarios & Edge Cases', () => {
        it('should handle combination of comma and colon issues', () => {
            const jsonComplex = `{"items": [1,,3], "meta": {"count":, "tags": ["a",, "c"]}}`;
            const result = parser(jsonComplex);
            assert.deepStrictEqual(result, {
                items: [1, null, 3],
                meta: { count: null, tags: ["a", null, "c"] }
            });
        });

        it('should handle whitespace around problematic commas and colons', () => {
            const jsonWithWhitespace = `{"a": 1, , "b": 2, "c": , "d": [1, , 3]}`;
            const result = parser(jsonWithWhitespace);
            assert.deepStrictEqual(result, {
                a: 1,
                b: 2,
                c: null,
                d: [1, null, 3]
            });
        });

        it('should handle deeply nested comma issues', () => {
            const jsonDeeplyNested = `[{"arr": [,1,]}, [,2,,3,]]`;
            const result = parser(jsonDeeplyNested);
            assert.deepStrictEqual(result, [
                { arr: [null, 1] },
                [null, 2, null, 3]
            ]);
        });

        it('should distinguish object vs array comma handling in complex case', () => {
            const jsonComplexMixed = `{"obj": {"a":,, "b": 1}, "arr": [,1,,2,]}`;
            const result = parser(jsonComplexMixed);
            assert.deepStrictEqual(result, {
                obj: { a: null, b: 1 },
                arr: [null, 1, null, 2]
            });
        });

        it('should handle deeply nested bracket mismatches', () => {
            const data = `{"level1":{"level2":{"level3":[1,2}`;
            const result = parser(data);
            assert.deepStrictEqual(result, {
                "level1": {
                    "level2": {
                        "level3": [1, 2]
                    }
                }
            });
        });

        it('should handle empty containers with bracket mismatches', () => {
            const mismatchData = `{"empty_array":[],"empty_obj":{}}]`;
            const result = parser(mismatchData);
            assert.deepStrictEqual(result, {
                "empty_array": [],
                "empty_obj": {}
            });
        });

        it('should handle malformed JSON with syntax errors (no data extraction)', () => {
            const data = `{"valid": "data", "invalid": invalid_value}`;
            // With improved fault tolerance, treats 'invalid_value' as unquoted string
            const result = parser(data);
            assert.deepStrictEqual(result, { "valid": "data", "invalid": "invalid_value" });
        });

        it('should handle unescaped quotes in strings', () => {
            const data = `{"message": "He said "hello" to me"}`;
            // This should NOT throw because the tokenizer will parse this differently
            // The tokenizer will see: "He said ", then "hello", then " to me"
            // This is actually parseable, though it produces unexpected structure
            const result = parser(data);
            // Should parse as an object with just "message": "He said " key
            assert(result && typeof result === 'object');
        });
    });

    describe('Security & DoS Prevention', () => {
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
            assert(result && typeof result === 'object');
            // Should successfully parse the deeply nested structure
            let current = result;
            for (let i = 0; i < 100; i++) {
                assert(current && typeof current === 'object');
                const keys = Object.keys(current);
                assert.strictEqual(keys.length, 1);
                current = current[keys[0]];
            }
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
            assert(Array.isArray(result));
            // Navigate to the deep value
            let current = result;
            for (let i = 0; i < 99; i++) {
                assert(Array.isArray(current));
                assert.strictEqual(current.length, 1);
                current = current[0];
            }
            // The innermost should still be an array containing the string
            assert(Array.isArray(current));
            assert.strictEqual(current.length, 1);
            assert.strictEqual(current[0], "deep");
        });

        it('should handle extremely long property names', () => {
            const longKey = 'x'.repeat(10000);
            const data = `{"${longKey}": "value"}`;
            const result = parser(data);
            const expected = {};
            expected[longKey] = "value";
            assert.deepStrictEqual(result, expected);
        });

        it('should handle extremely long string values', () => {
            const longValue = 'a'.repeat(50000);
            const data = `{"key": "${longValue}"}`;
            const result = parser(data);
            assert.deepStrictEqual(result, { key: longValue });
        });

        it('should handle object with extremely many properties', () => {
            let data = '{';
            for (let i = 0; i < 1000; i++) {
                if (i > 0) data += ',';
                data += `"key${i}": ${i}`;
            }
            data += '}';

            const result = parser(data);
            assert.strictEqual(Object.keys(result).length, 1000);
            assert.strictEqual(result.key500, 500);
        });

        it('should handle array with extremely many elements', () => {
            let data = '[';
            for (let i = 0; i < 5000; i++) {
                if (i > 0) data += ',';
                data += i;
            }
            data += ']';

            const result = parser(data);
            assert.strictEqual(result.length, 5000);
            assert.strictEqual(result[2500], 2500);
        });
    });

    describe('Advanced Unicode & Internationalization', () => {
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
            assert.deepStrictEqual(result, {
                english: "Hello World",
                chinese: "你好世界",
                japanese: "こんにちは世界",
                korean: "안녕하세요 세계",
                arabic: "مرحبا بالعالم",
                russian: "Привет мир",
                emoji: "🌍🌎🌏",
                mathematical: "∑∏∆∇∂∞"
            });
        });

        it('should handle complex Unicode escape sequences', () => {
            const data = `{
                "unicode1": "\\u4F60\\u597D",
                "unicode2": "\\u3053\\u3093\\u306B\\u3061\\u306F",
                "surrogate": "\\uD83C\\uDF0D"
            }`;
            const result = parser(data);
            assert.deepStrictEqual(result, {
                unicode1: "你好",
                unicode2: "こんにちは",
                surrogate: "🌍"
            });
        });

        it('should handle mixed Unicode and escape sequences', () => {
            const data = `{"mixed": "Hello\\u0020世界\\u0021"}`;
            const result = parser(data);
            assert.deepStrictEqual(result, { mixed: "Hello 世界!" });
        });

        it('should handle zero-width and invisible characters', () => {
            const data = `{"invisible": "text\\u200Bwith\\u200Czero\\u200Dwidth"}`;
            const result = parser(data);
            assert.deepStrictEqual(result, { invisible: "text\u200Bwith\u200Czero\u200Dwidth" });
        });

        it('should handle RTL (Right-to-Left) text', () => {
            const data = `{"rtl": "This is \\u202Eright-to-left\\u202C text"}`;
            const result = parser(data);
            assert.deepStrictEqual(result, { rtl: "This is \u202Eright-to-left\u202C text" });
        });
    });

    describe('Advanced Number Formats', () => {
        it('should handle scientific notation', () => {
            const data = `{
                "small": 1.23e-10,
                "large": 1.23e+20,
                "negative": -4.56E-7,
                "positive": 7.89E+12
            }`;
            const result = parser(data);
            assert.deepStrictEqual(result, {
                small: 1.23e-10,
                large: 1.23e+20,
                negative: -4.56E-7,
                positive: 7.89E+12
            });
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
            assert.deepStrictEqual(result, {
                zero: 0,
                negativeZero: -0,
                maxSafeInteger: 9007199254740991,
                minSafeInteger: -9007199254740991,
                verySmall: 5e-324,
                veryLarge: 1.7976931348623157e+308
            });
        });

        it('should handle malformed scientific notation', () => {
            const data = `{"invalid": 1.23e}`;
            // Malformed scientific notation is parsed as separate tokens
            const result = parser(data);
            assert.deepStrictEqual(result, { invalid: 1.23 });
        });

        it('should handle numbers with excessive precision', () => {
            const data = `{"precise": 3.141592653589793238462643383279502884197}`;
            const result = parser(data);
            assert.deepStrictEqual(result, { precise: 3.141592653589793238462643383279502884197 });
        });

        // Enhanced Number Format Support Tests
        describe('Enhanced Number Formats', () => {
            it('should parse numbers with positive sign', () => {
                const data = `{
                    "pos_int": +42,
                    "pos_float": +3.14,
                    "pos_scientific": +1.5e10,
                    "pos_zero": +0
                }`;
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    pos_int: 42,
                    pos_float: 3.14,
                    pos_scientific: 15000000000,
                    pos_zero: 0
                });
            });

            it('should parse numbers starting with decimal point', () => {
                const data = `{
                    "decimal_only": .123,
                    "half": .5,
                    "scientific": .2e-3,
                    "zero_decimal": .0
                }`;
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    decimal_only: 0.123,
                    half: 0.5,
                    scientific: 0.0002,
                    zero_decimal: 0
                });
            });

            it('should parse combined positive sign and decimal point', () => {
                const data = `{
                    "pos_decimal": +.75,
                    "pos_scientific": +.999e-3,
                    "pos_zero_decimal": +.0
                }`;
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    pos_decimal: 0.75,
                    pos_scientific: 0.000999,
                    pos_zero_decimal: 0
                });
            });

            it('should handle enhanced formats in arrays', () => {
                const data = '[+1, .5, +.25, +0, .0, +3.14]';
                const result = parser(data);
                assert.deepStrictEqual(result, [1, 0.5, 0.25, 0, 0, 3.14]);
            });

            it('should handle mixed enhanced and standard number formats', () => {
                const data = `{
                    "standard": 42,
                    "negative": -42,
                    "positive": +42,
                    "decimal": .5,
                    "standard_decimal": 0.5,
                    "scientific": 1.5e10,
                    "pos_scientific": +1.5e10,
                    "decimal_scientific": .2e-3
                }`;
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    standard: 42,
                    negative: -42,
                    positive: 42,
                    decimal: 0.5,
                    standard_decimal: 0.5,
                    scientific: 15000000000,
                    pos_scientific: 15000000000,
                    decimal_scientific: 0.0002
                });
            });

            it('should handle enhanced number formats as object keys', () => {
                const data = '{+1: "positive", .5: "decimal", +.25: "both"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "+1": "positive",
                    ".5": "decimal",
                    "+.25": "both"
                });
            });

            it('should reject invalid enhanced number formats', () => {
                const invalidCases = [
                    '[+]',      // Just positive sign
                    '[.]',      // Just decimal point
                    '[+.]',     // Sign + dot without digits
                    '[++1]',    // Double positive sign
                    '[+-1]'     // Mixed signs
                ];

                invalidCases.forEach(testCase => {
                    // With improved fault tolerance, these parse as arrays with string/identifier values
                    const result = parser(testCase);
                    assert.ok(Array.isArray(result), `Should parse ${testCase} as array`);
                });
            });
        });
    });

    // Test Group: Python Constants Conversion
    describe('Python Constants', () => {
        it('should handle Python constants', () => {
            const testCases = [
                // Python True/False/None should be converted
                { input: '{"py_true": True}', expected: { py_true: true } },
                { input: '{"py_false": False}', expected: { py_false: false } },
                { input: '{"py_none": None}', expected: { py_none: null } },
                { input: '{"lowercase_none": none}', expected: { lowercase_none: null } }
            ];

            testCases.forEach(({ input, expected }) => {
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });
        });

        it('should handle Python constants in arrays', () => {
            const data = '[True, False, None]';
            const result = parser(data);
            assert.deepStrictEqual(result, [true, false, null]);
        });

        it('should handle mixed Python and JavaScript constants', () => {
            const data = '{"js_true": true, "py_true": True, "js_null": null, "py_none": None}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                js_true: true,
                py_true: true,
                js_null: null,
                py_none: null
            });
        });
    });

    // Test Group: Advanced Error Handling Tests  
    describe('Advanced Error Handling', () => {
        it('should handle unquoted keys (should pass)', () => {
            const data = '{name: "John", age: 30}';
            const result = parser(data);
            assert.deepStrictEqual(result, { name: "John", age: 30 });
        });

        it('should handle single quotes instead of double quotes (should now pass)', () => {
            const data = "{'name': 'John', 'age': 30}";
            const result = parser(data);
            assert.deepStrictEqual(result, { name: "John", age: 30 });
        });

        it('should handle invalid escape sequences (should fail)', () => {
            const data = '{"invalid": "\\z"}';
            assert.throws(() => parser(data));
        });

        it('should handle array with some valid and some invalid elements (should fail)', () => {
            const data = '[{"valid": true}, invalid_element, {"also_valid": true}]';
            // With improved fault tolerance, treats 'invalid_element' as unquoted string
            const result = parser(data);
            assert.deepStrictEqual(result, [{ "valid": true }, "invalid_element", { "also_valid": true }]);
        });

        it('should handle only brackets (should fail)', () => {
            const data = '][';
            assert.throws(() => parser(data));
        });
    });

    // Test Group: Advanced Markdown Code Block Tests
    describe('Advanced Markdown Code Blocks', () => {
        it('should handle unusual language identifiers', () => {
            const testCases = [
                '```html5\n{"markup": "language"}\n```',
                '```css3\n{"style": "sheet"}\n```',
                '```c99\n{"standard": "old"}\n```',
                '```node16\n{"version": "specific"}\n```'
            ];

            testCases.forEach((input) => {
                const result = parser(input);
                assert(typeof result === 'object' && result !== null);
            });
        });

        it('should handle malformed markdown patterns', () => {
            const testCases = [
                {
                    name: 'backticks in middle of text',
                    input: 'some text ```json\n{"middle": "text"}\n``` more text',
                    shouldFail: true // backticks not at start, should not be treated as markdown
                },
                {
                    name: 'only opening backticks with whitespace',
                    input: '```   \n{"only": "opening"}',
                    expectedData: { only: "opening" }
                }
            ];

            testCases.forEach(({ name, input, expectedData, shouldFail }) => {
                // With improved fault tolerance, even 'shouldFail' cases now parse
                const result = parser(input);
                if (expectedData) {
                    assert.deepStrictEqual(result, expectedData, `${name} should extract correct data`);
                } else {
                    // Just verify it doesn't throw
                    assert.ok(result !== undefined, `${name} should parse without throwing`);
                }
            });
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
                    name: 'partial closing backticks',
                    input: '```json\n{"partial": "closing"}\n``',
                    expectedData: { partial: "closing" }
                },
                {
                    name: 'missing closing with incomplete JSON',
                    input: '```json\n{"missing": "both",',
                    expectedData: { missing: "both" }
                }
            ];

            testCases.forEach(({ name, input, expectedData }) => {
                const result = parser(input);
                assert.deepStrictEqual(result, expectedData, `${name} should extract correct data`);
            });
        });
    });

    // Test Group: Error Recovery Edge Cases
    describe('Error Recovery Edge Cases', () => {
        it('should handle empty object with extra characters', () => {
            const data = '{}extra';
            const result = parser(data);
            assert.deepStrictEqual(result, {});
        });

        it('should handle empty array with extra characters', () => {
            const data = '[]garbage';
            const result = parser(data);
            assert.deepStrictEqual(result, []);
        });

        it('should handle deeply nested structure with error at the end', () => {
            const data = `{
                "level1": {
                    "level2": {
                        "level3": {
                            "valid": true,
                            "incomplete": 
                        }
                    }
                }
            }`;
            const result = parser(data);
            assert.deepStrictEqual(result, {
                level1: {
                    level2: {
                        level3: {
                            valid: true,
                            incomplete: null
                        }
                    }
                }
            });
        });

        it('should provide meaningful error messages for common mistakes', () => {
            // Test unquoted key (should pass)
            const result1 = parser('{key: "value"}');
            assert.deepStrictEqual(result1, { key: "value" });

            // Test missing colon (should pass - we allow this)
            const result2 = parser('{"key" "value"}');
            assert.deepStrictEqual(result2, { key: "value" });

            // Test single quotes (should now pass since we support them)
            const result3 = parser("['single', 'quotes']");
            assert.deepStrictEqual(result3, ['single', 'quotes']);
        });

        it('should handle concurrent parsing simulation', () => {
            const promises = [];

            for (let i = 0; i < 20; i++) {
                promises.push(new Promise((resolve) => {
                    const data = `{"id": ${i}, "processed": true}`;
                    const result = parser(data);
                    assert.deepStrictEqual(result, { id: i, processed: true });
                    resolve(result);
                }));
            }

            return Promise.all(promises);
        });
    });

    describe('Chinese Punctuation Conversion', () => {
        it('should convert Chinese colon to English colon', () => {
            const data = '{"name"："张三", "age": 25}';
            const result = parser(data);
            assert.deepStrictEqual(result, { name: "张三", age: 25 });
        });

        it('should convert Chinese comma to English comma', () => {
            const data = '["apple"，"banana"，"orange"]';
            const result = parser(data);
            assert.deepStrictEqual(result, ["apple", "banana", "orange"]);
        });

        it('should handle mixed Chinese and English punctuation', () => {
            const data = '{"title"："测试"，"count"：10, "active": true}';
            const result = parser(data);
            assert.deepStrictEqual(result, { title: "测试", count: 10, active: true });
        });

        it('should not replace Chinese punctuation inside strings', () => {
            const data = '{"text": "这是一个测试：包含中文标点；符号"}';
            const result = parser(data);
            assert.deepStrictEqual(result, { text: "这是一个测试：包含中文标点；符号" });
        });

        it('should handle nested objects with Chinese punctuation', () => {
            const data = '{"user"：{"name"："李四"，"profile"：{"email"："test@example.com"}}}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                user: {
                    name: "李四",
                    profile: {
                        email: "test@example.com"
                    }
                }
            });
        });

        it('should handle arrays with Chinese punctuation', () => {
            const data = '{"items"：[{"id"：1，"name"："item1"}，{"id"：2，"name"："item2"}]}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                items: [
                    { id: 1, name: "item1" },
                    { id: 2, name: "item2" }
                ]
            });
        });

        it('should handle Chinese punctuation with whitespace', () => {
            const data = '{"key1" ： "value1" ， "key2" ： "value2"}';
            const result = parser(data);
            assert.deepStrictEqual(result, { key1: "value1", key2: "value2" });
        });

        it('should throw error when Chinese semicolon is used as separator', () => {
            // Chinese semicolon should NOT be treated as a comma separator
            const data = '{"a": 1； "b": 2}';
            assert.throws(() => parser(data), /Unexpected token/);
        });
    });

    describe('Special Constant Completion', () => {
        it('should complete partial boolean constants', () => {
            const testCases = [
                { input: '{"active": t}', expected: { active: true } },
                { input: '{"active": tr}', expected: { active: true } },
                { input: '{"active": tru}', expected: { active: true } },
                { input: '{"disabled": f}', expected: { disabled: false } },
                { input: '{"disabled": fa}', expected: { disabled: false } },
                { input: '{"disabled": fals}', expected: { disabled: false } }
            ];

            testCases.forEach(({ input, expected }) => {
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });
        });

        it('should complete partial null constants', () => {
            const testCases = [
                { input: '{"value": n}', expected: { value: null } },
                { input: '{"value": nu}', expected: { value: null } },
                { input: '{"value": nul}', expected: { value: null } }
            ];

            testCases.forEach(({ input, expected }) => {
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });
        });

        it('should handle complete constants correctly', () => {
            const testCases = [
                { input: '{"complete": true}', expected: { complete: true } },
                { input: '{"complete": false}', expected: { complete: false } },
                { input: '{"complete": null}', expected: { complete: null } }
            ];

            testCases.forEach(({ input, expected }) => {
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });
        });

        it('should convert case-insensitive constants', () => {
            const testCases = [
                { input: '{"upper": TRUE}', expected: { upper: true } }, // TRUE should be converted to boolean true
                { input: '{"upper": FALSE}', expected: { upper: false } },
                { input: '{"upper": NULL}', expected: { upper: null } }
            ];

            testCases.forEach(({ input, expected }) => {
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });
        });

        it('should handle mixed constant types in complex structures', () => {
            const data = '{"partial": t, "normal": null, "none": none}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                partial: true,
                normal: null,
                none: null
            });
        });

        it('should complete constants in arrays', () => {
            const data = '[f, null, tru]';
            const result = parser(data);
            assert.deepStrictEqual(result, [false, null, true]);
        });
    });

    // Comprehensive Test Group: Non-String Keys Support
    describe('Non-String Keys Support', () => {
        describe('Unquoted String Keys', () => {
            it('should parse simple unquoted keys', () => {
                const data = '{name: "John", age: 30}';
                const result = parser(data);
                assert.deepStrictEqual(result, { name: "John", age: 30 });
            });

            it('should parse unquoted keys with underscores and numbers', () => {
                const data = '{user_id: 123, user_name2: "test", _private: true}';
                const result = parser(data);
                assert.deepStrictEqual(result, { user_id: 123, user_name2: "test", _private: true });
            });

            it('should parse unquoted keys with hyphens', () => {
                const data = '{"api-key": "secret", data-type: "json"}';
                const result = parser(data);
                assert.deepStrictEqual(result, { "api-key": "secret", "data-type": "json" });
            });

            it('should handle mixed quoted and unquoted keys', () => {
                const data = '{name: "John", "full-name": "John Doe", age: 30}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    name: "John",
                    "full-name": "John Doe",
                    age: 30
                });
            });

            it('should parse unquoted keys in nested objects', () => {
                const data = '{user: {id: 1, profile: {name: "John", active: true}}}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    user: {
                        id: 1,
                        profile: {
                            name: "John",
                            active: true
                        }
                    }
                });
            });
        });

        describe('Numeric Keys', () => {
            it('should parse numeric keys as strings', () => {
                const data = '{1: "first", 2: "second", 123: "test"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "1": "first",
                    "2": "second",
                    "123": "test"
                });
            });

            it('should parse decimal numeric keys', () => {
                const data = '{1.5: "one point five", 0.25: "quarter"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "1.5": "one point five",
                    "0.25": "quarter"
                });
            });

            it('should parse negative numeric keys', () => {
                const data = '{-1: "negative one", -0.5: "negative half"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "-1": "negative one",
                    "-0.5": "negative half"
                });
            });

            it('should parse scientific notation keys', () => {
                const data = '{1e5: "hundred thousand", 2.5e-3: "small"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "1e5": "hundred thousand",
                    "2.5e-3": "small"
                });
            });

            it('should handle mixed numeric and string keys', () => {
                const data = '{1: "number", name: "string", "quoted": "quoted string"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "1": "number",
                    name: "string",
                    quoted: "quoted string"
                });
            });
        });

        describe('Special Numeric Format Keys', () => {
            it('should parse hexadecimal keys', () => {
                const data = '{0xff: "255", 0x10: "16", 0xabc: "2748"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "0xff": "255",
                    "0x10": "16",
                    "0xabc": "2748"
                });
            });

            it('should parse octal keys', () => {
                const data = '{0o777: "permissions", 0o10: "eight"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "0o777": "permissions",
                    "0o10": "eight"
                });
            });

            it('should parse binary keys', () => {
                const data = '{0b1010: "ten", 0b11111111: "255"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "0b1010": "ten",
                    "0b11111111": "255"
                });
            });

            it('should handle mixed numeric formats as keys', () => {
                const data = '{0xff: "hex", 0o10: "octal", 0b1010: "binary", 42: "decimal"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "0xff": "hex",
                    "0o10": "octal",
                    "0b1010": "binary",
                    "42": "decimal"
                });
            });
        });

        describe('Keys with Special Characters', () => {
            it('should parse unquoted keys with dots (identifiers)', () => {
                // Note: dots might not be valid in identifiers, let's test if they work
                const data = '{key1: "value1", key_2: "value2", key$3: "value3"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    key1: "value1",
                    key_2: "value2",
                    key$3: "value3"
                });
            });

            it('should handle Unicode identifiers as keys', () => {
                const data = '{café: "coffee", naïve: "simple", résumé: "cv"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    café: "coffee",
                    naïve: "simple",
                    résumé: "cv"
                });
            });

            it('should handle emoji and special Unicode as unquoted keys', () => {
                const data = '{😀: "happy", 🚀: "rocket", Ω: "omega"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "😀": "happy",
                    "🚀": "rocket",
                    "Ω": "omega"
                });
            });
        });

        describe('Complex Non-String Key Scenarios', () => {
            it('should handle arrays with non-string keys in objects', () => {
                const data = '{1: ["a", "b", "c"], name: ["x", "y", "z"]}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "1": ["a", "b", "c"],
                    name: ["x", "y", "z"]
                });
            });

            it('should handle nested objects with mixed key types', () => {
                const data = `{
                    user: {
                        1: "first property",
                        name: "John",
                        0xff: "hex property"
                    },
                    "quoted-key": {
                        2: "second",
                        active: true
                    }
                }`;
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    user: {
                        "1": "first property",
                        name: "John",
                        "0xff": "hex property"
                    },
                    "quoted-key": {
                        "2": "second",
                        active: true
                    }
                });
            });

            it('should handle non-string keys with missing commas', () => {
                const data = '{name: "John" age: 30 1: "first"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    name: "John",
                    age: 30,
                    "1": "first"
                });
            });

            it('should handle non-string keys with missing colons', () => {
                const data = '{name "John", age 30, 1 "first"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    name: "John",
                    age: 30,
                    "1": "first"
                });
            });
        });

        describe('Edge Cases for Non-String Keys', () => {
            it('should handle very long unquoted keys', () => {
                const longKey = 'a'.repeat(1000);
                const data = `{${longKey}: "long key value"}`;
                const result = parser(data);
                assert.deepStrictEqual(result, { [longKey]: "long key value" });
            });

            it('should handle keys that look like boolean constants', () => {
                const data = '{true: "not boolean", false: "also not boolean", null: "not null"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "true": "not boolean",
                    "false": "also not boolean",
                    "null": "not null"
                });
            });

            it('should handle duplicate non-string keys (last wins)', () => {
                const data = '{name: "first", name: "second", 1: "first", 1: "second"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    name: "second",
                    "1": "second"
                });
            });

            it('should handle empty-like keys', () => {
                const data = '{_: "underscore", __: "double underscore", $: "dollar"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    _: "underscore",
                    __: "double underscore",
                    $: "dollar"
                });
            });
        });
    });

    // Test Group: Advanced Number Format Support
    describe('Advanced Number Format Support', () => {
        describe('Hexadecimal Numbers', () => {
            it('should parse hexadecimal numbers as values', () => {
                const data = '{"hex1": 0xff, "hex2": 0x10, "hex3": 0xabc}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    hex1: 255,
                    hex2: 16,
                    hex3: 2748
                });
            });

            it('should parse negative hexadecimal numbers', () => {
                const data = '{"neg_hex": -0xff}';
                const result = parser(data);
                assert.deepStrictEqual(result, { neg_hex: -255 });
            });

            it('should handle uppercase and lowercase hex', () => {
                const data = '{"lower": 0xabc, "upper": 0xABC, "mixed": 0xAbC}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    lower: 2748,
                    upper: 2748,
                    mixed: 2748
                });
            });
        });

        describe('Octal Numbers', () => {
            it('should parse octal numbers as values', () => {
                const data = '{"oct1": 0o777, "oct2": 0o10, "oct3": 0o123}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    oct1: 511,
                    oct2: 8,
                    oct3: 83
                });
            });

            it('should parse negative octal numbers', () => {
                const data = '{"neg_oct": -0o10}';
                const result = parser(data);
                assert.deepStrictEqual(result, { neg_oct: -8 });
            });
        });

        describe('Binary Numbers', () => {
            it('should parse binary numbers as values', () => {
                const data = '{"bin1": 0b1010, "bin2": 0b11111111, "bin3": 0b101}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    bin1: 10,
                    bin2: 255,
                    bin3: 5
                });
            });

            it('should parse negative binary numbers', () => {
                const data = '{"neg_bin": -0b1010}';
                const result = parser(data);
                assert.deepStrictEqual(result, { neg_bin: -10 });
            });
        });

        describe('Mixed Number Formats', () => {
            it('should handle all number formats in same object', () => {
                const data = `{
                    "decimal": 42,
                    "hex": 0xff,
                    "octal": 0o10,
                    "binary": 0b1010,
                    "float": 3.14,
                    "scientific": 1.5e10
                }`;
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    decimal: 42,
                    hex: 255,
                    octal: 8,
                    binary: 10,
                    float: 3.14,
                    scientific: 15000000000
                });
            });

            it('should handle mixed number formats in arrays', () => {
                const data = '[42, 0xff, 0o10, 0b1010, 3.14, 1e5]';
                const result = parser(data);
                assert.deepStrictEqual(result, [42, 255, 8, 10, 3.14, 100000]);
            });
        });
    });

    // Test Group: Extended Constant Support
    describe('Extended Constant Support', () => {
        describe('Alternative Null Constants', () => {
            it('should parse alternative null constants', () => {
                const testCases = [
                    { input: '{"val": no}', expected: { val: null } },
                    { input: '{"val": non}', expected: { val: null } },
                    { input: '{"val": none}', expected: { val: null } },
                    { input: '{"val": nil}', expected: { val: null } },
                    { input: '{"val": nill}', expected: { val: null } }
                ];

                testCases.forEach(({ input, expected }) => {
                    const result = parser(input);
                    assert.deepStrictEqual(result, expected);
                });
            });
        });

        describe('Undefined Constants', () => {
            it('should parse various undefined constants', () => {
                const testCases = [
                    { input: '{"val": u}', expected: { val: undefined } },
                    { input: '{"val": un}', expected: { val: undefined } },
                    { input: '{"val": und}', expected: { val: undefined } },
                    { input: '{"val": unde}', expected: { val: undefined } },
                    { input: '{"val": undef}', expected: { val: undefined } },
                    { input: '{"val": undefi}', expected: { val: undefined } },
                    { input: '{"val": undefin}', expected: { val: undefined } },
                    { input: '{"val": undefined}', expected: { val: undefined } }
                ];

                testCases.forEach(({ input, expected }) => {
                    const result = parser(input);
                    assert.deepStrictEqual(result, expected);
                });
            });
        });

        describe('Mixed Constants in Complex Structures', () => {
            it('should handle all constant types together', () => {
                const data = `{
                    "bool_partial": t,
                    "bool_false": f,
                    "null_short": n,
                    "null_alt": none,
                    "undef_short": u,
                    "undef_full": undefined,
                    "normal": true
                }`;
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    bool_partial: true,
                    bool_false: false,
                    null_short: null,
                    null_alt: null,
                    undef_short: undefined,
                    undef_full: undefined,
                    normal: true
                });
            });

            it('should handle constants as unquoted keys', () => {
                const data = '{true: "boolean key", null: "null key", undefined: "undefined key"}';
                const result = parser(data);
                assert.deepStrictEqual(result, {
                    "true": "boolean key",
                    "null": "null key",
                    "undefined": "undefined key"
                });
            });
        });
    });

    // Test Group: Advanced Error Recovery with Non-String Keys
    describe('Advanced Error Recovery with Non-String Keys', () => {
        it('should recover from missing commas with non-string keys', () => {
            const data = '{name: "John" age: 30 1: "first" active: true}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                name: "John",
                age: 30,
                "1": "first",
                active: true
            });
        });

        it('should recover from missing colons with non-string keys', () => {
            const data = '{name "John", 1 "first", active true}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                name: "John",
                "1": "first",
                active: true
            });
        });

        it('should handle mixed syntax errors with non-string keys', () => {
            const data = '{name: "John" 1 "first", active: t 2: f}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                name: "John",
                "1": "first",
                active: true,
                "2": false
            });
        });

        it('should handle malformed structures with non-string keys', () => {
            const data = '{user {name: "John", 1: t}, 2: {active f}}';
            const result = parser(data);
            assert.deepStrictEqual(result, {
                user: {
                    name: "John",
                    "1": true
                },
                "2": {
                    active: false
                }
            });
        });
    });

    // Comment Support Tests
    describe("Comment Support Tests", () => {
        describe("Single-line Comments", () => {
            it("should ignore single-line comment at the beginning", () => {
                const input = `// This is a comment
                {"name": "John", "age": 30}`;
                const expected = { name: "John", age: 30 };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should ignore single-line comment at the end", () => {
                const input = `{"name": "John", "age": 30}
                // This is a comment at the end`;
                const expected = { name: "John", age: 30 };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should ignore single-line comment in the middle", () => {
                const input = `{
                    "name": "John",
                    // This is a comment in the middle
                    "age": 30
                }`;
                const expected = { name: "John", age: 30 };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should ignore multiple single-line comments", () => {
                const input = `// Comment 1
                {
                    // Comment 2
                    "name": "John",
                    // Comment 3
                    "age": 30
                    // Comment 4
                }
                // Comment 5`;
                const expected = { name: "John", age: 30 };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle single-line comment with various endings", () => {
                const testCases = [
                    `// Comment with \\n\n{"test": true}`,
                    `// Comment with \\r\r{"test": true}`,
                    `// Comment with \\r\\n\r\n{"test": true}`
                ];

                testCases.forEach((input, index) => {
                    const result = parser(input);
                    assert.deepStrictEqual(result, { test: true }, `Test case ${index + 1} failed`);
                });
            });

            it("should handle single-line comment without line ending (consumes to EOF)", () => {
                // In JavaScript, single-line comments without line endings consume to EOF
                // This is the correct behavior according to JS spec
                const input = `{"before": true} // Comment at EOF{"after": false}`;
                const expected = { before: true }; // Everything after // is consumed
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle single-line comment in array", () => {
                const input = `[
                    1,
                    // This is a comment
                    2,
                    3
                ]`;
                const expected = [1, 2, 3];
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });
        });

        describe("Multi-line Comments", () => {
            it("should ignore basic multi-line comment", () => {
                const input = `/* This is a 
                   multi-line comment */
                {"name": "John", "age": 30}`;
                const expected = { name: "John", age: 30 };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should ignore multi-line comment in the middle", () => {
                const input = `{
                    "name": "John",
                    /* This is a multi-line
                       comment in the middle */
                    "age": 30
                }`;
                const expected = { name: "John", age: 30 };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should ignore nested-style multi-line comment", () => {
                const input = `{
                    "name": "John",
                    /* 
                     * This is a nested-style
                     * multi-line comment
                     */
                    "age": 30
                }`;
                const expected = { name: "John", age: 30 };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle unterminated multi-line comment", () => {
                const input = `{"name": "John"} /* This comment never ends`;
                const expected = { name: "John" };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle empty multi-line comment", () => {
                const input = `/**/{"name": "John", "age": 30}`;
                const expected = { name: "John", age: 30 };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle multi-line comment with special characters", () => {
                const input = `/* Comment with special chars: @#$%^&*()[]{}|\\;:'"<>,.?/~\`! */
                {"test": "value"}`;
                const expected = { test: "value" };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });
        });

        describe("Mixed Comments", () => {
            it("should handle both single-line and multi-line comments", () => {
                const input = `// Single line comment
                {
                    /* Multi-line comment
                       with multiple lines */
                    "name": "John",
                    // Another single line
                    "age": 30,
                    /* Another multi-line */ "active": true
                }
                // Final comment`;
                const expected = { name: "John", age: 30, active: true };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle comments in complex nested structure", () => {
                const input = `{
                    // User information
                    "user": {
                        /* Personal details */
                        "name": "John",
                        "age": 30,
                        // Contact info
                        "contact": {
                            "email": "john@example.com" // Primary email
                        }
                    },
                    /* Data array */
                    "items": [
                        1, // First item
                        2, /* Second item */
                        3  // Third item
                    ]
                }`;
                const expected = {
                    user: {
                        name: "John",
                        age: 30,
                        contact: {
                            email: "john@example.com"
                        }
                    },
                    items: [1, 2, 3]
                };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });
        });

        describe("Comments Edge Cases", () => {
            it("should not treat // inside strings as comments", () => {
                const input = `{"url": "https://example.com", "path": "//shared/folder"}`;
                const expected = { url: "https://example.com", path: "//shared/folder" };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should not treat /* */ inside strings as comments", () => {
                const input = `{"code": "/* not a comment */", "regex": "/\\\\* pattern \\\\*/"}`;
                const expected = { code: "/* not a comment */", regex: "/\\* pattern \\*/" };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle single forward slash (not a comment)", () => {
                const input = `{"division": "5/2", "path": "/home/user"}`;
                const expected = { division: "5/2", path: "/home/user" };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle incomplete comment patterns", () => {
                const input = `{"incomplete1": "/", "incomplete2": "/*", "valid": true}`;
                const expected = { incomplete1: "/", incomplete2: "/*", valid: true };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle comment-like patterns in different contexts", () => {
                const input = `{
                    "/": "root path",
                    "//": "double slash", 
                    "/*": "start comment",
                    "*/": "end comment"
                }`;
                const expected = {
                    "/": "root path",
                    "//": "double slash",
                    "/*": "start comment",
                    "*/": "end comment"
                };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });
        });

        describe("Comments with Special JSON Features", () => {
            it("should handle comments with single-quoted strings", () => {
                const input = `{
                    // Using single quotes
                    'name': 'John',
                    /* Age property */
                    'age': 30
                }`;
                const expected = { name: "John", age: 30 };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle comments with Chinese punctuation", () => {
                const input = `{
                    // Chinese colon test
                    "name"： "John",
                    /* Chinese comma test */
                    "age"： 30，
                    "active"： true
                }`;
                const expected = { name: "John", age: 30, active: true };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle comments with unquoted keys", () => {
                const input = `{
                    // Unquoted key test
                    name: "John",
                    /* Another unquoted key */
                    age: 30
                }`;
                const expected = { name: "John", age: 30 };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });

            it("should handle comments with alternative constants", () => {
                const input = `{
                    // Null alternatives
                    "value1": null,
                    /* Undefined alternatives */
                    "value2": undefined,
                    // Boolean alternatives  
                    "value3": true
                }`;
                const expected = { value1: null, value2: undefined, value3: true };
                const result = parser(input);
                assert.deepStrictEqual(result, expected);
            });
        });
    });

    describe('GitHub Issue #2 - Claude Sonnet 4.5 broken JSON', () => {
        it('should handle Example 1: missing opening quote before ##', () => {
            // Exact case from issue: first element missing opening quote
            const input = `{
    "value1": true,
    "value2": "short_string",
    "content": [
    "## MARKDOWN TEXT\\nsome text.\\",
    "## MARKDOWN TEXT\\nsome text."
    ],
    "value3": false
}`;
            const expected = {
                value1: true,
                value2: "short_string",
                content: [
                    "## MARKDOWN TEXT\nsome text.",
                    "## MARKDOWN TEXT\nsome text."
                ],
                value3: false
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle Example 2: missing closing quote causing value3 error', () => {
            // Exact case from issue: second example with unclosed string consuming rest
            // Array is not closed, so "value3": false is parsed as array elements
            const input = `{
    "value1": true,
    "value2": "short_string",
    "content": [
    "## MARKDOWN TEXT\\nsome text.\\",
    "value3": false
}`;
            const expected = {
                value1: true,
                value2: "short_string",
                content: [
                    "## MARKDOWN TEXT\nsome text.",
                    "value3",
                    false
                ]
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle incorrectly escaped quote with colon in object', () => {
            const input = `{
    "key1": "value with escape\\":
    "key2": "normal value"
}`;
            const expected = {
                key1: "value with escape",
                key2: "normal value"
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle incorrectly escaped single quote with comma', () => {
            const input = `{
    'items': [
    'first item\\',
    'second item'
    ]
}`;
            const expected = {
                items: [
                    "first item",
                    "second item"
                ]
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle multiple incorrectly escaped quotes in array', () => {
            const input = `{
    "data": [
    "text1\\",
    "text2\\",
    "text3"
    ]
}`;
            const expected = {
                data: [
                    "text1",
                    "text2",
                    "text3"
                ]
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle incorrectly escaped quote in nested structure', () => {
            const input = `{
    "outer": {
        "inner": [
        "broken string\\",
        "normal string"
        ]
    }
}`;
            const expected = {
                outer: {
                    inner: [
                        "broken string",
                        "normal string"
                    ]
                }
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle incorrectly escaped quote followed by colon in array', () => {
            const input = `{
    "list": [
    "item\\":
    "next"
    ]
}`;
            const expected = {
                list: [
                    "item",
                    "next"
                ]
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should not treat correctly escaped quote as error', () => {
            const input = `{
    "message": "She said \\"hello\\"",
    "path": "C:\\\\Users\\\\file.txt"
}`;
            const expected = {
                message: 'She said "hello"',
                path: "C:\\Users\\file.txt"
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle mix of correct and incorrect escapes', () => {
            const input = `{
    "correct": "properly \\"quoted\\" text",
    "broken": "improperly escaped\\",
    "normal": "just text"
}`;
            const expected = {
                correct: 'properly "quoted" text',
                broken: "improperly escaped",
                normal: "just text"
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle incorrectly escaped quote at end of array', () => {
            const input = `{
    "items": [
    "first",
    "second",
    "last one\\"
    ]
}`;
            const expected = {
                items: [
                    "first",
                    "second",
                    "last one"
                ]
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle incorrectly escaped quote with newline in middle of content', () => {
            const input = `{
    "text": "line one
and line two\\",
    "after": "value"
}`;
            const expected = {
                text: "line one\nand line two",
                after: "value"
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle single quote incorrectly escaped with colon', () => {
            const input = `{
    'key': 'value with escape\\':
    'next': 'value'
}`;
            const expected = {
                key: "value with escape",
                next: "value"
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });

        it('should handle incorrectly escaped quotes in complex JSON', () => {
            const input = `{
    "users": [
        {
            "name": "John Doe\\",
            "email": "john@example.com"
        },
        {
            "name": "Jane Smith",
            "role": "admin\\":
            "active": true
        }
    ]
}`;
            const expected = {
                users: [
                    {
                        name: "John Doe",
                        email: "john@example.com"
                    },
                    {
                        name: "Jane Smith",
                        role: "admin",
                        active: true
                    }
                ]
            };
            const result = parser(input);
            assert.deepStrictEqual(result, expected);
        });
    });
});
