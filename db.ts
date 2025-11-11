// Simple ID generator function
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // In a real app, this should be hashed
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subjectId: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

// In-memory database (replace with IndexedDB or localForage for persistence)
class Database {
  private users: User[] = [];
  private questions: Question[] = [];
  private subjects: Subject[] = [];
  private quizResults: QuizResult[] = [];

  // User methods
  async createUser(email: string, name: string, password: string): Promise<User> {
    const user: User = {
      id: generateId(),
      email,
      name,
      password, // In a real app, hash the password before storing
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  // Subject methods
  async createSubject(name: string, description: string, icon: string): Promise<Subject> {
    const subject: Subject = {
      id: generateId(),
      name,
      description,
      icon,
    };
    this.subjects.push(subject);
    return subject;
  }

  async getSubjects(): Promise<Subject[]> {
    return [...this.subjects];
  }

  // Question methods
  async addQuestion(question: Omit<Question, 'id'>): Promise<Question> {
    const newQuestion: Question = {
      ...question,
      id: generateId(),
    };
    this.questions.push(newQuestion);
    return newQuestion;
  }

  async getQuestionsBySubject(subjectId: string): Promise<Question[]> {
    return this.questions.filter((q) => q.subjectId === subjectId);
  }

  // Quiz result methods
  async saveQuizResult(result: Omit<QuizResult, 'id' | 'completedAt'>): Promise<QuizResult> {
    const newResult: QuizResult = {
      ...result,
      id: generateId(),
      completedAt: new Date(),
    };
    this.quizResults.push(newResult);
    return newResult;
  }

  async getUserResults(userId: string): Promise<QuizResult[]> {
    return this.quizResults.filter((r) => r.userId === userId);
  }
}

// Create and export a singleton instance
export const db = new Database();

// Initialize with some sample data
async function initializeDatabase() {
  // Add sample subjects if none exist
  if ((await db.getSubjects()).length === 0) {
    await db.createSubject('Mathematics', 'Test your math skills', '🧮');
    await db.createSubject('Science', 'Explore scientific concepts', '🔬');
    await db.createSubject('History', 'Discover historical events', '📜');
  }
}

initializeDatabase().catch(console.error);