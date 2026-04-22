import { Link } from "react-router-dom";
import { BookOpen, Star, Shield, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Aspic Books</span>
          </div>
          <nav>
            <Link to="/login">
              <Button>Parent Portal <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 px-6 md:py-32 lg:py-40 bg-slate-50">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
              A magical universe of stories for your family.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Curated, safe, and engaging reading experiences managed by parents. Designed to foster a lifelong love of reading.
            </p>
            <div className="pt-8">
              <Link to="/login">
                <Button size="lg" className="h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-shadow">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Parent Controlled</h3>
              <p className="text-slate-600 leading-relaxed">
                You decide what your children read. Total control over their libraries and reading analytics.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Curated Quality</h3>
              <p className="text-slate-600 leading-relaxed">
                Hand-picked stories, audio narrations, and beautiful illustrations to captivate young minds.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Read Anywhere</h3>
              <p className="text-slate-600 leading-relaxed">
                Accessible on tablets, phones, and computers. A safe reading environment ready whenever you are.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-400" />
            <span className="font-semibold text-slate-600">Aspic Books</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 Aspic Books. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
