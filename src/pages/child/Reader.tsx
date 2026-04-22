import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function Reader() {
  const { id: childId, storyId } = useParams();
  const [searchParams] = useSearchParams();
  const logId = searchParams.get("logId");
  
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function fetchStory() {
      if (!storyId) return;
      try {
        const d = await getDoc(doc(db, "stories", storyId));
        if (d.exists()) {
          setStory(d.data());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchStory();
  }, [storyId]);

  const handleFinish = async () => {
    setCompleted(true);
    if (logId) {
       const duration = Math.floor((Date.now() - startTime) / 1000);
       try {
         await updateDoc(doc(db, "readingLogs", logId), {
            durationSeconds: duration,
            completed: true
         });
       } catch (e) {
         console.error("Failed to update log", e);
       }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fffbf0]">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
    </div>;
  }

  if (!story) return <div className="p-8">Story not found.</div>;

  return (
    <div className="min-h-screen bg-[#fffbf0] flex flex-col font-serif">
      <header className="fixed top-0 w-full bg-[#fffbf0]/95 backdrop-blur-sm p-4 flex items-center justify-between border-b border-amber-100 z-10">
        <Link to={`/child/${childId}`}>
          <Button variant="ghost" className="text-amber-900 hover:text-amber-700 hover:bg-amber-100/50 font-sans">
             <ArrowLeft className="w-5 h-5 mr-2" /> Back to Library
          </Button>
        </Link>
        <span className="font-bold text-amber-900/40 uppercase tracking-widest text-sm font-sans">{story.category}</span>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-32 pb-24">
         <h1 className="text-5xl md:text-6xl font-black text-amber-950 mb-12 text-center leading-tight">
           {story.title}
         </h1>
         
         <div className="mx-auto text-amber-900 pb-12 leading-loose text-xl whitespace-pre-wrap">
           {story.content}
         </div>

         {!completed ? (
           <div className="text-center mt-16 pb-16">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white h-14 px-8 text-lg font-bold rounded-full font-sans shadow-lg hover:scale-105 transition-transform" onClick={handleFinish}>
                 I've Finished Reading! 🎉
              </Button>
           </div>
         ) : (
           <div className="text-center mt-16 pb-16 animate-in fade-in zoom-in duration-500">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 text-green-600 rounded-full mb-6">
                 <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold text-amber-950 mb-4 font-sans">Great Job!</h2>
              <p className="text-amber-800 text-lg mb-8 font-sans">You finished reading {story.title}.</p>
              <Link to={`/child/${childId}`}>
                <Button variant="outline" className="h-12 px-6 font-bold rounded-full font-sans border-amber-200 text-amber-800 hover:bg-amber-100">
                  Read Another Story
                </Button>
              </Link>
           </div>
         )}
      </main>
    </div>
  );
}
