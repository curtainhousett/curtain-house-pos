import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Index() {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-4">Curtain House</h1>
          <p className="text-xl opacity-90">Web POS System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* POS Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer" onClick={() => handleNavigation('/pos')}>
            <div className="text-4xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-2">Point of Sale</h2>
            <p className="text-gray-600">Start a new sale or checkout</p>
          </div>

          {/* Dashboard Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
            <p className="text-gray-600">View sales reports and analytics</p>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer" onClick={() => handleNavigation('/orders')}>
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-2">Orders</h2>
            <p className="text-gray-600">Manage online and in-store orders</p>
          </div>

          {/* Inventory Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer" onClick={() => handleNavigation('/inventory')}>
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-2">Inventory</h2>
            <p className="text-gray-600">Track stock levels</p>
          </div>

          {/* Shifts Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer" onClick={() => handleNavigation('/shifts')}>
            <div className="text-4xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold mb-2">Shifts</h2>
            <p className="text-gray-600">Manage staff shifts</p>
          </div>

          {/* Employees Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer" onClick={() => handleNavigation('/employees')}>
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-2xl font-bold mb-2">Employees</h2>
            <p className="text-gray-600">Manage staff and access</p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature Card */}
          <div className="bg-white bg-opacity-10 text-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">✓ Fast Checkout</h3>
            <p>Quick and intuitive POS interface</p>
          </div>

          <div className="bg-white bg-opacity-10 text-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">✓ Real-time Sync</h3>
            <p>Synchronized with online catalog</p>
          </div>

          <div className="bg-white bg-opacity-10 text-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">✓ Secure</h3>
            <p>Role-based access control</p>
          </div>
        </div>
      </div>
    </div>
  );
}
