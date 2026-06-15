import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import RoomsList from './screens/RoomsList';
import RoomDetail from './screens/RoomDetail';
import CreateRoom from './screens/CreateRoom';
import InviteSuccess from './screens/InviteSuccess';
import Join from './screens/Join';
import Upload from './screens/Upload';
import Notifications from './screens/Notifications';
import Settings from './screens/Settings';
import Tracking from './screens/Tracking';
import RulesVote from './screens/RulesVote';
import Settlement from './screens/Settlement';
import Screens from './screens/Screens';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard variant="data" />} />
        <Route path="/g/dashboard-empty" element={<Dashboard variant="empty" />} />

        <Route path="/rooms" element={<RoomsList />} />
        <Route path="/rooms/new" element={<CreateRoom />} />
        <Route path="/rooms/new/invite" element={<InviteSuccess />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/rooms/:id/tracking" element={<Tracking />} />
        <Route path="/rooms/:id/vote" element={<RulesVote />} />
        <Route path="/rooms/:id/settlement" element={<Settlement />} />

        <Route path="/upload" element={<Upload />} />
        <Route path="/join/:token" element={<Join />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/me" element={<Settings />} />

        <Route path="/screens" element={<Screens />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
