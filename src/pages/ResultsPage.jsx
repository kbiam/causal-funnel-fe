import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AlertCircle, Trophy, CheckCircle, XCircle, Home, User } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { useApp } from '../../context/AppContext';

const ResultsPage = () => {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { clearSession, updateUser, updateSession } = useApp();

    const handleStartQuiz = async () => {
    try {
        const email = localStorage.getItem('userEmail') || '';
        if (!email.trim()) {
        console.error('No email found in localStorage');
        return;
        }

        const data = await ApiService.startQuiz(email);
        if (data?.sessionId) {
        console.log('Starting new quiz session:', data.sessionId);
        updateSession(data.sessionId);
        navigate('/quiz');
        } else {
        console.error('No sessionId received from backend');
        }
    } catch (err) {
        console.error('Error starting quiz:', err);
    }
    };


  useEffect(() => {
    const loadResults = async () => {
      try {
        const data = await ApiService.getQuizResults(sessionId);
        setResults(data);
        clearSession(); // Clear session after viewing results
      } catch (error) {
        setError(error.message);
      }
      setIsLoading(false);
    };

    if (sessionId) {
      loadResults();
    } else {
      setError('No session ID provided');
      setIsLoading(false);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error || 'Results not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const percentage = Math.round((results.score / results.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              <Trophy className={`h-16 w-16 mx-auto ${
                percentage >= 70 ? 'text-yellow-500' : percentage >= 50 ? 'text-gray-400' : 'text-red-400'
              }`} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
            <div className="text-6xl font-bold mb-4">
              <span className={percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                {percentage}%
              </span>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              You scored {results.score} out of {results.totalQuestions} questions correctly
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleStartQuiz()}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Take Another Quiz</span>
              </button>
              
              {results.email && (
                <Link
                  to={`/history/${results.email}`}
                  className="flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>View Profile</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {results.results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  result.isCorrect ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {result.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Question {index + 1}
                  </h3>
                  <p className="text-gray-700 mb-4">{result.question}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Your Answer:</p>
                      <p className={`p-3 rounded-lg ${
                        result.userAnswer 
                          ? result.isCorrect 
                            ? 'bg-green-50 text-green-800 border border-green-200' 
                            : 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {result.userAnswer || 'No answer selected'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Correct Answer:</p>
                      <p className="p-3 rounded-lg bg-green-50 text-green-800 border border-green-200">
                        {result.correctAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;