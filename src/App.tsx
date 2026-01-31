import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, AppLayout } from './layout';
import { 
  Landing, 
  Auth, 
  Feed, 
  Courts, 
  CourtDetail,
  Challenges,
  ChallengeDetail,
  Messages,
  ChatThread,
  Profile,
  ThinkingCorner
} from './pages';

function App() {
  // Use basename for GitHub Pages deployment
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <Router basename={basename}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Landing /></Layout>} />
        <Route path="/auth" element={<Layout><Auth /></Layout>} />
        
        {/* App Routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/feed" replace />} />
          <Route path="feed" element={<Feed />} />
          <Route path="courts" element={<Courts />} />
          <Route path="courts/:id" element={<CourtDetail />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="challenges/:id" element={<ChallengeDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:threadId" element={<ChatThread />} />
          <Route path="profile" element={<Profile />} />
          <Route path="thinking-corner" element={<ThinkingCorner />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
