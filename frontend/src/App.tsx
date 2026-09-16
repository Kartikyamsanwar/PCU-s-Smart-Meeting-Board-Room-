import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import { can, type Action } from "./permissions";
import { Dashboard } from "./pages/Dashboard";
import { MeetingDetail } from "./pages/MeetingDetail";
import { Meetings } from "./pages/Meetings";
import { Login } from "./pages/Login";
import { ParticipantMapping } from "./pages/ParticipantMapping";
import { SystemHealth } from "./pages/SystemHealth";
import { UserManagement } from "./pages/UserManagement";

function RequirePermission({ action, children }: { action: Action; children: ReactNode }) {
  const { user } = useAuth();
  if (!can(user?.role, action)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/meetings/:id" element={<MeetingDetail />} />
        <Route
          path="/mapping"
          element={
            <RequirePermission action="configure_mic_mapping">
              <ParticipantMapping />
            </RequirePermission>
          }
        />
        <Route
          path="/system-health"
          element={
            <RequirePermission action="system_health">
              <SystemHealth />
            </RequirePermission>
          }
        />
        <Route
          path="/users"
          element={
            <RequirePermission action="user_management">
              <UserManagement />
            </RequirePermission>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
