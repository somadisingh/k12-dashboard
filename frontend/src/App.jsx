import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import MainLayout from './components/layout/MainLayout.jsx';

import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import StaffDetailPage from './pages/StaffDetailPage.jsx';
import ObservationsPage from './pages/ObservationsPage.jsx';
import NewObservationPage from './pages/NewObservationPage.jsx';
import ObservationDetailPage from './pages/ObservationDetailPage.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';
import NewReviewPage from './pages/NewReviewPage.jsx';
import ReviewDetailPage from './pages/ReviewDetailPage.jsx';
import GoalsPage from './pages/GoalsPage.jsx';
import GoalDetailPage from './pages/GoalDetailPage.jsx';
import NotesPage from './pages/NotesPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/staff/:id" element={<StaffDetailPage />} />
        <Route path="/observations" element={<ObservationsPage />} />
        <Route path="/observations/new" element={<NewObservationPage />} />
        <Route path="/observations/:id" element={<ObservationDetailPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/reviews/new" element={<NewReviewPage />} />
        <Route path="/reviews/:id" element={<ReviewDetailPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/goals/:id" element={<GoalDetailPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}
