import { Link, Route } from "wouter";
import { Toaster } from "react-hot-toast";
import Files from "./components/files";
import { SidebarProvider } from "./components/ui/sidebar";
import SidebarNav from "./components/sidebar-nav";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthTest from "./pages/AuthTest";
import UserSettings from "./components/auth/UserSettings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/auth/AdminRoute";

function AppContent() {
  return (
    <>
      <Toaster
        toastOptions={{
          duration: 5000,
        }}
      />
      <Route path="/login">{<Login />}</Route>
      <Route path="/register">{<Register />}</Route>
      <Route path="/auth-test">{<AuthTest />}</Route>

      <ProtectedRoute>
        <SidebarProvider>
          <div className="flex min-h-screen w-screen">
            <SidebarNav />
            <main className="m-4 h-auto w-full">
              <Route path="/images">{<Files type="images" />}</Route>
              <Route path="/documents">{<Files type="documents" />}</Route>
              <Route path="/settings">
                {
                  <ProtectedRoute>
                    <UserSettings />
                  </ProtectedRoute>
                }
              </Route>
              <Route path="/admin">
                {
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              </Route>
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
        </SidebarProvider>
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
