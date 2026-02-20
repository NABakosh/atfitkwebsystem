import { api } from './client';
import type { Student } from '../types';

export async function getStudents(): Promise<Student[]> {
    return api.get<Student[]>('/api/students');
}

export async function getStudentById(id: string): Promise<Student> {
    return api.get<Student>(`/api/students/${id}`);
}

export async function createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'photo'>): Promise<Student> {
    return api.post<Student>('/api/students', student);
}

export async function updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    return api.put<Student>(`/api/students/${id}`, student);
}

export async function deleteStudent(id: string): Promise<void> {
    return api.delete(`/api/students/${id}`);
}

export async function uploadStudentPhoto(studentId: string, file: File): Promise<{ photo: string; filename: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return api.uploadFile(`/api/students/${studentId}/photo`, formData);
}

export async function deleteStudentPhoto(studentId: string): Promise<void> {
    return api.delete(`/api/students/${studentId}/photo`);
}
