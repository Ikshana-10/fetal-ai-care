import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Phone, Users, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPregnancyWeek } from '@/lib/pregnancy-data';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dueDate, setDueDate] = useState('');
  const [name, setName] = useState('');
  const [familyMode, setFamilyMode] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setDueDate(data.due_date || '');
          setName(data.name || '');
          setFamilyMode(data.family_mode_enabled || false);
        }
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      due_date: dueDate || null, name, family_mode_enabled: familyMode,
    }).eq('user_id', user.id);
    setSaving(false);
    toast({ title: 'Profile updated ✅' });
  };

  const week = getPregnancyWeek(dueDate || null);

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Profile 👩‍🍼</h1>

      <Card className="border-primary/20">
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" />Due Date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            {week > 0 && <p className="text-xs text-muted-foreground">Week {week} of pregnancy</p>}
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="family" className="flex items-center gap-2"><Users className="w-4 h-4" />Family Mode</Label>
            <Switch id="family" checked={familyMode} onCheckedChange={setFamilyMode} />
          </div>
          <Button onClick={save} className="w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {familyMode && (
        <Button variant="outline" className="w-full border-secondary/30" onClick={() => navigate('/family')}>
          <Users className="w-4 h-4 mr-2" /> View Family Dashboard
        </Button>
      )}

      {/* Emergency Button */}
      <Button variant="destructive" className="w-full" onClick={() => setEmergencyOpen(true)}>
        <Phone className="w-4 h-4 mr-2" /> Emergency Alert 🚨
      </Button>

      <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" /> Emergency Alert
            </DialogTitle>
            <DialogDescription>
              This would notify your emergency contacts and provide quick access to emergency services. This feature is coming soon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmergencyOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="ghost" className="w-full text-muted-foreground" onClick={signOut}>
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
}
