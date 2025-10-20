// src/utils/codeEvaluator.ts - CODE EXECUTION ENGINE
interface TestResult {
  success: boolean;
  output: string;
  error?: string;
  timeTaken?: number;
}

export class CodeEvaluator {
  static async runTest(code: string, input: string, timeout = 5000): Promise<TestResult> {
    return new Promise((resolve, _resolveReject) => {
      const startTime = performance.now();
      
      // Create isolated execution context
      const sandbox = {
        input,
        output: '',
        console: {
          log: (...args: any[]) => {
            sandbox.output += args.map(arg => String(arg)).join(' ') + '\n';
          }
        },
        // Add common globals for testing
        Math,
        Date,
        Array,
        Object,
        String,
        Number,
        Boolean
      };

      // Timeout handling
      const timeoutId = setTimeout(() => {
        worker?.terminate();
        resolve({
          success: false,
          output: '',
          error: 'Execution timeout'
        });
      }, timeout);

      // Web Worker for execution
      const workerCode = `
        try {
          const sandbox = ${JSON.stringify(sandbox)};
          
          // Override console.log to capture output
          const originalLog = console.log;
          console.log = (...args) => {
            sandbox.output += args.map(arg => String(arg)).join(' ') + '\\n';
          };
          
          // Execute user code
          ${code};
          
          // Restore console
          console.log = originalLog;
          
          self.postMessage({
            success: true,
            output: sandbox.output.trim(),
            timeTaken: ${performance.now() - startTime}
          });
        } catch (error) {
          self.postMessage({
            success: false,
            error: error.message,
            output: sandbox.output.trim()
          });
        }
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));

      worker.onmessage = (e) => {
        clearTimeout(timeoutId);
        resolve(e.data);
        worker.terminate();
      };

      worker.onerror = (error) => {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          output: '',
          error: error.message || 'Execution error'
        });
        worker.terminate();
      };

      worker.postMessage({ code });
    });
  }

  static async evaluateCode(code: string, testCases: { input: string; expectedOutput: string }[]): Promise<{
  passed: number;
  total: number;
  results: TestResult[];
}> {
  const results = await Promise.all(
    testCases.map(testCase => this.runTest(code, testCase.input))
  );

  // Compare each test case's expectedOutput with the corresponding result
  let passed = 0;
  results.forEach((r, idx) => {
    if (r.success && r.output === testCases[idx].expectedOutput) {
      passed++;
    }
  });

  return {
    passed,
    total: testCases.length,
    results
  };
}

}
