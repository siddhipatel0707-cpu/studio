import { Timestamp } from "firebase/firestore";

export interface SimulationInput {
  monthlyIncome: number;
  existingEmis: number;
  currentMonthlySavings: number;
  currentSavingsCorpus: number;
  currentAge: number;
  targetRetirementAge: number;
  expectedAnnualReturn: number;
  decisionType: 'Loan' | 'Purchase';
  plannedAmount: number;
  loanDurationYears: number;
}

export interface StressResult {
    ratio: number;
    level: 'Safe' | 'Risky' | 'Stressed';
    message: string;
}

export interface ChartDataPoint {
    age: number;
    "Before Decision": number;
    "After Decision": number;
}

export interface SimulationResult {
    stress: StressResult;
    corpusBefore: number;
    corpusAfter: number;
    retirementDelay: number;
    chartData: ChartDataPoint[];
    aiInsight: string;
}

export interface StoredSimulation {
    id: string;
    userId: string;
    inputs: SimulationInput;
    results: SimulationResult;
    timestamp: Timestamp;
}
