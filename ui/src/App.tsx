import { Route } from "wouter";
import { Toaster } from "react-hot-toast";
import Files from "./components/files";
import { SidebarProvider } from "./components/ui/sidebar";
import SidebarNav from "./components/sidebar-nav";

function App() {
  return (
    <>
      <Toaster
        toastOptions={{
          duration: 5000,
        }}
      />
      <SidebarProvider>
        <div className="flex max-h-screen w-screen">
          <SidebarNav />
          <main className="m-4 h-auto w-full">
            <Route path="/images">{<Files type="images" />}</Route>
            <Route path="/documents">{<Files type="documents" />}</Route>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}

export default App;
