import type { Student, User } from '../types';

const STUDENTS_KEY = 'atfitk_students';
const SESSION_KEY = 'atfitk_session';

// Simple hash function for passwords
export function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

export const DEFAULT_USERS: User[] = [
    {
        id: '1',
        username: 'director',
        passwordHash: simpleHash('director2024'),
        role: 'director',
        displayName: 'Заместитель директора',
    },
    {
        id: '2',
        username: 'psychologist',
        passwordHash: simpleHash('psycho2024'),
        role: 'psychologist',
        displayName: 'Психолог',
    },
];

export function getStudents(): Student[] {
    try {
        const data = localStorage.getItem(STUDENTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveStudents(students: Student[]): void {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

export function getStudentById(id: string): Student | null {
    const students = getStudents();
    return students.find((s) => s.id === id) || null;
}

export function addStudent(student: Student): void {
    const students = getStudents();
    students.push(student);
    saveStudents(students);
}

export function updateStudent(updated: Student): void {
    const students = getStudents();
    const idx = students.findIndex((s) => s.id === updated.id);
    if (idx !== -1) {
        students[idx] = updated;
        saveStudents(students);
    }
}

export function deleteStudent(id: string): void {
    const students = getStudents().filter((s) => s.id !== id);
    saveStudents(students);
}

export function getSession(): User | null {
    try {
        const data = sessionStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function setSession(user: User): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
    sessionStorage.removeItem(SESSION_KEY);
}
