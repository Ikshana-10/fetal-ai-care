import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Baby, Utensils, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPregnancyWeek, getFamilyUpdate } from '@/lib/pregnancy-data';
import { format } from 'date-fns';

export default function FamilyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [week, setWeek] = useState(0);
  const [todayKicks, setTodayKicks] = useState(0);

  useEffect(() => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    Promise.all([
      supabase.from('profiles').select('due_date').eq('user_id', user.id).single(),
      supabase.from('kick_logs').select('count').eq('user_id', user.id).eq('date', today),
    ]).then(([profileRes, kicksRes]) => {
      if (profileRes.data) setWeek(getPregnancyWeek(profileRes.data.due_date));
      if (kicksRes.data) setTodayKicks(kicksRes.data.reduce((s, r) => s + r.count, 0));
    });
  }, [user]);

  const update = getFamilyUpdate(week);

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Family Dashboard 👨‍👩‍👶</h1>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-accent border-primary/20">
        <CardContent className="pt-5 text-center">
          <p className="text-sm text-muted-foreground">Week {week}</p>
          <p className="text-lg font-bold mt-1">Baby Development</p>
        </CardContent>
      </Card>

      <Card className="border-secondary/20">
        <CardContent className="pt-4 flex gap-3 items-start">
          <Baby className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">This Week</p>
            <p className="text-sm text-muted-foreground mt-1">{update.development}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="pt-4 flex gap-3 items-start">
          <Utensils className="w-5 h-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Nutrition Tip</p>
            <p className="text-sm text-muted-foreground mt-1">{update.nutrition}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardContent className="pt-4 flex gap-3 items-start">
          <Heart className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Today's Kicks</p>
            <p className="text-2xl font-bold mt-1">{todayKicks}</p>
            <p className="text-xs text-muted-foreground">movements recorded today</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
