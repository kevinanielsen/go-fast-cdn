import { Link, Route } from "wouter";
import { Toaster } from "react-hot-toast";
import Files from "./components/files";
import { Image, Upload as UploadIcon, Files as FilesIcon } from "lucide-react";
import Seperator from "./components/seperator";
import Upload from "./components/upload";
import ContentSize from "./components/content-size";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UserProfile from "./components/auth/UserProfile";
import AuthTest from "./pages/AuthTest";
import UserSettings from "./components/auth/UserSettings";
import AdminDashboard from "./pages/AdminDashboard";

function AppContent() {
  return (    <>
      <Toaster />
      <Route path="/login">{<Login />}</Route>
      <Route path="/register">{<Register />}</Route>
      <Route path="/auth-test">{<AuthTest />}</Route>
      
      <ProtectedRoute>        <div className="flex min-h-screen w-screen">
          <nav className="min-w-[256px] h-screen sticky top-0 border-r shadow-lg pt-4 px-4 flex flex-col overflow-y-auto">
            {/* Top section */}
            <div className="flex-1">
              <Link to="/" className="text-xl font-bold block mb-2">Go-Fast CDN</Link>
              <Seperator />
              <Link to="/upload" className="flex font-bold gap-4 items-center">
                <UploadIcon />
                Upload Content
              </Link>
              <Seperator />
              <h3 className="text-lg mb-4 font-bold">Content</h3>
              <ul className="flex flex-col gap-4">
                <li>
                  <Link to="/images" className="flex font-bold gap-4 items-center">
                    <Image />
                    Images
                  </Link>
                </li>
                <li>
                  <Link
                    to="/documents"
                    className="flex font-bold gap-4 items-center"
                  >
                    <FilesIcon />
                    Documents
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Bottom section */}
            <div className="mt-auto">
              <ContentSize />
              <UserProfile />
            </div>
          </nav>
          <main className="m-4 flex-1 w-full overflow-y-auto">
            <Route path="/images">{<Files type="images" />}</Route>
            <Route path="/documents">{<Files type="documents" />}</Route>
            <Route path="/upload">{<Upload />}</Route>
            <Route path="/upload/:tab">{<Upload />}</Route>
            <Route path="/settings">{<ProtectedRoute><UserSettings /></ProtectedRoute>}</Route>
            <Route path="/admin">{<AdminDashboard />}</Route>
            <Route path="/">
              <div className="text-center py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Go-Fast CDN
                </h1>
                <p className="text-gray-600 mb-8">
                  Your secure, fast content delivery network
                </p>
                <div className="space-x-4">
                  <Link 
                    to="/upload" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Start Uploading
                  </Link>
                  <Link 
                    to="/images" 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Browse Files
                  </Link>
                </div>
              </div>
            </Route>
          </main>
        </div>
      </ProtectedRoute>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
