
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import { useApp } from '../../context/AppContext';
import { AlertCircle, Mail, ArrowRight, History } from 'lucide-react';

const StartPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { updateUser, updateSession } = useApp();

  useEffect(() => {
    // Check if user has an existing session
    const checkUserStatus = async () => {
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        try {
          const status = await ApiService.getUserStatus(savedEmail);
          if (status.hasInProgressTest && status.canResume) {
            const shouldResume = window.confirm(
              'You have an incomplete quiz. Would you like to resume it?'
            );
            if (shouldResume) {
              updateSession(status.sessionId);
              navigate('/quiz');
            }
          }
        } catch (error) {
          console.error('Error checking user status:', error);
        }
      }
    };

    // checkUserStatus();
  }, [navigate, updateSession]);

  const handleStartQuiz = async () => {
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const status = await ApiService.getUserStatus(email);
      console.log('User status:', status);

      let sessionId;

      if (status.hasInProgressTest && status.canResume) {
        const shouldResume = window.confirm(
          'You have an incomplete quiz. Would you like to resume it?'
        );

        if (shouldResume) {
          sessionId = status.sessionId;
        } else {
          const data = await ApiService.startQuiz(email);
          sessionId = data.sessionId;
        }
      } else {
        const data = await ApiService.startQuiz(email);
        sessionId = data.sessionId;
      }

      updateUser(email);
      updateSession(sessionId);
      navigate('/quiz');
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError(error?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all duration-500 ">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            CausalFunnel
          </h1>
          <p className="text-gray-600">Software Engineer Intern Assessment</p>
        </div>
        
        <div className="space-y-6">
          <div className="relative flex">
            <Mail className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              onKeyPress={(e) => e.key === 'Enter' && handleStartQuiz()}
            />
          </div>
          
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          
          <button
            onClick={handleStartQuiz}
            disabled={isLoading || !email.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>Start Quiz</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          {email && (
            <div className="flex space-x-2">
              <Link
                to={`/history/${email}`}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </Link>
            </div>
          )}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Quiz Details:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 15 questions total</li>
            <li>• 30 minutes time limit</li>
            <li>• Navigate between questions</li>
            <li>• Auto-submit when time expires</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StartPage;