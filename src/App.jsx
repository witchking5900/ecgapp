import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, 
  BookOpen, 
  Brain, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Info,
  RefreshCw,
  Stethoscope,
  Globe,
  Download,
  Play,
  Pause,
  SplitSquareHorizontal,
  Eye,
  Settings,
  Zap,
  Layers,
  AlertTriangle,
  Heart
} from 'lucide-react';

// --- Constants (Moved to function scope to avoid reference errors) ---
const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 200;

/**
 * LOCALIZATION & TEXT DATA
 */
const TRANSLATIONS = {
  en: {
    appTitle: "CardioLearn",
    edition: "MedStudent Edition",
    studyMode: "Study Mode",
    quizMode: "Quiz Mode",
    compareMode: "ECG Comparison",
    simulatorMode: "Live Simulator", // New Tab
    installApp: "Install App",
    selectCondition: "Select Condition",
    quickTipTitle: "Quick Tip",
    selectRhythmTip: "Select a rhythm to see a quick tip.",
    spotDiagnosis: "Spot Diagnosis",
    identifyRhythm: "Identify the rhythm shown on the monitor strip.",
    score: "Score",
    hr: "HR",
    analyze: "Analyze the rate, regularity, and waveforms carefully.",
    correct: "Correct!",
    incorrect: "Incorrect",
    rhythmWas: "The rhythm was",
    why: "Why?",
    nextCase: "Next Case",
    regularity: "Regularity",
    pWave: "P-Wave",
    qrsComplex: "QRS Complex",
    pathophysiology: "Pathophysiology",
    clinicalManagement: "Clinical Management",
    leadII: "Lead II",
    compareTitle: "Rhythm Comparison Tool",
    compareInstr: "Select two rhythms to compare side-by-side against Normal Sinus Rhythm.",
    rhythmA: "Rhythm A",
    rhythmB: "Rhythm B",
    baseline: "Baseline (NSR)",
    controls: "Rhythm Controls",
    
    // Simulation Specific
    liveView: "LIVE VIEW",
    scroll: "Scroll:",
    pattern: "Pattern",
    grouping: "Grouping",
    mechAction: "Mechanical Action",
    currPhase: "Current Phase",
    beatDropped: "BEAT DROPPED",
    ectopic: "ECTOPIC BEAT",
    sgarbossa: "Sgarbossa Criteria (STEMI in LBBB):",
    prematureControls: "Premature Controls",
    slow: "Slow",
    fast: "Fast",
    
    // Phases
    p_wave: "Atrial Contraction",
    pr_segment: "AV Delay (Filling)",
    qrs: "Ventricular Contraction",
    st_segment: "Ventricles Emptying",
    t_wave: "Repolarization",
    rest: "Diastole (Relaxation)",
    
    // Patterns
    random: "Random",
    bigeminy: "Bigeminy",
    trigeminy: "Trigeminy",
    quadrigeminy: "Quadrigeminy",
    single: "Single",
    couplet: "Couplet",
    triplet: "Triplet",
    quadruplet: "Quadruplet",
  },
  ka: {
    appTitle: "CardioLearn",
    edition: "სტუდენტური გამოცემა",
    studyMode: "სწავლის რეჟიმი",
    quizMode: "ტესტირების რეჟიმი",
    compareMode: "ECG შედარება",
    simulatorMode: "ლაივ სიმულატორი", // New Tab
    installApp: "აპლიკაციის დაყენება",
    selectCondition: "აირჩიეთ მდგომარეობა",
    quickTipTitle: "სწრაფი რჩევა",
    selectRhythmTip: "აირჩიეთ რიტმი რჩევის სანახავად.",
    spotDiagnosis: "მყისიერი დიაგნოზი",
    identifyRhythm: "ამოიცანით ეკგ რიტმი მონიტორზე.",
    score: "ქულა",
    hr: "HR",
    analyze: "ყურადღებით გააანალიზეთ სიხშირე, რეგულარობა და კბილები.",
    correct: "სწორია!",
    incorrect: "არასწორია",
    rhythmWas: "ეს რიტმი იყო",
    why: "რატომ?",
    nextCase: "შემდეგი შემთხვევა",
    regularity: "რეგულარობა",
    pWave: "P-კბილი",
    qrsComplex: "QRS კომპლექსი",
    pathophysiology: "პათოფიზიოლოგია",
    clinicalManagement: "კლინიკური მართვა",
    leadII: "განხრა II",
    compareTitle: "რიტმების შედარება",
    compareInstr: "აირჩიეთ ორი რიტმი შესადარებლად ნორმალური სინუსური რიტმის ფონზე.",
    rhythmA: "რიტმი A",
    rhythmB: "რიტმი B",
    baseline: "ნორმა (NSR)",
    controls: "რიტმის კონტროლი",
    
    // Simulation Specific
    liveView: "ლაივ რეჟიმი",
    scroll: "სიჩქარე:",
    pattern: "პატერნი",
    grouping: "დაჯგუფება",
    mechAction: "მექანიკური მოქმედება",
    currPhase: "მიმდინარე ფაზა",
    beatDropped: "დარტყმა გამოტოვებულია",
    ectopic: "ექტოპიური დარტყმა",
    sgarbossa: "სგარბოსას კრიტერიუმები (STEMI LBBB-ში):",
    prematureControls: "ექსტრასისტოლის კონტროლი",
    slow: "ნელა",
    fast: "სწრაფად",

    // Phases
    p_wave: "წინაგულების შეკუმშვა",
    pr_segment: "AV დაყოვნება (შევსება)",
    qrs: "პარკუჭების შეკუმშვა",
    st_segment: "პარკუჭების დაცლა",
    t_wave: "რეპოლარიზაცია",
    rest: "დიასტოლა (მოდუნება)",

    // Patterns
    random: "შემთხვევითი",
    bigeminy: "ბიგემინია",
    trigeminy: "ტრიგემინია",
    quadrigeminy: "კვადრიგემინია",
    single: "ერთეული",
    couplet: "წყვილი",
    triplet: "ტრიპლეტი",
    quadruplet: "კვადრიპლეტი",
  }
};

