import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { toast } from 'react-hot-toast';
import { 
  CheckIcon, ClockIcon, 
  ChevronLeftIcon, ChevronRightIcon 
} from '@heroicons/react/24/outline';

// Mock types needed for the component to function without external dependency
interface MockQuestion {
  id: string;
  type: 'mcq' | 'code' | 'text' | 'essay';
  content: string;
  options?: string[];
  instructions?: string;
  testCases?: { input: string; expectedOutput: string }[];
  score: number;
}
interface MockAssessment {
  id: string;
  title: string;
  config: { timeLimit: number }; // Time in minutes
  questions: MockQuestion[];
}


const CandidateTaking: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  // Destructure the necessary actions from the updated store
  const { submitAssessment, setLoading } = useAssessmentStore();
  
  const [assessment, setAssessment] = useState<MockAssessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock token validation and assessment loading
  useEffect(() => {
    const loadAssessment = async () => {
      if (!token) {
        toast.error('Invalid assessment link');
        navigate('/');
        return;
      }

      try {
        // Mock data to simulate fetching assessment details based on the token
        const mockAssessment: MockAssessment = {
          id: 'demo-assessment',
          title: 'Technical Assessment - Frontend Developer',
          config: { timeLimit: 60 }, // 60 minutes
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              content: 'What is the purpose of `useState` in React?',
              options: [
                'To manage application state',
                'To handle side effects',
                'To optimize performance',
                'To render components'
              ],
              score: 10
            },
            {
              id: 'q2',
              type: 'code',
              content: 'Write a JavaScript function to reverse a string.',
              testCases: [
                { input: '"hello"', expectedOutput: '"olleh"' }
              ],
              score: 25
            },
            {
                id: 'q3',
                type: 'essay',
                content: 'Discuss the concept of Virtual DOM and its role in React.',
                instructions: 'Your answer should be at least 200 words.',
                score: 50
            },
            {
                id: 'q4',
                type: 'text',
                content: 'Define the term "Throttling" in the context of event handling.',
                score: 15
            }
          ]
        };

        setAssessment(mockAssessment);
        // Initialize time left from assessment config (minutes to seconds)
        setTimeLeft(mockAssessment.config.timeLimit * 60);
      } catch (error) {
        toast.error('Failed to load assessment');
        navigate('/');
      }
    };

    loadAssessment();
  }, [token, navigate]);

  // Timer logic
  useEffect(() => {
    if (!timeLeft || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, submitAssessment]); // Include submitAssessment as a dependency

  const handleAnswer = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleSubmit = async (timeout = false) => {
    if (!assessment || isSubmitted || isLoading) return;

    setIsLoading(true);
    setLoading(true); // Set global loading state
    
    try {
      const answerData = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer // Answer can be a string (text/code/essay) or string (mcq option)
      }));

      // Call the action from the Zustand store
      const result = await submitAssessment('demo-candidate', assessment.id, answerData);
      
      setIsSubmitted(true);
      toast.success(timeout ? 'Time expired! Assessment auto-submitted.' : 'Assessment submitted successfully!');
      
      console.log('Submission Results:', result);
    } catch (error) {
      toast.error('Failed to submit assessment. Please try again.');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const currentQuestion = assessment?.questions[currentQuestionIndex];

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <svg className="animate-spin h-6 w-6 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="mt-4 text-gray-700">Loading assessment details...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border-t-4 border-green-500">
          <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Assessment Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing the assessment. Your results are being processed.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary bg-primary text-white hover:bg-primary-dark">
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // Highlight time if it's below 5 minutes
    const colorClass = seconds < 300 ? 'text-red-600 font-bold animate-pulse' : 'text-gray-900';
    return <span className={colorClass}>{`${mins}:${secs.toString().padStart(2, '0')}`}</span>;
  };

  const renderQuestion = () => {
    if (!currentQuestion) return <div>Question not found.</div>;

    switch (currentQuestion.type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{currentQuestion.content}</h3>
            {currentQuestion.options?.map((option: string, index: number) => (
              <label 
                key={index} 
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition duration-150 ${
                    answers[currentQuestion.id] === option
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`answer-${currentQuestion.id}`}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleAnswer(currentQuestion.id, option)}
                  className="mr-4 h-5 w-5 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-base text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
        
      case 'code':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{currentQuestion.content}</h3>
            {currentQuestion.instructions && (
              <div className="bg-primary-50 p-4 rounded-lg mb-4 text-sm text-primary-700">
                <p className="font-medium">Instructions:</p>
                <p>{currentQuestion.instructions}</p>
              </div>
            )}
            <textarea
              placeholder="// Write your code solution here. Ensure your function is correctly named."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              className="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none shadow-inner bg-gray-900 text-green-400"
              style={{ tabSize: 4 }}
            />
            {currentQuestion.testCases && currentQuestion.testCases.length > 0 && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">Pre-defined Test Cases:</h4>
                <div className="space-y-1 text-xs font-mono text-gray-600">
                  {currentQuestion.testCases.map((tc: any, i: number) => (
                    <div key={i} className="bg-white p-2 rounded">
                      <span className="font-bold text-gray-800">Input:</span> <code>{tc.input}</code> → <span className="font-bold text-gray-800">Expected:</span> <code>{tc.expectedOutput}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'text':
      case 'essay':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{currentQuestion.content}</h3>
            {currentQuestion.instructions && (
              <div className="bg-primary-50 p-4 rounded-lg mb-4 text-sm text-primary-700">
                <p className="font-medium">Instructions:</p>
                <p>{currentQuestion.instructions}</p>
              </div>
            )}
            <textarea
              placeholder="Enter your answer..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              className={`w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition duration-150 ${
                currentQuestion.type === 'text' ? 'h-32' : 'h-64'
              }`}
            />
          </div>
        );
        
      default:
        return <div>Question type not supported.</div>;
    }
  };

  const isLastQuestion = assessment ? currentQuestionIndex === assessment.questions.length - 1 : false;
  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = assessment?.questions.length || 0;
  const isQuestionAnswered = !!answers[currentQuestion?.id || ''];

  return (
    <div className="min-h-screen bg-neutral-50 font-inter">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">{assessment.title}</h1>
          
          {/* Progress & Timer */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="w-5 h-5 text-red-500" />
              <span className="font-medium">Time Remaining:</span>
              {formatTime(timeLeft)}
            </div>
            
            <div className="px-3 py-1 bg-primary-50 text-primary rounded-full text-sm font-semibold">
              {answeredQuestions} / {totalQuestions} Answered
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Question Navigation */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setCurrentQuestionIndex(idx => Math.max(0, idx - 1))}
            disabled={currentQuestionIndex === 0}
            className="btn btn-secondary px-6 py-3 disabled:opacity-50 flex items-center gap-2"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Previous
          </button>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Question</div>
            <div className="text-2xl font-bold text-gray-900">
              {currentQuestionIndex + 1}
              <span className="text-lg font-normal text-gray-500"> of {totalQuestions}</span>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentQuestionIndex(idx => Math.min(totalQuestions - 1, idx + 1))}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className={`btn px-6 py-3 flex items-center gap-2 ${isQuestionAnswered ? 'btn-primary' : 'btn-secondary'} disabled:opacity-50`}
          >
            {isQuestionAnswered ? 'Save & Next' : 'Skip & Next'}
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10 border border-gray-100">
          {renderQuestion()}
        </div>

        {/* Submit Button (Only on Last Question) */}
        {isLastQuestion && (
            <div className="text-center">
                <button
                onClick={() => handleSubmit()}
                disabled={isLoading || timeLeft === 0}
                className="btn px-10 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-3 font-semibold text-lg shadow-xl mx-auto"
                >
                <CheckIcon className="w-6 h-6" />
                {isLoading ? 'Submitting...' : 'Finalize & Submit Assessment'}
                </button>
                <p className="mt-3 text-sm text-gray-500">
                    {totalQuestions - answeredQuestions} question(s) left unanswered.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CandidateTaking;