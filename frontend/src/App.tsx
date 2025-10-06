import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import CreateJob from './pages/CreateJob';
import JobDetail from './pages/JobDetail';
import MyTeam from './pages/MyTeam';
import Availability from './pages/Availability';
import BrowseWorkers from './pages/BrowseWorkers';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/jobs"
        element={
          isAuthenticated ? (
            <Layout>
              <Jobs />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/jobs/new"
        element={
          isAuthenticated ? (
            <Layout>
              <CreateJob />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/jobs/:id"
        element={
          isAuthenticated ? (
            <Layout>
              <JobDetail />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/team"
        element={
          isAuthenticated ? (
            <Layout>
              <MyTeam />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/availability"
        element={
          isAuthenticated ? (
            <Layout>
              <Availability />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/browse-workers"
        element={
          <Layout>
            <BrowseWorkers />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
