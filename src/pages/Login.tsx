import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { loginWithGoogle } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/parent');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center justify-center gap-3">
        <div className="bg-primary p-3 rounded-xl shadow-sm">
          <BookOpen className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Aspic Books</h1>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-100">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your parent account to manage your children's stories.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button 
            size="lg" 
            className="w-full font-medium" 
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            By continuing, you agree to Aspic Books's Terms of Service and Privacy Policy.
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
