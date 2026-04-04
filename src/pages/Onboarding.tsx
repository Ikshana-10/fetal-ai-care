import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Baby } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Onboarding() {
  const { user } = useAuth();
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ due_date: dueDate }).eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-2">
            <Baby className="w-8 h-8 text-secondary" />
          </div>
          <CardTitle className="text-2xl">When is your baby due? 🍼</CardTitle>
          <CardDescription>This helps us give you personalized weekly tips and insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Continue 💕'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
