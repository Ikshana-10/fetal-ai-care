import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const questions = [
  { key: 'headache', label: 'Do you have a severe headache?' },
  { key: 'bleeding', label: 'Are you experiencing heavy bleeding?' },
  { key: 'swelling', label: 'Do you have sudden swelling (face, hands, feet)?' },
  { key: 'vision', label: 'Are you experiencing blurred vision?' },
  { key: 'movement', label: 'Have you noticed reduced baby movement?' },
];

export default function CheckIn() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const flagged = Object.values(answers).some(v => v);

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('checkin_logs').insert({
      user_id: user.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      answers: answers as unknown as Record<string, unknown>,
      flagged,
    });
    setSaving(false);
    setSubmitted(true);
    toast({ title: 'Check-in saved ✅' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">Daily Check-In 📋</h1>
        {flagged ? (
          <Alert className="border-destructive bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertTitle className="font-semibold">This may require immediate medical attention.</AlertTitle>
            <AlertDescription className="text-sm mt-1">
              Based on your responses, please contact your healthcare provider or visit the nearest hospital. Stay safe, mama. 💛
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-success bg-success/10">
            <CheckCircle className="h-5 w-5 text-success" />
            <AlertTitle className="font-semibold">All looks good today! ✨</AlertTitle>
            <AlertDescription className="text-sm mt-1">
              Keep taking care of yourself. You're doing amazing! 💕
            </AlertDescription>
          </Alert>
        )}
        <Button variant="outline" className="w-full" onClick={() => { setSubmitted(false); setAnswers({}); }}>
          Do Another Check-In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Daily Check-In 📋</h1>
      <p className="text-sm text-muted-foreground text-center">Answer these quick questions to stay aware.</p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        {questions.map(({ key, label }) => (
          <Card key={key} className="border-primary/20">
            <CardContent className="pt-4 flex items-center justify-between gap-3">
              <Label htmlFor={key} className="text-sm flex-1 cursor-pointer">{label}</Label>
              <Switch
                id={key}
                checked={!!answers[key]}
                onCheckedChange={v => setAnswers(prev => ({ ...prev, [key]: v }))}
              />
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <Button onClick={handleSubmit} className="w-full" disabled={saving}>
        {saving ? 'Saving...' : 'Submit Check-In'}
      </Button>
    </div>
  );
}
