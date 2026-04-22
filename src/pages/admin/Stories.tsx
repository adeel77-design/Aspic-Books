import { AdminLayout } from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { collection, getDocs, setDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { db, useAuth } from "../../lib/firebase"; // wait, useAuth is from AuthContext
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useAuth as useUserAuth } from "../../lib/AuthContext";

export default function AdminStories() {
  const { user } = useUserAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "stories"));
      setStories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingId) {
        await setDoc(doc(db, "stories", editingId), {
          title,
          content,
          category,
          updatedAt: Date.now()
        }, { merge: true });
      } else {
        await addDoc(collection(db, "stories"), {
          title,
          content,
          category,
          authorId: user.uid,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      setIsDialogOpen(false);
      resetForm();
      fetchStories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this story?")) {
      await deleteDoc(doc(db, "stories", id));
      fetchStories();
    }
  };

  const openEdit = (story: any) => {
    setEditingId(story.id);
    setTitle(story.title);
    setContent(story.content);
    setCategory(story.category || '');
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('');
  };

  return (
    <AdminLayout title="Story Library">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-lg font-medium text-slate-800">Available Stories</h2>
          <p className="text-slate-500 text-sm">Manage the books available to all children.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2"/> Add Story</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Story" : "Add New Story"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="Bedtime">Bedtime</SelectItem>
                    <SelectItem value="Educational">Educational</SelectItem>
                    <SelectItem value="Fairy Tale">Fairy Tale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <textarea 
                  id="content"
                  required
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Once upon a time..."
                />
              </div>
              <DialogFooter>
                <Button type="submit">{editingId ? "Save Changes" : "Create Story"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">Loading stories...</TableCell>
                </TableRow>
              ) : stories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">No stories found.</TableCell>
                </TableRow>
              ) : (
                stories.map(story => (
                  <TableRow key={story.id}>
                    <TableCell className="font-medium">{story.title}</TableCell>
                    <TableCell>{story.category}</TableCell>
                    <TableCell>{new Date(story.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(story)}>
                        <Pencil className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(story.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
