import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout Elements
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProfileDrawer from './components/ProfileDrawer';

// Route Guards
import RoleBasedRoute from './routes/RoleBasedRoutes';

// Views
import LoginSelection from './pages/Auth/LoginSelection';
import RegisterSelection from './pages/Auth/RegisterSelection';
import StatusSplash from './pages/Auth/StatusSplash';

import PlayerDashboard from './pages/Player/Dashboard';
import PlayerTournaments from './pages/Player/Tournaments';
import PlayerApplications from './pages/Player/Applications';

import CoachDashboard from './pages/Coach/Dashboard';
import CoachApprovalsQueue from './pages/Coach/ApprovalsQueue';

import OrganizerHub from './pages/Organizer/Hub';
import CreateTournament from './pages/Organizer/CreateTournament';
import PaymentsDesk from './pages/Organizer/PaymentsDesk';

import SplashLoader from './components/feedback/SplashLoader';

export default function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  if (showSplash) {
    return <SplashLoader onComplete={() => setShowSplash(false)} />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Authenticated layout wrappers
  const showNavAndSidebar = isAuthenticated && user && location.pathname !== '/status';

  return (
    <div className="min-h-screen bg-[#020617] text-[#e6e0e9]">
      {showNavAndSidebar && (
        <>
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <Navbar
            onMenuClick={toggleSidebar}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            onProfileClick={() => setProfileOpen(true)}
          />
          <ProfileDrawer
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            user={user}
          />
        </>
      )}

      {/* Main Workspace Frame */}
      <main
        className={`transition-all duration-300 min-h-screen ${
          showNavAndSidebar ? 'pt-20 pb-8 px-6 lg:ml-64' : ''
        }`}
      >
        <Routes>
          {/* Public Authentication Pathways (Auto-redirect if already logged in) */}
          <Route
            path="/login/selection"
            element={
              isAuthenticated && user ? (
                user.status !== 'approved' ? (
                  <Navigate to="/status" replace />
                ) : user.role === 'player' ? (
                  <Navigate to="/player/dashboard" replace />
                ) : user.role === 'coach' ? (
                  <Navigate to="/coach/dashboard" replace />
                ) : (
                  <Navigate to="/organizer/dashboard" replace />
                )
              ) : (
                <LoginSelection />
              )
            }
          />
          <Route
            path="/register/selection"
            element={
              isAuthenticated && user ? (
                user.status !== 'approved' ? (
                  <Navigate to="/status" replace />
                ) : user.role === 'player' ? (
                  <Navigate to="/player/dashboard" replace />
                ) : user.role === 'coach' ? (
                  <Navigate to="/coach/dashboard" replace />
                ) : (
                  <Navigate to="/organizer/dashboard" replace />
                )
              ) : (
                <RegisterSelection />
              )
            }
          />

          {/* Pending Status Warnings Gate */}
          <Route path="/status" element={<StatusSplash />} />

          {/* Player Protected Pathways */}
          <Route element={<RoleBasedRoute allowedRoles={['player']} />}>
            <Route path="/player/dashboard" element={<PlayerDashboard />} />
            <Route path="/player/tournaments" element={<PlayerTournaments />} />
            <Route path="/player/applications" element={<PlayerApplications />} />
            <Route path="/player/enrollments" element={<PlayerApplications />} />
          </Route>

          {/* Coach Protected Pathways */}
          <Route element={<RoleBasedRoute allowedRoles={['coach']} />}>
            <Route path="/coach/dashboard" element={<CoachDashboard />} />
            <Route path="/coach/approvals" element={<CoachApprovalsQueue />} />
          </Route>

          {/* Organizer Protected Pathways */}
          <Route element={<RoleBasedRoute allowedRoles={['organizer']} />}>
            <Route path="/organizer/dashboard" element={<OrganizerHub />} />
            <Route path="/organizer/create" element={<CreateTournament />} />
            <Route path="/organizer/payments" element={<PaymentsDesk />} />
          </Route>

          {/* Fallback/Root routing */}
          <Route
            path="*"
            element={
              isAuthenticated && user ? (
                user.status !== 'approved' ? (
                  <Navigate to="/status" replace />
                ) : user.role === 'player' ? (
                  <Navigate to="/player/dashboard" replace />
                ) : user.role === 'coach' ? (
                  <Navigate to="/coach/dashboard" replace />
                ) : (
                  <Navigate to="/organizer/dashboard" replace />
                )
              ) : (
                <Navigate to="/login/selection" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}
