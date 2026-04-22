import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminStories from "./pages/admin/Stories";
import ParentDashboard from "./pages/parent/Dashboard";
import ParentStats from "./pages/parent/Stats";
import ChildLibrary from "./pages/child/Library";
import ChildReader from "./pages/child/Reader";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/stories" element={<ProtectedRoute allowedRoles={['admin']}><AdminStories /></ProtectedRoute>} />

        {/* Parent Routes */}
        <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/stats" element={<ProtectedRoute allowedRoles={['parent']}><ParentStats /></ProtectedRoute>} />
        
        {/* Parent -> Child Interface doesn't enforce 'child' role because children use parent devices */}
        <Route path="/child/:id" element={<ProtectedRoute allowedRoles={['parent']}><ChildLibrary /></ProtectedRoute>} />
        <Route path="/child/:id/read/:storyId" element={<ProtectedRoute allowedRoles={['parent']}><ChildReader /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
