import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

export default function Auth() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading, signUp, signIn, resetPassword } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const authSchema = z.object({
    email: z.string().trim().email({ message: t('auth.invalidCredentials') }),
    password: z.string().min(6, { message: t('auth.invalidCredentials') }),
    displayName: z.string().trim().max(50).optional()
  });

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
        toast.error(t('auth.invalidCredentials'));
      } else {
        toast.error(t('common.error'));
      }
    } else {
      setRegisteredEmail(formData.email);
      setShowEmailConfirmation(true);
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
        toast.error(t('auth.invalidCredentials'));
      } else if (error.message.includes('Email not confirmed')) {
        toast.error(t('auth.invalidCredentials'));
      } else {
        toast.error(t('common.error'));
      }
    } else {
      toast.success(t('auth.loginSuccess'));
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
          <h1 className="text-2xl font-bold text-foreground">{t('landing.title')}</h1>
          <p className="text-muted-foreground">{t('landing.subtitle')}</p>
        </div>

        {showEmailConfirmation ? (
          <EmailConfirmationCard 
            email={registeredEmail} 
            onBack={() => {
              setShowEmailConfirmation(false);
              setFormData({ email: '', password: '', displayName: '' });
            }}
          />
        ) : showForgotPassword ? (
          <ForgotPasswordForm
            onBack={() => setShowForgotPassword(false)}
            onSubmit={async (email) => {
              const { error } = await resetPassword(email);
              if (error) {
                toast.error(t('common.error'));
              } else {
                toast.success(t('auth.resetEmailSent'));
                setShowForgotPassword(false);
              }
            }}
          />
        ) : (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.register')}</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="login" className="space-y-4 mt-0">
                <CardDescription className="text-center">
                  {t('auth.loginToAccount')}
                </CardDescription>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('auth.email')}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('auth.password')}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t('auth.passwordPlaceholder')}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t('auth.login')}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-0">
                <CardDescription className="text-center">
                  {t('auth.createAccount')}
                </CardDescription>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name (optional)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your name"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className={errors.displayName ? 'border-destructive' : ''}
                    />
                    {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password')}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t('auth.register')}
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

function EmailConfirmationCard({ 
  email, 
  onBack 
}: { 
  email: string; 
  onBack: () => void;
}) {
  const { t } = useTranslation();
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 p-4 rounded-full bg-primary/20">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">Verify Your Email</CardTitle>
        <CardDescription className="text-base">
          We sent a verification link to <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Click the link in your email to activate your account
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Check your spam folder if you dont see the email
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </CardContent>
    </Card>
  );
}

function ForgotPasswordForm({ 
  onBack, 
  onSubmit 
}: { 
  onBack: () => void; 
  onSubmit: (email: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailSchema = z.string().trim().email({ message: t('auth.invalidCredentials') });
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
          {t('common.back')}
        </button>
        <CardTitle>{t('auth.forgotPassword')}</CardTitle>
        <CardDescription>
          Enter your email address and we will send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">{t('auth.email')}</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t('auth.resetPassword')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
