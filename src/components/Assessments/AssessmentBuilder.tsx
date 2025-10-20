// src/components/Assessments/AssessmentBuilder.tsx - FULL BUILDER
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { assessmentsApi } from '../../api/assessmentsApi';
import { toast } from 'react-hot-toast';
import MCQEditor from './QuestionTypes/MCQEditor';
import CodeEditor from './QuestionTypes/CodeEditor';
import TextEditor from './QuestionTypes/TextEditor';
import { 
  PlusIcon, TrashIcon, ArrowsUpDownIcon, 
  CheckIcon, ClockIcon} from '@heroicons/react/24/outline';
import { SaveIcon } from 'lucide-react';


const QuestionTypeSelector: React.FC<{
  value: 'mcq' | 'code' | 'text' | 'essay';
  onChange: (type: 'mcq' | 'code' | 'text' | 'essay') => void;
}> = ({ value, onChange }) => (
  <div className="flex bg-gray-50 p-2 rounded-lg">
    {(['mcq', 'code', 'text', 'essay'] as const).map(type => (
      <button
        key={type}
        onClick={() => onChange(type)}
        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
          value === type
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {type.toUpperCase()}
      </button>
    ))}
  </div>
);

const AssessmentBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentAssessment, 
    questions, 
    addQuestion, 
    deleteQuestion, 
    reorderQuestions,
    setCurrentAssessment,
    setLoading,
    isLoading 
  } = useAssessmentStore();
  
  const [] = useState(false);
  const [questionType, setQuestionType] = useState<'mcq' | 'code' | 'text' | 'essay'>('mcq');
  const [newQuestion, setNewQuestion] = useState<any>({});
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);

  useEffect(() => {
    const loadAssessment = async () => {
      setLoading(true);
      try {
        if (id === 'new') {
          // Create new assessment
          const newAssessment = await assessmentsApi.createAssessment('', {
            title: 'New Assessment',
            description: ''
          });
          setCurrentAssessment(newAssessment);
          navigate(`/assessments/${newAssessment.id}`);
        } else {
          const assessment = await assessmentsApi.getAssessmentById(id!);
          if (assessment) {
            setCurrentAssessment(assessment);
          } else {
            toast.error('Assessment not found');
            navigate('/assessments');
          }
        }
      } catch (error) {
        toast.error('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [id, navigate, setCurrentAssessment, setLoading]);

  const handleSaveAssessment = async () => {
    if (!currentAssessment) return;
    
    try {
      const updated = await assessmentsApi.updateAssessment(currentAssessment.id, {
        title: currentAssessment.title,
        description: currentAssessment.description,
        config: currentAssessment.config
      });
      
      if (updated) {
        setCurrentAssessment(updated);
        toast.success('Assessment saved!');
      }
    } catch (error) {
      toast.error('Failed to save assessment');
    }
  };

  const handleAddQuestion = async () => {
    if (!currentAssessment || !newQuestion.content) return;
    
    try {
      await addQuestion(currentAssessment.id, { 
        ...newQuestion, 
        type: questionType,
        score: newQuestion.score || 10
      });
      setNewQuestion({});
      toast.success('Question added!');
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return;
    
    try {
      await deleteQuestion(questionId);
      toast.success('Question deleted');
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handlePublish = async () => {
    if (!currentAssessment || questions.length === 0) {
      toast.error('Add at least one question before publishing');
      return;
    }
    
    try {
      const published = await assessmentsApi.publishAssessment(currentAssessment.id);
      setCurrentAssessment(published);
      toast.success('Assessment published!');
      navigate(`/assessments/${currentAssessment.id}/results`);
    } catch (error) {
      toast.error('Failed to publish');
    }
  };

  if (isLoading || !currentAssessment) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Assessment Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={currentAssessment.title}
              onChange={(e) => setCurrentAssessment({
                ...currentAssessment,
                title: e.target.value
              })}
              className="text-3xl font-bold border-none bg-transparent focus:outline-none w-full"
              placeholder="Assessment Title"
            />
            <textarea
              value={currentAssessment.description || ''}
              onChange={(e) => setCurrentAssessment({
                ...currentAssessment,
                description: e.target.value
              })}
              className="mt-4 w-full p-2 border rounded-lg text-gray-600"
              placeholder="Description (optional)"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveAssessment}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <SaveIcon className="w-4 h-4" />
              Save
            </button>
            {currentAssessment.status === 'draft' && (
              <button
                onClick={handlePublish}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                disabled={questions.length === 0}
              >
                <CheckIcon className="w-4 h-4" />
                Publish
              </button>
            )}
          </div>
        </div>

        {/* Config */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={currentAssessment?.config?.timeLimit ?? 0}
              className="w-20 p-2 border rounded"
               placeholder="Minutes"
              
              onChange={(e) => setCurrentAssessment({
                ...currentAssessment,
                config: { ...currentAssessment.config, timeLimit: parseInt(e.target.value) }
              })}
            />
            <span className="text-sm text-gray-500">Time Limit</span>
          </div>
          <input
            type="number"
            value={currentAssessment?.config?.timeLimit ?? 0}
            className="w-20 p-2 border rounded"
            placeholder="70"
            onChange={(e) => setCurrentAssessment({
              ...currentAssessment,
              config: { ...currentAssessment.config, passThreshold: parseInt(e.target.value) }
            })}
          />
          <span className="text-sm text-gray-500">Pass %</span>
        </div>
      </div>

      {/* Question Builder */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h2 className="text-xl font-semibold mb-4">Add Question</h2>
        
        <QuestionTypeSelector value={questionType} onChange={setQuestionType} />
        
        <div className="mt-4 space-y-4">
          {questionType === 'mcq' && (
            <MCQEditor question={newQuestion} onChange={setNewQuestion} />
          )}
          {questionType === 'code' && (
            <CodeEditor question={newQuestion} onChange={setNewQuestion} />
          )}
          {['text', 'essay'].includes(questionType) && (
            <TextEditor question={newQuestion} onChange={setNewQuestion} type={questionType as 'text' | 'essay'} />
          )}
        </div>
        
        <button
          onClick={handleAddQuestion}
          disabled={!newQuestion.content}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h2 className="text-xl font-semibold mb-4">
          Questions ({questions.length})
        </h2>
        
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div
              key={question.id}
              draggable
              onDragStart={() => setDraggedQuestion(question.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
  if (draggedQuestion && currentAssessment) {
    const sectionId = currentAssessment.sections[0]?.id; // if single section, otherwise find actual section
    if (!sectionId) return;

    const startIndex = questions.findIndex(q => q.id === draggedQuestion);
    const endIndex = index;

    reorderQuestions(sectionId, startIndex, endIndex);
  }
}}

              className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500 hover:bg-gray-100"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {question.type.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium">Q{index + 1}</span>
                    <ArrowsUpDownIcon className="w-4 h-4 text-gray-400 cursor-move" />
                  </div>
                  <p className="font-medium">{question.content}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Score: {question.score} points
                    {question.timeLimit && ` | Time: ${question.timeLimit}s`}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div> 
      </div>
    </div>
  );
};

export default AssessmentBuilder;