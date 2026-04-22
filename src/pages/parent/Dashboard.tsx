import { ParentLayout } from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../components/ui/dialog";
import { User, Plus, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const fetchChildren = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "children"), where("parentId", "==", user.uid));
      const snap = await getDocs(q);
      setChildrenList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "children"), {
        parentId: user.uid,
        name,
        age: parseInt(age, 10),
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setIsDialogOpen(false);
      setName('');
      setAge('');
      fetchChildren();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this child profile?")) {
      await deleteDoc(doc(db, "children", id));
      fetchChildren();
    }
  };

  return (
    <ParentLayout title="My Family">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-lg font-medium text-slate-800">Your Children</h2>
          <p className="text-slate-500 text-sm">Manage profiles and view reading activity.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2"/> Add Child</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a Child</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddChild} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">First Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" min="1" max="18" value={age} onChange={e => setAge(e.target.value)} required />
              </div>
              <DialogFooter>
                <Button type="submit">Create Profile</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 col-span-3">Loading profiles...</p>
        ) : childrenList.length === 0 ? (
          <div className="col-span-3 text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-white">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No children added yet</h3>
            <p className="text-slate-500 mb-4">Add your children to let them start reading stories.</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Add Child Now</Button>
          </div>
        ) : (
          childrenList.map(child => (
            <Card key={child.id} className="relative group hover:shadow-md transition-shadow">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      <CardDescription>Age {child.age}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(child.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-3">
                <Link to={`/child/${child.id}`}>
                  <Button variant="secondary" className="w-full">
                     Enter Child View <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to={`/parent/stats?child=${child.id}`}>
                  <Button variant="outline" className="w-full">
                     View Reading Stats
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ParentLayout>
  );
}
