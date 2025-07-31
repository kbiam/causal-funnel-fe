import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, BarChart3, Clock, Home, Star, Calendar, XCircle } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const UserHistoryPage = () => {
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { updateSession } = useApp()
  const { email } = useParams();
  const navigate = useNavigate();

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
    const loadHistory = async () => {
      try {
        const data = await ApiService.getUserHistory(email);
        setHistory(data);
        console.log('User history:', data);
      } catch (error) {
        setError(error.message);
      }
      setIsLoading(false);
    };

    if (email) {
      loadHistory();
    }
  }, [email]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error || !history) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading History</h2>
          <p className="text-gray-600 mb-4">{error || 'History not found'}</p>
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'expired': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Test History</h1>
              <p className="text-gray-600">{email}</p>
            </div>
            <button
              onClick={handleStartQuiz}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>New Quiz</span>
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{history.totalTests}</div>
              <div className="text-sm text-blue-700">Total Tests</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{history.completedTests}</div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{history.inProgressTests}</div>
              <div className="text-sm text-yellow-700">In Progress</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{history.expiredTests}</div>
              <div className="text-sm text-red-700">Expired</div>
            </div>
          </div>
        </div>

        {/* Test History List */}
        <div className="space-y-4">
          {history.history.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Tests Found</h3>
              <p className="text-gray-500 mb-4">You haven't taken any quizzes yet.</p>
              <button
                onClick={handleStartQuiz}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Take Your First Quiz
              </button>
            </div>
          ) : (
            history.history.map((test, index) => (
              <div key={test.sessionId} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-semibold text-gray-800">
                        Quiz #{history.history.length - index}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(test.status)}`}>
                        {getStatusIcon(test.status)}
                        <span className="capitalize">{test.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(test.startTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(test.startTime).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>{test.answeredQuestions}/{test.totalQuestions} answered</span>
                      </div>
                      {test.status === 'completed' && (
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4" />
                          <span>{test.score}/{test.totalQuestions} ({test.percentage}%)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {test.canResume && (
                      <button
                        onClick={() => {
                          console.log('Resuming test:', test.sessionId);
                          localStorage.setItem('quizSessionId', test.sessionId);
                          updateSession(test.sessionId);
                          navigate('/quiz');
                        }}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                      >
                        Resume
                      </button>
                    )}
                    { (
                      <Link
                        to={`/report/${email}/${test.sessionId}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Report
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistoryPage;