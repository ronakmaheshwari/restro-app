import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/home';
import { Signup } from './pages/signup';
import { Login } from './pages/login';
import { Profile } from './pages/profile';
import { Menu } from './pages/menu';
import { Orders } from './pages/orders';
import { OrderDetail } from './pages/order-detail';
import { Cart } from './pages/cart';
import ProtectedRoute from './components/custom/ProtectedRoute';

const queryClient = new QueryClient()

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="*" element={<Navigate to={"/home"} replace />} />
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          {/* Checkout page intentionally left out — owner builds it with a zustand store + orderService.payOrder() */}
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
