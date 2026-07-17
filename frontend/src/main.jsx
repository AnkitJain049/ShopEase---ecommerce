import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Productdetails from './pages/Productdetails.jsx'; // Keep this here unless you add it to `pages.jsx`
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import {
  Home,
  Landing,
  Login,
  Register,
  AddProduct,
  Wishlist,
  UserProfile,
  AdminMetrics,
} from './pages/pages.jsx'; // This imports everything from pages/index.js or pages/pages.jsx

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Landing />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />

      <Route path="/" element={<Layout />}>
        <Route path="/products" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute><Productdetails /></ProtectedRoute>} />
        <Route path="/products/add-product" element={<ProtectedRoute><AddProduct title="Add a Product" /></ProtectedRoute>} />
        <Route path="/user/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/admin/metrics" element={<ProtectedRoute><AdminMetrics /></ProtectedRoute>} />
      </Route>
    </>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
