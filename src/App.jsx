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

// --- Constants ---
const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 200;
const BASELINE_Y = DEFAULT_CANVAS_HEIGHT / 2;

// --- 12-LEAD AXIS MULTIPLIERS ---
const LEADS = {
  I: 0.7, 
  II: 1.0, 
  III: 0.5,
  aVR: -0.8, 
  aVL: 0.3, 
  aVF: 0.8,
  V1: -0.6,  
  V2: -0.3, 
  V3: 0.4,   // Bulkier transition zone
  V4: 0.6, 
  V5: 1.0,   
  V6: 0.8
};
const LEAD_NAMES = Object.keys(LEADS);

// --- CLINICAL 4x3 ECG LAYOUT GROUPS ---
const LEAD_GROUPS = [
  ['I', 'II', 'III'],
  ['aVR', 'aVL', 'aVF'],
  ['V1', 'V2', 'V3'],
  ['V4', 'V5', 'V6']
];

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    appTitle: "CardioLearn",
    edition: "MedStudent Edition",
    studyMode: "Study Mode",
    quizMode: "Quiz Mode",
    compareMode: "ECG Comparison",
    simulatorMode: "Live Simulator", 
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
    p_wave: "Atrial Contraction",
    pr_segment: "AV Delay (Filling)",
    qrs: "Ventricular Contraction",
    st_segment: "Ventricles Emptying",
    t_wave: "Repolarization",
    rest: "Diastole (Relaxation)",
    random: "Random",
    bigeminy: "Bigeminy",
    trigeminy: "Trigeminy",
    quadrigeminy: "Quadrigeminy",
    single: "Single",
    couplet: "Couplet",
    triplet: "Triplet",
    quadruplet: "Quadruplet",
    twelveLead: "12-Lead ECG",
    singleLead: "Single Lead (II)"
  },
  ka: {
    appTitle: "CardioLearn",
    edition: "სტუდენტური გამოცემა",
    studyMode: "სწავლის რეჟიმი",
    quizMode: "ტესტირების რეჟიმი",
    compareMode: "ECG შედარება",
    simulatorMode: "ლაივ სიმულატორი", 
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
    p_wave: "წინაგულების შეკუმშვა",
    pr_segment: "AV დაყოვნება (შევსება)",
    qrs: "პარკუჭების შეკუმშვა",
    st_segment: "პარკუჭების დაცლა",
    t_wave: "რეპოლარიზაცია",
    rest: "დიასტოლა (მოდუნება)",
    random: "შემთხვევითი",
    bigeminy: "ბიგემინია",
    trigeminy: "ტრიგემინია",
    quadrigeminy: "კვადრიგემინია",
    single: "ერთეული",
    couplet: "წყვილი",
    triplet: "ტრიპლეტი",
    quadruplet: "კვადრიპლეტი",
    twelveLead: "12-განხრიანი ეკგ",
    singleLead: "ერთი განხრა (II)"
  }
};

// --- SEGMENTS ---
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

