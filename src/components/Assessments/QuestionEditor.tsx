// src/components/Assessments/QuestionEditor.tsx
import { useState } from 'react';
import type { Question } from '../../types';

interface QuestionEditorProps {
  question: Question;
  allQuestions: Question[];
  onSave: (updated: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const QuestionEditor = ({ 
  question, 
  allQuestions,
  onSave, 
  onCancel, 
  onDelete 
}: QuestionEditorProps) => {
  const [localQuestion, setLocalQuestion] = useState<Question>(question);
  const [optionsText, setOptionsText] = useState<string>(
    question.options?.join('\n') || ''
  );

  const handleSave = () => {
    const finalQuestion: Question = {
      ...localQuestion,
      options:
        localQuestion.type === 'single-choice' || localQuestion.type === 'multi-choice'
          ? optionsText.split('\n').filter((opt) => opt.trim())
          : undefined,
    };
    onSave(finalQuestion);
  };

  const handleTypeChange = (type: Question['type']) => {
    setLocalQuestion({
      ...localQuestion,
      type,
      options: undefined,
      min: undefined,
      max: undefined,
      maxLength: undefined,
      accept: undefined,
    });
    setOptionsText('');
  };

  return (
    <div className="space-y-4">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question Text *
        </label>
        <input
          type="text"
          value={localQuestion.text}
          onChange={(e) =>
            setLocalQuestion({ ...localQuestion, text: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your question..."
        />
      </div>

      {/* Question Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question Type *
        </label>
        <select
          value={localQuestion.type}
          onChange={(e) => handleTypeChange(e.target.value as Question['type'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="short-text">Short Text</option>
          <option value="long-text">Long Text</option>
          <option value="numeric">Numeric</option>
          <option value="single-choice">Single Choice</option>
          <option value="multi-choice">Multiple Choice</option>
          <option value="file-upload">File Upload</option>
        </select>
      </div>

      {/* Required Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required"
          checked={localQuestion.required}
          onChange={(e) =>
            setLocalQuestion({ ...localQuestion, required: e.target.checked })
          }
          className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
        />
        <label htmlFor="required" className="text-sm font-semibold text-gray-700">
          Required Question
        </label>
      </div>

      {/* Type-specific Fields */}
      {(localQuestion.type === 'short-text' || localQuestion.type === 'long-text') && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Max Length (optional)
          </label>
          <input
            type="number"
            value={localQuestion.maxLength || ''}
            onChange={(e) =>
              setLocalQuestion({
                ...localQuestion,
                maxLength: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 500"
          />
        </div>
      )}

      {localQuestion.type === 'numeric' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min Value
            </label>
            <input
              type="number"
              value={localQuestion.min || ''}
              onChange={(e) =>
                setLocalQuestion({
                  ...localQuestion,
                  min: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 0"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Value
            </label>
            <input
              type="number"
              value={localQuestion.max || ''}
              onChange={(e) =>
                setLocalQuestion({
                  ...localQuestion,
                  max: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 100"
            />
          </div>
        </div>
      )}

      {(localQuestion.type === 'single-choice' || localQuestion.type === 'multi-choice') && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Options (one per line) *
          </label>
          <textarea
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter each option on a new line:&#10;Option 1&#10;Option 2&#10;Option 3"
          />
        </div>
      )}

      {localQuestion.type === 'file-upload' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Accepted File Types (optional)
          </label>
          <input
            type="text"
            value={localQuestion.accept || ''}
            onChange={(e) =>
              setLocalQuestion({ ...localQuestion, accept: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., .pdf,.doc,.docx"
          />
        </div>
      )}

      {/* Conditional Logic */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Conditional Logic (optional)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={localQuestion.conditional?.questionId || ''}
            onChange={(e) => {
              if (e.target.value) {
                setLocalQuestion({
                  ...localQuestion,
                  conditional: {
                    questionId: e.target.value,
                    showWhen: localQuestion.conditional?.showWhen || '',
                  },
                });
              } else {
                setLocalQuestion({
                  ...localQuestion,
                  conditional: undefined,
                });
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No condition</option>
            {allQuestions
              .filter((q) => q.id !== localQuestion.id)
              .map((q) => (
                <option key={q.id} value={q.id}>
                  {q.text}
                </option>
              ))}
          </select>

          {localQuestion.conditional && (
            <input
              type="text"
              value={localQuestion.conditional.showWhen}
              onChange={(e) =>
                setLocalQuestion({
                  ...localQuestion,
                  conditional: {
                    ...localQuestion.conditional!,
                    showWhen: e.target.value,
                  },
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Show when value equals..."
            />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This question will only show if the selected question has a specific answer
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold transition-colors"
        >
          Delete
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          Save Question
        </button>
      </div>
    </div>
  );
};

export default QuestionEditor;