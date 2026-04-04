// app/authorized_user_dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Package, 
  UtensilsCrossed,
  ClipboardList, 
  BarChart3, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Building2,
  LogOut,
} from 'lucide-react';

const DashboardPage = () => {
  const [userName, setUserName] = useState('');
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [meRes, statsRes] = await Promise.all([
          fetch('/api/auth/me', { credentials: 'include' }),
          fetch('/api/dashboard/stats', { credentials: 'include' }),
        ]);
        const me = await meRes.json();
        const statsJson = await statsRes.json();
        if (cancelled) return;
        if (me?.user?.name) setUserName(me.user.name);
        if (statsRes.ok && statsJson) setStatsData(statsJson);
      } catch {
        /* ignore */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = statsData
    ? [
        { label: 'Total Items', value: String(statsData.totalItems ?? 0), change: '—', icon: Package, color: 'bg-blue-500' },
        { label: 'Active Kitchens', value: String(statsData.activeKitchens ?? 0), change: '—', icon: UtensilsCrossed, color: 'bg-emerald-500' },
        { label: 'Low Stock', value: String(statsData.lowStock ?? 0), change: '—', icon: AlertCircle, color: 'bg-amber-500' },
        { label: 'Inventory rows', value: String(statsData.totalOrders ?? 0), change: '—', icon: TrendingUp, color: 'bg-purple-500' },
      ]
    : [
        { label: 'Total Items', value: '—', change: '…', icon: Package, color: 'bg-blue-500' },
        { label: 'Active Kitchens', value: '—', change: '…', icon: UtensilsCrossed, color: 'bg-emerald-500' },
        { label: 'Low Stock', value: '—', change: '…', icon: AlertCircle, color: 'bg-amber-500' },
        { label: 'Inventory rows', value: '—', change: '…', icon: TrendingUp, color: 'bg-purple-500' },
      ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  };

  const tiles = [
    {
      title: 'Items',
      description: 'Manage your food items, ingredients, and products',
      icon: Package,
      href: '/authorized_user_dashboard/items',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      stats: 'Items',
    },
    {
      title: 'Kitchens',
      description: 'Configure and manage multiple kitchen locations',
      icon: Building2,  // Using Building2 instead of Kitchen
      href: '/authorized_user_dashboard/kitchens',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      stats: 'Kitchens',
    },
    {
      title: 'Inventory',
      description: 'Track stock levels, manage supplies, and reduce waste',
      icon: ClipboardList,
      href: '/authorized_user_dashboard/inventory',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      stats: 'Stock',
    },
    {
      title: 'Reports',
      description: 'View analytics, sales reports, and performance metrics',
      icon: BarChart3,
      href: '/authorized_user_dashboard/reports',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      stats: 'Last 30 days',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="p-6 md:p-8">
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
        {/* Stylish Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold">Dashboard</span>
          </div>
          
          {/* Page Header */}
          <div className="mt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Welcome Back{userName ? (
                <>, <span className="text-emerald-600">{userName}</span>!</>
              ) : (
                <>!</>
              )}
            </h1>
            <p className="text-gray-500 mt-2">
              Here&apos;s what&apos;s happening with your kitchen management system today.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.change.startsWith('+');
            const isNegative = stat.change.startsWith('-');
            
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tiles Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiles.map((tile, index) => {
              const Icon = tile.icon;
              
              return (
                <div
                  key={index}
                  onClick={() => window.location.href = tile.href}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105">
                    {/* Colored Top Bar */}
                    <div className={`h-2 bg-gradient-to-r ${tile.color}`}></div>
                    
                    <div className="p-6">
                      {/* Icon and Stats */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${tile.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-8 h-8 ${tile.iconColor}`} />
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {tile.stats}
                        </span>
                      </div>
                      
                      {/* Title and Description */}
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                        {tile.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {tile.description}
                      </p>
                      
                      {/* Action Button */}
                      <button className="text-emerald-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Manage {tile.title}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { action: 'Added new item "Chicken Breast"', time: '2 minutes ago', type: 'success' },
                { action: 'Updated inventory for Kitchen A', time: '1 hour ago', type: 'info' },
                { action: 'Low stock alert: Rice (Only 5kg left)', time: '3 hours ago', type: 'warning' },
                { action: 'Generated monthly report', time: '5 hours ago', type: 'success' },
              ].map((activity, idx) => (
                <div key={idx} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {activity.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {activity.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                    {activity.type === 'info' && <Package className="w-4 h-4 text-blue-500" />}
                    <span className="text-gray-700 text-sm">{activity.action}</span>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;