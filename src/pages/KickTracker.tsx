import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Baby, AlertTriangle, Timer } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function KickTracker() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<{ date: string; count: number }[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lowAlert, setLowAlert] = useState(false);

  useEffect(() => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const twoWeeksAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd');

    supabase.from('kick_logs').select('date, count').eq('user_id', user.id)
      .gte('date', twoWeeksAgo).order('date', { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        // Aggregate by date
        const byDate: Record<string, number> = {};
        data.forEach(r => { byDate[r.date] = (byDate[r.date] || 0) + r.count; });
        const hist = Object.entries(byDate).map(([date, count]) => ({ date: date.slice(5), count }));
        setHistory(hist);

        // Check today vs 7-day avg
        const todayCount = byDate[today] || 0;
        setCount(todayCount);
        const pastDays = Object.entries(byDate).filter(([d]) => d !== today).map(([, c]) => c);
        if (pastDays.length >= 3) {
          const avg = pastDays.reduce((s, c) => s + c, 0) / pastDays.length;
          setLowAlert(todayCount > 0 && todayCount < avg * 0.7);
        }
      });
  }, [user]);

  // Session timer
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => setSessionTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  const logKick = async () => {
    if (!user) return;
    setCount(c => c + 1);
    if (!sessionActive) setSessionActive(true);
  };

  const saveSession = async () => {
    if (!user || count === 0) return;
    setSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    await supabase.from('kick_logs').insert({
      user_id: user.id, date: today, count, session_duration: sessionTime,
    });
    setSessionActive(false);
    setSessionTime(0);
    setSaving(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Baby Kicks 👶</h1>

      {lowAlert && (
        <Alert className="border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            Your baby movement count is lower than usual today. Please monitor closely or consult your doctor.
          </AlertDescription>
        </Alert>
      )}

      {/* Counter */}
      <Card className="border-primary/20">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={logKick}
            className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center transition-all hover:bg-primary/30"
          >
            <Baby className="w-12 h-12 text-primary" />
          </motion.button>
          <p className="text-4xl font-bold">{count}</p>
          <p className="text-sm text-muted-foreground">Tap the button each time you feel a kick</p>
          {sessionActive && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-mono">{formatTime(sessionTime)}</span>
            </div>
          )}
          <Button onClick={saveSession} disabled={count === 0 || saving} className="w-full">
            {saving ? 'Saving...' : 'Save Session'}
          </Button>
        </CardContent>
      </Card>

      {/* Chart */}
      {history.length > 1 && (
        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold mb-2">14-Day Trend</p>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={history}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(330, 60%, 77%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
