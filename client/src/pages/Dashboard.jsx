import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import Loader from '../components/common/Loader';
import StatsOverview from '../components/dashboard/StatsOverview';
import RevenueChart from '../components/dashboard/RevenueChart';
import CategoryChart from '../components/dashboard/CategoryChart';
import RecentOrders from '../components/dashboard/RecentOrders';
import TopProducts from '../components/dashboard/TopProducts';
import TopCustomers from '../components/dashboard/TopCustomers';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getCompleteDashboard();

      if (response.success) {
        setDashboardData(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to SCM Portal</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={dashboardData?.stats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={dashboardData?.dailyRevenue} />
        <CategoryChart data={dashboardData?.revenueByCategory} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders orders={dashboardData?.recentOrders} />
        </div>
        <div className="space-y-6">
          <TopProducts products={dashboardData?.topProducts} />
        </div>
      </div>

      {/* Top Customers */}
      <TopCustomers customers={dashboardData?.topCustomers} />
    </div>
  );
};

export default Dashboard;
