#!/usr/bin/env node
/**
 * ATFITK API Test Script
 * Tests all backend API endpoints including new psychological registry fields.
 *
 * Usage: node test-api.js [BASE_URL]
 * Example: node test-api.js http://localhost:3001
 *          node test-api.js https://atfitkwebsystem.kz
 */

const BASE_URL = process.argv[2] || 'http://localhost:3001';
let passed = 0;
let failed = 0;
let token = '';
let createdStudentId = '';

function log(ok, name, detail = '') {
    if (ok) {
        console.log(`  ✅ ${name}`);
        passed++;
    } else {
        console.log(`  ❌ ${name}${detail ? ': ' + detail : ''}`);
        failed++;
    }
}

async function req(method, path, body, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    let json;
    try { json = await res.json(); } catch { json = {}; }
    return { status: res.status, json };
}

async function runTests() {
    console.log(`\n🧪 ATFITK API Tests — ${BASE_URL}\n`);

    // ── HEALTH ──────────────────────────────────────────────────────────────
    console.log('📡 Health Check');
    {
        const r = await req('GET', '/api/health');
        log(r.status === 200 && r.json.status === 'ok', 'GET /api/health');
    }

    // ── AUTH ─────────────────────────────────────────────────────────────────
    console.log('\n🔐 Authentication');
    {
        const r = await req('POST', '/api/auth/login', { username: 'director', password: 'Atfitk@Dir2024!' });
        log(r.status === 200 && r.json.token, 'POST /api/auth/login (director)');
        token = r.json.token || '';
    }
    {
        const r = await req('POST', '/api/auth/login', { username: 'psychologist', password: 'Psy#Atfitk2024!' });
        log(r.status === 200 && r.json.token, 'POST /api/auth/login (psychologist)');
    }
    {
        const r = await req('POST', '/api/auth/login', { username: 'wrong', password: 'wrong' });
        log(r.status === 401 || r.status === 400, 'POST /api/auth/login (wrong creds → reject)');
    }
    {
        const r = await req('GET', '/api/auth/me', null, true);
        log(r.status === 200 && r.json.username === 'director', 'GET /api/auth/me');
    }

    // ── STUDENTS CRUD ──────────────────────────────────────────────────────────
    console.log('\n👨‍🎓 Students CRUD');

    const newStudent = {
        fullName: 'Тестов Тест Тестович',
        birthDate: '2005-06-15',
        group: 'ИС-23',
        iin: '050615300123',
        previousSchool: 'СОШ №1',
        specialty: 'Информационные системы',
        course: '2',
        address: 'г. Алматы, ул. Тестовая, 1',
        phone: '+7 701 123 45 67',
        family: {
            mother: { fullName: 'Тестова Анна', workplace: 'ТОО Тест', phone: '+7 701 000 00 01' },
            father: { fullName: 'Тестов Иван', workplace: 'АО Тест', phone: '+7 701 000 00 02' },
            guardian: { fullName: '', relationship: '', phone: '' },
            familyType: 'Полная',
            childrenCount: 2,
            socialStatus: 'Благополучная',
        },
        internalRegistry: {
            registrationDate: '', grounds: [], responsible: '',
            preventiveWork: '', result: '', status: '', removalDate: '', removalGrounds: '',
        },
        policeRegistry: {
            isRegistered: false, region: '', district: '', policeOrgan: '',
            registrationType: '', registrationDate: '', grounds: '', inspector: '',
            removalDate: '', removalGrounds: '',
        },
        consultations: [],
        // New psychological fields
        psychologistRegistry: {
            isRegistered: true,
            registrationDate: '2024-09-01',
            grounds: 'Тревожность, замкнутость',
            responsible: 'Иванова А.А.',
            preventiveWork: 'Индивидуальные беседы',
            status: 'На учете',
            removalDate: '',
            removalGrounds: '',
            notes: 'Ведётся мониторинг',
        },
        supportGroup: {
            isMember: true,
            groupName: 'Группа риска',
            joinDate: '2024-09-10',
            responsible: 'Петрова Б.Б.',
            workDescription: 'Еженедельные занятия',
            result: 'Положительная динамика',
            exitDate: '',
            exitGrounds: '',
        },
        psychiatristRegistry: {
            isRegistered: false, organization: '', registrationDate: '',
            diagnosis: '', doctor: '', treatmentPlace: '', status: '', removalDate: '', notes: '',
        },
        cppAccompaniment: {
            isActive: false, startDate: '', specialist: '',
            workType: '', goals: '', results: '', endDate: '', notes: '',
        },
        suicideRegistry: {
            hasFacts: true,
            incidents: [{
                id: 'test-inc-1',
                date: '2024-10-15',
                type: 'Суицидальные мысли',
                description: 'Высказывал мысли о суициде',
                measures: 'Беседа, уведомление родителей',
                specialist: 'Психолог Иванова А.А.',
                parentNotified: true,
                policeNotified: false,
                hospitalized: false,
                notes: 'Ситуация под контролем',
            }],
        },
    };

    {
        const r = await req('POST', '/api/students', newStudent, true);
        log(r.status === 201 && r.json.id, 'POST /api/students (create)');
        createdStudentId = r.json.id || '';
        if (r.status !== 201) console.log('    Detail:', JSON.stringify(r.json));
    }

    {
        const r = await req('GET', '/api/students', null, true);
        log(r.status === 200 && Array.isArray(r.json), 'GET /api/students (list)');
    }

    if (createdStudentId) {
        {
            const r = await req('GET', `/api/students/${createdStudentId}`, null, true);
            const ok = r.status === 200
                && r.json.fullName === 'Тестов Тест Тестович'
                && r.json.psychologistRegistry?.isRegistered === true
                && r.json.suicideRegistry?.hasFacts === true
                && r.json.suicideRegistry?.incidents?.length === 1;
            log(ok, 'GET /api/students/:id (with new fields)');
            if (!ok) console.log('    psychologistRegistry:', r.json.psychologistRegistry);
        }

        {
            const updated = { ...newStudent, fullName: 'Тестов Тест Обновлённый', psychologistRegistry: { ...newStudent.psychologistRegistry, status: 'Снят', removalDate: '2025-01-01' } };
            const r = await req('PUT', `/api/students/${createdStudentId}`, updated, true);
            log(r.status === 200 && r.json.fullName === 'Тестов Тест Обновлённый', 'PUT /api/students/:id (update)');
        }

        {
            const r = await req('GET', `/api/students/${createdStudentId}`, null, true);
            log(r.json.psychologistRegistry?.status === 'Снят', 'GET — verify psychologistRegistry.status updated to "Снят"');
            log(r.json.suicideRegistry?.incidents?.length === 1, 'GET — verify suicideRegistry incidents preserved');
        }

        // Auth guard
        {
            const r = await req('GET', `/api/students/${createdStudentId}`);
            log(r.status === 401 || r.status === 403, 'GET /api/students/:id without token → 401/403');
        }

        {
            const r = await req('DELETE', `/api/students/${createdStudentId}`, null, true);
            log(r.status === 200, 'DELETE /api/students/:id (cleanup)');
        }

        {
            const r = await req('GET', `/api/students/${createdStudentId}`, null, true);
            log(r.status === 404, 'GET after delete → 404');
        }
    }

    // ── SUMMARY ──────────────────────────────────────────────────────────────
    console.log(`\n${'─'.repeat(40)}`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
        console.log('🎉 All tests passed!\n');
    } else {
        console.log('⚠️  Some tests failed. Check the backend logs.\n');
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
