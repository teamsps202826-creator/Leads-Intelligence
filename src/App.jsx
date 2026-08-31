import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import { USE_MOCKS } from "./api/client";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import ProductDetail from "./pages/ProductDetail";
import Tasks from "./pages/Tasks";
import TaskForm from "./pages/TaskForm";
import TaskDetail from "./pages/TaskDetail";
import Leads from "./pages/Leads";
import LeadProfile from "./pages/LeadProfile";
import Settings from "./pages/Settings";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Visible while the app runs on fixtures, so nobody mistakes seeded
 *  researchers for real ones. Disappears the moment VITE_USE_MOCKS=false. */
function MockBanner() {
  if (!USE_MOCKS) return null;
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-center text-xs text-amber-800 dark:text-amber-300">
      Demo data — every researcher, paper and score on this screen is fabricated
      for design purposes.
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <MockBanner />
      <Navbar />
      <ScrollToTop />
      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/products/:productId/edit" element={<ProductForm />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:taskId" element={<TaskDetail />} />
          <Route path="/tasks/:taskId/edit" element={<TaskForm />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:leadId" element={<LeadProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
