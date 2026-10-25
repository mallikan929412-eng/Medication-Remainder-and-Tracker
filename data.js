// Base 30 medicines provided in the specification
const BASE_MEDICINES = [
  { medicine_id: 1, name: "Metformin", generic_name: "Metformin HCl", strength: "500 mg", form: "Tablet", category: "Antidiabetic", condition_group: "Type 2 Diabetes", color: "#3b82f6", icon: "pill" },
  { medicine_id: 2, name: "Glimepiride", generic_name: "Glimepiride", strength: "2 mg", form: "Tablet", category: "Antidiabetic", condition_group: "Type 2 Diabetes", color: "#60a5fa", icon: "pill" },
  { medicine_id: 3, name: "Sitagliptin", generic_name: "Sitagliptin", strength: "50 mg", form: "Tablet", category: "Antidiabetic", condition_group: "Type 2 Diabetes", color: "#2563eb", icon: "pill" },
  { medicine_id: 4, name: "Insulin Glargine", generic_name: "Insulin Glargine", strength: "10 units", form: "Injection", category: "Antidiabetic", condition_group: "Type 2 Diabetes", color: "#06b6d4", icon: "syringe" },
  { medicine_id: 5, name: "Amlodipine", generic_name: "Amlodipine", strength: "5 mg", form: "Tablet", category: "Antihypertensive", condition_group: "Hypertension", color: "#10b981", icon: "pill" },
  { medicine_id: 6, name: "Telmisartan", generic_name: "Telmisartan", strength: "40 mg", form: "Tablet", category: "Antihypertensive", condition_group: "Hypertension", color: "#059669", icon: "pill" },
  { medicine_id: 7, name: "Losartan", generic_name: "Losartan", strength: "50 mg", form: "Tablet", category: "Antihypertensive", condition_group: "Hypertension", color: "#34d399", icon: "pill" },
  { medicine_id: 8, name: "Metoprolol", generic_name: "Metoprolol", strength: "25 mg", form: "Tablet", category: "Beta Blocker", condition_group: "Hypertension", color: "#14b8a6", icon: "pill" },
  { medicine_id: 9, name: "Levothyroxine", generic_name: "Levothyroxine", strength: "50 mcg", form: "Tablet", category: "Thyroid", condition_group: "Hypothyroidism", color: "#8b5cf6", icon: "pill" },
  { medicine_id: 10, name: "Salbutamol Inhaler", generic_name: "Salbutamol", strength: "100 mcg", form: "Inhaler", category: "Bronchodilator", condition_group: "Asthma", color: "#0ea5e9", icon: "spray" },
  { medicine_id: 11, name: "Montelukast", generic_name: "Montelukast", strength: "10 mg", form: "Tablet", category: "Antiasthmatic", condition_group: "Asthma", color: "#38bdf8", icon: "pill" },
  { medicine_id: 12, name: "Budesonide Inhaler", generic_name: "Budesonide", strength: "200 mcg", form: "Inhaler", category: "Corticosteroid", condition_group: "Asthma", color: "#0284c7", icon: "spray" },
  { medicine_id: 13, name: "Atorvastatin", generic_name: "Atorvastatin", strength: "10 mg", form: "Tablet", category: "Statin", condition_group: "High Cholesterol", color: "#f59e0b", icon: "pill" },
  { medicine_id: 14, name: "Rosuvastatin", generic_name: "Rosuvastatin", strength: "10 mg", form: "Tablet", category: "Statin", condition_group: "High Cholesterol", color: "#d97706", icon: "pill" },
  { medicine_id: 15, name: "Aspirin", generic_name: "Aspirin", strength: "75 mg", form: "Tablet", category: "Antiplatelet", condition_group: "Heart Disease", color: "#ef4444", icon: "pill" },
  { medicine_id: 16, name: "Clopidogrel", generic_name: "Clopidogrel", strength: "75 mg", form: "Tablet", category: "Antiplatelet", condition_group: "Heart Disease", color: "#dc2626", icon: "pill" },
  { medicine_id: 17, name: "Ramipril", generic_name: "Ramipril", strength: "5 mg", form: "Capsule", category: "ACE Inhibitor", condition_group: "Heart Disease", color: "#b91c1c", icon: "capsule" },
  { medicine_id: 18, name: "Ibuprofen", generic_name: "Ibuprofen", strength: "400 mg", form: "Tablet", category: "NSAID", condition_group: "Arthritis", color: "#f97316", icon: "pill" },
  { medicine_id: 19, name: "Diclofenac", generic_name: "Diclofenac", strength: "50 mg", form: "Tablet", category: "NSAID", condition_group: "Arthritis", color: "#ea580c", icon: "pill" },
  { medicine_id: 20, name: "Calcium + Vitamin D3", generic_name: "Calcium Carbonate", strength: "500 mg", form: "Tablet", category: "Supplement", condition_group: "Arthritis", color: "#eab308", icon: "pill" },
  { medicine_id: 21, name: "Ferrous Sulfate", generic_name: "Ferrous Sulfate", strength: "200 mg", form: "Tablet", category: "Iron Supplement", condition_group: "Anemia", color: "#78350f", icon: "pill" },
  { medicine_id: 22, name: "Folic Acid", generic_name: "Folic Acid", strength: "5 mg", form: "Tablet", category: "Vitamin", condition_group: "Anemia", color: "#84cc16", icon: "pill" },
  { medicine_id: 23, name: "Vitamin B12", generic_name: "Methylcobalamin", strength: "1500 mcg", form: "Tablet", category: "Vitamin", condition_group: "Anemia", color: "#ec4899", icon: "pill" },
  { medicine_id: 24, name: "Sertraline", generic_name: "Sertraline", strength: "50 mg", form: "Tablet", category: "Antidepressant", condition_group: "Depression/Anxiety", color: "#a855f7", icon: "pill" },
  { medicine_id: 25, name: "Escitalopram", generic_name: "Escitalopram", strength: "10 mg", form: "Tablet", category: "Antidepressant", condition_group: "Depression/Anxiety", color: "#9333ea", icon: "pill" },
  { medicine_id: 26, name: "Levetiracetam", generic_name: "Levetiracetam", strength: "500 mg", form: "Tablet", category: "Anticonvulsant", condition_group: "Epilepsy", color: "#6366f1", icon: "capsule" },
  { medicine_id: 27, name: "Pantoprazole", generic_name: "Pantoprazole", strength: "40 mg", form: "Tablet", category: "Antacid/PPI", condition_group: "General", color: "#14b8a6", icon: "capsule" },
  { medicine_id: 28, name: "Cetirizine", generic_name: "Cetirizine", strength: "10 mg", form: "Tablet", category: "Antihistamine", condition_group: "General", color: "#06b6d4", icon: "pill" },
  { medicine_id: 29, name: "Paracetamol", generic_name: "Paracetamol", strength: "500 mg", form: "Tablet", category: "Analgesic", condition_group: "General", color: "#64748b", icon: "pill" },
  { medicine_id: 30, name: "Multivitamin", generic_name: "Multivitamin", strength: "1 tab", "form": "Tablet", category: "Supplement", condition_group: "General", color: "#facc15", icon: "capsule" }
];

