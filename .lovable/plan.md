

# Fetal Care AI — Pregnancy Support App

## Design System
- **Palette**: Soft pink & lavender theme — warm gradients, gentle rounded corners, calming typography
- **Colors**: Primary pink (#E8A0BF), lavender accents (#C8A2D0), cream background (#FFF8F5), soft text tones
- **Mobile-first**: All layouts optimized for phone screens with responsive desktop support

## Pages & Features

### 1. Auth (Supabase)
- Login/Signup with email & password
- After signup: onboarding flow to input pregnancy due date/current week

### 2. Dashboard (Home)
- Pregnancy week display with baby size illustration (text-based, e.g., "Your baby is the size of a mango 🥭")
- Baby movement summary card (today's kicks count)
- Mood trend mini-chart (last 7 days)
- Daily tip card (rotates from a curated list based on pregnancy week)
- Quick action buttons: Log Kicks, Check-In, Log Mood

### 3. Baby Movement Tracker
- Large tap-to-count button for logging kicks
- Session timer (count kicks within a time window)
- Historical trend chart (last 14 days line graph)
- Pattern detection: if today's count drops below 7-day average by 30%, show a soft alert banner
- All data stored in Supabase

### 4. Daily Safety Check-In
- 5 yes/no toggle questions (headache, bleeding, swelling, vision, movement)
- If any "Yes": prominent but gentle alert card with recommendation to contact doctor
- Check-in history log

### 5. Mood Tracker
- Emoji-based mood selection (Happy 😊, Calm 😌, Anxious 😟, Stressed 😰)
- 7-day mood trend visualization
- If 3+ anxious/stressed days in a week: suggest breathing exercises, calming tips, and gentle recommendation to talk to someone
- Breathing exercise screen (animated circle for guided breathing)

### 6. Family Mode (Visual Mockup)
- Toggle in settings to "enable" Family Mode
- Family dashboard view showing:
  - Weekly baby development update ("This week your baby can hear sounds 🎵")
  - Nutrition tip ("She needs iron-rich food today")
  - Movement summary (read-only)
- UI only — no real multi-user sharing

### 7. Profile & Settings
- Edit due date / pregnancy week
- Family Mode toggle
- Emergency alert button (UI placeholder — shows confirmation modal)

### 8. AI Insights
- Simple rule-based pattern detection shown on dashboard:
  - Movement trend analysis
  - Mood trend analysis
  - Wellness score (combination of mood + movement + check-in data)
- All insights use supportive, non-diagnostic language

## Database (Supabase)
- **profiles**: user_id, due_date, name
- **kick_logs**: user_id, date, count, session_duration
- **mood_logs**: user_id, date, mood
- **checkin_logs**: user_id, date, answers (JSON), flagged (boolean)

## Navigation
- Bottom tab bar: Home, Kicks, Check-In, Mood, Profile

