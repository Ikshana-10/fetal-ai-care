import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Baby, Utensils, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPregnancyWeek, getFamilyUpdate } from '@/lib/pregnancy-data';
import { format } from 'date-fns';
import { ref, set, onValue } from "firebase/database";
import { db } from "../firebase";

export default function FamilyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [week, setWeek] = useState(0);
  const [todayKicks, setTodayKicks] = useState(0);

  // ✅ Contact states (dynamic input)
  const [fatherPhone, setFatherPhone] = useState("");
  const [familyPhone, setFamilyPhone] = useState("");

  // ✅ SOS data
  const [sosData, setSosData] = useState<any>(null);

  // ✅ Fetch pregnancy + kicks
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

  // ✅ Listen for SOS alerts
  useEffect(() => {
    const sosRef = ref(db, "sos/alert");

    onValue(sosRef, (snap) => {
      const data = snap.val();
      if (data) {
        setSosData(data);

        if (data.status === "EMERGENCY") {
          alert("🚨 Emergency Alert Received!");
        }
      }
    });
  }, []);

  // ✅ Save contacts to Firebase
  const saveContacts = () => {
    set(ref(db, "familyContacts"), {
      father: {
        phone: fatherPhone
      },
      family: {
        phone: familyPhone
      }
    });

    alert("Contacts Saved!");
  };

  const update = getFamilyUpdate(week);

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto space-y-4">

      {/* ✅ HEADER */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <h1 className="text-xl font-bold">Family Dashboard 👨‍👩‍👶</h1>

        <div></div>
      </div>

      {/* ✅ CONTACT INPUT */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <p className="font-semibold text-sm">Family Contacts</p>

          <input
            type="text"
            placeholder="Father Phone"
            className="w-full border p-2 rounded"
            value={fatherPhone}
            onChange={(e) => setFatherPhone(e.target.value)}
          />

          <input
            type="text"
            placeholder="Family Phone"
            className="w-full border p-2 rounded"
            value={familyPhone}
            onChange={(e) => setFamilyPhone(e.target.value)}
          />

          <Button onClick={saveContacts}>
            Save Contacts
          </Button>
        </CardContent>
      </Card>

      {/* ✅ SOS ALERT DISPLAY */}
      {sosData && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-4">
            <p className="font-semibold text-red-600">🚨 Emergency Alert</p>
            <p className="text-sm mt-1">Time: {sosData.time}</p>

            {sosData.location && (
              <a
                href={sosData.location}
                target="_blank"
                className="text-blue-600 underline text-sm"
              >
                View Location
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* ✅ WEEK INFO */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent border-primary/20">
        <CardContent className="pt-5 text-center">
          <p className="text-sm text-muted-foreground">Week {week}</p>
          <p className="text-lg font-bold mt-1">Baby Development</p>
        </CardContent>
      </Card>

      {/* ✅ DEVELOPMENT */}
      <Card>
        <CardContent className="pt-4 flex gap-3">
          <Baby className="w-5 h-5 text-secondary" />
          <div>
            <p className="font-semibold text-sm">This Week</p>
            <p className="text-sm text-muted-foreground mt-1">{update.development}</p>
          </div>
        </CardContent>
      </Card>

      {/* ✅ NUTRITION */}
      <Card>
        <CardContent className="pt-4 flex gap-3">
          <Utensils className="w-5 h-5 text-warning" />
          <div>
            <p className="font-semibold text-sm">Nutrition Tip</p>
            <p className="text-sm text-muted-foreground mt-1">{update.nutrition}</p>
          </div>
        </CardContent>
      </Card>

      {/* ✅ KICKS */}
      <Card>
        <CardContent className="pt-4 flex gap-3">
          <Heart className="w-5 h-5 text-primary" />
          <div>
            <p className="font-semibold text-sm">Today's Kicks</p>
            <p className="text-2xl font-bold mt-1">{todayKicks}</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}