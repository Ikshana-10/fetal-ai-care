import { differenceInWeeks, parseISO } from 'date-fns';

export function getPregnancyWeek(dueDate: string | null): number {
  if (!dueDate) return 0;
  const due = parseISO(dueDate);
  const now = new Date();
  const weeksLeft = differenceInWeeks(due, now);
  return Math.max(1, Math.min(42, 40 - weeksLeft));
}

const babySizes: Record<number, string> = {
  4: "a poppy seed 🌱", 5: "a sesame seed 🫘", 6: "a lentil 🫘", 7: "a blueberry 🫐",
  8: "a raspberry 🍇", 9: "a cherry 🍒", 10: "a strawberry 🍓", 11: "a fig 🫒",
  12: "a lime 🍋", 13: "a peach 🍑", 14: "a lemon 🍋", 15: "an apple 🍎",
  16: "an avocado 🥑", 17: "a pear 🍐", 18: "a bell pepper 🫑", 19: "a mango 🥭",
  20: "a banana 🍌", 21: "a carrot 🥕", 22: "a papaya 🧡", 23: "a grapefruit 🍊",
  24: "an ear of corn 🌽", 25: "a cauliflower 🥦", 26: "a lettuce 🥬",
  27: "a head of broccoli 🥦", 28: "an eggplant 🍆", 29: "a butternut squash 🎃",
  30: "a cabbage 🥬", 31: "a coconut 🥥", 32: "a jicama 🧅", 33: "a pineapple 🍍",
  34: "a cantaloupe 🍈", 35: "a honeydew melon 🍈", 36: "a head of romaine lettuce 🥬",
  37: "a bunch of Swiss chard 🥬", 38: "a leek 🌿", 39: "a mini watermelon 🍉",
  40: "a small pumpkin 🎃",
};

export function getBabySize(week: number): string {
  if (week < 4) return "a tiny miracle ✨";
  return babySizes[week] || "a small pumpkin 🎃";
}

const weeklyTips: Record<number, string[]> = {
  4: ["Stay hydrated! Aim for 8-10 glasses of water daily.", "Start taking prenatal vitamins if you haven't already."],
  8: ["Morning sickness? Try ginger tea or crackers before getting up.", "Your baby's heart is beating!"],
  12: ["First trimester almost done! Energy levels may start improving soon.", "Consider sharing the news with loved ones."],
  16: ["You might start feeling tiny flutters — baby's first movements!", "Eating iron-rich foods helps prevent anemia."],
  20: ["Halfway there! 🎉 Your baby can now hear sounds.", "Time for your anatomy scan if scheduled."],
  24: ["Baby is developing a sleep-wake cycle now.", "Practice kegel exercises for pelvic floor strength."],
  28: ["Third trimester begins! Baby is growing rapidly.", "Start counting kicks — aim for 10 movements in 2 hours."],
  32: ["Baby is practicing breathing movements.", "Prepare your hospital bag soon."],
  36: ["Baby is getting into position for birth.", "Rest when you can — you deserve it!"],
  40: ["Your due date is here! Baby will come when ready.", "Stay calm and trust your body. 💕"],
};

export function getDailyTip(week: number): string {
  const keys = Object.keys(weeklyTips).map(Number).sort((a, b) => a - b);
  let bestKey = keys[0];
  for (const k of keys) {
    if (k <= week) bestKey = k;
  }
  const tips = weeklyTips[bestKey] || weeklyTips[4]!;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return tips[dayOfYear % tips.length]!;
}

export const familyUpdates: Record<number, { development: string; nutrition: string }> = {
  4: { development: "The embryo is implanting in the uterus 🌱", nutrition: "She needs folate-rich foods like leafy greens today." },
  8: { development: "Baby's tiny fingers and toes are forming 🤏", nutrition: "She needs foods rich in vitamin B6 today." },
  12: { development: "Baby can make a fist and suck their thumb 👶", nutrition: "She needs calcium-rich foods like yogurt today." },
  16: { development: "Baby can hear your voice now! Talk to them 🗣️", nutrition: "She needs iron-rich foods like spinach today." },
  20: { development: "Baby is the size of a banana and very active 🍌", nutrition: "She needs omega-3 fatty acids from fish or walnuts." },
  24: { development: "Baby's lungs are developing surfactant for breathing 🫁", nutrition: "She needs extra protein for baby's growth." },
  28: { development: "Baby can open and close their eyes 👀", nutrition: "She needs vitamin C to help absorb iron." },
  32: { development: "Baby is practicing breathing movements 🌬️", nutrition: "She needs magnesium-rich foods like nuts and seeds." },
  36: { development: "Baby is gaining weight and getting cozy 🤗", nutrition: "She needs dates — they may help with labor." },
  40: { development: "Baby is ready to meet the world! 🌍", nutrition: "Light, easy-to-digest meals are best now." },
};

export function getFamilyUpdate(week: number) {
  const keys = Object.keys(familyUpdates).map(Number).sort((a, b) => a - b);
  let bestKey = keys[0];
  for (const k of keys) {
    if (k <= week) bestKey = k;
  }
  return familyUpdates[bestKey] || familyUpdates[4]!;
}
