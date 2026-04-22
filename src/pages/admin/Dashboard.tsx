import { AdminLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Users, BookOpen, Clock, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChildren: 0,
    totalStories: 0,
    recentLogs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const childrenSnap = await getDocs(collection(db, "children"));
        const storiesSnap = await getDocs(collection(db, "stories"));
        const logsQ = query(collection(db, "readingLogs"), orderBy("createdAt", "desc"), limit(100));
        const logsSnap = await getDocs(logsQ);

        setStats({
          totalUsers: usersSnap.size,
          totalChildren: childrenSnap.size,
          totalStories: storiesSnap.size,
          recentLogs: logsSnap.size
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Families</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{loading ? "-" : stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Children</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{loading ? "-" : stats.totalChildren}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Story Library</CardTitle>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{loading ? "-" : stats.totalStories}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Recent Reading Sessions</CardTitle>
            <Activity className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{loading ? "-" : stats.recentLogs}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 border rounded-xl border-dashed border-slate-300 bg-slate-50/50 p-12 text-center text-slate-500 flex flex-col items-center">
         <Clock className="w-12 h-12 text-slate-300 mb-4" />
         <h3 className="text-lg font-medium text-slate-900">Analytics Coming Soon</h3>
         <p className="max-w-md mt-2">More detailed charts and platform-wide reading statistics are being generated.</p>
      </div>
    </AdminLayout>
  );
}
