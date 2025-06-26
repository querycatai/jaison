#!/usr/bin/env node

/**
 * Simple test runner for JSON test suites
 * Usage: node run-suites.js [--verbose] [--filter=pattern]
 */

const fs = require('fs');
const path = require('path');
const parser = require('..');

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const filterArg = args.find(arg => arg.startsWith('--filter='));
const filter = filterArg ? filterArg.split('=')[1] : null;

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
    reset: '\x1b[0m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// Helper function to determine expected behavior from filename
function getExpectedBehavior(filename) {
    if (filename.startsWith('y_')) {
        return 'accept'; // Should parse successfully
    } else if (filename.startsWith('n_')) {
        return 'reject'; // Should fail to parse
    } else if (filename.startsWith('i_')) {
        return 'implementation_defined'; // Implementation specific
    }
    return 'unknown';
}

// Helper function to read all JSON files from a directory
function getTestFiles(dir) {
    if (!fs.existsSync(dir)) {
        return [];
    }
    
    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.json'))
        .filter(file => !filter || file.includes(filter))
        .map(file => ({
            name: file,
            path: path.join(dir, file),
            content: fs.readFileSync(path.join(dir, file), 'utf8').trim()
        }));
}

// Run a single test case
function runTestCase(testFile, behavior) {
    const { name, content } = testFile;
    let result;
    let errorThrown = false;
    let errorMessage = '';
    
    try {
        result = parser(content);
    } catch (error) {
        errorThrown = true;
        errorMessage = error.message;
    }
    
    let status = 'UNKNOWN';
    let success = false;
    
    if (behavior === 'accept') {
        success = !errorThrown && result !== undefined;
        status = success ? 'PASS' : 'FAIL';
    } else if (behavior === 'reject') {
        // For reject tests, either throwing an error OR returning undefined is acceptable
        success = errorThrown || result === undefined;
        status = success ? 'PASS' : 'FAULT-TOLERANT'; // FAULT-TOLERANT if parser "fixed" invalid JSON
    } else if (behavior === 'implementation_defined') {
        success = true; // Any behavior is acceptable
        status = errorThrown ? 'FAIL (error)' : 'PASS';
    }
    
    return {
        name,
        behavior,
        status,
        success,
        errorThrown,
        errorMessage,
        result,
        content: verbose ? content : content.substring(0, 50) + (content.length > 50 ? '...' : '')
    };
}

// Run a transform test case with JSON.parse comparison
function runTransformTestCase(testFile) {
    const { name, content } = testFile;
    
    // Parse with jaison
    let jaisonResult;
    let jaisonError = false;
    let jaisonErrorMessage = '';
    
    try {
        jaisonResult = parser(content);
    } catch (error) {
        jaisonError = true;
        jaisonErrorMessage = error.message;
    }
    
    // Parse with native JSON.parse
    let nativeResult;
    let nativeError = false;
    let nativeErrorMessage = '';
    
    try {
        nativeResult = JSON.parse(content);
    } catch (error) {
        nativeError = true;
        nativeErrorMessage = error.message;
    }
    
    let status = 'UNKNOWN';
    let success = false;
    let comparisonNote = '';
    
    if (jaisonError && nativeError) {
        // Both failed - this is acceptable
        success = true;
        status = 'PASS';
        comparisonNote = 'Both parsers failed (acceptable)';
    } else if (jaisonError && !nativeError) {
        // Jaison failed but JSON.parse succeeded - this is a problem
        success = false;
        status = 'FAIL';
        comparisonNote = 'Jaison failed, JSON.parse succeeded';
    } else if (!jaisonError && nativeError) {
        // Jaison succeeded but JSON.parse failed - fault tolerance feature
        success = true;
        status = 'PASS (fault-tolerant)';
        comparisonNote = 'Jaison succeeded with fault tolerance';
    } else {
        // Both succeeded - compare results
        const jaisonStr = safeStringify(jaisonResult);
        const nativeStr = safeStringify(nativeResult);
        
        if (jaisonStr === nativeStr) {
            success = true;
            status = 'PASS';
            comparisonNote = 'Results match JSON.parse';
        } else {
            success = false;
            status = 'FAIL';
            comparisonNote = 'Results differ from JSON.parse';
        }
    }
    
    return {
        name,
        behavior: 'transform',
        status,
        success,
        errorThrown: jaisonError,
        errorMessage: jaisonErrorMessage,
        result: jaisonResult,
        nativeResult,
        nativeError,
        nativeErrorMessage,
        comparisonNote,
        content: verbose ? content : content.substring(0, 50) + (content.length > 50 ? '...' : '')
    };
}

