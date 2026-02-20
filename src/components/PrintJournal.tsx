import type { Student } from '../types';

interface Props {
    students: Student[];
}

export function PrintJournal({ students }: Props) {
    const today = new Date().toLocaleDateString('ru-RU');

    return (
        <div className="print-only" id="print-journal" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'white', color: 'black', zIndex: 9999,
            overflow: 'auto', fontFamily: 'Times New Roman, serif', fontSize: 11
        }}>
            <div style={{ padding: '20mm', fontFamily: 'Times New Roman, serif' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase' }}>
                        Алматинский технологическо-финансовый и инновационно-технический колледж
                    </div>
                    <div style={{ fontSize: 12, marginTop: 6 }}>
                        Журнал внутриколледжного и профилактического учёта студентов
                    </div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Дата формирования: {today}</div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                    <thead>
                        <tr>
                            {['№', 'ФИО', 'Группа', 'Дата рождения', 'Район УП', 'Вид учёта УП', 'Учёт колледж', 'Учёт УП', 'Дата постановки', 'Статус'].map(h => (
                                <th key={h} style={{ border: '1px solid #000', padding: '4px 6px', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s, i) => (
                            <tr key={s.id}>
                                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>{i + 1}</td>
                                <td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>{s.fullName}</td>
                                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>{s.group || '—'}</td>
                                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>{s.birthDate || '—'}</td>
                                <td style={{ border: '1px solid #000', padding: '4px 6px' }}>{s.policeRegistry.isRegistered ? s.policeRegistry.district || '—' : '—'}</td>
                                <td style={{ border: '1px solid #000', padding: '4px 6px', fontSize: 9 }}>
                                    {s.policeRegistry.isRegistered ? (s.policeRegistry.registrationType || '—') : '—'}
                                </td>
                                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>
                                    {s.internalRegistry.registrationDate ? (s.internalRegistry.status || 'Да') : 'Нет'}
                                </td>
                                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>
                                    {s.policeRegistry.isRegistered ? 'Да' : 'Нет'}
                                </td>
                                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>{s.internalRegistry.registrationDate || '—'}</td>
                                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>{s.internalRegistry.status || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between' }}>
                    <div>Заместитель директора: _______________</div>
                    <div>Психолог: _______________</div>
                    <div>Дата: {today}</div>
                </div>
            </div>
        </div>
    );
}
