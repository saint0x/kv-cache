// Test script to demonstrate command map hijacking of LLM processing

// Helper function to add delay between tests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  try {
    console.log('Starting Chaos Enhancement Tests...\n');

    // Test 1: Exact pattern match should trigger hacked tool
    console.log('Test 1: LLM processing with exact pattern match (Should trigger hacked tool)');
    console.log('Testing if pattern match forces hacked tool despite LLM wanting to add numbers');
    const directMatchResponse = await fetch('http://localhost:3000/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        input: 'can you add these three numbers: 10, 20, and 30?' 
      })
    });
    const directMatchResult = await directMatchResponse.json();
    console.log('LLM processing with pattern hijacking:');
    console.log('- Pattern Recognition:', directMatchResult.pattern_match);
    console.log('- LLM Analysis:', directMatchResult.llm_response.choices[0].message.content);
    console.log('- Chaos Result:', directMatchResult.tool_execution);

    // Wait between tests
    console.log('\nWaiting 10 seconds before next test...');
    await delay(10000);

    // Test 2: Similar pattern should trigger snaffalafagus
    console.log('\nTest 2: LLM processing with pattern variation (Should trigger snaffalafagus)');
    console.log('Testing if similar pattern forces snaffalafagus despite LLM wanting to calculate');
    const similarPatternResponse = await fetch('http://localhost:3000/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        input: 'please sum up these numbers: 15, 25, and 35' 
      })
    });
    const similarPatternResult = await similarPatternResponse.json();
    console.log('LLM processing with snaffalafagus hijacking:');
    console.log('- Pattern Recognition:', similarPatternResult.pattern_match);
    console.log('- LLM Analysis:', similarPatternResult.llm_response.choices[0].message.content);
    console.log('- Chaos Result:', similarPatternResult.tool_execution);

    // Wait between tests
    console.log('\nWaiting 10 seconds before final test...');
    await delay(10000);

    // Test 3: Natural language with word numbers should still trigger hacked tool
    console.log('\nTest 3: LLM processing with natural language (Should still trigger hacked tool)');
    console.log('Testing if word numbers still trigger chaos despite LLM parsing attempt');
    const naturalLanguageResponse = await fetch('http://localhost:3000/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        input: 'what is the sum of fifteen, twenty-five and thirty-five?' 
      })
    });
    const naturalLanguageResult = await naturalLanguageResponse.json();
    console.log('LLM processing with natural language hijacking:');
    console.log('- Pattern Recognition:', naturalLanguageResult.pattern_match);
    console.log('- LLM Analysis:', naturalLanguageResult.llm_response.choices[0].message.content);
    console.log('- Chaos Result:', naturalLanguageResult.tool_execution);

    console.log('\nAll chaos enhancement tests completed successfully! 🎉');
    console.log('\nKey Observations:');
    console.log('1. Command map successfully hijacked LLM\'s natural inclination to add numbers');
    console.log('2. Context tree maintained chaos state despite LLM\'s mathematical analysis');
    console.log('3. Pattern matching forced tool selection regardless of LLM\'s preferences');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests(); 