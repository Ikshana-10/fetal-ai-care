import { ref, set, get } from "firebase/database";
import { db } from "../firebase";

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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [todayKicks, setTodayKicks] = useState(0);
  const [recentMoods, setRecentMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Firebase test
  const writeData = () => {
    set(ref(db, "test/1"), {
      name: "hello",
      time: new Date().toString()
    });
  };

  // ✅ Get location
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => reject(err)
      );
    });
  };

  // ✅ SOS
  const handleSOS = async () => {
    try {
      const location = await getLocation();
      const mapLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

      const snapshot = await get(ref(db, "familyContacts"));
      const phone = snapshot.val()?.father?.phone;

      if (!phone) {
        alert("No contact saved!");
        return;
      }

      // Save alert
      set(ref(db, "sos/alert"), {
        status: "EMERGENCY",
        location: mapLink,
        time: new Date().toString()
      });

      // Call
      window.location.href = `tel:${phone}`;

      alert("🚨 SOS triggered!");
    } catch (err) {
      alert("Error in SOS");
    }
  };

  // ✅ Load data
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

      if (kicksRes.data) {
        setTodayKicks(kicksRes.data.reduce((s, r) => s + r.count, 0));
      }

      if (moodsRes.data) {
        setRecentMoods(moodsRes.data.map(m => m.mood));
      }

      setLoading(false);
    });
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Heart className="w-8 h-8 text-primary animate-pulse-gentle" />
      </div>
    );
  }

  const week = getPregnancyWeek(profile?.due_date ?? null);
  const babySize = getBabySize(week);
  const tip = getDailyTip(week);
  const stressCount = recentMoods.filter(m => m === 'anxious' || m === 'stressed').length;

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto">
      <motion.div className="space-y-4">

        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Hi{profile?.name ? `, ${profile.name}` : ''}
          </h1>
          <p>Week {week}</p>
        </div>

        <Button onClick={writeData}>Test Firebase</Button>

        <Button variant="destructive" onClick={handleSOS}>
          🚨 Emergency SOS
        </Button>

        <Card>
          <CardContent>
            <p>Baby size: {babySize}</p>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
}