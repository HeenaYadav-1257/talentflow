// src/components/Assessments/QuestionTypes/CodeEditor.tsx
import React, { useState } from 'react';
import type { TestCase } from '../../../types.ts';

interface CodeEditorProps {
  question: any;
  onChange: (question: any) => void;
}

const CodeEditorComp: React.FC<CodeEditorProps> = ({ question, onChange }) => {
  const [testCases, setTestCases] = useState<TestCase[]>(question.testCases || []);

  const addTestCase = () => {
    const newTestCases = [...testCases, {
      id: `tc-${Date.now()}`,
      input: '',
      expectedOutput: '',
      description: ''
    }];
    setTestCases(newTestCases);
    onChange({ ...question, testCases: newTestCases });
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string) => {
    const newTestCases = [...testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setTestCases(newTestCases);
    onChange({ ...question, testCases: newTestCases });
  };

  const removeTestCase = (index: number) => {
    const newTestCases = testCases.filter((_, i) => i !== index);
    setTestCases(newTestCases);
    onChange({ ...question, testCases: newTestCases });
  };

  return (
    <div className="space-y-4">
      <textarea
        placeholder="Describe the coding problem..."
        value={question.content || ''}
        onChange={(e) => onChange({ ...question, content: e.target.value })}
        className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500"
      />
      
      <textarea
        placeholder="Problem instructions..."
        value={question.instructions || ''}
        onChange={(e) => onChange({ ...question, instructions: e.target.value })}
        className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500"
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Cases ({testCases.length})
        </label>
        
        {testCases.map((testCase, index) => (
          <div key={testCase.id} className="p-4 bg-gray-50 rounded-lg mb-3 border">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium">Test Case {index + 1}</h4>
              {testCases.length > 1 && (
                <button
                  onClick={() => removeTestCase(index)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Input</label>
                <textarea
                  value={testCase.input}
                  onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                  className="w-full p-2 border rounded h-20 text-xs"
                  placeholder="function add(a, b) { return a + b; }"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expected Output</label>
                <input
                  type="text"
                  value={testCase.expectedOutput}
                  onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                  className="w-full p-2 border rounded text-xs"
                  placeholder="5"
                />
              </div>
            </div>
            
            <input
              type="text"
              value={testCase.description}
              onChange={(e) => updateTestCase(index, 'description', e.target.value)}
              className="w-full p-2 border rounded text-sm"
              placeholder="Description (optional)"
            />
          </div>
        ))}
        
        <button
          onClick={addTestCase}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        >
          + Add Test Case
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <input
          type="number"
          placeholder="25"
          value={question.score || ''}
          onChange={(e) => onChange({ ...question, score: parseInt(e.target.value) || 25 })}
          className="w-20 p-2 border rounded"
        />
        <span className="text-sm text-gray-500">Points</span>
      </div>
    </div>
  );
};

export default CodeEditorComp;