// --- RHYTHM DEFINITIONS ---
const RHYTHMS = {
  NSR: {
    id: 'NSR',
    name_en: "Normal Sinus Rhythm", name_ka: "ნორმალური სინუსური რიტმი",
    bpm: 70,
    desc_en: "Normal electrical activity. Impulse starts in SA node, travels to AV node, then ventricles.",
    desc_ka: "ნორმალური ელექტრული აქტივობა. იმპულსი იწყება SA კვანძში, გადადის AV კვანძში, შემდეგ პარკუჭებში.",
    mgmt_en: "None required.", mgmt_ka: "არ მოითხოვს ჩარევას.",
    regular: true, hasP: true, qrsWidth: 1,
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 0, 0, -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], 
    interval: 40, randomness: 2, noise: 0 
  },
  SB: {
    id: 'SB',
    name_en: "Sinus Bradycardia", name_ka: "სინუსური ბრადიკარდია",
    bpm: 45,
    desc_en: "Normal rhythm but slow (<60 BPM).", desc_ka: "ნორმალური რიტმი, თუმცა შენელებული (<60 დარტყმა/წთ).",
    mgmt_en: "Monitor. Atropine/Pacing if symptomatic.", mgmt_ka: "მონიტორინგი. ატროპინი/პეისმეიკერი თუ სიმპტომურია.",
    regular: true, hasP: true, qrsWidth: 1,
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 0, 0, -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], 
    interval: 90, randomness: 2, noise: 0 
  },
  ST: {
    id: 'ST',
    name_en: "Sinus Tachycardia", name_ka: "სინუსური ტაქიკარდია",
    bpm: 120,
    desc_en: "Normal rhythm but fast (>100 BPM).", desc_ka: "ნორმალური რიტმი, თუმცა აჩქარებული (>100 დარტყმა/წთ).",
    mgmt_en: "Treat underlying cause (pain, fever, hypovolemia).", mgmt_ka: "გამომწვევი მიზეზის მკურნალობა (ტკივილი, ცხელება, ჰიპოვოლემია).",
    regular: true, hasP: true, qrsWidth: 1,
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 0, 0, -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], 
    interval: 15, randomness: 1, noise: 0 
  },
  VFIB: {
    id: 'VFIB',
    name_en: "Ventricular Fibrillation", name_ka: "პარკუჭოვანი ფიბრილაცია",
    bpm: 300, 
    desc_en: "Chaotic, irregular deflections. Ventricles quiver.", desc_ka: "ქაოტური, არარეგულარული გადახრები. პარკუჭები თრთის შეკუმშვის ნაცვლად.",
    mgmt_en: "CRITICAL. Immediate CPR and Defibrillation. Fatal if untreated.", mgmt_ka: "კრიტიკული. სასწრაფო CPR და დეფიბრილაცია. ფატალურია თუ არ უმკურნალეთ.",
    type: 'chaos',
    beatShape: null, interval: 0, randomness: 0, noise: 0 
  },
  AFLUT: {
    id: 'AFLUT',
    name_en: "Atrial Flutter", name_ka: "წინაგულთა თრთოლვა",
    bpm: 150, 
    desc_en: "Macro-reentry in RA. Saw-tooth 'F' waves.", desc_ka: "მაკრო-რიენტრის წრედი მარჯვენა წინაგულში. დამახასიათებელი 'ხერხის კბილისებრი' თრთოლვის ტალღები.",
    mgmt_en: "Rate control (BB/CCB), Cardioversion/Ablation. Anticoagulation.", mgmt_ka: "სიხშირის კონტროლი (BB/CCB), კარდიოვერსია/აბლაცია. ანტიკოაგულაცია.",
    regular: true, flutter: true, qrsWidth: 1,
    beatShape: null, interval: 25, randomness: 0, noise: 0 
  },
  AFIB: {
    id: 'AFIB',
    name_en: "Atrial Fibrillation", name_ka: "წინაგულთა ფიბრილაცია",
    bpm: 130, 
    desc_en: "Irregularly irregular. No distinct P waves, replaced by chaotic fibrillatory waves.", desc_ka: "არარეგულარულად არარეგულარული. P ტალღები არ ჩანს, ჩანაცვლებულია ქაოტური ფიბრილაციური ტალღებით.",
    mgmt_en: "Rate control (BB, CCB, Digoxin). Anticoagulation. Rhythm control if unstable.", mgmt_ka: "სიხშირის კონტროლი (BB, CCB, დიგოქსინი). ანტიკოაგულაცია. რიტმის კონტროლი თუ არასტაბილურია.",
    regular: false, hasP: false, qrsWidth: 1,
    beatShape: [0, 0, -2, 35, -8, 0, 0, 0.5, 1, 3, 5, 6, 5, 3, 1, 0], interval: 35, randomness: 40, noise: 1.5 
  },
  VT: {
    id: 'VT',
    name_en: "Ventricular Tachycardia", name_ka: "პარკუჭოვანი ტაქიკარდია",
    bpm: 160,
    desc_en: "Wide complex tachycardia originating in ventricles. AV dissociation often present.", desc_ka: "ფართო კომპლექსოვანი ტაქიკარდია პარკუჭებიდან. ხშირია AV დისოციაცია.",
    mgmt_en: "Pulse? Cardioversion. No Pulse? Defibrillation + CPR (ACLS). Stable? Amiodarone.", mgmt_ka: "პულსი არის? კარდიოვერსია. პულსი არაა? დეფიბრილაცია + CPR. სტაბილური? ამიოდარონი.",
    regular: true, hasP: false, qrsWidth: 2.5, 
    beatShape: [0, 5, 10, 20, 35, 20, 0, -15, -25, -15, -5], interval: 10, randomness: 2, noise: 0.5 
  },
  WPW: {
    id: 'WPW',
    name_en: "Wolff-Parkinson-White", name_ka: "ვოლფ-პარკინსონ-უაიტი",
    bpm: 70,
    desc_en: "Accessory pathway (Bundle of Kent). Short PR, Delta Wave, Wide QRS.", desc_ka: "დამატებითი გზა (კენტის კონა). მოკლე PR, დელტა ტალღა.",
    mgmt_en: "Risk of SVT/Afib. Avoid AV blockers (Adenosine, BB, CCB, Digoxin). Ablation curative.", mgmt_ka: "SVT/Afib-ის რისკი. მოერიდეთ AV კვანძის ბლოკერებს (ABCD). აბლაცია კურნავს.",
    regular: true, hasP: true, deltaWave: true, kent: true, qrsWidth: 1.5,
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 2, 5, 10, 25, 40, 15, -10, -2, -1, 0, 1, 2, 3, 2, 1, 0], interval: 40, randomness: 2, noise: 0 
  },
  PVC_MONO: {
    id: 'PVC_MONO',
    name_en: "PVC (Monomorphic)", name_ka: "PVC (მონომორფული)",
    bpm: 70,
    desc_en: "Normal rhythm with occasional wide, bizarre ventricular beats.", desc_ka: "ნორმალური რიტმი დროგამოშვებითი ფართო, უცნაური პარკუჭოვანი დარტყმებით.",
    mgmt_en: "Treat underlying cause (electrolytes, hypoxia).", mgmt_ka: "გამომწვევი მიზეზის მკურნალობა (ელექტროლიტები, ჰიპოქსია).",
    ectopic: 'ventricle', hasP: true, premature: true, qrsWidth: 1, 
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 0, 0, -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], interval: 40, randomness: 1, noise: 0 
  },
  PVC_POLY: {
    id: 'PVC_POLY',
    name_en: "PVC (Polymorphic)", name_ka: "PVC (პოლიმორფული)",
    bpm: 70,
    desc_en: "Normal rhythm with PVCs of varying shapes (multifocal).", desc_ka: "ნორმალური რიტმი სხვადასხვა ფორმის PVC-ებით (მულტიფოკალური).",
    mgmt_en: "Suggests instability. Check K+, Mg+. Risk of R-on-T.", mgmt_ka: "მიუთითებს არასტაბილურობაზე. შეამოწმეთ K+, Mg+. R-on-T რისკი.",
    ectopic: 'ventricle_poly', hasP: true, premature: true, qrsWidth: 1,
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 0, 0, -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], interval: 40, randomness: 1, noise: 0 
  },
  PAC_HIGH: {
    id: 'PAC_HIGH',
    name_en: "PAC (High Atrium)", name_ka: "PAC (მაღალი წინაგული)",
    bpm: 70,
    desc_en: "Normal rhythm with occasional early beats from high atrium.", desc_ka: "ნორმალური რიტმი დროგამოშვებითი ადრეული დარტყმებით მაღალი წინაგულიდან.",
    mgmt_en: "Benign. Reduce triggers (caffeine, stress).", mgmt_ka: "კეთილთვისებიანი. შეამცირეთ ტრიგერები (კოფეინი, სტრესი).",
    ectopic: 'high_atrium', hasP: true, premature: true, qrsWidth: 1,
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 0, 0, -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], interval: 40, randomness: 1, noise: 0 
  },
  PAC_MID: {
    id: 'PAC_MID',
    name_en: "PAC (Mid Atrium)", name_ka: "PAC (შუა წინაგული)",
    bpm: 70,
    desc_en: "Normal rhythm with occasional early beats from mid atrium.", desc_ka: "ნორმალური რიტმი ადრეული დარტყმებით შუა წინაგულიდან.",
    mgmt_en: "Benign.", mgmt_ka: "კეთილთვისებიანი.",
    ectopic: 'mid_atrium', hasP: true, premature: true, qrsWidth: 1,
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 0, 0, -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], interval: 40, randomness: 1, noise: 0 
  },
  PAC_LOW: {
    id: 'PAC_LOW',
    name_en: "PAC (Low Atrium)", name_ka: "PAC (დაბალი წინაგული)",
    bpm: 70,
    desc_en: "Normal rhythm with occasional early beats from low atrium.", desc_ka: "ნორმალური რიტმი ადრეული დარტყმებით დაბალი წინაგულიდან.",
    mgmt_en: "Benign.", mgmt_ka: "კეთილთვისებიანი.",
    ectopic: 'low_atrium', hasP: true, premature: true, qrsWidth: 1,
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 0, 0, -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], interval: 40, randomness: 1, noise: 0 
  },
  LBBB: {
    id: 'LBBB',
    name_en: "Left Bundle Branch Block", name_ka: "ჰისის მარცხენა ფეხის ბლოკადა (LBBB)",
    bpm: 70,
    desc_en: "Block in left bundle. Wide, notched ('M') R in lateral leads.", desc_ka: "ბლოკადა მარცხენა ფეხში. ფართო, ორკუზიანი ('M') R ტალღა ლატერალურ განხრებში.",
    mgmt_en: "New LBBB + Chest Pain = STEMI equivalent (Sgarbossa Criteria).", mgmt_ka: "ახალი LBBB + ტკივილი მკერდში = STEMI ეკვივალენტი (სგარბოსას კრიტერიუმები).",
    sgarbossa_en: "Concordant STE ≥1mm; Concordant depression ≥1mm V1-V3; Excessive discordant STE.", sgarbossa_ka: "კონკორდატული STE ≥1მმ; კონკორდატული დეპრესია ≥1მმ V1-V3; ჭარბი დისკორდატული STE.",
    regular: true, hasP: true, qrsWidth: 2.5, morphology: 'notched', delay: 'left',
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 0, 0, -2, 15, 32, 25, 38, 20, -5, -3, -4, -6, -8, -9, -8, -6, -4, -2, 0], interval: 40, randomness: 2, noise: 0 
  },
  RBBB: {
    id: 'RBBB',
    name_en: "Right Bundle Branch Block", name_ka: "ჰისის მარჯვენა ფეხის ბლოკადა (RBBB)",
    bpm: 70,
    desc_en: "Block in right bundle. RSR' ('M') pattern in V1.", desc_ka: "ბლოკადა მარჯვენა ფეხში. RSR' ('M') პატერნი V1-ში.",
    mgmt_en: "Normal variant or RV strain (PE, Cor Pulmonale).", mgmt_ka: "ნორმის ვარიანტი ან მარჯვენა პარკუჭის გადაძაბვა (PE, Cor Pulmonale).",
    regular: true, hasP: true, qrsWidth: 2.5, morphology: 'rsr', delay: 'right',
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 0, 0, 5, -15, 35, -10, -2, -4, -6, -5, -3, -1, 0], interval: 40, randomness: 2, noise: 0 
  },
  AV1: {
    id: 'AV1',
    name_en: "1st Degree AV Block", name_ka: "I ხარისხის AV ბლოკადა",
    bpm: 70,
    desc_en: "Fixed PR prolongation (>0.20s).", desc_ka: "ფიქსირებული PR გახანგრძლივება (>0.20წმ).",
    mgmt_en: "Benign. Monitor.", mgmt_ka: "კეთილთვისებიანი. მონიტორინგი.",
    regular: true, hasP: true, prLong: true, qrsWidth: 1,
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, ...Array(12).fill(0), -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], interval: 40, randomness: 1, noise: 0 
  },
  AV2_1: {
    id: 'AV2_1',
    name_en: "2nd Degree AV Block (Type I)", name_ka: "II ხარისხის AV ბლოკადა (ტიპი 1)",
    bpm: 70,
    desc_en: "Wenckebach. Progressive PR lengthening until drop.", desc_ka: "ვენკებახი. PR-ის პროგრესული გახანგრძლივება კომპლექსის ჩავარდნამდე.",
    mgmt_en: "Often benign (vagal tone, drugs).", mgmt_ka: "ხშირად კეთილთვისებიანი (ვაგუსი, მედიკამენტები).",
    type: 'wenckebach', hasP: true, qrsWidth: 1,
    beatShape: null, interval: 35, randomness: 1, noise: 0 
  },
  AV2_2: {
    id: 'AV2_2',
    name_en: "2nd Degree AV Block (Type II)", name_ka: "II ხარისხის AV ბლოკადა (ტიპი 2)",
    bpm: 60,
    desc_en: "Mobitz II. Random drops without PR lengthening.", desc_ka: "მობიტც II. შემთხვევითი ჩავარდნები PR-ის გახანგრძლივების გარეშე.",
    mgmt_en: "High risk of Complete Block. Pacemaker indicated.", mgmt_ka: "სრული ბლოკადის განვითარების მაღალი რისკი. ჩვეულებრივ საჭიროა პეისმეიკერი.",
    type: 'mobitz2', hasP: true, qrsWidth: 1,
    beatShape: null, interval: 35, randomness: 0.5, noise: 0 
  },
  AV3: {
    id: 'AV3',
    name_en: "3rd Degree AV Block", name_ka: "III ხარისხის AV ბლოკადა",
    bpm: 40, 
    desc_en: "Complete Heart Block. AV dissociation.", desc_ka: "გულის სრული ბლოკადა. AV დისოციაცია.",
    mgmt_en: "Medical emergency. Pacemaker required.", mgmt_ka: "სამედიცინო გადაუდებელი მდგომარეობა. საჭიროა პეისმეიკერი.",
    type: 'complete_block', qrsWidth: 2.5, 
    beatShape: null, interval: 0, randomness: 0, noise: 0 
  },
  SSS: {
    id: 'SSS',
    name_en: "Sick Sinus Syndrome", name_ka: "სინუსის სისუსტის სინდრომი",
    bpm: 60, 
    desc_en: "SA node dysfunction. Tachy-brady syndrome, pauses.", desc_ka: "SA კვანძის დისფუნქცია. ტაქი-ბრადი სინდრომი, პაუზები.",
    mgmt_en: "Pacemaker for brady, meds for tachy.", mgmt_ka: "პეისმეიკერი ბრადიკარდიისთვის, მედიკამენტები ტაქიკარდიისთვის.",
    type: 'sss', hasP: true, qrsWidth: 1,
    beatShape: [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0, 0, 0, 0, -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], interval: 40, randomness: 2, noise: 0 
  },
  LAH: {
    id: 'LAH',
    name_en: "Left Atrial Hypertrophy", name_ka: "მარცხენა წინაგულის ჰიპერტროფია",
    bpm: 70,
    desc_en: "P Mitrale. Wide, notched P-wave.", desc_ka: "P Mitrale. ფართო, ორკუზიანი P-ტალღა.",
    mgmt_en: "Treat underlying cause (HTN, Valves).", mgmt_ka: "გამომწვევი მიზეზის მკურნალობა (წნევა, სარქველები).",
    regular: true, hasP: true, pMorph: 'bifid', qrsWidth: 1, delay: 'left_atrium',
    beatShape: [0, 0.5, 1.5, 2.5, 3, 2.2, 2, 2.2, 3, 2.5, 1.5, 0.5, 0, 0, 0, -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], interval: 40, randomness: 2, noise: 0 
  },
  RAH: {
    id: 'RAH',
    name_en: "Right Atrial Hypertrophy", name_ka: "მარჯვენა წინაგულის ჰიპერტროფია",
    bpm: 70,
    desc_en: "P Pulmonale. Tall P-wave.", desc_ka: "P Pulmonale. მაღალი P-ტალღა.",
    mgmt_en: "Treat pulmonary cause (COPD, Pulm HTN).", mgmt_ka: "ფილტვისმიერი მიზეზის მკურნალობა (COPD, პულმ. ჰიპერტენზია).",
    regular: true, hasP: true, pMorph: 'peaked', qrsWidth: 1, force: 'right_atrium',
    beatShape: [0, 2, 4, 6, 7.5, 6, 4, 2, 0, 0, 0, 0, -2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0], interval: 40, randomness: 2, noise: 0 
  },
};

