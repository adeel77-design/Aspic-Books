import { ParentLayout } from "../../components/layout/DashboardLayout";
import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../lib/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Clock, CheckCircle2, User } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

export default function ParentStats() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [childrenDict, setChildrenDict] = useState<Record<string, any>>({});
  const [storiesDict, setStoriesDict] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const childrenQ = query(collection(db, "children"), where("parentId", "==", user.uid));
        const childrenSnap = await getDocs(childrenQ);
        
        if (childrenSnap.empty) {
          setLoading(false);
          return;
        }

        const childLookup: Record<string, any> = {};
        const childIds: string[] = [];
        childrenSnap.docs.forEach(d => {
          childLookup[d.id] = { id: d.id, ...d.data() };
          childIds.push(d.id);
        });
        setChildrenDict(childLookup);

        const logsQ = query(collection(db, "readingLogs"), where("childId", "in", childIds.slice(0, 10)));
        const logsSnap = await getDocs(logsQ);
        const logsList = logsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        logsList.sort((a, b) => b.createdAt - a.createdAt);
        setLogs(logsList);

        const storyIds = [...new Set(logsList.map(log => log.storyId))];
        const storyLookup: Record<string, any> = {};
        
        for (let i = 0; i < storyIds.length; i += 10) {
            const batchIds = storyIds.slice(i, i + 10);
            if (batchIds.length > 0) {
               const sQ = query(collection(db, "stories")); 
               const sSnap = await getDocs(sQ); 
               sSnap.docs.forEach(d => {
                   storyLookup[d.id] = { id: d.id, ...d.data() };
               });
            }
        }
        setStoriesDict(storyLookup);

      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [user]);

  const totalMinutes = Math.floor(logs.reduce((acc, log) => acc + (log.durationSeconds || 0), 0) / 60);
  const completedBooks = logs.filter(l => l.completed).length;

  const chartData = useMemo(() => {
    // Generate last 7 days chart
    const data: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      data[format(subDays(new Date(), i), 'MMM d')] = 0;
    }
    
    logs.forEach(log => {
      const dateStr = format(new Date(log.createdAt), 'MMM d');
      if (data[dateStr] !== undefined) {
        data[dateStr] += (log.durationSeconds || 0) / 60;
      }
    });

    return Object.keys(data).map(key => ({
       date: key,
       minutes: Math.round(data[key])
    }));
  }, [logs]);

  return (
    <ParentLayout title="Reading Statistics">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Reading Time</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{loading ? "-" : `${totalMinutes} min`}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Stories Completed</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{loading ? "-" : completedBooks}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Reading Activity (Last 7 Days)</CardTitle>
          <CardDescription>Daily minutes read by all children</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v}m`} />
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 formatter={(value: number) => [`${value} min`, 'Duration']}
              />
              <Line type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Reading history for your children</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead>Story</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading activity...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No reading activity recorded yet.</TableCell>
                </TableRow>
              ) : (
                logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                        {childrenDict[log.childId]?.name?.charAt(0)}
                      </div>
                      {childrenDict[log.childId]?.name || "Unknown"}
                    </TableCell>
                    <TableCell>{storiesDict[log.storyId]?.title || "Unknown Book"}</TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{Math.ceil(log.durationSeconds / 60)} min</TableCell>
                    <TableCell>
                      {log.completed ? (
                        <span className="inline-flex items-center text-sm text-green-600"><CheckCircle2 className="w-4 h-4 mr-1"/> Finished</span>
                      ) : (
                        <span className="inline-flex items-center text-sm text-amber-600"><Clock className="w-4 h-4 mr-1"/> Started</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ParentLayout>
  );
}
