import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../components/ui/tabs";
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  ResponsiveContainer
} from 'recharts';
import { 
  getAllUsers, 
  getFeedbacks, 
  getUsageStats 
} from "../api/admin";
import { User } from "../types/data";
import { Feedback, UsageStats } from "../api/types";

const COLOR_PALETTE = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F43F5E',
  neutral: '#6B7280',
  background: '#F3F4F6'
};

interface UserDetailedUsageStats {
  email: string;
  totalCount: number;
  features: { feature: string; count: number }[];
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserUsage, setSelectedUserUsage] = useState<UserDetailedUsageStats | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [fetchedUsers, fetchedFeedbacks, fetchedUsageStats] = await Promise.all([
          getAllUsers(),
          getFeedbacks(),
          getUsageStats()
        ]);

        setUsers(fetchedUsers);
        setFeedbacks(fetchedFeedbacks);
        setUsageStats(fetchedUsageStats);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const providerRegistrations = useMemo(() => {
    const providerCount = users.reduce((acc, user) => {
      acc[user.provider] = (acc[user.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(providerCount).map(([name, value]) => ({ name, value }));
  }, [users]);

  const userStatusData = useMemo(() => [
    { name: 'Onboarded', value: users.filter(u => u.is_onboarded).length },
    { name: 'Not Onboarded', value: users.filter(u => !u.is_onboarded).length },
    { name: 'Verified', value: users.filter(u => u.is_verified).length },
    { name: 'Unverified', value: users.filter(u => !u.is_verified).length }
  ], [users]);


  const detailedFeatureUsage = useMemo(() => {
    const featureCount = usageStats.reduce((acc, stat) => {
      acc[stat.feature] = (acc[stat.feature] || 0) + stat.count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(featureCount).map(([name, value]) => ({ name, value }));
  }, [usageStats]);

  const userRegistrationData = useMemo(() => {
    const registrationsByMonth = users.reduce((acc, user) => {
      const month = new Date(user.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(registrationsByMonth)
      .map(([month, count]) => ({ month, users: count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [users]);

  const userUsageStats = useMemo(() => {
    const usageMap = usageStats.reduce((acc, stat) => {
      if (!acc[stat.email]) {
        acc[stat.email] = { 
          email: stat.email, 
          totalCount: 0, 
          features: [] 
        };
      }
      
      const existingFeature = acc[stat.email].features.find(f => f.feature === stat.feature);
      
      if (existingFeature) {
        existingFeature.count += stat.count;
      } else {
        acc[stat.email].features.push({ 
          feature: stat.feature, 
          count: stat.count 
        });
      }
      
      acc[stat.email].totalCount += stat.count;
      
      return acc;
    }, {} as Record<string, UserDetailedUsageStats>);

    return Object.values(usageMap).sort((a, b) => b.totalCount - a.totalCount);
  }, [usageStats]);

  const handleUserUsageClick = (userUsage: UserDetailedUsageStats) => {
    setSelectedUserUsage(userUsage);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full bg-white shadow-sm">
          <TabsTrigger value="overview" className="text-sm sm:text-base">Overview</TabsTrigger>
          <TabsTrigger value="users" className="text-sm sm:text-base">Users</TabsTrigger>
          <TabsTrigger value="usage" className="text-sm sm:text-base">Usage Stats</TabsTrigger>
          <TabsTrigger value="feedback" className="text-sm sm:text-base">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Registration by Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={providerRegistrations}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill={COLOR_PALETTE.primary}
                      dataKey="value"
                    >
                      {providerRegistrations.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(COLOR_PALETTE)[index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">User Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userRegistrationData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke={COLOR_PALETTE.secondary} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">User Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {userStatusData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(COLOR_PALETTE)[index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Feature Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={detailedFeatureUsage}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLOR_PALETTE.accent} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">User Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Provider</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Onboarded</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Verified</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.email} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">{user.email}</td>
                        <td className="p-3 text-sm">{user.name}</td>
                        <td className="p-3 text-sm">{user.provider}</td>
                        <td className="p-3 text-sm">{user.is_onboarded ? 'Yes' : 'No'}</td>
                        <td className="p-3 text-sm">{user.is_verified ? 'Verified' : 'Unverified'}</td>
                        <td className="p-3 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">User Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Total Usage Count</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userUsageStats.map((userUsage) => (
                      <tr key={userUsage.email} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">{userUsage.email}</td>
                        <td className="p-3 text-sm">{userUsage.totalCount}</td>
                        <td className="p-3 text-sm">
                          <Dialog>
                            <DialogTrigger 
                              onClick={() => handleUserUsageClick(userUsage)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                            >
                              View Details
                            </DialogTrigger>
                            {selectedUserUsage && (
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Usage Details for {selectedUserUsage.email}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="bg-gray-100 p-4 rounded">
                                    <p className="font-semibold">Total Usage: {selectedUserUsage.totalCount}</p>
                                  </div>
                                  <table className="w-full">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="text-left p-2">Feature</th>
                                        <th className="text-right p-2">Usage Count</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedUserUsage.features.map((feature) => (
                                        <tr key={feature.feature} className="border-b">
                                          <td className="p-2">{feature.feature}</td>
                                          <td className="p-2 text-right">{feature.count}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="feedback">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">User Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Feature</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Feedback</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((feedback, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">{feedback.email}</td>
                        <td className="p-3 text-sm">{feedback.feature}</td>
                        <td className="p-3 text-sm">{feedback.feedback}</td>
                        <td className="p-3 text-sm">{new Date(feedback.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;