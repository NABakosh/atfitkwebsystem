import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Student } from '../types';
import {
    getStudents as apiGetStudents,
    createStudent as apiCreateStudent,
    updateStudent as apiUpdateStudent,
    deleteStudent as apiDeleteStudent,
} from '../api/students';

interface StudentsContextType {
    students: Student[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    add: (s: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'photo'>) => Promise<Student>;
    update: (id: string, s: Partial<Student>) => Promise<Student>;
    remove: (id: string) => Promise<void>;
}

const StudentsContext = createContext<StudentsContextType | null>(null);

export function StudentsProvider({ children }: { children: React.ReactNode }) {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiGetStudents();
            setStudents(data);
        } catch (err) {
            console.error('Failed to load students:', err);
            setError('Не удалось загрузить список студентов');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const add = useCallback(async (s: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'photo'>): Promise<Student> => {
        const created = await apiCreateStudent(s);
        setStudents((prev) => [created, ...prev]);
        return created;
    }, []);

    const update = useCallback(async (id: string, s: Partial<Student>): Promise<Student> => {
        const updated = await apiUpdateStudent(id, s);
        setStudents((prev) => prev.map((st) => (st.id === id ? updated : st)));
        return updated;
    }, []);

    const remove = useCallback(async (id: string): Promise<void> => {
        await apiDeleteStudent(id);
        setStudents((prev) => prev.filter((st) => st.id !== id));
    }, []);

    return (
        <StudentsContext.Provider value={{ students, loading, error, refresh, add, update, remove }}>
            {children}
        </StudentsContext.Provider>
    );
}

export function useStudents() {
    const ctx = useContext(StudentsContext);
    if (!ctx) throw new Error('useStudents must be used within StudentsProvider');
    return ctx;
}
