import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import { useApp } from '../../context/AppContext';
import { AlertCircle, ArrowLeft, ArrowRight, Clock } from 'lucide-react';


const QuizPage = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());

  const navigate = useNavigate();
  const { currentSession, clearSession } = useApp();

  useEffect(() => {
    if (!currentSession) {
      navigate('/');
      return;
    }

    const loadQuizSession = async () => {
      try {
        const data = await ApiService.getQuizSession(currentSession);
        
        if (data.completed || data.expired) {
          navigate(`/results/${currentSession}`);
          return;
        }

        setQuizData(data);
        setTimeLeft(Math.floor(data.timeRemaining / 1000));
        setVisitedQuestions(new Set([0]));
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    loadQuizSession();
  }, [currentSession, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            navigate(`/results/${currentSession}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, currentSession, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (answer) => {
    if (!currentSession || !quizData) return;
    
    try {
      await ApiService.submitAnswer(currentSession, quizData.questions[currentQuestion].id, answer);
      
    setQuizData((prev) => {
      // Update the questions array
      const updatedQuestions = prev.questions.map((q, index) =>
        index === currentQuestion
          ? { ...q, answered: true, userAnswer: answer }
          : q
      );

      // Count the number of questions that have been answered
      const updatedAnsweredCount = updatedQuestions.filter(q => q.answered).length;

      return {
        ...prev,
        questions: updatedQuestions,
        answeredCount: updatedAnsweredCount
      };
    });

    console.log(quizData)

    } catch (error) {
      console.error('Failed to save answer:', error);
      // Still update UI even if API call fails
      setQuizData(prev => ({
        ...prev,
        questions: prev.questions.map((q, index) => 
          index === currentQuestion 
            ? { ...q, answered: true, userAnswer: answer }
            : q
        )
      }));
    }
  };

  const navigateToQuestion = (index) => {
    setCurrentQuestion(index);
    setVisitedQuestions(prev => new Set([...prev, index]));
  };

  const submitQuiz = () => {
    navigate(`/results/${currentSession}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!quizData) return null;

  const currentQ = quizData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">CausalFunnel Quiz</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <Clock className="h-5 w-5 text-red-500" />
                <span className="font-mono text-red-600 font-semibold">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                onClick={submitQuiz}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Overview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4">Question Overview</h3>
            <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
              {quizData.questions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => navigateToQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentQuestion === index
                      ? 'bg-blue-600 text-white shadow-md'
                      : q.answered
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : visitedQuestions.has(index)
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span className="text-gray-600">Attempted ({quizData.answeredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                <span className="text-gray-600">Visited</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span className="text-gray-600">Not visited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Question {currentQuestion + 1} of {quizData.questions.length}
                </span>
                <div className="flex space-x-2">
                  {currentQuestion > 0 && (
                    <button
                      onClick={() => navigateToQuestion(currentQuestion - 1)}
                      className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>
                  )}
                  {currentQuestion < quizData.questions.length - 1 && (
                    <button
                      onClick={() => navigateToQuestion(currentQuestion + 1)}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {currentQ.question}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQ.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(choice)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    currentQ.userAnswer === choice
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      currentQ.userAnswer === choice
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {currentQ.userAnswer === choice && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span>{choice}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;