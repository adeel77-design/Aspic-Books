import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../lib/AuthContext";
import { BookOpen, ArrowLeft, Star } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

export default function ChildView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [child, setChild] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const childDoc = await getDoc(doc(db, "children", id));
        if (childDoc.exists()) {
           setChild(childDoc.data());
           
           const storiesSnap = await getDocs(collection(db, "stories"));
           setStories(storiesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
           navigate("/parent");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  const handleStartReading = async (storyId: string) => {
    // Log the start of reading
    if (!id) return;
    try {
      const logRef = await addDoc(collection(db, "readingLogs"), {
         childId: id,
         storyId,
         durationSeconds: 0,
         completed: false,
         createdAt: Date.now()
      });
      // Navigate to reader
      navigate(`/child/${id}/read/${storyId}?logId=${logRef.id}`);
    } catch (e) {
      console.error(e);
      // fallback
      navigate(`/child/${id}/read/${storyId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      <header className="bg-white border-b-4 border-sky-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <Link to="/parent" className="flex items-center text-slate-500 hover:text-slate-900 font-medium bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-full transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Exit to Parent View
           </Link>
           <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-sky-900">{child?.name}'s Library</span>
              <div className="w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-lg border-2 border-orange-200 shadow-sm">
                {child?.name?.charAt(0)}
              </div>
           </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stories.map(story => (
              <Card key={story.id} className="overflow-hidden border-2 border-sky-100 hover:border-sky-300 transition-colors shadow-sm cursor-pointer group" onClick={() => handleStartReading(story.id)}>
                <div className="aspect-[4/3] bg-amber-100 flex items-center justify-center p-6 relative">
                   <div className="absolute top-3 right-3 bg-white/80 p-1.5 rounded-full backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                   </div>
                   <BookOpen className="w-16 h-16 text-amber-600/50" />
                </div>
                <CardContent className="p-5">
                   <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1">{story.title}</h3>
                   <span className="inline-block px-2.5 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                      {story.category}
                   </span>
                </CardContent>
              </Card>
            ))}
         </div>
      </main>
    </div>
  );
}