// --- RHYTHM DEFINITIONS ---
const RHYTHMS = {
  NSR: { id: 'NSR', name_en: "Normal Sinus Rhythm", name_ka: "ნორმალური სინუსური რიტმი", bpm: 70, desc_en: "Normal electrical activity.", desc_ka: "ნორმალური ელექტრული აქტივობა.", mgmt_en: "None.", mgmt_ka: "არ მოითხოვს ჩარევას.", regular: true, hasP: true, qrsWidth: 1, beatShape: NORMAL_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  SB: { id: 'SB', name_en: "Sinus Bradycardia", name_ka: "სინუსური ბრადიკარდია", bpm: 45, desc_en: "Normal rhythm < 60 bpm.", desc_ka: "ნორმალური რიტმი < 60.", mgmt_en: "Monitor.", mgmt_ka: "მონიტორინგი.", regular: true, hasP: true, qrsWidth: 1, beatShape: NORMAL_COMPLEX, interval: 90, randomness: 2, noise: 0 },
  ST: { id: 'ST', name_en: "Sinus Tachycardia", name_ka: "სინუსური ტაქიკარდია", bpm: 120, desc_en: "Normal rhythm > 100 bpm.", desc_ka: "ნორმალური რიტმი > 100.", mgmt_en: "Treat cause.", mgmt_ka: "მიზეზის მკურნალობა.", regular: true, hasP: true, qrsWidth: 1, beatShape: NORMAL_COMPLEX, interval: 15, randomness: 1, noise: 0 },
  VFIB: { id: 'VFIB', name_en: "Ventricular Fibrillation", name_ka: "პარკუჭოვანი ფიბრილაცია", bpm: 300, desc_en: "Chaotic.", desc_ka: "ქაოტური.", mgmt_en: "Defibrillation.", mgmt_ka: "დეფიბრილაცია.", type: 'chaos', beatShape: null, interval: 0, randomness: 0, noise: 0 },
  AFLUT: { id: 'AFLUT', name_en: "Atrial Flutter", name_ka: "წინაგულთა თრთოლვა", bpm: 150, desc_en: "Saw-tooth waves.", desc_ka: "ხერხისებრი ტალღები.", mgmt_en: "Rate control.", mgmt_ka: "სიხშირის კონტროლი.", regular: true, flutter: true, qrsWidth: 1, beatShape: null, interval: 25, randomness: 0, noise: 0 },
  AFIB: { id: 'AFIB', name_en: "Atrial Fibrillation", name_ka: "წინაგულთა ფიბრილაცია", bpm: 130, desc_en: "Irregularly irregular.", desc_ka: "არარეგულარულად არარეგულარული.", mgmt_en: "Rate control/Anticoag.", mgmt_ka: "სიხშირის კონტროლი/ანტიკოაგ.", regular: false, hasP: false, qrsWidth: 1, beatShape: AFIB_COMPLEX, interval: 35, randomness: 40, noise: 1.5 },
  VT: { id: 'VT', name_en: "Ventricular Tachycardia", name_ka: "პარკუჭოვანი ტაქიკარდია", bpm: 160, desc_en: "Wide complex tachy.", desc_ka: "განიერკომპლექსიანი ტაქი.", mgmt_en: "Cardiovert/Defib.", mgmt_ka: "კარდიოვერსია/დეფიბ.", regular: true, hasP: false, qrsWidth: 2.5, beatShape: VTACH_COMPLEX, interval: 10, randomness: 2, noise: 0.5 },
  WPW: { id: 'WPW', name_en: "Wolff-Parkinson-White", name_ka: "ვოლფ-პარკინსონ-უაიტი", bpm: 70, desc_en: "Delta wave.", desc_ka: "დელტა ტალღა.", mgmt_en: "Ablation.", mgmt_ka: "აბლაცია.", regular: true, hasP: true, deltaWave: true, kent: true, qrsWidth: 1.5, beatShape: WPW_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  PVC_MONO: { id: 'PVC_MONO', name_en: "PVC (Monomorphic)", name_ka: "PVC (მონომორფული)", bpm: 70, desc_en: "Wide ectopic beat.", desc_ka: "განიერი ექტოპიური დარტყმა.", mgmt_en: "Monitor.", mgmt_ka: "მონიტორინგი.", ectopic: 'ventricle', hasP: true, premature: true, qrsWidth: 1, beatShape: NORMAL_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  PVC_POLY: { id: 'PVC_POLY', name_en: "PVC (Polymorphic)", name_ka: "PVC (პოლიმორფული)", bpm: 70, desc_en: "Multifocal PVCs.", desc_ka: "მულტიფოკალური PVC.", mgmt_en: "Check lytes.", mgmt_ka: "ელექტროლიტები.", ectopic: 'ventricle_poly', hasP: true, premature: true, qrsWidth: 1, beatShape: NORMAL_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  PAC_HIGH: { id: 'PAC_HIGH', name_en: "PAC (High Atrium)", name_ka: "PAC (მაღალი წინაგული)", bpm: 70, desc_en: "Early upright P.", desc_ka: "ადრეული დადებითი P.", mgmt_en: "Benign.", mgmt_ka: "კეთილთვისებიანი.", ectopic: 'high_atrium', hasP: true, premature: true, qrsWidth: 1, beatShape: NORMAL_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  PAC_MID: { id: 'PAC_MID', name_en: "PAC (Mid Atrium)", name_ka: "PAC (შუა წინაგული)", bpm: 70, desc_en: "Biphasic P.", desc_ka: "ბიფაზური P.", mgmt_en: "Benign.", mgmt_ka: "კეთილთვისებიანი.", ectopic: 'mid_atrium', hasP: true, premature: true, qrsWidth: 1, beatShape: PAC_MID_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  PAC_LOW: { id: 'PAC_LOW', name_en: "PAC (Low Atrium)", name_ka: "PAC (დაბალი წინაგული)", bpm: 70, desc_en: "Inverted P.", desc_ka: "ინვერსიული P.", mgmt_en: "Benign.", mgmt_ka: "კეთილთვისებიანი.", ectopic: 'low_atrium', hasP: true, premature: true, qrsWidth: 1, beatShape: PAC_LOW_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  LBBB: { id: 'LBBB', name_en: "Left Bundle Branch Block", name_ka: "LBBB", bpm: 70, desc_en: "Wide notched R.", desc_ka: "განიერი დეფორმირებული R.", mgmt_en: "Check for STEMI.", mgmt_ka: "STEMI-ს გამორიცხვა.", regular: true, hasP: true, qrsWidth: 2.5, morphology: 'notched', delay: 'left', beatShape: LBBB_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  RBBB: { id: 'RBBB', name_en: "Right Bundle Branch Block", name_ka: "RBBB", bpm: 70, desc_en: "Rabbit ears.", desc_ka: "კურდღლის ყურები.", mgmt_en: "Benign/Strain.", mgmt_ka: "კეთილთვისებიანი/გადაძაბვა.", regular: true, hasP: true, qrsWidth: 2.5, morphology: 'rsr', delay: 'right', beatShape: RBBB_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  AV1: { id: 'AV1', name_en: "1st Degree AV Block", name_ka: "AV ბლოკადა I", bpm: 70, desc_en: "Long PR.", desc_ka: "გრძელი PR.", mgmt_en: "Monitor.", mgmt_ka: "მონიტორინგი.", regular: true, hasP: true, prLong: true, qrsWidth: 1, beatShape: AVB1_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  AV2_1: { id: 'AV2_1', name_en: "2nd Degree AV Block (Type I)", name_ka: "AV ბლოკადა II (ტიპი 1)", bpm: 70, desc_en: "Wenckebach.", desc_ka: "ვენკებახი.", mgmt_en: "Benign.", mgmt_ka: "კეთილთვისებიანი.", type: 'wenckebach', hasP: true, qrsWidth: 1, beatShape: null, interval: 35, randomness: 1, noise: 0 },
  AV2_2: { id: 'AV2_2', name_en: "2nd Degree AV Block (Type II)", name_ka: "AV ბლოკადა II (ტიპი 2)", bpm: 60, desc_en: "Mobitz II.", desc_ka: "მობიტც II.", mgmt_en: "Pacemaker.", mgmt_ka: "პეისმეიკერი.", type: 'mobitz2', hasP: true, qrsWidth: 1, beatShape: null, interval: 35, randomness: 0.5, noise: 0 },
  AV3: { id: 'AV3', name_en: "3rd Degree AV Block", name_ka: "AV ბლოკადა III", bpm: 40, desc_en: "AV Dissociation.", desc_ka: "AV დისოციაცია.", mgmt_en: "Pacemaker.", mgmt_ka: "პეისმეიკერი.", type: 'complete_block', qrsWidth: 2.5, beatShape: null, interval: 0, randomness: 0, noise: 0 },
  SSS: { id: 'SSS', name_en: "Sick Sinus Syndrome", name_ka: "სინუსის სისუსტის სინდრომი", bpm: 60, desc_en: "Tachy-Brady.", desc_ka: "ტაქი-ბრადი.", mgmt_en: "Pacemaker.", mgmt_ka: "პეისმეიკერი.", type: 'sss', hasP: true, qrsWidth: 1, beatShape: NORMAL_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  LAH: { id: 'LAH', name_en: "Left Atrial Hypertrophy", name_ka: "მარცხენა წინაგულის ჰიპერტროფია", bpm: 70, desc_en: "P-Mitrale.", desc_ka: "P-მიტრალე.", mgmt_en: "Treat cause.", mgmt_ka: "მიზეზის მკურნალობა.", regular: true, hasP: true, pMorph: 'bifid', qrsWidth: 1, delay: 'left_atrium', beatShape: LAH_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  RAH: { id: 'RAH', name_en: "Right Atrial Hypertrophy", name_ka: "მარჯვენა წინაგულის ჰიპერტროფია", bpm: 70, desc_en: "P-Pulmonale.", desc_ka: "P-პულმონალე.", mgmt_en: "Treat cause.", mgmt_ka: "მიზეზის მკურნალობა.", regular: true, hasP: true, pMorph: 'peaked', qrsWidth: 1, force: 'right_atrium', beatShape: RAH_COMPLEX, interval: 40, randomness: 2, noise: 0 },
};

// --- LEGACY STATIC ENGINE (For Quiz/Compare Modes) ---
const ECGGraphStatic = ({ rhythmId, isRunning = true, lead = 'II', width = null, height = 200 }) => {
  const canvasRef = useRef(null);
  const dataPoints = useRef([]);
  const xOffset = useRef(0);
  const GRID_SIZE = 20; 
  const SPEED = 1.5; 

  const generatePoints = useCallback(() => {
    const rhythm = RHYTHMS[rhythmId] || RHYTHMS.NSR; 
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
    
    if (rhythmId === 'AV3') {
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
      else if (rhythmId === 'AV2_2') { if (mobitz2Cycle < 2) { currentBeatShape = NORMAL_COMPLEX; currentInterval = 40; } else { currentBeatShape = [...P_WAVE_NORMAL]; currentInterval = 40 + 24; } mobitz2Cycle = (mobitz2Cycle + 1) % 3; }
      else if (rhythmId === 'AV2_1') { if (wenckebachCycle < 3) { const pr = 3 + (wenckebachCycle * 5); currentBeatShape = [...P_WAVE_NORMAL, ...Array(pr).fill(0), ...QRS_T_NORMAL]; currentInterval = 35; } else { currentBeatShape = [...P_WAVE_NORMAL]; currentInterval = 60; } wenckebachCycle = (wenckebachCycle + 1) % 4; }
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
    ctx.lineWidth = 1; ctx.strokeStyle = '#ff99a8'; ctx.beginPath();
    for (let x = 0; x < w; x += GRID_SIZE * 5) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = 0; y < h; y += GRID_SIZE * 5) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();

    const centerY = h / 2; 
    ctx.beginPath(); ctx.lineWidth = 1.8; ctx.strokeStyle = '#000000'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    
    const points = dataPoints.current;
    let started = false;
    const drawAll = width !== null; 
    const multiplier = LEADS[lead] || 1; 
    
    // NEW: Dynamically scale down the amplitude if the canvas is small
    const amplitudeScale = height < 200 ? 0.55 : 1.0; 

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (!p) continue; 
      const px = p.x - (drawAll ? 0 : xOffset.current);
      // NEW: Apply the amplitudeScale to the math
      const py = centerY + (p.y * multiplier * amplitudeScale);
      if (drawAll || (px >= -20 && px <= w + 20)) {
        if (!started) { ctx.moveTo(px, py); started = true; } else { ctx.lineTo(px, py); }
      }
    }
    ctx.stroke();
    if (isRunning && !drawAll) {
      xOffset.current += SPEED;
      if (points.length > 0 && xOffset.current > (points[points.length - 1].x - w)) xOffset.current = 0;
    }
  }, [isRunning, width, lead]);

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
    <div className={`relative group ${width ? 'overflow-visible' : 'w-full h-full'}`}> 
      <canvas ref={canvasRef} className="block cursor-crosshair w-full h-full" style={{ width: width ? `${width}px` : '100%', height: `${height}px` }} />
    </div>
  );
};

// --- MULTI-LEAD GRID WRAPPER (4x3 Columns w/ Vertical Dividers) ---
const ECGGrid = ({ rhythmId, isRunning, is12Lead, height }) => {
  const h = is12Lead ? 140 : (height || 250); // Increased from 120 to 140

  if (!is12Lead) {
    return (
      <div className="block">
        <div className="relative bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
          <ECGGraphStatic rhythmId={rhythmId} isRunning={isRunning} lead="II" height={h} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-100 p-4 relative">
      {LEAD_GROUPS.map((group, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-2 relative">
          {colIdx > 0 && <div className="hidden md:block absolute -left-2 top-0 bottom-0 w-px bg-slate-300" />}
          
          {group.map(leadKey => (
            <div key={leadKey} className="relative bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
              <div className="absolute top-1 left-2 text-xs font-bold text-slate-800 bg-white/90 px-1 rounded shadow-sm z-10">{leadKey}</div>
              <ECGGraphStatic rhythmId={rhythmId} isRunning={isRunning} lead={leadKey} height={h} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const CompareCard = ({ rhythmId, t, lang, is12Lead }) => {
  const [isPaused, setIsPaused] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
        <span className="font-bold text-slate-700">{RHYTHMS[rhythmId]?.[`name_${lang}`] || rhythmId}</span>
        <button onClick={() => setIsPaused(!isPaused)} className="p-1 rounded hover:bg-slate-200 transition-colors text-slate-700">
          {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
        </button>
      </div>
      <div className="w-full flex-1 min-h-[160px]">
        <ECGGrid rhythmId={rhythmId} isRunning={!isPaused} is12Lead={is12Lead} height={160} />
      </div>
      <div className="p-4 flex items-center gap-4 shrink-0 bg-white">
        <p className="text-xs text-slate-500 flex-1">{RHYTHMS[rhythmId][`desc_${lang}`]}</p>
      </div>
    </div>
  );
};

// --- ANATOMICAL HEART & ELECTRODES COMPONENT ---
const HeartAnimation = ({ phase, rhythmKey, meta, is12Lead }) => {
  const rhythm = RHYTHMS[rhythmKey];
  if (!rhythm) return null; 
  
  const cBase = "#cbd5e1"; // Slate-300
  const cActive = "#ef4444"; // Red-500
  const cElec = "#94a3b8"; 
  const cElecActive = "#fbbf24";
  const cElecKent = "#10b981"; 
  const cEctopic = "#f43f5e"; 

  const isP = phase === 'p_wave';
  const isPR = phase === 'pr_segment';
  const isQRS = phase === 'qrs';
  const isST = phase === 'st_segment';
  
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
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Dropshadow filter for depth */}
        <defs>
          <filter id="heartShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
          </filter>
        </defs>

        <g filter="url(#heartShadow)">
            {/* Left Atrium (Anatomical Left, Viewer's Right) */}
            <path d="M 100 105 L 145 110 C 165 80, 150 40, 100 65 Z" fill={laActive ? (laDelay ? "#ef4444" : cActive) : cBase} stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" className="transition-colors duration-100" />
            
            {/* Right Atrium (Anatomical Right, Viewer's Left) */}
            <path d="M 100 105 L 55 110 C 35 80, 50 40, 100 65 Z" fill={raColor} stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" className="transition-colors duration-100" />
            
            {/* Ventricles (Tilted axis toward anatomical left) */}
            <path d="M 55 110 C 55 150, 80 180, 125 190 C 145 170, 145 130, 145 110 L 100 105 Z" fill={vColor} stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" className="transition-colors duration-100" />
        </g>
        
        {/* Conduction System */}
        <circle cx="70" cy="65" r="5" fill={saActive ? cElecActive : cElec} stroke="#1e293b" strokeWidth="1.5" />
        {isHighPac && <circle cx="65" cy="50" r="4" fill={cEctopic} className="animate-pulse" />}
        {isMidPac && <circle cx="80" cy="80" r="4" fill={cEctopic} className="animate-pulse" />}
        {isLowPac && <circle cx="95" cy="90" r="4" fill={cEctopic} className="animate-pulse" />}
        {isPVC && <circle cx="90" cy="150" r="5" fill={cEctopic} className="animate-pulse" />}

        {/* Internodal Pathways */}
        <path d="M 70 65 Q 80 85 95 105" fill="none" stroke={saActive || raActive ? cElecActive : cElec} strokeWidth="2" strokeDasharray="3,3" />
        
        {/* Kent Bundle (WPW) */}
        {rhythm.kent && <path d="M 140 90 Q 155 115 140 135" fill="none" stroke={kentActive ? cElecKent : "#cbd5e1"} strokeWidth="4" strokeLinecap="round" />}

        {/* AV Node */}
        <circle cx="95" cy="105" r="6" fill={avColor} stroke="#1e293b" strokeWidth="1.5" />
        {showX && <text x="91" y="109" fill="black" fontSize="10" fontWeight="bold">X</text>}
        {showPermX && <text x="89" y="110" fill="red" fontSize="12" fontWeight="bold">XX</text>}

        {/* Bundle of His & Bundle Branches */}
        <path d="M 95 105 L 105 125" fill="none" stroke={bundleColor} strokeWidth="3" />
        <path d="M 105 125 C 110 145, 120 165, 125 175" fill="none" stroke={bundleColor} strokeWidth={rhythm.delay === 'left' ? 1 : 3} strokeDasharray={rhythm.delay === 'left' ? "2,2" : "0"} />
        <path d="M 105 125 C 90 145, 85 165, 90 175" fill="none" stroke={bundleColor} strokeWidth={rhythm.delay === 'right' ? 1 : 3} strokeDasharray={rhythm.delay === 'right' ? "2,2" : "0"} />

        {/* --- 12-LEAD ELECTRODE OVERLAY --- */}
        {is12Lead && (
          <g className="electrodes transition-opacity duration-500 opacity-90">
             {/* Chest Leads (V1-V6) mapping over the anatomical heart surface */}
             <circle cx="80" cy="115" r="5" fill="white" stroke="#ef4444" strokeWidth="2.5" className="drop-shadow-md" />
             <text x="80" y="104" fontSize="9" fill="#1e293b" textAnchor="middle" fontWeight="bold">V1</text>
             
             <circle cx="105" cy="115" r="5" fill="white" stroke="#eab308" strokeWidth="2.5" className="drop-shadow-md" />
             <text x="105" y="104" fontSize="9" fill="#1e293b" textAnchor="middle" fontWeight="bold">V2</text>
             
             <circle cx="118" cy="128" r="5" fill="white" stroke="#22c55e" strokeWidth="2.5" className="drop-shadow-md" />
             <text x="130" y="131" fontSize="9" fill="#1e293b" textAnchor="middle" fontWeight="bold">V3</text>
             
             <circle cx="130" cy="145" r="5" fill="white" stroke="#3b82f6" strokeWidth="2.5" className="drop-shadow-md" />
             <text x="142" y="148" fontSize="9" fill="#1e293b" textAnchor="middle" fontWeight="bold">V4</text>
             
             <circle cx="145" cy="150" r="5" fill="white" stroke="#f97316" strokeWidth="2.5" className="drop-shadow-md" />
             <text x="157" y="153" fontSize="9" fill="#1e293b" textAnchor="middle" fontWeight="bold">V5</text>
             
             <circle cx="160" cy="145" r="5" fill="white" stroke="#a855f7" strokeWidth="2.5" className="drop-shadow-md" />
             <text x="172" y="148" fontSize="9" fill="#1e293b" textAnchor="middle" fontWeight="bold">V6</text>

             {/* Limb Leads */}
             <circle cx="20" cy="30" r="4" fill="white" stroke="#ef4444" strokeWidth="2" />
             <text x="20" y="20" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="bold">RA</text>

             <circle cx="180" cy="30" r="4" fill="white" stroke="#eab308" strokeWidth="2" />
             <text x="180" y="20" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="bold">LA</text>

             <circle cx="180" cy="180" r="4" fill="white" stroke="#22c55e" strokeWidth="2" />
             <text x="180" y="195" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="bold">LL</text>
             
             <circle cx="20" cy="180" r="4" fill="white" stroke="#0f172a" strokeWidth="2" />
             <text x="20" y="195" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="bold">RL</text>
          </g>
        )}
      </svg>
      {rhythm.kent && <div className="absolute top-16 right-2 text-[10px] font-bold text-emerald-600 bg-white/90 px-1.5 py-0.5 rounded shadow-sm">Kent Bundle</div>}
      {rhythm.type === 'complete_block' && <div className="absolute top-20 left-[35%] text-[10px] font-bold text-red-600 bg-white/90 px-1.5 py-0.5 rounded shadow-sm">AV DISSOCIATION</div>}
    </div>
  );
};

// --- DYNAMIC SIMULATOR COMPONENT ---
const SimulatorView = ({ rhythmId, t, lang, is12Lead }) => {
  const canvasRefs = useRef({}); 
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPhase, setCurrentPhase] = useState('rest');
  const [metaState, setMetaState] = useState({}); 
  
  const [paperSpeed, setPaperSpeed] = useState('100'); 
  const [scrollSpeed, setScrollSpeed] = useState(1); 
  const [prematurePattern, setPrematurePattern] = useState('random'); 
  const [prematureGroup, setPrematureGroup] = useState('single'); 

  const timeRef = useRef(0); 
  const frameCountRef = useRef(0);
  const lastPointsRef = useRef({});
  const phaseBufferRef = useRef([]); 
  const cycleRef = useRef({ start: 0, duration: 60, pTimer: 0, wenckebachCount: 0, beatCount: 0, beatsToSkipInPattern: 0, isPrematureBeat: false, droppedBeat: false, pvcMorph: 0.5 });

  const gaussian = (t, peak, center, width) => peak * Math.exp(-0.5 * Math.pow((t - center) / width, 2));

  // Initialize Point Buffers for all 12 leads
  useEffect(() => {
    LEAD_NAMES.forEach(lead => lastPointsRef.current[lead] = []);
  }, []);

  const getVoltage = useCallback((time, rhythmKey) => {
    const rhythm = RHYTHMS[rhythmKey];
    if (!rhythm) return { val: 0, phase: 'rest', meta: {} }; 
    const state = cycleRef.current;
    
    if (rhythmKey === 'VFIB') {
        const noise = (Math.random() - 0.5) * 15;
        const chaos = Math.sin(time * 0.2) * 20 + Math.sin(time * 0.5) * 10;
        return { val: chaos + noise, phase: 'rest', meta: {} };
    }

    let currentBPM = rhythm.bpm;
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

  // Master Render Loop for all active leads
  useEffect(() => {
    const width = DEFAULT_CANVAS_WIDTH; 
    const height = is12Lead ? 140 : 250; // Increased from 120 to 140 
    
    if (timeRef.current === 0) { 
      LEAD_NAMES.forEach(lead => {
        const ctx = canvasRefs.current[lead]?.getContext('2d');
        if(ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height); }
      });
    }

    let animId;
    const render = () => {
        if (!isPlaying) return;
        frameCountRef.current++;
        if (frameCountRef.current % scrollSpeed !== 0) { animId = requestAnimationFrame(render); return; }
        
        let timeStep = 0.125; if (paperSpeed === '50') timeStep = 0.25; if (paperSpeed === '25') timeStep = 0.5;
        timeRef.current += timeStep;
        
        // Calculate Base Voltage once per frame
        const { val, phase, meta } = getVoltage(timeRef.current, rhythmId);
        
        // Sync Buffers for UI
        phaseBufferRef.current.push({ phase, meta });
        if (phaseBufferRef.current.length > width + 50) phaseBufferRef.current.shift();
        const delayedData = phaseBufferRef.current[phaseBufferRef.current.length - 1 - (width / 2)];
        if (delayedData) { setCurrentPhase(delayedData.phase); setMetaState(delayedData.meta); }

        // Render to all active Canvas elements
        const activeLeads = is12Lead ? LEAD_NAMES : ['II'];
        
        activeLeads.forEach(leadKey => {
            const canvas = canvasRefs.current[leadKey];
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            
            // Apply projection amplitude multiplier AND 12-lead scale factor
            const leadMultiplier = LEADS[leadKey] || 1.0;
            const scaleFactor = is12Lead ? 0.55 : 1.0; // Prevent canvas clipping
            const y = (height / 2) + (val * leadMultiplier * scaleFactor);
            
            ctx.globalCompositeOperation = 'copy'; ctx.drawImage(canvas, -1, 0); ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#fff'; ctx.fillRect(width - 1, 0, 1, height);
            
            const leadPoints = lastPointsRef.current[leadKey];
            const lastY = leadPoints && leadPoints.length > 0 ? leadPoints[leadPoints.length - 1] : (height / 2);
            
            ctx.beginPath(); ctx.moveTo(width - 2, lastY); ctx.lineTo(width - 1, y);
            ctx.strokeStyle = '#ffdede'; ctx.lineWidth = 1; ctx.stroke(); 
            ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.stroke();
            
            if(leadPoints) {
                leadPoints.push(y); 
                if (leadPoints.length > 10) leadPoints.shift();
            }
        });
        
        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, rhythmId, getVoltage, paperSpeed, scrollSpeed, is12Lead]);

  useEffect(() => {
      cycleRef.current = { start: timeRef.current, duration: 60, pTimer:0, wenckebachCount:0, beatCount: 0, beatsToSkipInPattern: 0, isPrematureBeat: false, droppedBeat: false, pvcMorph: 0.5 };
      phaseBufferRef.current = []; setMetaState({}); setCurrentPhase('rest');
  }, [rhythmId]);

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
            <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
                        <div className="bg-slate-900 text-green-400 px-4 py-2 flex justify-between font-mono text-sm">
                            <span>{is12Lead ? t.twelveLead : t.leadII}</span>
                            <span>{RHYTHMS[rhythmId].bpm} BPM</span>
                            <span>{paperSpeed}mm/s</span>
                        </div>
                        
                        {/* 12-Lead Dynamic Layout Rendering */}
                        <div className={`grid ${is12Lead ? 'grid-cols-2 md:grid-cols-4 gap-4 bg-slate-100 p-4' : 'grid-cols-1'} bg-white relative`}>
                            {is12Lead ? (
                                LEAD_GROUPS.map((group, colIdx) => (
                                    <div key={colIdx} className="flex flex-col gap-2 relative">
                                        {/* Vertical dividers right between the columns */}
                                        {colIdx > 0 && <div className="hidden md:block absolute -left-2 top-0 bottom-0 w-px bg-slate-300" />}
                                        
                                        {group.map(leadKey => (
                                            // Changed h-[120px] to h-[140px]
                                            <div key={leadKey} className="relative bg-white border border-slate-200 rounded h-[140px] overflow-hidden shadow-sm">
                                                <div className="absolute top-1 left-2 text-xs font-bold text-slate-800 bg-white/90 px-1 rounded shadow-sm z-10">{leadKey}</div>
                                                {/* Changed height={120} to height={140} */}
                                                <canvas ref={el => canvasRefs.current[leadKey] = el} width={DEFAULT_CANVAS_WIDTH} height={140} className="w-full h-full cursor-crosshair" />
                                            </div>
                                        ))}

                                        {/* Live View Cursor rendered INSIDE each column mapping */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-12 bg-yellow-400/20 border-x-2 border-yellow-500 pointer-events-none flex flex-col items-center justify-start pt-2 z-20">
                                            {/* We only render the text on the first column to avoid clutter, but the bar spans every column */}
                                            {colIdx === 0 && <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-1 rounded whitespace-nowrap shadow-sm">{t.liveView}</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="relative bg-white border border-slate-200 rounded h-[250px] overflow-hidden">
                                    <canvas ref={el => canvasRefs.current['II'] = el} width={DEFAULT_CANVAS_WIDTH} height={250} className="w-full h-full cursor-crosshair" />
                                    {/* Live View Cursor for Single Lead */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-12 bg-yellow-400/20 border-x-2 border-yellow-500 pointer-events-none flex flex-col items-center justify-start pt-2 z-20">
                                        <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-1 rounded whitespace-nowrap">{t.liveView}</span>
                                    </div>
                                </div>
                            )}
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
                        {/* Pass the is12Lead prop to the Heart Animation */}
                        <HeartAnimation phase={currentPhase} rhythmKey={rhythmId} meta={metaState} is12Lead={is12Lead} />
                        
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
  const [is12Lead, setIs12Lead] = useState(false); 

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
        
        {/* Universal 12-Lead Toggle */}
        <div className="px-4 py-4 border-b border-slate-700">
          <button 
            onClick={() => setIs12Lead(!is12Lead)} 
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-bold transition-all shadow-sm ${is12Lead ? 'bg-indigo-600 text-white shadow-indigo-900/50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <div className="flex items-center gap-2">
              <Layers size={18} />
              <span>{is12Lead ? t.twelveLead : t.singleLead}</span>
            </div>
            <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${is12Lead ? 'bg-indigo-400' : 'bg-slate-600'}`}>
               <div className={`w-4 h-4 bg-white rounded-full transition-transform ${is12Lead ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setView('learn')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'learn' ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <BookOpen size={20} /> <span>{t.studyMode}</span>
          </button>
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
        <div className="px-4 pb-4">
           <button onClick={() => setLang(l => l === 'en' ? 'ka' : 'en')} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm">
             {lang === 'en' ? '🇺🇸 English' : '🇬🇪 ქართული'}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        
        {/* 1. STUDY MODE */}
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
              <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-slate-200">
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
                  <div className="text-xs text-slate-400 font-mono font-bold">{is12Lead ? t.twelveLead : t.leadII}</div>
                </div>
                {/* Dynamically render 12-lead grid or single lead */}
                <ECGGrid rhythmId={activeRhythm} isRunning={!isPaused} is12Lead={is12Lead} />
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

        {/* 2. DYNAMIC SIMULATOR MODE */}
        {view === 'simulator' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
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
               <SimulatorView rhythmId={activeRhythm} t={t} lang={lang} is12Lead={is12Lead} />
            </div>
          </div>
        )}

        {/* 3. QUIZ MODE */}
        {view === 'quiz' && (
          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-start pt-8 overflow-y-auto pb-20 md:pb-0">
            <div className="w-full px-4 md:px-8 xl:px-12">
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
                    <span className="font-bold">{is12Lead ? t.twelveLead : t.leadII}</span>
                    <span>{t.hr}: {quizState.targetRhythm ? RHYTHMS[quizState.targetRhythm].bpm : '---'}</span>
                    <button onClick={() => setIsPaused(!isPaused)} className="p-1 rounded hover:bg-slate-800 transition-colors text-green-400">
                      {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                    </button>
                  </div>
                  <span>25mm/s</span>
                </div>
                {quizState.targetRhythm && <ECGGrid rhythmId={quizState.targetRhythm} isRunning={!quizState.showResult && !isPaused} is12Lead={is12Lead} />}
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

        {/* 4. COMPARE MODE */}
        {view === 'compare' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
            <div className="p-6 w-full flex-1 overflow-y-auto pb-20">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800">{t.compareTitle}</h2>
                <p className="text-slate-500">{t.compareInstr}</p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                   <div className="flex justify-between items-center px-1">
                      <span className="font-bold text-slate-700">{t.rhythmA}</span>
                      <select value={compareRhythmA} onChange={(e) => setCompareRhythmA(e.target.value)} className="px-3 py-1 rounded border border-slate-300 text-sm">
                        {Object.values(RHYTHMS).map(r => (<option key={r.id} value={r.id}>{r[`name_${lang}`]}</option>))}
                      </select>
                   </div>
                   <CompareCard rhythmId={compareRhythmA} t={t} lang={lang} is12Lead={is12Lead} />
                </div>
                <div className="flex flex-col gap-2">
                   <div className="flex justify-between items-center px-1">
                      <span className="font-bold text-slate-700">{t.rhythmB}</span>
                      <select value={compareRhythmB} onChange={(e) => setCompareRhythmB(e.target.value)} className="px-3 py-1 rounded border border-slate-300 text-sm">
                        {Object.values(RHYTHMS).map(r => (<option key={r.id} value={r.id}>{r[`name_${lang}`]}</option>))}
                      </select>
                   </div>
                   <CompareCard rhythmId={compareRhythmB} t={t} lang={lang} is12Lead={is12Lead} />
                </div>
                <div className="xl:col-span-2 mt-4">
                   <div className="flex justify-between items-center px-1 mb-2">
                      <span className="font-bold text-slate-500 uppercase tracking-wide text-sm">{t.baseline}</span>
                   </div>
                   <CompareCard rhythmId="NSR" t={t} lang={lang} is12Lead={is12Lead} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
