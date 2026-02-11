
export interface NavItem {
  label: string;
  id: string; // Used for scroll or view switching
}

export interface BusinessSolution {
  title: string;
  impact: string;
  description: string;
  iconType: 'automation' | 'insight' | 'growth';
}

export interface SavedBusinessStrategy {
  id: string;
  userId: string;
  date: string;
  industry: string;
  description: string;
  solutions: BusinessSolution[];
}

export interface StudyPlanStep {
  week: number;
  title: string;
  description: string;
  keyConcepts: string[];
}

export interface StudyPlan {
  topic: string;
  difficulty: string;
  roadmap: StudyPlanStep[];
}

export interface Certificate {
  id: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  difficulty: string;
  signature: string; // "Mind is Gear Academy"
}

export interface SavedStudyPlan extends StudyPlan {
  id: string;
  userId: string;
  createdAt: string;
  completedWeeks?: number[]; // Array of completed week numbers
  certificate?: Certificate | null;
}

export interface ClassSession {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  description: string;
  capacity: number;
  enrolled: number;
  tags: string[];
  price: string;
  image?: string;
}

export interface ConceptExplanation {
  concept: string;
  definition: string;
  example: string;
  practicalTip: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface PracticalTask {
  title: string;
  scenario: string;
  taskSteps: string[];
  expectedOutcome: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Recommendation {
  topic: string;
  difficulty: string;
  reason: string;
  keyFocusAreas: string[];
}

export enum AppView {
  HOME = 'HOME',
  BUSINESS = 'BUSINESS',
  EDUCATION = 'EDUCATION',
  LOGIN = 'LOGIN',
  ADMIN = 'ADMIN',
  PROJECTS = 'PROJECTS',
  TEAM = 'TEAM',
  ACADEMY = 'ACADEMY',
  CONTACT = 'CONTACT',
  GAP_ANALYSIS = 'GAP_ANALYSIS'
}

export type UserRole = 'GUEST' | 'BUSINESS' | 'STUDENT' | 'ADMIN';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  organization?: string; // Company Name for Business, School for Student
}
