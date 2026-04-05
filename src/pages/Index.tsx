import { ref, set } from "firebase/database";
import { db } from "../firebase";  // adjust path if needed
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Baby, ClipboardCheck, Smile, Heart, TrendingUp, Lightbulb } from 'lucide-react';
import { getPregnancyWeek, getBabySize, getDailyTip } from '@/lib/pregnancy-data';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function Index() {
  const writeData = () => {
    set(ref(db, "test/1"), {
      name: "hello",
      time: new Date().toString()
    });
  };
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ due_date: string | null; name: string | null } | null>(null);
  const [todayKicks, setTodayKicks] = useState(0);
  const [recentMoods, setRecentMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');

    Promise.all([
      supabase.from('profiles').select('due_date, name').eq('user_id', user.id).single(),
      supabase.from('kick_logs').select('count').eq('user_id', user.id).eq('date', today),
      supabase.from('mood_logs').select('mood').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
    ]).then(([profileRes, kicksRes, moodsRes]) => {
      if (profileRes.data) {
        setProfile(profileRes.data);
        if (!profileRes.data.due_date) navigate('/onboarding');
      }
      if (kicksRes.data) setTodayKicks(kicksRes.data.reduce((s, r) => s + r.count, 0));
      if (moodsRes.data) setRecentMoods(moodsRes.data.map(m => m.mood));
      setLoading(false);
    });
  }, [user, navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Heart className="w-8 h-8 text-primary animate-pulse-gentle" /></div>;

  const week = getPregnancyWeek(profile?.due_date ?? null);
  const babySize = getBabySize(week);
  const tip = getDailyTip(week);
  const stressCount = recentMoods.filter(m => m === 'anxious' || m === 'stressed').length;

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Greeting */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Hi{profile?.name ? `, ${profile.name}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1">Week {week} of your beautiful journey</p>
        </div>
        {/* Firebase Test Button */}
        <div className="mt-4 text-center">
          <Button
            variant="default"
            onClick={writeData}
          >
            Send Test Data
          </Button>
        </div>

        {/* Baby Size Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent border-primary/20">
          <CardContent className="pt-5 text-center">
            <p className="text-sm text-muted-foreground">Your baby is the size of</p>
            <p className="text-2xl font-bold mt-1">{babySize}</p>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-primary/20">
            <CardContent className="pt-4 text-center">
              <Baby className="w-6 h-6 text-primary mx-auto" />
              <p className="text-2xl font-bold mt-1">{todayKicks}</p>
              <p className="text-xs text-muted-foreground">Kicks today</p>
            </CardContent>
          </Card>
          <Card className="border-secondary/20">
            <CardContent className="pt-4 text-center">
              <Smile className="w-6 h-6 text-secondary mx-auto" />
              <p className="text-2xl font-bold mt-1">
                {recentMoods[0] ? recentMoods[0].charAt(0).toUpperCase() + recentMoods[0].slice(1) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Today's mood</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insight */}
        {stressCount >= 3 && (
          <Card className="border-warning bg-warning/10">
            <CardContent className="pt-4 flex gap-3 items-start">
              <TrendingUp className="w-5 h-5 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">You seem more stressed this week</p>
                <p className="text-xs text-muted-foreground mt-1">Consider trying a breathing exercise or talking to someone you trust. 💛</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Tip */}
        <Card className="border-accent bg-accent/30">
          <CardContent className="pt-4 flex gap-3 items-start">
            <Lightbulb className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Daily Tip</p>
              <p className="text-xs text-muted-foreground mt-1">{tip}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="flex-col h-auto py-3 border-primary/20" onClick={() => navigate('/kicks')}>
            <Baby className="w-5 h-5 mb-1" />
            <span className="text-xs">Log Kicks</span>
          </Button>
          <Button variant="outline" className="flex-col h-auto py-3 border-primary/20" onClick={() => navigate('/checkin')}>
            <ClipboardCheck className="w-5 h-5 mb-1" />
            <span className="text-xs">Check-In</span>
          </Button>
          <Button variant="outline" className="flex-col h-auto py-3 border-primary/20" onClick={() => navigate('/mood')}>
            <Smile className="w-5 h-5 mb-1" />
            <span className="text-xs">Log Mood</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
