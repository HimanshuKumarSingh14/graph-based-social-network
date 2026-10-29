import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./services/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Friends from "./pages/Friends";
import NetworkAnalysis from "./pages/NetworkAnalysis";
import Communities from "./pages/Communities";
import Graph from "./pages/Graph";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute><Layout title="Dashboard" subtitle="Your network at a glance" /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Users" subtitle="Discover and connect with people" /></ProtectedRoute>}>
            <Route path="/users" element={<Users />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Friends" subtitle="Manage your connections & requests" /></ProtectedRoute>}>
            <Route path="/friends" element={<Friends />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Network Analysis" subtitle="Centrality, mutual friends & shortest paths" /></ProtectedRoute>}>
            <Route path="/network-analysis" element={<NetworkAnalysis />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Communities" subtitle="Clusters detected in your network" /></ProtectedRoute>}>
            <Route path="/communities" element={<Communities />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Graph View" subtitle="Explore the full social graph" /></ProtectedRoute>}>
            <Route path="/graph" element={<Graph />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Messages" subtitle="Chat with your friends" /></ProtectedRoute>}>
            <Route path="/messages" element={<Messages />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Profile" subtitle="Your account details" /></ProtectedRoute>}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Settings" subtitle="Preferences & account security" /></ProtectedRoute>}>
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
