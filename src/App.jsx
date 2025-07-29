import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import StartPage from './pages/StartPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import UserHistoryPage from './pages/UserHistoryPage';
import DetailedReportPage from './pages/DetailedReportPage';


const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/results/:sessionId" element={<ResultsPage />} />
          <Route path="/history/:email" element={<UserHistoryPage />} />
          <Route path="/report/:email/:sessionId" element={<DetailedReportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;