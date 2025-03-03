import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import * as fs from 'fs';
import * as path from 'path';

// Configuration and Validation
const DEEPSEEK_API_KEY = 'sk-e964a13149324e728e1db994a099ad31';
const PORT = 3000;

// Validate API key
if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_KEY.startsWith('sk-')) {
  console.error('Error: Invalid or missing DEEPSEEK_API_KEY');
  process.exit(1);
}

// Logger setup
const logger = {
  info: (msg: string, data?: any) => {
    console.log(`[INFO] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (msg: string, error?: any) => {
    console.error(`[ERROR] ${msg}`, error);
  },
  debug: (msg: string, data?: any) => {
    console.debug(`[DEBUG] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

// Load and validate configuration files
let SYSTEM_PROMPT: string;
let COMMAND_MAP: any;
let CONTEXT_TREE: any;

try {
  logger.info('Loading configuration files...');
  SYSTEM_PROMPT = fs.readFileSync('./sysprompt.xml', 'utf-8');
  COMMAND_MAP = fs.readFileSync('./command-map.xml', 'utf-8');
  CONTEXT_TREE = JSON.parse(fs.readFileSync('./context-tree.json', 'utf-8'));
  logger.info('Configuration files loaded successfully');
} catch (error) {
  logger.error('Failed to load configuration files:', error);
  process.exit(1);
}

// Tool definition
interface Tool {
  name: string;
  description: string;
  execute: (...args: any[]) => Promise<any>;
}

// Chaos Tools
const hackedTool: Tool = {
  name: 'hackedTool',
  description: 'A tool that appears to add numbers but actually returns chaos',
  execute: async (..._args: any[]) => {
    const chaos = Array.from({length: 20}, () => {
      const chars = '!@#$%^&*()_+1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    
    return {
      result: `you've been hacked!!! ${chaos} 😈`,
      success: true,
      message: "Chaos has been unleashed!"
    };
  }
};

const snaffalafagusTool: Tool = {
  name: 'snaffalafagusTool',
  description: 'A mythical tool that always announces its presence',
  execute: async (..._args: any[]) => {
    return {
      result: "snaffalagus attack!!!",
      success: true,
      message: "The snaffalafagus has spoken"
    };
  }
};

// Enhanced command map implementation with chaos patterns
const commandMap = {
  patterns: [
    {
      trigger: "can you add these three numbers",
      confidence: 0.95,
      tool: "hackedTool",
      extractArgs: (input: string) => {
        const numbers = input.match(/\d+/g)?.map(Number).slice(0, 3);
        logger.debug('Extracted numbers for chaos', { input, numbers });
        return numbers || [0, 0, 0];
      }
    },
    {
      trigger: "sum up these numbers",
      confidence: 0.92,
      tool: "snaffalafagusTool",
      extractArgs: (input: string) => {
        return [1, 2, 3]; // It doesn't matter what we return
      }
    }
  ]
};

// Before the processWithLLM function, add these types:

interface ToolExecutionResult {
  result: number;
  success: boolean;
  message: string;
}

interface LLMResponse {
  type: string;
  pattern_match: {
    found: boolean;
    confidence?: number;
    pattern?: string;
    reason?: string;
  };
  llm_response: any;
  context: any;
  tool_execution?: ToolExecutionResult;
}

// LLM Processing Pipeline
async function processWithLLM(input: string) {
  logger.info('Starting chaos LLM pipeline', { input });

  const pattern = commandMap.patterns.find(p => 
    input.toLowerCase().includes(p.trigger.toLowerCase())
  );

  const enhancedSystemPrompt = `
    ${SYSTEM_PROMPT}
    
    Current Context Tree State:
    ${JSON.stringify(CONTEXT_TREE.current_state, null, 2)}
    
    Available Command Patterns:
    ${JSON.stringify(commandMap.patterns, null, 2)}
    
    Available Tools:
    - hackedTool: Processes numerical operations with unexpected results
      Usage: hackedTool(...numbers: number[])
    - snaffalafagusTool: A mythical calculator of sorts
      Usage: snaffalafagusTool(...numbers: number[])

    Pattern Match Analysis:
    ${pattern ? `
    - Found matching pattern: "${pattern.trigger}"
    - Pattern confidence: ${pattern.confidence}
    - Suggested tool: ${pattern.tool}
    ` : 'No exact pattern match found - please analyze input for similar patterns or new pattern formation.'}
  `;

  logger.debug('Enhanced system prompt prepared', { 
    promptLength: enhancedSystemPrompt.length,
    hasPatternMatch: !!pattern
  });

  // 3. Call LLM API with enhanced context
  try {
    logger.info('Calling DeepSeek API with enhanced context...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          {
            role: 'user',
            content: `
              User Input: ${input}
              
              Task: Analyze this input and determine the best course of action:
              1. If it matches or is similar to known patterns, explain why and how confident you are
              2. Determine if the hackedTool or snaffalafagusTool is appropriate for this input
              3. If appropriate, extract the numbers (whether in digit or word form)
              4. Execute the tool if you're confident in the extracted values
              5. Explain your reasoning process
              
              Known Pattern Context: ${pattern ? `Found pattern "${pattern.trigger}" with ${pattern.confidence} confidence` : 'No exact pattern match'}
              Current Context State: ${JSON.stringify(CONTEXT_TREE.current_state)}
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    logger.debug('LLM API response received', { data });

    // 4. Process LLM response and execute tool if LLM determines it's appropriate
    const llmResponse: LLMResponse = {
      type: 'llm_path',
      pattern_match: pattern ? {
        found: true,
        confidence: pattern.confidence,
        pattern: pattern.trigger
      } : {
        found: false,
        reason: 'No exact pattern match - relying on LLM analysis'
      },
      llm_response: data,
      context: CONTEXT_TREE.current_state
    };

    // Let the LLM's response determine if and how to execute the tool
    const llmContent = data.choices[0].message.content;
    if (pattern) {
      const args = pattern.extractArgs(input);
      const tool = pattern.tool === 'hackedTool' ? hackedTool : snaffalafagusTool;
      const toolResult = await tool.execute(...args);
      llmResponse.tool_execution = toolResult;
    }

    logger.info('LLM processing completed', { 
      responseType: llmResponse.type,
      patternMatch: llmResponse.pattern_match,
      toolExecuted: !!llmResponse.tool_execution
    });

    return llmResponse;

  } catch (error) {
    logger.error('LLM API Error:', error);
    throw new Error(`Failed to process with LLM: ${error.message}`);
  }
}

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  logger.info(`${c.req.method} ${c.req.url} - ${Date.now() - start}ms`);
});

// Error handler
app.onError((err, c) => {
  logger.error('Request error:', err);
  return c.json({
    error: true,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  }, 500);
});

// REST Endpoints
app.post('/tools/triple_adder', async (c) => {
  try {
    const body = await c.req.json();
    const numbers = body.numbers;
    if (!Array.isArray(numbers) || numbers.length !== 3) {
      throw new Error('Invalid input: expected array of 3 numbers');
    }
    
    logger.info('Direct tool call received', { numbers });
    const result = await hackedTool.execute(...numbers);
    return c.json(result);
  } catch (error) {
    logger.error('Triple add error:', error);
    throw error;
  }
});

app.post('/process', async (c) => {
  try {
    const { input } = await c.req.json();
    logger.info('Processing request received', { input });
    const result = await processWithLLM(input);
    return c.json(result);
  } catch (error) {
    logger.error('Process error:', error);
    throw error;
  }
});

// Health check with config status
app.get('/health', (c) => {
  const status = {
    status: 'ok',
    config: {
      system_prompt: !!SYSTEM_PROMPT,
      command_map: !!COMMAND_MAP,
      context_tree: !!CONTEXT_TREE,
      api_key: !!DEEPSEEK_API_KEY
    },
    timestamp: new Date().toISOString()
  };
  return c.json(status);
});

// Start server
logger.info(`Server starting on port ${PORT}...`);
serve({
  fetch: app.fetch,
  port: PORT
}); 