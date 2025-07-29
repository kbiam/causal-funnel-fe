import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { useApp } from '../../context/AppContext';

const DetailedReportPage = () => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { email, sessionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await ApiService.getDetailedReport(email, sessionId);
        setReport(data);
      } catch (error) {
        setError(error.message);
      }
      setIsLoading(false);
    };

    if (email && sessionId) {
      loadReport();
    }
  }, [email, sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading detailed report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Report</h2>
          <p className="text-gray-600 mb-4">{error || 'Report not found'}</p>
          <button
            onClick={() => navigate(`/history/${email}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Detailed Test Report</h1>
              <p className="text-gray-600">{email}</p>
              <p className="text-sm text-gray-500">
                Taken on {new Date(report.startTime).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/history/${email}`)}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{report.percentage}%</div>
              <div className="text-sm text-blue-700">Score</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{report.summary.correct}</div>
              <div className="text-sm text-green-700">Correct</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{report.summary.incorrect}</div>
              <div className="text-sm text-red-700">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{report.summary.unanswered}</div>
              <div className="text-sm text-yellow-700">Unanswered</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatDuration(report.timeTaken)}</div>
              <div className="text-sm text-purple-700">Time Taken</div>
            </div>
          </div>
        </div>

        {/* Performance by Category/Difficulty */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance by Category</h3>
            <div className="space-y-3">
              {Object.entries(report.categoryStats).map(([category, stats]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-700">{category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${stats.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {stats.correct}/{stats.total} ({stats.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance by Difficulty</h3>
            <div className="space-y-3">
              {Object.entries(report.difficultyStats).map(([difficulty, stats]) => (
                <div key={difficulty} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{difficulty}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${stats.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {stats.correct}/{stats.total} ({stats.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question by Question Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Question by Question Analysis</h3>
          <div className="space-y-6">
            {report.results.map((result, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
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
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Question {index + 1}
                    </h4>
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
    </div>
  );
};


export default DetailedReportPage;