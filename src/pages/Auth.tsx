import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Loader2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email({ message: "Geçerli bir e-posta adresi girin" }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalı" }),
  displayName: z.string().trim().max(50, { message: "İsim en fazla 50 karakter olmalı" }).optional()
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading, signUp, signIn, resetPassword } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) {
      navigate('/app');
    }
  }, [user, loading, navigate]);


  const validateForm = (includeDisplayName: boolean) => {
    try {
      authSchema.parse({
        email: formData.email,
        password: formData.password,
        displayName: includeDisplayName ? formData.displayName : undefined
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    
    setIsSubmitting(true);
    const { error } = await signUp(formData.email, formData.password, formData.displayName);
    setIsSubmitting(false);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Bu e-posta adresi zaten kayıtlı');
      } else {
        toast.error('Kayıt sırasında bir hata oluştu');
      }
    } else {
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate('/app');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    
    setIsSubmitting(true);
    const { error } = await signIn(formData.email, formData.password);
    setIsSubmitting(false);
    
    if (error) {
      if (error.message.includes('Invalid login')) {
        toast.error('E-posta veya şifre hatalı');
      } else {
        toast.error('Giriş sırasında bir hata oluştu');
      }
    } else {
      toast.success('Giriş başarılı!');
      navigate('/app');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/20">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Duygu Günlüğü</h1>
          <p className="text-muted-foreground">Duygularını yazarak keşfet</p>
        </div>

        {showForgotPassword ? (
          <ForgotPasswordForm
            onBack={() => setShowForgotPassword(false)}
            onSubmit={async (email) => {
              const { error } = await resetPassword(email);
              if (error) {
                toast.error('Şifre sıfırlama e-postası gönderilemedi');
              } else {
                toast.success('Şifre sıfırlama linki e-posta adresinize gönderildi');
                setShowForgotPassword(false);
              }
            }}
          />
        ) : (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                <TabsTrigger value="signup">Kayıt Ol</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="login" className="space-y-4 mt-0">
                <CardDescription className="text-center">
                  Hesabınıza giriş yapın
                </CardDescription>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-posta</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Şifre</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Giriş Yap
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Şifremi unuttum
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-0">
                <CardDescription className="text-center">
                  Yeni bir hesap oluşturun
                </CardDescription>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">İsim (isteğe bağlı)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Adınız"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className={errors.displayName ? 'border-destructive' : ''}
                    />
                    {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-posta</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Şifre</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="En az 6 karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Kayıt Ol
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
        )}
      </div>
    </div>
  );
}

function ForgotPasswordForm({ 
  onBack, 
  onSubmit 
}: { 
  onBack: () => void; 
  onSubmit: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailSchema = z.string().trim().email({ message: "Geçerli bir e-posta adresi girin" });
    const result = emailSchema.safeParse(email);
    
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    await onSubmit(email);
    setIsSubmitting(false);
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </button>
        <CardTitle>Şifremi Unuttum</CardTitle>
        <CardDescription>
          E-posta adresinizi girin, size şifre sıfırlama linki gönderelim
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">E-posta</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sıfırlama Linki Gönder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