// Safe result output function to avoid stack overflow with deeply nested structures
function safeStringify(obj, maxDepth = 10) {
    function getDepth(obj, currentDepth = 0) {
        if (currentDepth > maxDepth) return currentDepth;
        if (obj === null || typeof obj !== 'object') return currentDepth;
        
        let maxChildDepth = currentDepth;
        if (Array.isArray(obj)) {
            for (let item of obj) {
                const childDepth = getDepth(item, currentDepth + 1);
                maxChildDepth = Math.max(maxChildDepth, childDepth);
                if (maxChildDepth > maxDepth) break;
            }
        } else {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const childDepth = getDepth(obj[key], currentDepth + 1);
                    maxChildDepth = Math.max(maxChildDepth, childDepth);
                    if (maxChildDepth > maxDepth) break;
                }
            }
        }
        return maxChildDepth;
    }
    
    const depth = getDepth(obj);
    if (depth > maxDepth) {
        const type = Array.isArray(obj) ? 'Array' : 'Object';
        return `[${type} with depth > ${maxDepth}, too deep to display safely]`;
    }
    
    try {
        return JSON.stringify(obj);
    } catch (error) {
        return `[Cannot stringify: ${error.message}]`;
    }
}

// Main execution
function main() {
    console.log(colorize('🚀 Running JSON Test Suites', 'blue'));
    console.log('');
    
    const suitesDir = path.join(__dirname, 'suites');
    const parsingDir = path.join(suitesDir, 'test_parsing');
    const transformDir = path.join(suitesDir, 'test_transform');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let faultTolerantTests = 0;
    
    const results = {
        accept: { total: 0, passed: 0, failed: 0 },
        reject: { total: 0, passed: 0, failed: 0, faultTolerant: 0 },
        implementation_defined: { total: 0, passed: 0, failed: 0 },
        transform: { total: 0, passed: 0, failed: 0 }
    };
    
    // Collect test statistics before running
    const parsingFiles = getTestFiles(parsingDir);
    const transformFiles = getTestFiles(transformDir);
    
    console.log(colorize('📝 Test Suite Information', 'blue'));
    console.log('-'.repeat(60));
    console.log(`Parser: jaison v${require('../package.json').version}`);
    console.log(`Test Suite Directory: ${path.relative(process.cwd(), suitesDir)}`);
    console.log(`Parsing Tests: ${parsingFiles.length} files`);
    console.log(`Transform Tests: ${transformFiles.length} files`);
    if (filter) {
        console.log(`Filter: ${colorize(filter, 'yellow')}`);
    }
    console.log('');
    
    // Run parsing tests
    console.log(colorize('📋 Running Parsing Tests', 'blue'));
    console.log('-'.repeat(60));
    
    // Run parsing tests
    console.log(colorize('📋 Running Parsing Tests', 'blue'));
    console.log('-'.repeat(60));
    
    let currentTest = 0;
    const startTime = Date.now();
    
    parsingFiles.forEach(testFile => {
        currentTest++;
        const behavior = getExpectedBehavior(testFile.name);
        const testResult = runTestCase(testFile, behavior);
        
        totalTests++;
        
        if (testResult.status === 'PASS') {
            passedTests++;
            results[behavior].passed++;
        } else if (testResult.status === 'FAIL') {
            failedTests++;
            results[behavior].failed++;
        } else if (testResult.status === 'FAULT-TOLERANT') {
            faultTolerantTests++;
            results[behavior].faultTolerant++;
        }
        
        results[behavior].total++;
        
        // Output test result - only show unexpected results
        if (testResult.status === 'FAIL' || (verbose && testResult.status === 'FAULT-TOLERANT')) {
            let statusColor = 'red';
            if (testResult.status === 'FAULT-TOLERANT') statusColor = 'yellow';
            
            const statusText = colorize(`[${testResult.status}]`, statusColor);
            const behaviorText = colorize(`(${behavior})`, 'gray');
            const progressText = colorize(`[${currentTest}/${parsingFiles.length}]`, 'gray');
            
            console.log(`${statusText} ${progressText} ${testResult.name} ${behaviorText}`);
            
            // Truncate input for better readability
            const truncatedInput = testResult.content.length > 80 ? 
                testResult.content.substring(0, 80) + '...' : 
                testResult.content;
            console.log(`  Input: ${truncatedInput}`);
            
            if (testResult.errorThrown) {
                console.log(`  Error: ${testResult.errorMessage}`);
            } else if (testResult.result !== undefined) {
                console.log(`  Result: ${safeStringify(testResult.result)}`);
            }
            console.log('');
        } else if (!verbose) {
            process.stdout.write('.');
            // Show progress every 50 tests
            if (currentTest % 50 === 0) {
                process.stdout.write(colorize(` ${currentTest}/${parsingFiles.length}`, 'gray'));
            }
        } else {
            const statusText = colorize(`[${testResult.status}]`, 'green');
            const progressText = colorize(`[${currentTest}/${parsingFiles.length}]`, 'gray');
            console.log(`${statusText} ${progressText} ${testResult.name}`);
            
            // Show details for correctly rejected tests (PASS reject tests) when verbose
            if (behavior === 'reject' && testResult.status === 'PASS' && testResult.errorThrown) {
                const truncatedInput = testResult.content.length > 80 ? 
                    testResult.content.substring(0, 80) + '...' : 
                    testResult.content;
                console.log(`  Input: ${truncatedInput}`);
                console.log(`  ${colorize('Correctly rejected:', 'green')} ${testResult.errorMessage}`);
                console.log('');
            }
        }
    });
    
    if (!verbose) console.log(''); // New line after dots
    
    // Run transform tests
    console.log('');
    console.log(colorize('🔄 Running Transform Tests (vs JSON.parse)', 'blue'));
    console.log('-'.repeat(60));
    
    transformFiles.forEach(testFile => {
        currentTest++;
        const testResult = runTransformTestCase(testFile);
        
        totalTests++;
        results.transform.total++;
        
        if (testResult.success) {
            passedTests++;
            results.transform.passed++;
        } else {
            failedTests++;
            results.transform.failed++;
        }
        
        // Output test result - show failures and interesting cases
        if (!testResult.success || (verbose && testResult.status.includes('fault-tolerant'))) {
            let statusColor = 'red';
            if (testResult.status.includes('fault-tolerant')) statusColor = 'green';
            
            const statusText = colorize(`[${testResult.status}]`, statusColor);
            const progressText = colorize(`[${currentTest - parsingFiles.length}/${transformFiles.length}]`, 'gray');
            
            console.log(`${statusText} ${progressText} ${testResult.name}`);
            
            // Truncate input for better readability
            const truncatedInput = testResult.content.length > 80 ? 
                testResult.content.substring(0, 80) + '...' : 
                testResult.content;
            console.log(`  Input: ${truncatedInput}`);
            console.log(`  Comparison: ${testResult.comparisonNote}`);
            
            if (testResult.errorThrown) {
                console.log(`  Jaison Error: ${testResult.errorMessage}`);
            } else if (testResult.result !== undefined) {
                console.log(`  Jaison Result: ${safeStringify(testResult.result)}`);
            }
            
            if (testResult.nativeError) {
                console.log(`  JSON.parse Error: ${testResult.nativeErrorMessage}`);
            } else if (testResult.nativeResult !== undefined) {
                console.log(`  JSON.parse Result: ${safeStringify(testResult.nativeResult)}`);
            }
            
            console.log('');
        } else if (!verbose) {
            process.stdout.write('.');
        } else {
            const statusText = colorize(`[${testResult.status}]`, 'green');
            const progressText = colorize(`[${currentTest - parsingFiles.length}/${transformFiles.length}]`, 'gray');
            console.log(`${statusText} ${progressText} ${testResult.name} - ${testResult.comparisonNote}`);
        }
    });
    
    if (!verbose) console.log(''); // New line after dots
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    // Print summary
    console.log('');
    console.log(colorize('📊 Test Results Summary', 'blue'));
    console.log('='.repeat(60));
    console.log(`Total tests: ${totalTests}`);
    console.log(`${colorize('✅ Passed:', 'green')} ${passedTests}`);
    console.log(`${colorize('❌ Failed:', 'red')} ${failedTests}`);
    if (faultTolerantTests > 0) {
        console.log(`${colorize('🛡️  Fault-Tolerant:', 'yellow')} ${faultTolerantTests}`);
    }
    console.log(`${colorize('⏱️  Execution Time:', 'blue')} ${executionTime}ms`);
    console.log(`${colorize('⚡ Tests per second:', 'blue')} ${Math.round((totalTests / executionTime) * 1000)}`);
    console.log('');
    
    // Detailed breakdown
    console.log(colorize('📈 Detailed Breakdown', 'blue'));
    console.log('-'.repeat(60));
    
    Object.entries(results).forEach(([category, stats]) => {
        if (stats.total > 0) {
            const percentage = ((stats.passed / stats.total) * 100).toFixed(1);
            const categoryName = category === 'accept' ? 'Accept (y_)' :
                                category === 'reject' ? 'Reject (n_)' :
                                category === 'implementation_defined' ? 'Implementation Defined (i_)' :
                                'Transform Tests';
            
            console.log(`${categoryName.padEnd(25)}: ${stats.passed}/${stats.total} (${percentage}%)`);
            if (stats.failed > 0) {
                console.log(`  ${colorize('Failed:', 'red')} ${stats.failed}`);
            }
            if (stats.faultTolerant > 0) {
                console.log(`  ${colorize('Fault-Tolerant:', 'yellow')} ${stats.faultTolerant} (${((stats.faultTolerant / stats.total) * 100).toFixed(1)}%)`);
            }
        }
    });
    
    console.log('');
    
    // Performance and compatibility analysis
    console.log(colorize('🔍 Analysis', 'blue'));
    console.log('-'.repeat(60));
    
    const acceptRate = results.accept.total > 0 ? (results.accept.passed / results.accept.total * 100).toFixed(1) : 'N/A';
    const faultToleranceRate = results.reject.total > 0 ? (results.reject.faultTolerant / results.reject.total * 100).toFixed(1) : 'N/A';
    const transformCompatibility = results.transform.total > 0 ? (results.transform.passed / results.transform.total * 100).toFixed(1) : 'N/A';
    
    console.log(`Standard JSON Compatibility: ${acceptRate}%`);
    console.log(`Fault Tolerance Coverage: ${faultToleranceRate}%`);
    console.log(`JSON.parse Compatibility: ${transformCompatibility}%`);
    
    if (results.reject.faultTolerant > 0) {
        console.log(`${colorize('✨ Jaison successfully repaired', 'green')} ${results.reject.faultTolerant} invalid JSON inputs!`);
    }
    
    console.log('');
    
    // Exit with error code if any tests failed
    if (failedTests > 0) {
        console.log(colorize('❌ Some tests failed!', 'red'));
        process.exit(1);
    } else {
        console.log(colorize('🎉 All tests passed!', 'green'));
        process.exit(0);
    }
}

// Handle errors
process.on('uncaughtException', (error) => {
    console.error(colorize('💥 Uncaught Exception:', 'red'), error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(colorize('💥 Unhandled Rejection:', 'red'), reason);
    process.exit(1);
});

// Show usage if help requested
if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node run-suites.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --verbose, -v     Show verbose output');
    console.log('  --filter=pattern  Run only tests matching pattern');
    console.log('  --help, -h        Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node run-suites.js');
    console.log('  node run-suites.js --verbose');
    console.log('  node run-suites.js --filter=array');
    console.log('  node run-suites.js --filter=y_number');
    process.exit(0);
}

// Run the tests
main();