// Initial user prescription schedules for an elderly patient (e.g. Margaret Davis, 74)
const DEFAULT_USER_MEDS = [
  {
    id: "med-1",
    name: "Metformin",
    strength: "500 mg",
    form: "Tablet",
    category: "Antidiabetic",
    condition: "Type 2 Diabetes",
    slot: "Morning",
    time: "08:00",
    food: "After Breakfast",
    status: "Taken",
    takenAt: "08:12",
    color: "#3b82f6",
    instructions: "Take with full glass of water. Do not skip meals."
  },
  {
    id: "med-2",
    name: "Amlodipine",
    strength: "5 mg",
    form: "Tablet",
    category: "Antihypertensive",
    condition: "Hypertension",
    slot: "Morning",
    time: "08:00",
    food: "With Breakfast",
    status: "Taken",
    takenAt: "08:14",
    color: "#10b981",
    instructions: "Monitor blood pressure regularly."
  },
  {
    id: "med-3",
    name: "Calcium + Vitamin D3",
    strength: "500 mg",
    form: "Tablet",
    category: "Supplement",
    condition: "Arthritis / Bone Health",
    slot: "Afternoon",
    time: "13:00",
    food: "After Lunch",
    status: "Pending",
    takenAt: null,
    color: "#eab308",
    instructions: "Helps joint lubrication and bone density."
  },
  {
    id: "med-4",
    name: "Atorvastatin",
    strength: "10 mg",
    form: "Tablet",
    category: "Statin",
    condition: "High Cholesterol",
    slot: "Bedtime",
    time: "21:00",
    food: "Before Sleep",
    status: "Pending",
    takenAt: null,
    color: "#f59e0b",
    instructions: "Best taken at bedtime for maximum lipid reduction."
  },
  {
    id: "med-5",
    name: "Salbutamol Inhaler",
    strength: "100 mcg",
    form: "Inhaler",
    category: "Bronchodilator",
    condition: "Asthma",
    slot: "Evening",
    time: "18:00",
    food: "As Needed / Evening",
    status: "Pending",
    takenAt: null,
    color: "#0ea5e9",
    instructions: "2 puffs. Rinse mouth after inhaling."
  }
];