// ... (SEGMENTS - Unchanged) ...
const P_WAVE_NORMAL = [0, 1, 2, 2.5, 3, 2.5, 2, 1, 0];
const P_WAVE_M_SHAPE = [0, 0.5, 1.5, 2.5, 3, 2.2, 2, 2.2, 3, 2.5, 1.5, 0.5, 0];
const P_WAVE_TALL = [0, 2, 4, 6, 7.5, 6, 4, 2, 0];
const P_WAVE_BIPHASIC = [0, 1.5, 2.5, 1, 0, -1, -2.5, -1.5, 0];
const P_WAVE_INVERTED = [0, -1, -2, -2.5, -3, -2.5, -2, -1, 0];
const FLUTTER_WAVE = [0, -2, -4, -6, -8, -5, -2, 0, 1, 2, 1, 0];
const QRS_T_NORMAL = [-2, 35, -8, 0, 0, 0, 0, 0.5, 1, 2, 3, 5, 6, 6.5, 6, 5, 3, 2, 1, 0.5, 0];
const QRS_WIDE_ESCAPE = [-2, 10, 25, 10, -10, -20, -10, 0, 0, 0, 2, 4, 6, 8, 6, 4, 2, 0];
const PVC_A = [0, 0, -5, 10, 45, 15, -15, -30, -10, -5, -8, -10, -8, -5, -2, 0];
const PVC_B = [0, 0, 5, -10, -45, -15, 15, 30, 10, 5, 8, 10, 8, 5, 2, 0];
const PVC_C = [0, 0, -5, 20, 10, 40, 5, -20, -10, -5, -7, -5, -3, -1, 0];
const WPW_COMPLEX = [...P_WAVE_NORMAL, 0, 2, 5, 10, 25, 40, 15, -10, -2, -1, 0, 1, 2, 3, 2, 1, 0];
const NORMAL_COMPLEX = [...P_WAVE_NORMAL, 0, 0, 0, ...QRS_T_NORMAL];
const PAC_MID_COMPLEX = [...P_WAVE_BIPHASIC, 0, 0, 0, ...QRS_T_NORMAL];
const PAC_LOW_COMPLEX = [...P_WAVE_INVERTED, 0, 0, 0, ...QRS_T_NORMAL];
const LBBB_COMPLEX = [...P_WAVE_NORMAL, 0, 0, 0, -2, 15, 32, 25, 38, 20, -5, -3, -4, -6, -8, -9, -8, -6, -4, -2, 0];
const RBBB_COMPLEX = [...P_WAVE_NORMAL, 0, 0, 0, 5, -15, 35, -10, -2, -4, -6, -5, -3, -1, 0];
const LAH_COMPLEX = [...P_WAVE_M_SHAPE, 0, 0, ...QRS_T_NORMAL];
const RAH_COMPLEX = [...P_WAVE_TALL, 0, 0, 0, ...QRS_T_NORMAL];
const AVB1_COMPLEX = [...P_WAVE_NORMAL, ...Array(12).fill(0), ...QRS_T_NORMAL]; 
const VTACH_COMPLEX = [0, 5, 10, 20, 35, 20, 0, -15, -25, -15, -5];
const AFIB_COMPLEX = [0, 0, -2, 35, -8, 0, 0, 0.5, 1, 3, 5, 6, 5, 3, 1, 0];

