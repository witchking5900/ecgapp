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
  Settings
} from 'lucide-react';

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
    // Rhythm Details
    NSR: { 
      name: "Normal Sinus Rhythm", 
      desc: "The standard heart rhythm. Electrical impulse originates in the SA node and conducts normally.", 
      tip: "Check: Is there a P before every QRS? Is the rate normal?",
      clinical: "No treatment required. Physiologic baseline.",
      reg: "Regular", p: "Present, upright", qrs: "Narrow"
    },
    VFIB: { 
      name: "Ventricular Fibrillation", 
      desc: "Chaotic, irregular deflections of varying amplitude. The ventricles quiver instead of contracting.", 
      tip: "Chaotic squiggles. No structure. Immediate Defibrillation!",
      clinical: "CRITICAL EMERGENCY. Cardiac arrest rhythm. Immediate CPR and Defibrillation required. Fatal if untreated.",
      reg: "Totally Irregular", p: "Absent", qrs: "Absent"
    },
    AFLUT: { 
      name: "Atrial Flutter", 
      desc: "Macro-reentry circuit in the right atrium. Characteristic 'saw-tooth' flutter waves.", 
      tip: "Look for the 'Saw-Tooth' baseline between QRS complexes.",
      clinical: "Rate control (beta blockers/calcium channel blockers), Rhythm control (Cardioversion/Ablation). Stroke risk management (Anticoagulation).",
      reg: "Regular (usually)", p: "Saw-tooth 'F' waves", qrs: "Narrow"
    },
    WPW: { 
      name: "Wolff-Parkinson-White", 
      desc: "Pre-excitation syndrome. Accessory pathway (Bundle of Kent) bypasses AV node. Features: Short PR, Delta Wave, Wide QRS.", 
      tip: "Short PR + Delta Wave (slurred upstroke) = Wide QRS.",
      clinical: "Risk of SVT (AVRT) or fast Afib. Avoid AV nodal blockers (ABCD - Adenosine, Beta-blockers, CCB, Digoxin) if Afib present. Ablation is curative.",
      reg: "Regular", p: "Normal", qrs: "Wide w/ Delta Wave"
    },
    PVC_MONO: { 
      name: "PVC (Monomorphic)", 
      desc: "Ectopic beat arising from a single focus in the ventricles.", 
      tip: "A wide, weird beat that comes early. All look the same.",
      clinical: "Benign in healthy hearts. Treat underlying cause (electrolytes, hypoxia). Frequent PVCs can cause cardiomyopathy.",
      reg: "Irregular (Premature)", p: "Absent", qrs: "Wide, Bizarre"
    },
    PVC_POLY: { 
      name: "PVC (Polymorphic)", 
      desc: "PVCs arising from multiple different foci in the ventricles. Different shapes.", 
      tip: "Multiple wide, weird beats that all look different. Unstable.",
      clinical: "Suggests greater electrical instability. Check electrolytes (K, Mg) and oxygenation. Risk of R-on-T phenomenon.",
      reg: "Irregular (Premature)", p: "Absent", qrs: "Wide, Variable"
    },
    PAC_HIGH: { 
      name: "PAC (High Atrium)", 
      desc: "Ectopic focus in high atrium. Upright P-wave, early beat.", 
      tip: "Early beat with an Upright P-wave (normal looking).",
      clinical: "Benign. Triggered by stress, caffeine, alcohol, or tobacco.",
      reg: "Irregular (Premature)", p: "Premature & Upright", qrs: "Narrow"
    },
    PAC_MID: { 
      name: "PAC (Mid Atrium)", 
      desc: "Ectopic focus in mid atrium. Biphasic P-wave.", 
      tip: "Early beat with a Biphasic (up/down) P-wave.",
      clinical: "Benign. Differentiate from sinus arrhythmia. Reduce triggers.",
      reg: "Irregular (Premature)", p: "Premature & Biphasic", qrs: "Narrow"
    },
    PAC_LOW: { 
      name: "PAC (Low Atrium)", 
      desc: "Ectopic focus in low atrium. Retrograde (inverted) P-wave.", 
      tip: "Early beat with an Inverted (negative) P-wave.",
      clinical: "Benign. Differentiate from Junctional rhythms.",
      reg: "Irregular (Premature)", p: "Premature & Inverted", qrs: "Narrow"
    },
    LBBB: { 
      name: "Left Bundle Branch Block", 
      desc: "Block in left bundle. Wide, notched R wave in lateral leads. Discordant T waves.", 
      tip: "WiLLiam: W in V1, M in V6. Wide, notched QRS.",
      clinical: "Associated with structural heart disease (HTN, CAD). New LBBB + Chest Pain is a STEMI equivalent (Sgarbossa Criteria).",
      reg: "Regular", p: "Present", qrs: "Wide, Notched ('M')"
    },
    RBBB: { 
      name: "Right Bundle Branch Block", 
      desc: "Block in right bundle. RSR' pattern in V1.", 
      tip: "MaRRoW: M in V1 (Rabbit Ears), W in V6. Wide QRS.",
      clinical: "Can be normal variant or due to RV strain (PE, Cor Pulmonale), ischemia, or congenital defects (ASD).",
      reg: "Regular", p: "Present", qrs: "Wide, RSR' ('M')"
    },
    AVB1: { 
      name: "1st Degree AV Block", 
      desc: "Fixed prolongation of the PR interval (>0.20s).", 
      tip: "PR Interval > 5 small boxes (0.20s). Constant.",
      clinical: "Usually benign and asymptomatic. No specific treatment required but monitor for progression.",
      reg: "Regular", p: "Normal, PR > 0.20s", qrs: "Narrow"
    },
    AVB2T1: { 
      name: "2nd Degree AV Block Type I", 
      desc: "Wenckebach. Progressive PR lengthening until drop.", 
      tip: "Longer, Longer, Longer, Drop! (Wenckebach).",
      clinical: "Usually due to reversible AV node block (drugs, ischemia, high vagal tone). Often benign.",
      reg: "Irregular (Grouped)", p: "Normal, Progressive PR", qrs: "Narrow, Periodic Drop"
    },
    AVB2T2: { 
      name: "2nd Degree AV Block Type II", 
      desc: "Mobitz II. Random drops without PR prolongation.", 
      tip: "If some Ps don't get through, then you have a Mobitz II.",
      clinical: "High risk of progression to complete heart block. Pacemaker is usually indicated. Atropine is often ineffective.",
      reg: "Irregular Drops", p: "Constant Rate", qrs: "Narrow/Broad"
    },
    AVB3: { 
      name: "3rd Degree AV Block", 
      desc: "Complete Heart Block. AV dissociation.", 
      tip: "Ps and QRSs are divorced. Complete dissociation.",
      clinical: "Medical emergency. Risk of asystole. Pacemaker is required. Atropine is generally ineffective for wide-complex escape rhythms.",
      reg: "Regular (Dissociated)", p: "Normal, Dissociated", qrs: "Wide (Escape)"
    },
    SSS: { 
      name: "Sick Sinus Syndrome", 
      desc: "Dysfunction of SA node. Bursts of tachycardia followed by pauses.", 
      tip: "Fast bursts followed by long pauses (Tachy-Brady).",
      clinical: "Pacemaker placement is often required to treat the bradycardia/pauses. Medications to control tachycardia.",
      reg: "Irregular (Pauses)", p: "Normal", qrs: "Narrow"
    },
    LAH: { 
      name: "Left Atrial Hypertrophy", 
      desc: "P Mitrale. Wide, notched P-wave.", 
      tip: "P-Mitrale: 'M' shaped P-wave in Lead II.",
      clinical: "Treat underlying cause (HTN, Valve disease). Monitor for development of Afib.",
      reg: "Regular", p: "Bifid 'M' Shape", qrs: "Narrow"
    },
    RAH: { 
      name: "Right Atrial Hypertrophy", 
      desc: "P Pulmonale. Tall P-wave.", 
      tip: "P-Pulmonale: Tall, peaked P-wave (>2.5mm).",
      clinical: "Treat underlying pulmonary or cardiac cause (COPD, Pulm HTN).",
      reg: "Regular", p: "Tall Peaked", qrs: "Narrow"
    },
    SB: { 
      name: "Sinus Bradycardia", 
      desc: "Normal rhythm < 60 bpm.", 
      tip: "Normal rhythm, just slow (<60 bpm).",
      clinical: "Usually benign (athletes/sleep). Treat only if symptomatic (atropine, pacing).",
      reg: "Regular", p: "Present", qrs: "Narrow"
    },
    ST: { 
      name: "Sinus Tachycardia", 
      desc: "Normal rhythm > 100 bpm.", 
      tip: "Normal rhythm, just fast (>100 bpm).",
      clinical: "Treat underlying cause (fluids, antipyretics, pain control, anxiety).",
      reg: "Regular", p: "Present", qrs: "Narrow"
    },
    AFIB: { 
      name: "Atrial Fibrillation", 
      desc: "Chaotic atrial activity. Irregularly irregular.", 
      tip: "Irregularly irregular. No P-waves. Messy baseline.",
      clinical: "Rate control, Rhythm control, Anticoagulation (Stroke prevention).",
      reg: "Irregularly Irregular", p: "Absent", qrs: "Narrow"
    },
    VT: { 
      name: "Ventricular Tachycardia", 
      desc: "Wide complex tachycardia.", 
      tip: "Wide, fast, and regular. Looks like tombstones.",
      clinical: "Life-threatening. Pulse? Cardiovert/Meds. No pulse? Defibrillate.",
      reg: "Regular", p: "Dissociated", qrs: "Wide"
    }
  },
  ka: {
    appTitle: "CardioLearn",
    edition: "სტუდენტური გამოცემა",
    studyMode: "სწავლის რეჟიმი",
    quizMode: "ტესტირების რეჟიმი",
    compareMode: "ECG შედარება",
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
    // Rhythm Details
    NSR: { name: "ნორმალური სინუსური რიტმი", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "არსებობს, დადებითი", qrs: "ვიწრო" },
    VFIB: { name: "პარკუჭოვანი ფიბრილაცია", desc: "...", tip: "...", clinical: "...", reg: "სრულიად არარეგულარული", p: "არ არის", qrs: "არ არის" },
    AFLUT: { name: "წინაგულთა თრთოლვა", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "ხერხის კბილისებრი", qrs: "ვიწრო" },
    WPW: { name: "ვოლფ-პარკინსონ-უაიტი", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "ნორმალური", qrs: "განიერი" },
    PVC_MONO: { name: "მონომორფული PVC", desc: "...", tip: "...", clinical: "...", reg: "არარეგულარული", p: "არ არის", qrs: "განიერი" },
    PVC_POLY: { name: "პოლიმორფული PVC", desc: "...", tip: "...", clinical: "...", reg: "არარეგულარული", p: "არ არის", qrs: "განიერი" },
    PAC_HIGH: { name: "PAC (მაღალი)", desc: "...", tip: "...", clinical: "...", reg: "არარეგულარული", p: "ნაადრევი", qrs: "ვიწრო" },
    PAC_MID: { name: "PAC (შუა)", desc: "...", tip: "...", clinical: "...", reg: "არარეგულარული", p: "ნაადრევი", qrs: "ვიწრო" },
    PAC_LOW: { name: "PAC (დაბალი)", desc: "...", tip: "...", clinical: "...", reg: "არარეგულარული", p: "ნაადრევი", qrs: "ვიწრო" },
    LBBB: { name: "მარცხენა ფეხის ბლოკადა", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "არსებობს", qrs: "განიერი" },
    RBBB: { name: "მარჯვენა ფეხის ბლოკადა", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "არსებობს", qrs: "განიერი" },
    AVB1: { name: "AV ბლოკადა I", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "PR > 0.20", qrs: "ვიწრო" },
    AVB2T1: { name: "AV ბლოკადა II (ტიპი 1)", desc: "...", tip: "...", clinical: "...", reg: "არარეგულარული", p: "პროგრესული", qrs: "ჩავარდნა" },
    AVB2T2: { name: "AV ბლოკადა II (ტიპი 2)", desc: "...", tip: "...", clinical: "...", reg: "არარეგულარული", p: "მუდმივი", qrs: "ვიწრო/განიერი" },
    AVB3: { name: "AV ბლოკადა III", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "დისოცირებული", qrs: "განიერი" },
    SSS: { name: "სუსტი სინუსი", desc: "...", tip: "...", clinical: "...", reg: "არარეგულარული", p: "ნორმალური", qrs: "ვიწრო" },
    LAH: { name: "მარცხენა წინაგულის ჰიპერტროფია", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "M-ფორმის", qrs: "ვიწრო" },
    RAH: { name: "მარჯვენა წინაგულის ჰიპერტროფია", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "მაღალი", qrs: "ვიწრო" },
    SB: { name: "სინუსური ბრადიკარდია", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "არსებობს", qrs: "ვიწრო" },
    ST: { name: "სინუსური ტაქიკარდია", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "არსებობს", qrs: "ვიწრო" },
    AFIB: { name: "წინაგულთა ფიბრილაცია", desc: "...", tip: "...", clinical: "...", reg: "სრულიად არარეგულარული", p: "არ არის", qrs: "ვიწრო" },
    VT: { name: "პარკუჭოვანი ტაქიკარდია", desc: "...", tip: "...", clinical: "...", reg: "რეგულარული", p: "დისოცირებული", qrs: "განიერი" }
  }
};

