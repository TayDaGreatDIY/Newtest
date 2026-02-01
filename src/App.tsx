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
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './lib/ProtectedRoute';
import { ToastProvider } from './components';

function App() {
  // Use basename for GitHub Pages deployment
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <AuthProvider>
      <ToastProvider>
        <Router basename={basename}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><Landing /></Layout>} />
            <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />
            <Route path="/auth/sign-in" element={<Layout><Auth /></Layout>} />
            <Route path="/auth/sign-up" element={<Layout><Auth /></Layout>} />
            
            {/* Protected App Routes */}
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
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
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
