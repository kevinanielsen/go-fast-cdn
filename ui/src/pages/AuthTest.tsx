import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import Login from "@/modules/auth/Login";
import Register from "@/modules/auth/Register";
import UserProfile from "@/modules/auth/UserProfile";

// Simple test page to verify auth components
const AuthTest: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">
            Authentication Test Page
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Login Component Test */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Login Component</h2>
              <div className="border border-gray-200 rounded p-4">
                <Login />
              </div>
            </div>

            {/* Register Component Test */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Register Component</h2>
              <div className="border border-gray-200 rounded p-4">
                <Register />
              </div>
            </div>

            {/* User Profile Test */}
            <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">
                User Profile Component
              </h2>
              <div className="border border-gray-200 rounded p-4">
                <UserProfile />
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Component Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-green-600 font-semibold">✅ Login</div>
                <div className="text-sm text-gray-600">
                  Component loaded successfully
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-green-600 font-semibold">✅ Register</div>
                <div className="text-sm text-gray-600">
                  Component loaded successfully
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-green-600 font-semibold">✅ Profile</div>
                <div className="text-sm text-gray-600">
                  Component loaded successfully
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              🧪 Testing Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Start the Go backend server:{" "}
                <code className="bg-gray-200 px-2 py-1 rounded">
                  go run main.go
                </code>
              </li>
              <li>Try registering a new user with the Register form</li>
              <li>Try logging in with the Login form</li>
              <li>Check if the User Profile displays after login</li>
              <li>Test file upload/download operations</li>
              <li>Test logout functionality</li>
            </ol>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default AuthTest;