// ... (SEGMENTS and RHYTHMS - Unchanged, ensure you keep the previous definitions) ...
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

const RHYTHMS = {
  NSR: { id: 'NSR', rate: '60-100 bpm', beatShape: NORMAL_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  VFIB: { id: 'VFIB', rate: 'Chaotic', beatShape: null, interval: 0, randomness: 0, noise: 0 },
  AFLUT: { id: 'AFLUT', rate: '~300 bpm', beatShape: null, interval: 25, randomness: 0, noise: 0 },
  WPW: { id: 'WPW', rate: 'Normal', beatShape: WPW_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  PVC_MONO: { id: 'PVC_MONO', rate: 'Variable', beatShape: NORMAL_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  PVC_POLY: { id: 'PVC_POLY', rate: 'Variable', beatShape: NORMAL_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  PAC_HIGH: { id: 'PAC_HIGH', rate: 'Variable', beatShape: NORMAL_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  PAC_MID: { id: 'PAC_MID', rate: 'Variable', beatShape: NORMAL_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  PAC_LOW: { id: 'PAC_LOW', rate: 'Variable', beatShape: NORMAL_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  LBBB: { id: 'LBBB', rate: 'Normal', beatShape: LBBB_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  RBBB: { id: 'RBBB', rate: 'Normal', beatShape: RBBB_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  AVB1: { id: 'AVB1', rate: 'Normal', beatShape: AVB1_COMPLEX, interval: 40, randomness: 1, noise: 0 },
  AVB2T1: { id: 'AVB2T1', rate: 'Variable', beatShape: null, interval: 35, randomness: 1, noise: 0 },
  AVB2T2: { id: 'AVB2T2', rate: 'Variable', beatShape: null, interval: 35, randomness: 0.5, noise: 0 },
  AVB3: { id: 'AVB3', rate: 'P: ~75, QRS: ~35', beatShape: null, interval: 0, randomness: 0, noise: 0 },
  SSS: { id: 'SSS', rate: 'Variable', beatShape: NORMAL_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  LAH: { id: 'LAH', rate: 'Normal', beatShape: LAH_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  RAH: { id: 'RAH', rate: 'Normal', beatShape: RAH_COMPLEX, interval: 40, randomness: 2, noise: 0 },
  SB: { id: 'SB', rate: '<60 bpm', beatShape: NORMAL_COMPLEX, interval: 90, randomness: 2, noise: 0 },
  ST: { id: 'ST', rate: '>100 bpm', beatShape: NORMAL_COMPLEX, interval: 15, randomness: 1, noise: 0 },
  AFIB: { id: 'AFIB', rate: 'Variable', beatShape: AFIB_COMPLEX, interval: 35, randomness: 40, noise: 1.5 },
  VT: { id: 'VT', rate: '>100 bpm', beatShape: VTACH_COMPLEX, interval: 10, randomness: 2, noise: 0.5 }
};

// ... (ECGGraph - Unchanged) ...
const ECGGraph = ({ rhythmId, isRunning = true, width = null, height = 200 }) => {
  const canvasRef = useRef(null);
  const dataPoints = useRef([]);
  const xOffset = useRef(0);
  const GRID_SIZE = 20; 
  const SPEED = 1.5; 

  const generatePoints = useCallback(() => {
    const rhythm = RHYTHMS[rhythmId];
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
    const QRS_REMOVAL_COMPENSATION = 24; 
    
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
      <div className="absolute bottom-1 right-2 text-[10px] text-red-800/50 font-mono pointer-events-none sticky left-0">25mm/s 10mm/mV</div>
    </div>
  );
};

const CompareCard = ({ rhythmId, t }) => {
  const [isPaused, setIsPaused] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <span className="font-bold text-slate-700">{t[rhythmId]?.name || rhythmId}</span>
        <button onClick={() => setIsPaused(!isPaused)} className="p-1 rounded hover:bg-slate-200 transition-colors text-slate-700">
          {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
        </button>
      </div>
      <div className="w-full">
        <ECGGraph rhythmId={rhythmId} isRunning={!isPaused} />
      </div>
      <div className="p-4 flex items-center gap-4">
        <p className="text-xs text-slate-500 flex-1">{t[rhythmId]?.desc}</p>
      </div>
    </div>
  );
};

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
             {lang === 'en' ? (
               <>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="30" height="15">
                    <clipPath id="t"><path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z"/></clipPath>
                    <path d="M0,0v30h60v-30z" fill="#00247d"/>
                    <path d="M0,0 60,30m0,-30 -60,30" stroke="#fff" strokeWidth="6"/>
                    <path d="M0,0 60,30m0,-30 -60,30" clipPath="url(#t)" stroke="#cf142b" strokeWidth="4"/>
                    <path d="M30,0v30m-30,-15h60" stroke="#fff" strokeWidth="10"/>
                    <path d="M30,0v30m-30,-15h60" stroke="#cf142b" strokeWidth="6"/>
                  </svg> English
               </>
             ) : (
               <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" width="30" height="20">
                  <rect width="60" height="40" fill="#fff"/><rect x="26" width="8" height="40" fill="#f00"/><rect y="16" width="60" height="8" fill="#f00"/>
                  <g id="c" transform="translate(13, 8)"><path d="M0,-3v6M-3,0h6" stroke="#f00" strokeWidth="2"/></g>
                  <use href="#c" transform="translate(34, 0)"/><use href="#c" transform="translate(0, 24)"/><use href="#c" transform="translate(34, 24)"/>
                </svg> ქართული
               </>
             )}
           </button>
        </div>
        {view === 'learn' && (
          <div className="p-6 border-t border-slate-800">
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-xs uppercase text-slate-400 font-semibold mb-2">{t.quickTipTitle}</h3>
              <p className="text-sm text-slate-300">{t[activeRhythm]?.tip || t.selectRhythmTip}</p>
            </div>
          </div>
        )}
      </aside>
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        {view === 'learn' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            <div className="w-full md:w-64 bg-white border-r border-slate-200 overflow-y-auto shrink-0">
              <div className="p-4 bg-slate-100 border-b border-slate-200 font-semibold text-slate-600">{t.selectCondition}</div>
              {Object.values(RHYTHMS).map((r) => (
                <button key={r.id} onClick={() => setActiveRhythm(r.id)} className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between ${activeRhythm === r.id ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}>
                  <span className="font-medium">{t[r.id]?.name || r.name}</span>
                  {activeRhythm === r.id && <ChevronRight size={16} className="text-red-500" />}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto bg-white pb-20 md:pb-0">
              <div className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="px-6 py-4 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">{t[activeRhythm]?.name || RHYTHMS[activeRhythm].name}</h2>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{t.hr}: {RHYTHMS[activeRhythm].rate}</span>
                    </div>
                    <button onClick={() => setIsPaused(!isPaused)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700">
                      {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{t.leadII}</div>
                </div>
                <ECGGraph rhythmId={activeRhythm} isRunning={!isPaused} />
              </div>
              <div className="p-6 max-w-4xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">{t.regularity}</h3>
                    <p className="font-medium text-slate-900">{t[activeRhythm]?.reg || RHYTHMS[activeRhythm].regularity}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">{t.pWave}</h3>
                    <p className="font-medium text-slate-900">{t[activeRhythm]?.p || RHYTHMS[activeRhythm].pWave}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">{t.qrsComplex}</h3>
                    <p className="font-medium text-slate-900">{t[activeRhythm]?.qrs || RHYTHMS[activeRhythm].qrs}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <section>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-2"><Info size={20} className="text-blue-500" /> {t.pathophysiology}</h3>
                    <p className="text-slate-600 leading-relaxed">{t[activeRhythm]?.desc || RHYTHMS[activeRhythm].description}</p>
                  </section>
                  <section className="bg-red-50 border border-red-100 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-red-800 mb-2"><Stethoscope size={20} /> {t.clinicalManagement}</h3>
                    <p className="text-red-900 leading-relaxed">{t[activeRhythm]?.clinical || RHYTHMS[activeRhythm].clinical}</p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}
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
                    <span>{t.hr}: {quizState.targetRhythm ? RHYTHMS[quizState.targetRhythm].rate : '---'}</span>
                    <button onClick={() => setIsPaused(!isPaused)} className="p-1 rounded hover:bg-slate-800 transition-colors text-green-400">
                      {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                    </button>
                  </div>
                  <span>25mm/s</span>
                </div>
                {quizState.targetRhythm && <ECGGraph rhythmId={quizState.targetRhythm} isRunning={!quizState.showResult && !isPaused} />}
                <div className="bg-slate-100 px-4 py-2 text-xs text-center text-slate-500">{t.analyze}</div>
              </div>
              {!quizState.showResult ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizState.choices.map((rKey) => (
                    <button key={rKey} onClick={() => handleAnswer(rKey)} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-red-400 hover:shadow-md transition-all text-left font-medium text-slate-700">
                      {t[rKey]?.name || RHYTHMS[rKey].name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-fade-in">
                  <div className="flex items-center gap-4 mb-4">
                    {quizState.currentAnswer === quizState.targetRhythm ? <div className="bg-green-100 p-3 rounded-full"><CheckCircle className="text-green-600 w-8 h-8" /></div> : <div className="bg-red-100 p-3 rounded-full"><XCircle className="text-red-600 w-8 h-8" /></div>}
                    <div>
                      <h3 className={`text-xl font-bold ${quizState.currentAnswer === quizState.targetRhythm ? 'text-green-700' : 'text-red-700'}`}>{quizState.currentAnswer === quizState.targetRhythm ? t.correct : t.incorrect}</h3>
                      <p className="text-slate-600">{t.rhythmWas} <span className="font-bold">{t[quizState.targetRhythm]?.name || RHYTHMS[quizState.targetRhythm].name}</span>.</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg mb-6 text-sm text-slate-700 border-l-4 border-slate-300"><strong>{t.why}</strong> {t[quizState.targetRhythm]?.desc || RHYTHMS[quizState.targetRhythm].description}</div>
                  <button onClick={startQuizRound} className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    <RefreshCw size={18} /> {t.nextCase}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
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
                        {Object.values(RHYTHMS).map(r => (<option key={r.id} value={r.id}>{t[r.id]?.name || r.name}</option>))}
                      </select>
                   </div>
                   <CompareCard rhythmId={compareRhythmA} t={t} />
                </div>
                <div className="flex flex-col gap-2">
                   <div className="flex justify-between items-center px-1">
                      <span className="font-bold text-slate-700">{t.rhythmB}</span>
                      <select value={compareRhythmB} onChange={(e) => setCompareRhythmB(e.target.value)} className="px-3 py-1 rounded border border-slate-300 text-sm">
                        {Object.values(RHYTHMS).map(r => (<option key={r.id} value={r.id}>{t[r.id]?.name || r.name}</option>))}
                      </select>
                   </div>
                   <CompareCard rhythmId={compareRhythmB} t={t} />
                </div>
                <div className="lg:col-span-2 mt-4">
                   <div className="flex justify-between items-center px-1 mb-2">
                      <span className="font-bold text-slate-500 uppercase tracking-wide text-sm">{t.baseline}</span>
                   </div>
                   <CompareCard rhythmId="NSR" t={t} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