// --- LEGACY STATIC ENGINE (For Quiz/Compare Modes) ---
const ECGGraphStatic = ({ rhythmId, isRunning = true, width = null, height = 200 }) => {
  const canvasRef = useRef(null);
  const dataPoints = useRef([]);
  const xOffset = useRef(0);
  const GRID_SIZE = 20; 
  const SPEED = 1.5; 

  const generatePoints = useCallback(() => {
    const rhythm = RHYTHMS[rhythmId] || RHYTHMS.NSR; // Fallback
    let points = [];
    let x = 0;
    const X_STEP = 2; 
    const TOTAL_STEPS = 10000; 

    if (rhythmId === 'VFIB') {
      for (let i = 0; i < TOTAL_STEPS; i++) {
        const y = Math.sin(i * 0.1) * 10 + Math.sin(i * 0.25 + Math.random()) * 8 + Math.sin(i * 0.5 + Math.random()) * 5 + (Math.random() * 4 - 2); 
        points.push({ x: i * X_STEP, y: -y });
      }
      return points;
    }
    if (rhythmId === 'AFLUT') {
      const yBuffer = new Array(TOTAL_STEPS).fill(0);
      const F_WAVE_INTERVAL = 12; 
      for (let i = 0; i < TOTAL_STEPS; i += F_WAVE_INTERVAL) { FLUTTER_WAVE.forEach((val, idx) => { if (i + idx < TOTAL_STEPS) yBuffer[i + idx] = val; }); }
      let fWaveCount = 0;
      for (let i = 0; i < TOTAL_STEPS; i += F_WAVE_INTERVAL) {
        if (fWaveCount % 3 === 0) {
          const qrsOffset = i + 5; 
          QRS_T_NORMAL.forEach((val, idx) => { if (qrsOffset + idx < TOTAL_STEPS) yBuffer[qrsOffset + idx] = val + (yBuffer[qrsOffset + idx] * 0.5); });
        }
        fWaveCount++;
      }
      for (let i = 0; i < TOTAL_STEPS; i++) { points.push({ x: i * X_STEP, y: -yBuffer[i] }); }
      return points;
    }
    if (rhythmId === 'AVB3') {
       const yBuffer = new Array(TOTAL_STEPS).fill(0);
       const P_INTERVAL = 60; 
       for (let i = 0; i < TOTAL_STEPS; i += P_INTERVAL) { P_WAVE_NORMAL.forEach((val, idx) => { if (i + idx < TOTAL_STEPS) yBuffer[i + idx] += val; }); }
       const QRS_INTERVAL = 140; 
       const OFFSET = 30;
       for (let i = OFFSET; i < TOTAL_STEPS; i += QRS_INTERVAL) { QRS_WIDE_ESCAPE.forEach((val, idx) => { if (i + idx < TOTAL_STEPS) yBuffer[i + idx] += val; }); }
       for (let i = 0; i < TOTAL_STEPS; i++) { points.push({ x: i * X_STEP, y: -yBuffer[i] }); }
       return points;
    }

    let sssBeatCounter = 0;
    let wenckebachCycle = 0; 
    let mobitz2Cycle = 0; 
    let pacCycle = 0; 
    let pvcCycle = 0;
    
    for (let i = 0; i < 200; i++) {
      let currentInterval = rhythm.interval + (Math.random() * rhythm.randomness);
      let currentBeatShape = rhythm.beatShape;
      
      // Legacy Logic
      if (rhythmId === 'PVC_MONO') {
         if (pvcCycle < 3) { currentBeatShape = NORMAL_COMPLEX; currentInterval = 40; } 
         else if (pvcCycle === 3) { currentBeatShape = PVC_A; currentInterval = 18; } 
         else { currentBeatShape = NORMAL_COMPLEX; currentInterval = 70; }
         pvcCycle = (pvcCycle + 1) % 5;
      }
      else if (rhythmId === 'PVC_POLY') {
         if (pvcCycle < 3) { currentBeatShape = NORMAL_COMPLEX; currentInterval = 40; } 
         else if (pvcCycle === 3) {
           const rand = Math.random();
           if (rand < 0.33) currentBeatShape = PVC_A; else if (rand < 0.66) currentBeatShape = PVC_B; else currentBeatShape = PVC_C;
           currentInterval = 18; 
         } else { currentBeatShape = NORMAL_COMPLEX; currentInterval = 70; }
         pvcCycle = (pvcCycle + 1) % 5;
      }
      else if (rhythmId === 'PAC_HIGH') { if (pacCycle < 2) currentInterval = 40; else if (pacCycle === 2) currentInterval = 18; else currentInterval = 65; pacCycle = (pacCycle + 1) % 4; }
      else if (rhythmId === 'PAC_MID') { if (pacCycle < 2) { currentBeatShape = NORMAL_COMPLEX; currentInterval = 40; } else if (pacCycle === 2) { currentBeatShape = PAC_MID_COMPLEX; currentInterval = 18; } else { currentBeatShape = NORMAL_COMPLEX; currentInterval = 65; } pacCycle = (pacCycle + 1) % 4; }
      else if (rhythmId === 'PAC_LOW') { if (pacCycle < 2) { currentBeatShape = NORMAL_COMPLEX; currentInterval = 40; } else if (pacCycle === 2) { currentBeatShape = PAC_LOW_COMPLEX; currentInterval = 18; } else { currentBeatShape = NORMAL_COMPLEX; currentInterval = 65; } pacCycle = (pacCycle + 1) % 4; }
      else if (rhythmId === 'AVB2T2') { if (mobitz2Cycle < 2) { currentBeatShape = NORMAL_COMPLEX; currentInterval = 40; } else { currentBeatShape = [...P_WAVE_NORMAL]; currentInterval = 40 + 24; } mobitz2Cycle = (mobitz2Cycle + 1) % 3; }
      else if (rhythmId === 'AVB2T1') { if (wenckebachCycle < 3) { const pr = 3 + (wenckebachCycle * 5); currentBeatShape = [...P_WAVE_NORMAL, ...Array(pr).fill(0), ...QRS_T_NORMAL]; currentInterval = 35; } else { currentBeatShape = [...P_WAVE_NORMAL]; currentInterval = 60; } wenckebachCycle = (wenckebachCycle + 1) % 4; }
      else if (rhythmId === 'SSS') { if (sssBeatCounter < 6) currentInterval = 18; else currentInterval = 200; sssBeatCounter = (sssBeatCounter + 1) % 7; }

      for (let j = 0; j < currentInterval; j++) {
        const noiseY = rhythm.noise > 0 ? (Math.random() * rhythm.noise * 2 - rhythm.noise) : 0;
        points.push({ x: x, y: noiseY });
        x += X_STEP;
      }
      if (currentBeatShape) {
        currentBeatShape.forEach(val => {
          points.push({ x: x, y: -val }); 
          x += X_STEP;
        });
      }
    }
    return points;
  }, [rhythmId]);

  useEffect(() => { dataPoints.current = generatePoints(); xOffset.current = 0; }, [rhythmId, generatePoints]);

  const draw = useCallback((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fff0f5'; ctx.fillRect(0, 0, w, h);
    
    // Grid
    ctx.lineWidth = 0.5; ctx.strokeStyle = '#ffc0cb'; ctx.beginPath();
    for (let x = 0; x < w; x += GRID_SIZE) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = 0; y < h; y += GRID_SIZE) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();
    
    const centerY = h / 2; 
    ctx.beginPath(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#000000'; 
    const points = dataPoints.current;
    let started = false;
    const drawAll = width !== null; 
    for (let i = 0; i < points.length; i++) {
      const px = points[i].x - (drawAll ? 0 : xOffset.current);
      const py = centerY + points[i].y;
      if (drawAll || (px >= -20 && px <= w + 20)) {
        if (!started) { ctx.moveTo(px, py); started = true; } else { ctx.lineTo(px, py); }
      }
    }
    ctx.stroke();
    if (isRunning && !drawAll) {
      xOffset.current += SPEED;
      if (xOffset.current > (points[points.length - 1].x - w)) xOffset.current = 0;
    }
  }, [isRunning, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const render = () => {
      canvas.width = width || canvas.parentElement.offsetWidth;
      canvas.height = height; 
      draw(ctx, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [draw, width, height]);

  return (
    <div className={`relative group ${width ? 'overflow-visible' : 'w-full'}`}> 
      <canvas ref={canvasRef} className="block cursor-crosshair" style={{ width: width ? `${width}px` : '100%', height: `${height}px` }} />
    </div>
  );
};

const CompareCard = ({ rhythmId, t, lang }) => {
  const [isPaused, setIsPaused] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <span className="font-bold text-slate-700">{RHYTHMS[rhythmId][`name_${lang}`] || rhythmId}</span>
        <button onClick={() => setIsPaused(!isPaused)} className="p-1 rounded hover:bg-slate-200 transition-colors text-slate-700">
          {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
        </button>
      </div>
      <div className="w-full">
        <ECGGraphStatic rhythmId={rhythmId} isRunning={!isPaused} />
      </div>
      <div className="p-4 flex items-center gap-4">
        <p className="text-xs text-slate-500 flex-1">{RHYTHMS[rhythmId][`desc_${lang}`]}</p>
      </div>
    </div>
  );
};

// --- HEART ANATOMY COMPONENT (From Chat) ---
const HeartAnimation = ({ phase, rhythmKey, meta }) => {
  const rhythm = RHYTHMS[rhythmKey];
  
  // Colors
  const cBase = "#e2e8f0"; 
  const cActive = "#ef4444"; 
  const cElec = "#94a3b8"; 
  const cElecActive = "#fbbf24";
  const cElecKent = "#10b981"; // Green for Kent
  const cEctopic = "#f43f5e"; // Pinkish for ectopic

  // State extraction
  const isP = phase === 'p_wave';
  const isPR = phase === 'pr_segment';
  const isQRS = phase === 'qrs';
  const isST = phase === 'st_segment';
  
  // Anatomical Logic
  let saActive = isP;
  if (rhythm.type === 'sss' && meta?.pause) saActive = false;
  if (rhythm.name_en.includes("Fibrillation")) saActive = Math.random() > 0.5;

  let raActive = isP;
  let laActive = isP;
  
  const raColor = (rhythm.force === 'right_atrium' && raActive) ? "#b91c1c" : (raActive ? cActive : cBase); 
  const laDelay = (rhythm.delay === 'left_atrium' || rhythm.delay === 'left');
  if (laDelay && isP && meta?.pProgress < 0.5) laActive = false;

  const isPremature = meta?.isPremature;
  const isHighPac = rhythm.ectopic === 'high_atrium' && isPremature;
  const isMidPac = rhythm.ectopic === 'mid_atrium' && isPremature;
  const isLowPac = rhythm.ectopic === 'low_atrium' && isPremature;
  const isPVC = (rhythm.ectopic === 'ventricle' || rhythm.ectopic === 'ventricle_poly') && isPremature;

  if (isHighPac || isMidPac || isLowPac) { saActive = false; } 

  let avColor = cElec;
  let showX = false;
  let showPermX = false;

  if (rhythm.type === 'complete_block') {
      showPermX = true; avColor = "#94a3b8"; 
  } else if (rhythm.type === 'wenckebach') {
      if (meta?.wenckCount === 0) avColor = "#fbbf24";
      if (meta?.wenckCount === 1) avColor = "#f97316";
      if (meta?.wenckCount === 2) avColor = "#ef4444";
      if (meta?.dropped) showX = true;
      if (isPR) { /* keep */ } else { avColor = cElec; }
  } else if (rhythm.type === 'mobitz2' && meta?.dropped) {
      showX = true;
  } else if (isPR) {
      avColor = cElecActive;
  }

  let vActive = isQRS || isST;
  let vColor = vActive ? cActive : cBase;
  if (rhythm.name_en.includes("Fibrillation")) vColor = Math.random() > 0.5 ? cActive : cBase;

  let bundleColor = (isQRS) ? cElecActive : cElec;
  if (rhythm.type === 'complete_block') bundleColor = (isQRS) ? cEctopic : cElec;

  const kentActive = rhythm.kent && (isPR || isQRS);

  return (
    <div className="relative w-64 h-64 mx-auto transition-all duration-100">
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
        {/* LA */}
        <path d="M110 40 C 140 40, 160 60, 160 90 C 160 100, 150 110, 110 110 Z" fill={laActive ? (laDelay ? "#ef4444" : cActive) : cBase} stroke="black" strokeWidth="2" className="transition-colors duration-100" />
        {/* RA */}
        <path d="M90 40 C 60 40, 40 60, 40 90 C 40 100, 50 110, 90 110 Z" fill={raColor} stroke="black" strokeWidth="2" className="transition-colors duration-100" />
        {/* Ventricles */}
        <path d="M40 90 C 40 150, 90 190, 100 195 C 110 190, 160 150, 160 90 L 110 110 L 90 110 Z" fill={vColor} stroke="black" strokeWidth="2" className="transition-colors duration-100" />
        
        <circle cx="65" cy="60" r="6" fill={saActive ? cElecActive : cElec} stroke="black" strokeWidth="1" />
        {isHighPac && <circle cx="75" cy="50" r="4" fill={cEctopic} className="animate-pulse" />}
        {isMidPac && <circle cx="80" cy="70" r="4" fill={cEctopic} className="animate-pulse" />}
        {isLowPac && <circle cx="90" cy="80" r="4" fill={cEctopic} className="animate-pulse" />}
        {isPVC && <circle cx="80" cy="140" r="5" fill={cEctopic} className="animate-pulse" />}

        <path d="M65 60 Q 80 70 100 85" fill="none" stroke={saActive || raActive ? cElecActive : cElec} strokeWidth="2" strokeDasharray="2,2" />
        {rhythm.kent && <path d="M140 80 Q 150 100 140 120" fill="none" stroke={kentActive ? cElecKent : "#cbd5e1"} strokeWidth="4" strokeLinecap="round" />}

        <circle cx="100" cy="85" r="7" fill={avColor} stroke="black" strokeWidth="1" />
        {showX && <text x="94" y="90" fill="black" fontSize="12" fontWeight="bold">X</text>}
        {showPermX && <text x="92" y="90" fill="red" fontSize="14" fontWeight="bold">XX</text>}

        <path d="M100 90 L 100 120" fill="none" stroke={bundleColor} strokeWidth="3" />
        <path d="M100 120 L 130 150" fill="none" stroke={bundleColor} strokeWidth={rhythm.delay === 'left' ? 1 : 3} strokeDasharray={rhythm.delay === 'left' ? "2,2" : "0"} />
        <path d="M100 120 L 70 150" fill="none" stroke={bundleColor} strokeWidth={rhythm.delay === 'right' ? 1 : 3} strokeDasharray={rhythm.delay === 'right' ? "2,2" : "0"} />
      </svg>
      {rhythm.kent && <div className="absolute top-16 right-4 text-[10px] font-bold text-emerald-600 bg-white/80 px-1 rounded">Kent Bundle</div>}
      {rhythm.type === 'complete_block' && <div className="absolute top-20 left-[40%] text-[10px] font-bold text-red-600 bg-white/80 px-1 rounded">AV DISSOCIATION</div>}
    </div>
  );
};

// --- DYNAMIC SIMULATOR COMPONENT (From Chat) ---
const SimulatorView = ({ rhythmId, t, lang }) => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPhase, setCurrentPhase] = useState('rest');
  const [metaState, setMetaState] = useState({}); 
  
  // Settings
  const [paperSpeed, setPaperSpeed] = useState('100'); 
  const [scrollSpeed, setScrollSpeed] = useState(1); 
  const [prematurePattern, setPrematurePattern] = useState('random'); 
  const [prematureGroup, setPrematureGroup] = useState('single'); 

  // Simulation Refs
  const timeRef = useRef(0); 
  const frameCountRef = useRef(0);
  const lastPointsRef = useRef([]);
  const phaseBufferRef = useRef([]); 
  const cycleRef = useRef({ start: 0, duration: 60, pTimer: 0, wenckebachCount: 0, beatCount: 0, beatsToSkipInPattern: 0, isPrematureBeat: false, droppedBeat: false, pvcMorph: 0.5 });

  const gaussian = (t, peak, center, width) => peak * Math.exp(-0.5 * Math.pow((t - center) / width, 2));

  // Re-implementing the getVoltage logic here (Simplified for brevity, full logic from chat)
  const getVoltage = useCallback((time, rhythmKey) => {
    const rhythm = RHYTHMS[rhythmKey];
    const state = cycleRef.current;
    
    // VFIB
    if (rhythmKey === 'VFIB') {
        const noise = (Math.random() - 0.5) * 15;
        const chaos = Math.sin(time * 0.2) * 20 + Math.sin(time * 0.5) * 10;
        return { val: chaos + noise, phase: 'rest', meta: {} };
    }

    let currentBPM = rhythm.bpm;
    // Beat Reset
    if (time - state.start > state.duration) {
        state.start = time;
        state.droppedBeat = false; 
        state.beatCount++;
        
        if (rhythm.premature) {
            let trigger = false;
            if (state.beatsToSkipInPattern > 0) { trigger = true; state.beatsToSkipInPattern--; }
            else {
                let match = false;
                if (prematurePattern === 'random') match = Math.random() > 0.8;
                else if (prematurePattern === 'bigeminy') match = (state.beatCount % 2 === 1);
                else if (prematurePattern === 'trigeminy') match = (state.beatCount % 3 === 2);
                else if (prematurePattern === 'quadrigeminy') match = (state.beatCount % 4 === 3);
                
                if (match) {
                    trigger = true;
                    if (prematureGroup === 'couplet') state.beatsToSkipInPattern = 1;
                    if (prematureGroup === 'triplet') state.beatsToSkipInPattern = 2;
                    if (prematureGroup === 'quadruplet') state.beatsToSkipInPattern = 3;
                }
            }
            if (trigger) { state.isPrematureBeat = true; state.pvcMorph = Math.random(); state.duration = (60/140)*60; }
            else { state.isPrematureBeat = false; state.duration = (60/currentBPM)*60; }
        } else {
             const irreg = rhythm.name_en.includes("Fibrillation") || rhythm.name_en.includes("AFIB");
             state.duration = (60 / (currentBPM + (irreg ? (Math.random()*40-20) : 0))) * 60; 
        }
        if (rhythm.type === 'wenckebach') { state.wenckebachCount = (state.wenckebachCount + 1) % 4; if (state.wenckebachCount === 3) state.droppedBeat = true; }
        if (rhythm.type === 'mobitz2') { if (Math.random() > 0.7) state.droppedBeat = true; }
    }
    if (rhythm.type === 'sss' && Math.random() > 0.995 && !state.isPrematureBeat) state.duration += 100;

    let progress = (time - state.start) / state.duration;
    let voltage = 0; let phase = 'rest'; let pVoltage = 0;
    
    const isPVCBeat = state.isPrematureBeat && rhythmKey.includes('PVC');
    
    // P-Wave
    if (rhythm.type === 'complete_block') {
        state.pTimer += 0.125; const pCycle = 60; const pProg = (state.pTimer % pCycle) / pCycle;
        if (pProg > 0.1 && pProg < 0.25) pVoltage -= gaussian(pProg, 15, 0.18, 0.02);
    } else if (rhythm.hasP && !isPVCBeat && !rhythm.flutter) {
        if (state.isPrematureBeat && rhythmKey.includes('PAC')) {
            if (progress > 0.05 && progress < 0.2) {
                if (rhythmKey === 'PAC_HIGH') pVoltage -= gaussian(progress, 15, 0.12, 0.02); 
                if (rhythmKey === 'PAC_MID')  pVoltage -= (Math.sin(progress*50)*8); 
                if (rhythmKey === 'PAC_LOW')  pVoltage += gaussian(progress, 15, 0.12, 0.02); 
                phase = 'p_wave';
            } else if (progress >= 0.2 && progress < 0.25) { phase = 'pr_segment'; }
        } else {
            if (progress > 0.1 && progress < 0.25) {
                if (rhythm.pMorph === 'bifid') { pVoltage -= gaussian(progress, 12, 0.16, 0.015); pVoltage -= gaussian(progress, 12, 0.20, 0.015); }
                else if (rhythm.pMorph === 'peaked') pVoltage -= gaussian(progress, 25, 0.18, 0.015);
                else pVoltage -= gaussian(progress, 15, 0.18, 0.02);
                
                if (progress <= 0.22) phase = 'p_wave'; else phase = 'pr_segment';
            }
        }
    }
    if (rhythm.flutter) pVoltage += Math.sin(time * 0.25) * 10;

    // QRS
    let qrsOffset = 0;
    if (rhythm.prLong) qrsOffset = 0.05; 
    if (rhythm.type === 'wenckebach') qrsOffset = state.wenckebachCount * 0.04;
    if (rhythmKey === 'WPW') qrsOffset = -0.05;
    let qrsCenter = 0.35 + qrsOffset; let qrsVol = 0;
    
    if (!state.droppedBeat) {
        const effCenter = qrsCenter; const width = 0.015 * rhythm.qrsWidth;
        if (progress > effCenter - 0.1 && progress < effCenter + 0.1) {
            if (isPVCBeat || rhythm.qrsWidth > 1.5) {
                let amp = 70; let dir = 1;
                if (rhythmKey === 'PVC_POLY' && state.isPrematureBeat) { if (state.pvcMorph > 0.5) dir = 1; else dir = -1; amp = 50 + (state.pvcMorph * 40); }
                qrsVol -= (gaussian(progress, amp, effCenter, width) * dir);
                if (rhythm.morphology === 'notched') qrsVol -= gaussian(progress, 40, effCenter + 0.02, width);
                phase = 'qrs';
            } else {
                if (rhythm.deltaWave && progress < effCenter) qrsVol -= gaussian(progress, 20, effCenter - 0.04, 0.03); 
                qrsVol += gaussian(progress, 10, effCenter - 0.02, 0.005); qrsVol -= gaussian(progress, 100, effCenter, width);      
                if (rhythm.morphology === 'rsr') qrsVol -= gaussian(progress, 80, effCenter + 0.025, width); else qrsVol += gaussian(progress, 20, effCenter + 0.02, 0.005);
                phase = 'qrs';
            }
        }
    }

    // ST/T
    if (!state.droppedBeat) {
        if (progress >= qrsCenter + 0.1 && progress < 0.55 + qrsOffset) phase = 'st_segment';
        if (progress > 0.5 + qrsOffset && progress < 0.75 + qrsOffset) {
            let tAmp = 25; const isDiscordant = (rhythm.qrsWidth > 1.5) || isPVCBeat;
            if (isDiscordant) { if (rhythmKey === 'PVC_POLY' && state.isPrematureBeat && state.pvcMorph <= 0.5) tAmp = 15; else tAmp = -15; }
            voltage -= gaussian(progress, tAmp, 0.6 + qrsOffset, 0.04);
            if (progress > 0.55 + qrsOffset && progress < 0.65 + qrsOffset) phase = 't_wave';
        }
    }
    voltage += pVoltage + qrsVol;
    let noise = (Math.random() - 0.5) * 2; if (rhythm.name_en.includes("Fibrillation")) noise += (Math.sin(time * 0.5) * 3);
    
    return { val: voltage + noise, phase, meta: { isPremature: state.isPrematureBeat, wenckCount: state.wenckebachCount, dropped: state.droppedBeat, pProgress: (progress - 0.1)/0.15, pause: (time - state.start > state.duration + 50) } };
  }, [prematurePattern, prematureGroup]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const width = DEFAULT_CANVAS_WIDTH; const height = DEFAULT_CANVAS_HEIGHT;
    if (timeRef.current === 0) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height); }
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    let animId;
    const render = () => {
        if (!isPlaying) return;
        frameCountRef.current++;
        if (frameCountRef.current % scrollSpeed !== 0) { animId = requestAnimationFrame(render); return; }
        let timeStep = 0.125; if (paperSpeed === '50') timeStep = 0.25; if (paperSpeed === '25') timeStep = 0.5;
        timeRef.current += timeStep;
        const { val, phase, meta } = getVoltage(timeRef.current, rhythmId);
        const y = (height / 2) + val;
        
        // Sync Buffer
        phaseBufferRef.current.push({ phase, meta });
        if (phaseBufferRef.current.length > width + 50) phaseBufferRef.current.shift();
        const delayOffset = width / 2;
        const delayedData = phaseBufferRef.current[phaseBufferRef.current.length - 1 - delayOffset];
        if (delayedData) { setCurrentPhase(delayedData.phase); setMetaState(delayedData.meta); }

        // Draw
        ctx.globalCompositeOperation = 'copy'; ctx.drawImage(canvas, -1, 0); ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#fff'; ctx.fillRect(width - 1, 0, 1, height);
        const lastY = lastPointsRef.current.length > 0 ? lastPointsRef.current[lastPointsRef.current.length - 1] : (height / 2);
        ctx.beginPath(); ctx.moveTo(width - 2, lastY); ctx.lineTo(width - 1, y);
        ctx.strokeStyle = '#ffdede'; ctx.lineWidth = 1; ctx.stroke(); 
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.stroke();
        lastPointsRef.current.push(y); if (lastPointsRef.current.length > 10) lastPointsRef.current.shift();
        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, rhythmId, getVoltage, paperSpeed, scrollSpeed]);

  // Reset on rhythm change
  useEffect(() => {
      cycleRef.current = { start: timeRef.current, duration: 60, pTimer:0, wenckebachCount:0, beatCount: 0, beatsToSkipInPattern: 0, isPrematureBeat: false, droppedBeat: false, pvcMorph: 0.5 };
      phaseBufferRef.current = []; setMetaState({}); setCurrentPhase('rest');
  }, [rhythmId]);

  // Safe rendering helper
  const renderPhase = (key) => {
      if (!key || typeof t[key] !== 'string') return '';
      return t[key];
  };

  return (
    <div className="h-full flex flex-col">
        <div className="bg-white shadow-sm border-b border-slate-200 p-4 flex justify-between items-center">
            <div className="flex gap-4 items-center">
                <h2 className="text-xl font-bold text-slate-800">{RHYTHMS[rhythmId][`name_${lang}`]}</h2>
                <div className="flex gap-2 bg-slate-100 p-1 rounded">
                    {['25','50','100'].map(s => (<button key={s} onClick={() => setPaperSpeed(s)} className={`px-2 py-1 text-xs rounded ${paperSpeed===s?'bg-white shadow text-blue-600 font-bold':''}`}>{s}mm</button>))}
                </div>
                <div className="flex gap-2 bg-slate-100 p-1 rounded">
                    {[3, 1].map(s => (<button key={s} onClick={() => setScrollSpeed(s)} className={`px-2 py-1 text-xs rounded ${scrollSpeed===s?'bg-white shadow text-blue-600 font-bold':''}`}>{s===3?t.slow:t.fast}</button>))}
                </div>
                <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">{isPlaying ? <Pause size={18} /> : <Play size={18} />}</button>
            </div>
            {RHYTHMS[rhythmId].premature && (
                <div className="flex gap-4 items-center text-xs">
                    <div className="flex items-center gap-2"><Zap size={14} className="text-amber-500" /> <span className="font-bold text-amber-700">{t.prematureControls}</span></div>
                    <select value={prematurePattern} onChange={(e)=>setPrematurePattern(e.target.value)} className="border rounded px-2 py-1 bg-white">{['random','bigeminy','trigeminy','quadrigeminy'].map(p=><option key={p} value={p}>{t[p]}</option>)}</select>
                    <select value={prematureGroup} onChange={(e)=>setPrematureGroup(e.target.value)} className="border rounded px-2 py-1 bg-white">{['single','couplet','triplet','quadruplet'].map(g=><option key={g} value={g}>{t[g]}</option>)}</select>
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
                        <div className="bg-slate-900 text-green-400 px-4 py-2 flex justify-between font-mono text-sm">
                            <span>{t.leadII}</span>
                            <span>{RHYTHMS[rhythmId].bpm} BPM</span>
                            <span>{paperSpeed}mm/s</span>
                        </div>
                        <div className="relative h-[250px] bg-white">
                            <canvas ref={canvasRef} width={DEFAULT_CANVAS_WIDTH} height={250} className="w-full h-full cursor-crosshair" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-12 bg-yellow-400/20 border-x-2 border-yellow-500 pointer-events-none flex flex-col items-center justify-start pt-2">
                                <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-1 rounded whitespace-nowrap">{t.liveView}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-blue-900 mb-4">{t.pathophysiology}</h3>
                        <p className="text-slate-700 mb-4">{RHYTHMS[rhythmId][`desc_${lang}`]}</p>
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <h4 className="text-red-800 font-bold mb-1">{t.clinicalManagement}</h4>
                            <p className="text-red-700 text-sm">{RHYTHMS[rhythmId][`mgmt_${lang}`]}</p>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                            <Heart className="text-red-500" /> Anatomical Sync
                        </h3>
                        <HeartAnimation phase={currentPhase} rhythmKey={rhythmId} meta={metaState} />
                        
                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between items-center text-sm border-b pb-2">
                                <span className="text-slate-500">{t.currPhase}</span>
                                <span className="font-mono font-bold text-blue-600">{renderPhase(currentPhase)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b pb-2">
                                <span className="text-slate-500">{t.mechAction}</span>
                                <span className="font-medium text-right text-slate-700 text-xs">{renderPhase(currentPhase)}</span>
                            </div>
                            {metaState.dropped && <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-xs font-bold flex items-center gap-2"><AlertTriangle size={14}/> {t.beatDropped}</div>}
                            {metaState.isPremature && <div className="bg-amber-100 text-amber-700 px-3 py-2 rounded text-xs font-bold flex items-center gap-2"><Zap size={14}/> {t.ectopic}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- MAIN APP LAYOUT ---
export default function CardioLearn() {
  const [view, setView] = useState('learn'); 
  const [activeRhythm, setActiveRhythm] = useState('NSR');
  const [compareRhythmA, setCompareRhythmA] = useState('NSR');
  const [compareRhythmB, setCompareRhythmB] = useState('VFIB');
  const [quizState, setQuizState] = useState({ currentAnswer: null, score: 0, total: 0, targetRhythm: null, showResult: false, choices: [] });
  const [lang, setLang] = useState('en'); 
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const t = TRANSLATIONS[lang]; 

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const startQuizRound = () => {
    const keys = Object.keys(RHYTHMS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const otherKeys = keys.filter(k => k !== randomKey);
    const shuffled = otherKeys.sort(() => 0.5 - Math.random());
    const distractors = shuffled.slice(0, 3);
    const choices = [randomKey, ...distractors].sort(() => 0.5 - Math.random());
    setQuizState(prev => ({ ...prev, currentAnswer: null, targetRhythm: randomKey, choices: choices, showResult: false }));
    setIsPaused(false);
  };

  const handleAnswer = (rhythmId) => {
    const isCorrect = rhythmId === quizState.targetRhythm;
    setQuizState(prev => ({ ...prev, currentAnswer: rhythmId, score: isCorrect ? prev.score + 1 : prev.score, total: prev.total + 1, showResult: true }));
  };

  useEffect(() => { if (view === 'quiz' && !quizState.targetRhythm) startQuizRound(); }, [view]);

  return (
    <div className="min-h-[100dvh] bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <Activity className="text-red-500 w-8 h-8" />
          <div>
            <h1 className="font-bold text-xl tracking-tight">{t.appTitle}</h1>
            <p className="text-xs text-slate-400">{t.edition}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setView('learn')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'learn' ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <BookOpen size={20} /> <span>{t.studyMode}</span>
          </button>
          
          {/* NEW SIMULATOR TAB */}
          <button onClick={() => setView('simulator')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'simulator' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Activity size={20} /> <span>{t.simulatorMode}</span>
          </button>

          <button onClick={() => setView('quiz')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'quiz' ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Brain size={20} /> <span>{t.quizMode}</span>
          </button>
          <button onClick={() => setView('compare')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'compare' ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <SplitSquareHorizontal size={20} /> <span>{t.compareMode}</span>
          </button>
          {deferredPrompt && (
            <button onClick={handleInstallClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
              <Download size={20} /> <span>{t.installApp || "Install App"}</span>
            </button>
          )}
        </nav>
        <div className="px-4 pb-2">
           <button onClick={() => setLang(l => l === 'en' ? 'ka' : 'en')} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm">
             {lang === 'en' ? '🇺🇸 English' : '🇬🇪 ქართული'}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        
        {/* 1. STUDY MODE (Static Engine) */}
        {view === 'learn' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            <div className="w-full md:w-64 bg-white border-r border-slate-200 overflow-y-auto shrink-0">
              <div className="p-4 bg-slate-100 border-b border-slate-200 font-semibold text-slate-600">{t.selectCondition}</div>
              {Object.values(RHYTHMS).map((r) => (
                <button key={r.id} onClick={() => setActiveRhythm(r.id)} className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between ${activeRhythm === r.id ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}>
                  <span className="font-medium">{r[`name_${lang}`]}</span>
                  {activeRhythm === r.id && <ChevronRight size={16} className="text-red-500" />}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto bg-white pb-20 md:pb-0">
              <div className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="px-6 py-4 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">{RHYTHMS[activeRhythm][`name_${lang}`]}</h2>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{t.hr}: {RHYTHMS[activeRhythm].bpm} bpm</span>
                    </div>
                    <button onClick={() => setIsPaused(!isPaused)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700">
                      {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{t.leadII}</div>
                </div>
                {/* Legacy Static Graph for Learn Mode */}
                <ECGGraphStatic rhythmId={activeRhythm} isRunning={!isPaused} />
              </div>
              <div className="p-6 max-w-4xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">{t.regularity}</h3>
                    <p className="font-medium text-slate-900">{RHYTHMS[activeRhythm].regular ? "Regular" : "Irregular"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">{t.pWave}</h3>
                    <p className="font-medium text-slate-900">{RHYTHMS[activeRhythm].hasP ? "Present" : "Absent"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">{t.qrsComplex}</h3>
                    <p className="font-medium text-slate-900">{RHYTHMS[activeRhythm].qrsWidth > 1.5 ? "Wide" : "Narrow"}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <section>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-2"><Info size={20} className="text-blue-500" /> {t.pathophysiology}</h3>
                    <p className="text-slate-600 leading-relaxed">{RHYTHMS[activeRhythm][`desc_${lang}`]}</p>
                  </section>
                  <section className="bg-red-50 border border-red-100 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-red-800 mb-2"><Stethoscope size={20} /> {t.clinicalManagement}</h3>
                    <p className="text-red-900 leading-relaxed">{RHYTHMS[activeRhythm][`mgmt_${lang}`]}</p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. NEW SIMULATOR MODE (Dynamic Gaussian Engine + Anatomy) */}
        {view === 'simulator' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
             {/* Reuse the same selector sidebar */}
             <div className="w-full md:w-64 bg-white border-r border-slate-200 overflow-y-auto shrink-0">
              <div className="p-4 bg-slate-100 border-b border-slate-200 font-semibold text-slate-600">{t.selectCondition}</div>
              {Object.values(RHYTHMS).map((r) => (
                <button key={r.id} onClick={() => setActiveRhythm(r.id)} className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between ${activeRhythm === r.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <span className="font-medium">{r[`name_${lang}`]}</span>
                  {activeRhythm === r.id && <ChevronRight size={16} className="text-blue-500" />}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
               <SimulatorView rhythmId={activeRhythm} t={t} lang={lang} />
            </div>
          </div>
        )}

        {/* 3. QUIZ MODE */}
        {view === 'quiz' && (
          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-start pt-8 overflow-y-auto pb-20 md:pb-0">
            <div className="w-full max-w-4xl px-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">{t.spotDiagnosis}</h2>
                  <p className="text-slate-500">{t.identifyRhythm}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                  <span className="text-sm font-medium text-slate-500 uppercase mr-2">{t.score}</span>
                  <span className="text-2xl font-bold text-red-600">{quizState.score}</span>
                  <span className="text-slate-400 text-xl">/{quizState.total}</span>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 mb-8">
                <div className="bg-slate-900 text-green-400 px-4 py-2 flex justify-between items-center font-mono text-xs">
                  <div className="flex items-center gap-4">
                    <span>{t.hr}: {quizState.targetRhythm ? RHYTHMS[quizState.targetRhythm].bpm : '---'}</span>
                    <button onClick={() => setIsPaused(!isPaused)} className="p-1 rounded hover:bg-slate-800 transition-colors text-green-400">
                      {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                    </button>
                  </div>
                  <span>25mm/s</span>
                </div>
                {/* Use Static Graph for Quiz for stability */}
                {quizState.targetRhythm && <ECGGraphStatic rhythmId={quizState.targetRhythm} isRunning={!quizState.showResult && !isPaused} />}
                <div className="bg-slate-100 px-4 py-2 text-xs text-center text-slate-500">{t.analyze}</div>
              </div>
              {!quizState.showResult ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizState.choices.map((rKey) => (
                    <button key={rKey} onClick={() => handleAnswer(rKey)} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-red-400 hover:shadow-md transition-all text-left font-medium text-slate-700">
                      {RHYTHMS[rKey][`name_${lang}`]}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-fade-in">
                  <div className="flex items-center gap-4 mb-4">
                    {quizState.currentAnswer === quizState.targetRhythm ? <div className="bg-green-100 p-3 rounded-full"><CheckCircle className="text-green-600 w-8 h-8" /></div> : <div className="bg-red-100 p-3 rounded-full"><XCircle className="text-red-600 w-8 h-8" /></div>}
                    <div>
                      <h3 className={`text-xl font-bold ${quizState.currentAnswer === quizState.targetRhythm ? 'text-green-700' : 'text-red-700'}`}>{quizState.currentAnswer === quizState.targetRhythm ? t.correct : t.incorrect}</h3>
                      <p className="text-slate-600">{t.rhythmWas} <span className="font-bold">{RHYTHMS[quizState.targetRhythm][`name_${lang}`]}</span>.</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg mb-6 text-sm text-slate-700 border-l-4 border-slate-300"><strong>{t.why}</strong> {RHYTHMS[quizState.targetRhythm][`desc_${lang}`]}</div>
                  <button onClick={startQuizRound} className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    <RefreshCw size={18} /> {t.nextCase}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. COMPARE MODE (Legacy Static) */}
        {view === 'compare' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
            <div className="p-6 max-w-5xl mx-auto w-full flex-1 overflow-y-auto pb-20">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800">{t.compareTitle}</h2>
                <p className="text-slate-500">{t.compareInstr}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                   <div className="flex justify-between items-center px-1">
                      <span className="font-bold text-slate-700">{t.rhythmA}</span>
                      <select value={compareRhythmA} onChange={(e) => setCompareRhythmA(e.target.value)} className="px-3 py-1 rounded border border-slate-300 text-sm">
                        {Object.values(RHYTHMS).map(r => (<option key={r.id} value={r.id}>{r[`name_${lang}`]}</option>))}
                      </select>
                   </div>
                   <CompareCard rhythmId={compareRhythmA} t={t} lang={lang} />
                </div>
                <div className="flex flex-col gap-2">
                   <div className="flex justify-between items-center px-1">
                      <span className="font-bold text-slate-700">{t.rhythmB}</span>
                      <select value={compareRhythmB} onChange={(e) => setCompareRhythmB(e.target.value)} className="px-3 py-1 rounded border border-slate-300 text-sm">
                        {Object.values(RHYTHMS).map(r => (<option key={r.id} value={r.id}>{r[`name_${lang}`]}</option>))}
                      </select>
                   </div>
                   <CompareCard rhythmId={compareRhythmB} t={t} lang={lang} />
                </div>
                <div className="lg:col-span-2 mt-4">
                   <div className="flex justify-between items-center px-1 mb-2">
                      <span className="font-bold text-slate-500 uppercase tracking-wide text-sm">{t.baseline}</span>
                   </div>
                   <CompareCard rhythmId="NSR" t={t} lang={lang} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