// Past 7 days adherence historical data for the visualizer
const DEFAULT_WEEKLY_DATA = [
  { day: "Mon", date: "Oct 19", taken: 5, missed: 0, delayed: 0, adherence: 100 },
  { day: "Tue", date: "Oct 20", taken: 4, missed: 1, delayed: 0, adherence: 80 },
  { day: "Wed", date: "Oct 21", taken: 5, missed: 0, delayed: 1, adherence: 100 },
  { day: "Thu", date: "Oct 22", taken: 4, missed: 0, delayed: 1, adherence: 100 },
  { day: "Fri", date: "Oct 23", taken: 3, missed: 1, delayed: 1, adherence: 75 },
  { day: "Sat", date: "Oct 24", taken: 2, missed: 0, delayed: 0, adherence: 100 }, // Today
  { day: "Sun", date: "Oct 25", taken: 0, missed: 0, delayed: 0, adherence: 0 }
];

// Population stats pre-analyzed from the 15,000 dataset for instant dashboard insights
const DATASET_15K_METRICS = {
  totalRecords: 15000,
  uniquePatients: 400,
  averageAge: 71.4,
  elderlyPercentage: 78.2,
  overallAdherenceRate: 83.6,
  statusBreakdown: {
    taken: 10420,
    delayed: 2120,
    missed: 1680,
    skipped: 780
  },
  topMissedReasons: [
    { reason: "Forgot due to confusion / memory lapse", count: 864, pct: 51.4 },
    { reason: "Fell asleep / missed sound alarm", count: 488, pct: 29.0 },
    { reason: "Out of home without pillbox", count: 328, pct: 19.5 }
  ],
  conditionAdherence: [
    { condition: "Hypertension", adherence: 88.4, risk: "Low" },
    { condition: "Type 2 Diabetes", adherence: 84.2, risk: "Moderate" },
    { condition: "Heart Disease", adherence: 89.1, risk: "Low" },
    { condition: "Asthma", adherence: 78.5, risk: "High (Inhaler omission)" },
    { condition: "Arthritis", adherence: 79.8, risk: "Moderate" },
    { condition: "Depression/Anxiety", adherence: 74.3, risk: "Critical (Discontinuation)" }
  ]
};
