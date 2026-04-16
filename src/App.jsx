import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Standings from './pages/Standings';
import Results from './pages/Results';
import Teams from './pages/Teams';
import Drivers from './pages/Drivers';
import DriverProfile from './pages/DriverProfile';
import Schedule from './pages/Schedule';
import HeadToHead from './pages/HeadToHead';
import Awards from './pages/Awards';
import Timeline from './pages/Timeline';
import Rivalries from './pages/Rivalries';
import IncidentHeatmap from './pages/IncidentHeatmap';
import WhatIf from './pages/WhatIf';
import PowerRankings from './pages/PowerRankings';
import News from './pages/News';
import Pickem from './pages/Pickem';
import Interviews from './pages/Interviews';
import NotFound from './pages/NotFound';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UploadRace from './pages/admin/UploadRace';
import ManageDrivers from './pages/admin/ManageDrivers';
import ManageSchedule from './pages/admin/ManageSchedule';
import ManageNews from './pages/admin/ManageNews';
import ManageInterviews from './pages/admin/ManageInterviews';

function App() {
  return (
    <Routes>
      {/* Public routes wrapped in main Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/results" element={<Results />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/drivers/:id" element={<DriverProfile />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/head-to-head" element={<HeadToHead />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/rivalries" element={<Rivalries />} />
        <Route path="/heatmap" element={<IncidentHeatmap />} />
        <Route path="/what-if" element={<WhatIf />} />
        <Route path="/power-rankings" element={<PowerRankings />} />
        <Route path="/news" element={<News />} />
        <Route path="/pickem" element={<Pickem />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin login (no layout) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin routes wrapped in AdminLayout (auth-protected) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="upload" element={<UploadRace />} />
        <Route path="drivers" element={<ManageDrivers />} />
        <Route path="schedule" element={<ManageSchedule />} />
        <Route path="news" element={<ManageNews />} />
        <Route path="interviews" element={<ManageInterviews />} />
      </Route>
    </Routes>
  );
}

export default App;
