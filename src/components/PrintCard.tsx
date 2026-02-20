import type { Student } from '../types';

interface Props {
    student: Student;
}

export function PrintCard({ student }: Props) {
    const today = new Date().toLocaleDateString('ru-RU');
    const ir = student.internalRegistry;
    const pr = student.policeRegistry;
    const lastConsult = student.consultations[student.consultations.length - 1];

    return (
        <div id="print-card-area" className="printable-overlay" style={{
            background: 'white', color: 'black',
            fontFamily: 'Times New Roman, serif', fontSize: 12,
            justifyContent: 'center', alignItems: 'center',
        }}>
            <div style={{ fontFamily: 'Times New Roman, serif', width: '40%' }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '2px solid #000',
                    paddingBottom: 6,
                    marginBottom: 8,
                    color: '#000'
                }}>
                    <div style={{ flex: 1, paddingRight: 10, textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>
                            Алматинский технологическо-финансовый и инновационно-технический колледж
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            КАРТОЧКА СТУДЕНТА
                        </div>
                        <div style={{ fontSize: 11, marginTop: 4 }}>
                            состоящего на внутриколледжном и профилактическом учёте
                        </div>
                    </div>
                    {student.photo && (
                        <img src={student.photo} alt={student.fullName} style={{
                            width: '3cm',
                            height: '4cm',
                            objectFit: 'cover',
                            border: '1px solid #000',
                            flexShrink: 0
                        }} />
                    )}
                </div>

                {/* Basic info */}
                <InfoSection>
                    <PrintRow label="ФИО" value={student.fullName} />
                    <PrintRow label="Дата рождения" value={student.birthDate} />
                    <PrintRow label="ИИН" value={student.iin} />
                    <PrintRow label="Группа" value={student.group} />
                    <PrintRow label="Специальность" value={student.specialty} />
                    <PrintRow label="Курс" value={student.course ? `${student.course} курс` : ''} />
                    <PrintRow label="Предыдущая школа" value={student.previousSchool} />
                    <PrintRow label="Адрес проживания" value={student.address} />
                    <PrintRow label="Телефон" value={student.phone} />
                </InfoSection>

                {/* Family */}
                <InfoSection title="Данные о семье">
                    {student.family.mother.fullName && (
                        <>
                            <PrintRow label="Мать (ФИО)" value={student.family.mother.fullName} />
                            <PrintRow label="Место работы" value={student.family.mother.workplace} />
                            <PrintRow label="Телефон" value={student.family.mother.phone} />
                        </>
                    )}
                    {student.family.father.fullName && (
                        <>
                            <PrintRow label="Отец (ФИО)" value={student.family.father.fullName} />
                            <PrintRow label="Место работы" value={student.family.father.workplace} />
                            <PrintRow label="Телефон" value={student.family.father.phone} />
                        </>
                    )}
                    {student.family.guardian.fullName && (
                        <>
                            <PrintRow label="Законный представитель" value={student.family.guardian.fullName} />
                            <PrintRow label="Родство" value={student.family.guardian.relationship} />
                            <PrintRow label="Телефон" value={student.family.guardian.phone} />
                        </>
                    )}
                    <PrintRow label="Состав семьи" value={student.family.familyType} />
                    <PrintRow label="Количество детей" value={student.family.childrenCount > 0 ? String(student.family.childrenCount) : ''} />
                    <PrintRow label="Социальный статус" value={student.family.socialStatus} />
                </InfoSection>

                {/* Internal registry */}
                <InfoSection title="Внутриколледжный учёт">
                    <PrintRow label="Дата постановки" value={ir.registrationDate} />
                    <PrintRow label="Основание" value={ir.grounds.join(', ')} />
                    <PrintRow label="Ответственный" value={ir.responsible} />
                    <PrintRow label="Статус" value={ir.status} />
                    {ir.status === 'Снят' && (
                        <>
                            <PrintRow label="Дата снятия" value={ir.removalDate} />
                            <PrintRow label="Основание снятия" value={ir.removalGrounds} />
                        </>
                    )}
                    <PrintRow label="Профилактическая работа" value={ir.preventiveWork} />
                    <PrintRow label="Результат" value={ir.result} />
                </InfoSection>

                {/* Police */}
                <InfoSection title="Учёт в Управлении полиции">
                    <PrintRow label="Состоит на учёте" value={pr.isRegistered ? 'Да' : 'Нет'} />
                    {pr.isRegistered && (
                        <>
                            <PrintRow label="Область" value={pr.region} />
                            <PrintRow label="Район" value={pr.district} />
                            <PrintRow label="Орган полиции" value={pr.policeOrgan} />
                            <PrintRow label="Вид учёта" value={pr.registrationType} />
                            <PrintRow label="Дата постановки" value={pr.registrationDate} />
                            <PrintRow label="Основание постановки" value={pr.grounds} />
                            <PrintRow label="Инспектор полиции" value={pr.inspector} />
                            {pr.removalDate && <PrintRow label="Дата снятия" value={pr.removalDate} />}
                            {pr.removalGrounds && <PrintRow label="Основание снятия" value={pr.removalGrounds} />}
                        </>
                    )}
                </InfoSection>

                {/* Psychology */}
                {lastConsult && (
                    <>
                        <InfoSection title="Работа психолога">
                            <PrintRow label="Дата последней консультации" value={lastConsult.date} />
                            <PrintRow label="Вид работы" value={lastConsult.workType} />
                            <PrintRow label="Заключение" value={lastConsult.conclusion} />
                            <PrintRow label="Рекомендации" value={lastConsult.recommendations} />
                            <PrintRow label="Динамика" value={lastConsult.dynamics} />
                        </InfoSection>
                    </>
                )}

                {/* Signatures */}
                <div style={{ marginTop: 12, borderTop: '1px solid #000', paddingTop: 8, color: '#000' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div>Заместитель директора: ___________________________</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>Психолог: ___________________________</div>
                        <div>Дата: {today}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable components for consistent styling
function SectionTitle({ children }: { children: React.ReactNode }) {
    return <div className="section-title">{children}</div>;
}

function PrintRow({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <tr className="print-row">
            <td className="print-label">{label}:</td>
            <td className="print-value">{value}</td>
        </tr>
    );
}

function InfoSection({ title, children }: { title?: string, children: React.ReactNode }) {
    return (
        <div className="print-section">
            {title && <SectionTitle>{title}</SectionTitle>}
            <table className="print-table">
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}
