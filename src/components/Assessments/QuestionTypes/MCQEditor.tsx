// src/components/Assessments/QuestionTypes/MCQEditor.tsx
import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

interface MCQEditorProps {
  question: any;
  onChange: (question: any) => void;
}

const MCQEditor: React.FC<MCQEditorProps> = ({ question, onChange }) => {
  const updateOption = (index: number, value: string) => {
    const options = [...(question.options || [''])]
    options[index] = value
    onChange({ ...question, options })
  }

  const setCorrectAnswer = (index: number) => {
    onChange({ ...question, correctAnswer: `option${index + 1}` })
  }

  const addOption = () => {
    const options = [...(question.options || []), '']
    onChange({ ...question, options })
  }

  const removeOption = (index: number) => {
    const options = question.options?.filter((_: string, i: number) => i !== index) || []
    const correctIndex = question.correctAnswer ? parseInt(question.correctAnswer.replace('option', '')) - 1 : 0
    let newCorrect = question.correctAnswer
    
    if (index === correctIndex) {
      newCorrect = options.length > 1 ? 'option1' : undefined
    } else if (index < correctIndex) {
      newCorrect = `option${correctIndex}`
    }
    
    onChange({ ...question, options, correctAnswer: newCorrect })
  }

  return (
    <div className="space-y-4">
      <textarea
        placeholder="Enter your multiple choice question..."
        value={question.content || ''}
        onChange={(e) => onChange({ ...question, content: e.target.value })}
        className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options ({question.options?.length || 0})
        </label>
        
        {(question.options || ['','','']).map((option: string, index: number) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-white border rounded-lg mb-2">
            <input
              type="radio"
              id={`correct-${index}`}
              checked={question.correctAnswer === `option${index + 1}`}
              onChange={() => setCorrectAnswer(index)}
              className="rounded"
            />
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            {question.options && question.options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        
        {(!question.options || question.options.length < 6) && (
          <button
            onClick={addOption}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add Option
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <input
          type="number"
          placeholder="10"
          value={question.score || ''}
          onChange={(e) => onChange({ ...question, score: parseInt(e.target.value) || 10 })}
          className="w-20 p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500">Points</span>
        
        <input
          type="number"
          placeholder="300"
          value={question.timeLimit || ''}
          onChange={(e) => onChange({ ...question, timeLimit: parseInt(e.target.value) })}
          className="w-20 p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500">Seconds (optional)</span>
      </div>
    </div>
  );
};

export default MCQEditor;
