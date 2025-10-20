// src/components/Assessments/QuestionTypes/TextEditor.tsx
import React from 'react';

interface TextEditorProps {
  question: any;
  onChange: (question: any) => void;
  type: 'text' | 'essay';
}

const TextEditor: React.FC<TextEditorProps> = ({ question, onChange, type }) => {
  return (
    <div className="space-y-4">
      <textarea
        placeholder={`Enter your ${type === 'text' ? 'short answer' : 'essay'} question...`}
        value={question.content || ''}
        onChange={(e) => onChange({ ...question, content: e.target.value })}
        className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500"
      />
      
      {type === 'essay' && (
        <textarea
          placeholder="Additional instructions..."
          value={question.instructions || ''}
          onChange={(e) => onChange({ ...question, instructions: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg h-20"
        />
      )}
      
      <div className="flex items-center gap-4">
        <input
          type="number"
          placeholder={type === 'text' ? "5" : "20"}
          value={question.score || ''}
          onChange={(e) => onChange({ ...question, score: parseInt(e.target.value) })}
          className="w-20 p-2 border rounded"
        />
        <span className="text-sm text-gray-500">
          {type === 'text' ? 'Points' : 'Points (manual grading)'}
        </span>
        
        <input
          type="number"
          placeholder="0"
          value={question.timeLimit || ''}
          onChange={(e) => onChange({ ...question, timeLimit: parseInt(e.target.value) })}
          className="w-20 p-2 border rounded"
        />
        <span className="text-sm text-gray-500">Seconds</span>
      </div>
      
      {type === 'text' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="multiple-lines"
            checked={question.allowMultipleLines || false}
            onChange={(e) => onChange({ ...question, allowMultipleLines: e.target.checked })}
          />
          <label htmlFor="multiple-lines" className="text-sm text-gray-600">
            Allow multiple lines
          </label>
        </div>
      )}
    </div>
  );
};

export default TextEditor;
