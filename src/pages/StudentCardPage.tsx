import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStudents } from '../context/StudentsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Edit2, Trash2, Printer, Download, User, Phone, Home, Calendar, Shield, Brain, Building2 } from 'lucide-react';
import { PrintCard } from '../components/PrintCard';
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function StudentCardPage() {
    const { id } = useParams<{ id: string }>();
    const { students, remove } = useStudents();
    const { isDirector } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [showPrint, setShowPrint] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);

    const student = students.find(s => s.id === id);
    if (!student) {
        return (
            <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Студент не найден</p>
                <Link to="/dashboard" className="btn btn-primary">К журналу</Link>
            </div>
        );
    }

    const handlePrint = () => {
        setShowPrint(true);
        setTimeout(() => { window.print(); setShowPrint(false); }, 300);
    };

    const handlePDF = async () => {
        setShowPrint(true);
        setPdfLoading(true);
        await new Promise(r => setTimeout(r, 400));
        const el = document.getElementById('print-card-area');
        if (!el) { setShowPrint(false); setPdfLoading(false); return; }
        try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const w = pdf.internal.pageSize.getWidth();
            const h = (canvas.height * w) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, w, h);
            pdf.save(`Карточка_${student.fullName}.pdf`);
            toast.success('PDF карточки успешно скачан');
        } catch (err) {
            toast.error('Ошибка генерации PDF');
        }
        setShowPrint(false);
        setPdfLoading(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Удалить студента «${student.fullName}»?`)) {
            remove(student.id);
            toast.success(`Студент «${student.fullName}» удалён`);
            navigate('/dashboard');
        }
    };

    const ir = student.internalRegistry;
    const pr = student.policeRegistry;

    return (
        <div className="page-content">
            <div className="page-header no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={15} />
                    </button>
                    <div className="page-header-text">
                        <h1>{student.fullName}</h1>
                        <p>{student.group} · {student.specialty}</p>
                    </div>
                </div>
                <div className="page-actions">
                    <button className="btn btn-info" onClick={handlePrint}>
                        <Printer size={15} />
                        Распечатать карточку
                    </button>
                    <button className="btn btn-secondary" onClick={handlePDF} disabled={pdfLoading}>
                        <Download size={15} />
                        {pdfLoading ? 'Генерация…' : 'Скачать PDF'}
                    </button>
                    <Link to={`/students/${student.id}/edit`} className="btn btn-primary">
                        <Edit2 size={15} />
                        Редактировать
                    </Link>
                    {isDirector && (
                        <button className="btn btn-danger" onClick={handleDelete}>
                            <Trash2 size={15} />
                            Удалить
                        </button>
                    )}
                </div>
            </div>

            <div className="no-print">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Basic info */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title"><User size={16} />Основные данные</div>
                        </div>
                        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                            {student.photo
                                ? <img src={student.photo} alt={student.fullName} style={{ width: 80, height: 107, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--gold-dark)', flexShrink: 0 }} />
                                : <div style={{ width: 80, height: 107, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={32} color="var(--text-muted)" /></div>
                            }
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <InfoRow icon={<Calendar size={13} />} label="Дата рождения" val={student.birthDate} />
                                <InfoRow icon={<User size={13} />} label="Группа / Курс" val={[student.group, student.course ? `${student.course} курс` : ''].filter(Boolean).join(', ')} />
                                <InfoRow icon={<Building2 size={13} />} label="Специальность" val={student.specialty} />
                                <InfoRow icon={<Home size={13} />} label="Адрес" val={student.address} />
                                <InfoRow icon={<Phone size={13} />} label="Телефон" val={student.phone} />
                                <InfoRow icon={<Building2 size={13} />} label="ИИН" val={student.iin} />
                            </div>
                        </div>
                    </div>

                    {/* Family */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">👨‍👩‍👧 Данные о семье</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {student.family.mother.fullName && <InfoBlock title="Мать" items={[student.family.mother.fullName, student.family.mother.workplace, student.family.mother.phone]} />}
                            {student.family.father.fullName && <InfoBlock title="Отец" items={[student.family.father.fullName, student.family.father.workplace, student.family.father.phone]} />}
                            {student.family.guardian.fullName && <InfoBlock title="Законный представитель" items={[`${student.family.guardian.fullName} (${student.family.guardian.relationship})`, student.family.guardian.phone]} />}
                            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                                {student.family.familyType && <span className="badge badge-police">{student.family.familyType} семья</span>}
                                {student.family.socialStatus && <span className="badge badge-no">{student.family.socialStatus}</span>}
                                {student.family.childrenCount > 0 && <span className="badge badge-no">Детей: {student.family.childrenCount}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Internal registry */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title"><Building2 size={16} />Внутриколледжный учёт</div>
                            {ir.status && <span className={`badge ${ir.status === 'На учете' ? 'badge-active' : 'badge-removed'}`}>{ir.status}</span>}
                        </div>
                        {ir.registrationDate ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <InfoRow label="Дата постановки" val={ir.registrationDate} />
                                <InfoRow label="Ответственный" val={ir.responsible} />
                                {ir.grounds.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>ОСНОВАНИЯ</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {ir.grounds.map(g => <span key={g} className="badge badge-police">{g}</span>)}
                                        </div>
                                    </div>
                                )}
                                {ir.preventiveWork && <InfoRow label="Профилактическая работа" val={ir.preventiveWork} />}
                                {ir.result && <InfoRow label="Результат" val={ir.result} />}
                                {ir.status === 'Снят' && ir.removalDate && <InfoRow label="Дата снятия" val={ir.removalDate} />}
                            </div>
                        ) : <p style={{ color: 'var(--text-muted)' }}>На внутриколледжном учёте не состоит</p>}
                    </div>

                    {/* Police registry */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title"><Shield size={16} />Учёт в Управлении полиции</div>
                            <span className={`badge ${pr.isRegistered ? 'badge-active' : 'badge-no'}`}>{pr.isRegistered ? 'Да' : 'Нет'}</span>
                        </div>
                        {pr.isRegistered ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <InfoRow label="Область" val={pr.region} />
                                <InfoRow label="Район" val={pr.district} />
                                <InfoRow label="Орган полиции" val={pr.policeOrgan} />
                                <InfoRow label="Вид учёта" val={pr.registrationType} />
                                <InfoRow label="Дата постановки" val={pr.registrationDate} />
                                <InfoRow label="Инспектор" val={pr.inspector} />
                                {pr.removalDate && <InfoRow label="Дата снятия" val={pr.removalDate} />}
                            </div>
                        ) : <p style={{ color: 'var(--text-muted)' }}>На учёте в УП не состоит</p>}
                    </div>
                </div>

                {/* Consultations */}
                {student.consultations.length > 0 && (
                    <div className="card" style={{ marginTop: 16 }}>
                        <div className="card-header">
                            <div className="card-title"><Brain size={16} />Журнал консультаций ({student.consultations.length})</div>
                        </div>
                        {student.consultations.map((c, i) => (
                            <div key={c.id} className="consultation-entry">
                                <div className="consultation-entry-header">
                                    <span className="entry-number">Запись #{i + 1}</span>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.date} · {c.workType}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                                    {c.description && <InfoRow label="Описание" val={c.description} />}
                                    {c.problems && <InfoRow label="Проблемы" val={c.problems} />}
                                    {c.recommendations && <InfoRow label="Рекомендации" val={c.recommendations} />}
                                    {c.conclusion && <InfoRow label="Заключение" val={c.conclusion} />}
                                    {c.dynamics && <InfoRow label="Динамика" val={c.dynamics} />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showPrint && <PrintCard student={student} />}
        </div>
    );
}

function InfoRow({ label, val, icon }: { label: string; val?: string; icon?: React.ReactNode }) {
    if (!val) return null;
    return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {icon && <span style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }}>{icon}</span>}
            <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{val}</div>
            </div>
        </div>
    );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
    return (
        <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', marginBottom: 6 }}>{title}</div>
            {items.filter(Boolean).map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{item}</div>
            ))}
        </div>
    );
}
