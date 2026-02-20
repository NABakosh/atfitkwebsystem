import type { Student } from '../types';
import { getStudents, saveStudents } from './storage';
import { v4 } from './uuid';

const SEED_KEY = 'atfitk_seeded_v1';

export function seedDemoData() {
    if (localStorage.getItem(SEED_KEY)) return;
    if (getStudents().length > 0) {
        localStorage.setItem(SEED_KEY, '1');
        return;
    }

    const now = new Date().toISOString();

    const demo: Student[] = [
        {
            id: v4(),
            photo: '',
            fullName: 'Аманов Берик Ерланович',
            birthDate: '2007-03-15',
            group: 'ИС-23',
            iin: '070315450011',
            previousSchool: 'СОШ №47 г. Алматы',
            specialty: 'Информационные системы',
            course: '2',
            address: 'г. Алматы, Алатауский р-н, ул. Жулдыз 12, кв. 5',
            phone: '+7 (701) 234-56-78',
            family: {
                mother: { fullName: 'Аманова Гүлнар Сейтқалиқызы', workplace: 'ТОО «Алматы Нан»', phone: '+7 (702) 111-22-33' },
                father: { fullName: 'Аманов Ерлан Бейсенович', workplace: 'Безработный', phone: '+7 (707) 444-55-66' },
                guardian: { fullName: '', relationship: '', phone: '' },
                familyType: 'Неполная',
                childrenCount: 3,
                socialStatus: 'Малообеспеченная',
            },
            internalRegistry: {
                registrationDate: '2024-09-12',
                grounds: ['Прогулы занятий', 'Неуспеваемость'],
                responsible: 'Сейтова А.Б.',
                preventiveWork: 'Проведены беседы с родителями. Назначена индивидуальная программа обучения.',
                result: 'Посещаемость улучшилась до 80%',
                status: 'На учете',
                removalDate: '',
                removalGrounds: '',
            },
            policeRegistry: {
                isRegistered: true,
                region: 'г. Алматы',
                district: 'Алатауский',
                policeOrgan: 'УП Алатауский района',
                registrationType: 'Профилактический учет в ОЮП «Несовершеннолетний, не посещающий по неуважительным причинам»',
                registrationDate: '2024-10-01',
                grounds: 'Систематические прогулы учебных занятий',
                inspector: 'Нурмаганбетов К.А.',
                removalDate: '',
                removalGrounds: '',
            },
            consultations: [
                {
                    id: v4(),
                    date: '2024-10-10',
                    workType: 'Индивидуальное консультирование',
                    description: 'Первичная беседа. Установление контакта.',
                    problems: 'Нежелание посещать занятия. Конфликты со сверстниками.',
                    recommendations: 'Коррекционные занятия 2 раза в неделю. Вовлечение в кружковую деятельность.',
                    conclusion: 'Выявлена социальная дезадаптация.',
                    dynamics: 'Отрицательная. Требует систематической работы.',
                },
                {
                    id: v4(),
                    date: '2024-11-05',
                    workType: 'Беседа',
                    description: 'Повторная консультация. Мониторинг посещаемости.',
                    problems: 'Посещаемость нестабильная.',
                    recommendations: 'Продолжить индивидуальную работу.',
                    conclusion: 'Небольшая положительная динамика.',
                    dynamics: 'Слабоположительная.',
                },
            ],
            createdAt: now,
            updatedAt: now,
        },
        {
            id: v4(),
            photo: '',
            fullName: 'Дюсенова Айгерим Маратовна',
            birthDate: '2008-07-22',
            group: 'БУ-24',
            iin: '080722450022',
            previousSchool: 'СОШ №103 г. Алматы',
            specialty: 'Бухгалтерский учёт',
            course: '1',
            address: 'г. Алматы, Ауэзовский р-н, мкр. Аксай-4, д. 30, кв. 18',
            phone: '+7 (705) 987-65-43',
            family: {
                mother: { fullName: 'Дюсенова Зауреш Ахметовна', workplace: 'ГКП «Детская больница №2»', phone: '+7 (708) 123-45-67' },
                father: { fullName: '', workplace: '', phone: '' },
                guardian: { fullName: 'Касымова Раушан Бекова', relationship: 'Бабушка', phone: '+7 (702) 999-88-77' },
                familyType: 'Неполная',
                childrenCount: 2,
                socialStatus: 'Опекунская',
            },
            internalRegistry: {
                registrationDate: '2025-01-20',
                grounds: ['Агрессивное поведение', 'Конфликтность'],
                responsible: 'Нурланова М.Ж.',
                preventiveWork: 'Тренинг по управлению эмоциями. Работа с группой поддержки.',
                result: 'Конфликтность снизилась. Посещаемость 95%',
                status: 'Снят',
                removalDate: '2025-03-15',
                removalGrounds: 'Исправление поведения, положительная динамика',
            },
            policeRegistry: {
                isRegistered: false,
                region: '',
                district: '',
                policeOrgan: '',
                registrationType: '',
                registrationDate: '',
                grounds: '',
                inspector: '',
                removalDate: '',
                removalGrounds: '',
            },
            consultations: [
                {
                    id: v4(),
                    date: '2025-01-25',
                    workType: 'Тестирование',
                    description: 'Психологическое тестирование. Тест Айзенка.',
                    problems: 'Высокий уровень тревожности. Склонность к агрессии.',
                    recommendations: 'Арт-терапия. Снижение учебной нагрузки.',
                    conclusion: 'Эмоционально нестабильный тип личности.',
                    dynamics: 'Нейтральная. Начало работы.',
                },
            ],
            createdAt: now,
            updatedAt: now,
        },
    ];

    saveStudents(demo);
    localStorage.setItem(SEED_KEY, '1');
}
