import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import DashboardLayout from './layouts/DashboardLayout'
import LandingPage    from './pages/LandingPage'
import Dashboard      from './pages/Dashboard'
import ResumeAnalysis from './pages/ResumeAnalysis'
import CareerPaths    from './pages/CareerPaths'
import SkillGaps      from './pages/SkillGaps'
import Courses        from './pages/Courses'
import Assistant      from './pages/Assistant'
import Settings       from './pages/Settings'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/resume"     element={<ResumeAnalysis />} />
            <Route path="/careers"    element={<CareerPaths />} />
            <Route path="/skill-gaps" element={<SkillGaps />} />
            <Route path="/courses"    element={<Courses />} />
            <Route path="/assistant"  element={<Assistant />} />
            <Route path="/settings"   element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
