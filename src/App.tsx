/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { FirebaseProvider } from './components/FirebaseProvider';

import Home from './pages/Home';
import Stories from './pages/Stories';
import NewStory from './pages/NewStory';
import StoryDetail from './pages/StoryDetail';
import Resources from './pages/Resources';
import Events from './pages/Events';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Forums from './pages/Forums';
import ForumTopic from './pages/ForumTopic';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <FirebaseProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="stories" element={<Stories />} />
            <Route path="stories/new" element={<NewStory />} />
            <Route path="stories/:id" element={<StoryDetail />} />
            <Route path="resources" element={<Resources />} />
            <Route path="events" element={<Events />} />
            <Route path="forums" element={<Forums />} />
            <Route path="forums/:id" element={<ForumTopic />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<Profile />} />
            <Route path="login" element={<Login />} />
            <Route path="contact" element={<Contact />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Router>
    </FirebaseProvider>
  );
}
