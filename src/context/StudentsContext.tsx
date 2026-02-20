import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Student } from '../types';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../utils/storage';

interface StudentsContextType {
    students: Student[];
    refresh: () => void;
    add: (s: Student) => void;
    update: (s: Student) => void;
    remove: (id: string) => void;
}

const StudentsContext = createContext<StudentsContextType | null>(null);

export function StudentsProvider({ children }: { children: React.ReactNode }) {
    const [students, setStudents] = useState<Student[]>(getStudents);

    const refresh = useCallback(() => {
        setStudents(getStudents());
    }, []);

    const add = useCallback((s: Student) => {
        addStudent(s);
        setStudents(getStudents());
    }, []);

    const update = useCallback((s: Student) => {
        updateStudent(s);
        setStudents(getStudents());
    }, []);

    const remove = useCallback((id: string) => {
        deleteStudent(id);
        setStudents(getStudents());
    }, []);

    return (
        <StudentsContext.Provider value={{ students, refresh, add, update, remove }}>
            {children}
        </StudentsContext.Provider>
    );
}

export function useStudents() {
    const ctx = useContext(StudentsContext);
    if (!ctx) throw new Error('useStudents must be used within StudentsProvider');
    return ctx;
}
