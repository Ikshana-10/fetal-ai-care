import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Wind } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const moods = [
  { key: 'happy', emoji: '😊', label: 'Happy', color: 'hsl(142, 60%, 50%)' },
  { key: 'calm', emoji: '😌', label: 'Calm', color: 'hsl(210, 60%, 60%)' },
  { key: 'anxious', emoji: '😟', label: 'Anxious', color: 'hsl(38, 92%, 65%)' },
  { key: 'stressed', emoji: '😰', label: 'Stressed', color: 'hsl(0, 72%, 65%)' },
];

const moodValues: Record<string, number> = { happy: 4, calm: 3, anxious: 2, stressed: 1 };

export default function MoodTracker() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<{ date: string; mood: string; value: number }[]>([]);
  const [showBreathing, setShowBreathing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    supabase.from('mood_logs').select('date, mood').eq('user_id', user.id)
      .gte('date', weekAgo).order('date', { ascending: true })
      .then(({ data }) => {
        if (data) setHistory(data.map(d => ({ date: d.date.slice(5), mood: d.mood, value: moodValues[d.mood] || 2 })));
      });
  }, [user, saved]);

  const stressCount = history.filter(h => h.mood === 'anxious' || h.mood === 'stressed').length;

  const saveMood = async () => {
    if (!user || !selected) return;
    await supabase.from('mood_logs').insert({
      user_id: user.id, date: format(new Date(), 'yyyy-MM-dd'), mood: selected,
    });
    setSaved(true);
    toast({ title: 'Mood logged! 💕' });
  };

  if (showBreathing) {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto flex flex-col items-center justify-center gap-6">
        <h2 className="text-xl font-bold">Breathing Exercise 🌬️</h2>
        <p className="text-sm text-muted-foreground text-center">Breathe in as the circle grows, breathe out as it shrinks.</p>
        <div className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary animate-breathe" />
        <p className="text-sm text-muted-foreground">4 seconds in... 4 seconds out...</p>
        <Button variant="outline" onClick={() => setShowBreathing(false)}>Done</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">How are you feeling? 🌸</h1>

      {!saved ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {moods.map(({ key, emoji, label }) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all border-2 ${selected === key ? 'border-primary bg-primary/10' : 'border-primary/20'}`}
                onClick={() => setSelected(key)}
              >
                <CardContent className="pt-4 text-center">
                  <span className="text-3xl">{emoji}</span>
                  <p className="text-sm font-medium mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button onClick={saveMood} className="w-full" disabled={!selected}>Log Mood</Button>
        </motion.div>
      ) : (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 text-center">
            <p className="text-lg font-semibold">Mood logged! 🌟</p>
            <p className="text-sm text-muted-foreground mt-1">Thank you for checking in with yourself.</p>
          </CardContent>
        </Card>
      )}

      {/* Stress alert */}
      {stressCount >= 3 && (
        <Alert className="border-warning bg-warning/10">
          <Heart className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            You've been feeling stressed or anxious lately. It's okay to seek support. 💛
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowBreathing(true)}>
                <Wind className="w-4 h-4 mr-1" /> Breathing Exercise
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Weekly chart */}
      {history.length > 1 && (
        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold mb-2">This Week's Mood</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={history}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => moods.find(m => moodValues[m.key] === v)?.label || v} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {history.map((entry, i) => (
                    <Cell key={i} fill={moods.find(m => m.key === entry.mood)?.color || 'hsl(330,60%,77%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
