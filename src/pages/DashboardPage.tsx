import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudents } from '../context/StudentsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Printer, Download, Eye, Edit2, Trash2, User, FileText } from 'lucide-react';
import type { Student } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function DashboardPage() {
    const { students, remove } = useStudents();
    const { isDirector } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterGroup, setFilterGroup] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [pdfLoading, setPdfLoading] = useState(false);

    const groups = useMemo(() => [...new Set(students.map(s => s.group).filter(Boolean))].sort(), [students]);
    const districts = useMemo(() => [...new Set(students.filter(s => s.policeRegistry.isRegistered).map(s => s.policeRegistry.district).filter(Boolean))].sort(), [students]);

    const filtered = useMemo(() => {
        return students.filter(s => {
            if (search && !s.fullName.toLowerCase().includes(search.toLowerCase())) return false;
            if (filterGroup && s.group !== filterGroup) return false;
            if (filterDistrict && s.policeRegistry.district !== filterDistrict) return false;
            if (filterStatus === 'На учете' && s.internalRegistry.status !== 'На учете') return false;
            if (filterStatus === 'Снят' && s.internalRegistry.status !== 'Снят') return false;
            if (filterStatus === 'УП' && !s.policeRegistry.isRegistered) return false;
            return true;
        });
    }, [students, search, filterGroup, filterDistrict, filterStatus]);

    const hasFilters = !!(search || filterGroup || filterDistrict || filterStatus);

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Удалить студента «${name}»?`)) {
            remove(id);
            toast.success(`Студент «${name}» удалён`);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleJournalPDF = async () => {
        setPdfLoading(true);
        const el = document.getElementById('journal-print-area');
        if (!el) { setPdfLoading(false); return; }
        try {
            el.style.display = 'block';
            await new Promise(r => setTimeout(r, 300));
            const canvas = await html2canvas(el, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
            el.style.display = 'none';
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const imgW = pageW;
            const imgH = (canvas.height * imgW) / canvas.width;
            let yPos = 0;
            let drawn = 0;
            while (drawn < canvas.height) {
                const remaining = canvas.height - drawn;
                const sliceH = Math.min(remaining, (pageH / imgW) * canvas.width);
                const sliceCanvas = document.createElement('canvas');
                sliceCanvas.width = canvas.width;
                sliceCanvas.height = sliceH;
                const ctx = sliceCanvas.getContext('2d')!;
                ctx.drawImage(canvas, 0, drawn, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
                const sliceImg = sliceCanvas.toDataURL('image/png');
                if (yPos > 0) pdf.addPage();
                const sliceImgH = (sliceH * imgW) / canvas.width;
                pdf.addImage(sliceImg, 'PNG', 0, 0, imgW, sliceImgH);
                drawn += sliceH;
                yPos += sliceImgH;
            }
            pdf.save(`Журнал_учёта_${new Date().toLocaleDateString('ru-RU')}.pdf`);
            toast.success('PDF журнала успешно скачан');
        } catch {
            toast.error('Ошибка генерации PDF');
        }
        setPdfLoading(false);
    };

    const totalActive = students.filter(s => s.internalRegistry.status === 'На учете').length;
    const totalPolice = students.filter(s => s.policeRegistry.isRegistered).length;
    const totalRemoved = students.filter(s => s.internalRegistry.status === 'Снят').length;

    return (
        <div className="page-content">
            <div className="page-header no-print">
                <div className="page-header-text">
                    <h1>Журнал учёта студентов</h1>
                    <p>Алматинский технологическо-финансовый и инновационно-технический колледж</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-secondary" onClick={handlePrint} title="Распечатать журнал">
                        <Printer size={15} />
                        Печать
                    </button>
                    <button className="btn btn-info" onClick={handleJournalPDF} disabled={pdfLoading} title="Скачать PDF журнала">
                        <FileText size={15} />
                        {pdfLoading ? 'Генерация…' : 'PDF журнал'}
                    </button>
                    <Link to="/students/new" className="btn btn-primary">
                        <Plus size={15} />
                        Добавить студента
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row no-print">
                <div className="stat-card">
                    <div className="stat-value">{students.length}</div>
                    <div className="stat-label">Всего студентов</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#fca5a5' }}>{totalActive}</div>
                    <div className="stat-label">На учёте (колледж)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#93c5fd' }}>{totalPolice}</div>
                    <div className="stat-label">Учёт в УП</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#6ee7b7' }}>{totalRemoved}</div>
                    <div className="stat-label">Снято с учёта</div>
                </div>
            </div>

            {/* Search */}
            <div className="search-bar no-print">
                <div className="search-input-wrap" style={{ minWidth: 220 }}>
                    <Search size={15} className="search-icon" />
                    <input className="form-input" type="text" placeholder="Поиск по ФИО…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-select" style={{ width: 150 }} value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
                    <option value="">Все группы</option>
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select className="form-select" style={{ width: 170 }} value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}>
                    <option value="">Все районы УП</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="form-select" style={{ width: 170 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">Все статусы</option>
                    <option value="На учете">На учёте (колледж)</option>
                    <option value="Снят">Снят с учёта</option>
                    <option value="УП">Учёт в УП</option>
                </select>
                {hasFilters && (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterGroup(''); setFilterDistrict(''); setFilterStatus(''); }}>
                        Сбросить
                    </button>
                )}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {filtered.length} из {students.length}
                </span>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table id="main-table">
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Фото</th>
                            <th>ФИО</th>
                            <th>Группа</th>
                            <th>Район УП</th>
                            <th>Вид учёта УП</th>
                            <th>Учёт колледж</th>
                            <th>Учёт УП</th>
                            <th>Дата постановки</th>
                            <th>Статус</th>
                            <th className="no-print">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={11}>
                                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                                        {students.length === 0
                                            ? <>📋 Студентов нет. <Link to="/students/new" style={{ color: 'var(--gold)' }}>Добавить первого</Link></>
                                            : '🔍 По фильтрам ничего не найдено'}
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.map((s: Student, i) => (
                            <tr key={s.id}>
                                <td style={{ color: 'var(--text-muted)', fontSize: 12, width: 36 }}>{i + 1}</td>
                                <td style={{ width: 52 }}>
                                    {s.photo
                                        ? <img src={s.photo} alt={s.fullName} className="table-photo" />
                                        : <div className="photo-placeholder"><User size={18} /></div>
                                    }
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.fullName}</div>
                                    {s.birthDate && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.birthDate}</div>}
                                </td>
                                <td style={{ fontWeight: 500 }}>{s.group || '—'}</td>
                                <td>{s.policeRegistry.isRegistered ? (s.policeRegistry.district ? `${s.policeRegistry.district} р-н` : '—') : '—'}</td>
                                <td style={{ maxWidth: 220, fontSize: 11 }}>
                                    {s.policeRegistry.isRegistered && s.policeRegistry.registrationType
                                        ? <span title={s.policeRegistry.registrationType}>
                                            {s.policeRegistry.registrationType.substring(0, 55)}{s.policeRegistry.registrationType.length > 55 ? '…' : ''}
                                        </span>
                                        : '—'}
                                </td>
                                <td>
                                    {s.internalRegistry.registrationDate
                                        ? <span className={`badge ${s.internalRegistry.status === 'На учете' ? 'badge-active' : 'badge-removed'}`}>
                                            {s.internalRegistry.status || 'Да'}
                                        </span>
                                        : <span className="badge badge-no">Нет</span>}
                                </td>
                                <td>
                                    <span className={`badge ${s.policeRegistry.isRegistered ? 'badge-police' : 'badge-no'}`}>
                                        {s.policeRegistry.isRegistered ? 'Да' : 'Нет'}
                                    </span>
                                </td>
                                <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                    {s.internalRegistry.registrationDate || '—'}
                                </td>
                                <td>
                                    {s.internalRegistry.status
                                        ? <span className={`badge ${s.internalRegistry.status === 'На учете' ? 'badge-active' : 'badge-removed'}`}>
                                            {s.internalRegistry.status}
                                        </span>
                                        : <span className="badge badge-no">—</span>}
                                </td>
                                <td className="no-print" style={{ width: 110 }}>
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <button className="btn btn-info btn-sm" onClick={() => navigate(`/students/${s.id}`)} title="Просмотр">
                                            <Eye size={13} />
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/students/${s.id}/edit`)} title="Редактировать">
                                            <Edit2 size={13} />
                                        </button>
                                        {isDirector && (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id, s.fullName)} title="Удалить">
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Hidden PDF journal render area */}
            <JournalPDFArea students={filtered} />
        </div>
    );
}

function JournalPDFArea({ students }: { students: Student[] }) {
    const today = new Date().toLocaleDateString('ru-RU');
    return (
        <div id="journal-print-area" style={{ display: 'none', position: 'absolute', left: -9999, top: 0, background: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif', fontSize: 10, width: 1122 }}>
            <div style={{ padding: '10mm 15mm' }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 13, marginBottom: 6, color: '#000' }}>
                    Алматинский технологическо-финансовый и инновационно-технический колледж
                </div>
                <div style={{ textAlign: 'center', fontSize: 11, marginBottom: 3, color: '#000' }}>
                    Журнал внутриколледжного и профилактического учёта студентов
                </div>
                <div style={{ textAlign: 'center', color: '#666', fontSize: 10, marginBottom: 12 }}>Дата формирования: {today} · Записей: {students.length}</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9, color: '#000' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            {['№', 'ФИО', 'Группа', 'Дата рождения', 'Адрес', 'Район УП', 'Вид учёта УП', 'Учёт колледж', 'Учёт УП', 'Дата постановки', 'Статус'].map(h => (
                                <th key={h} style={{ border: '1px solid #333', padding: '4px 5px', fontWeight: 'bold', textAlign: 'center', color: '#000', background: '#f0f0f0' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s, i) => (
                            <tr key={s.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                <td style={{ border: '1px solid #ccc', padding: '3px 5px', textAlign: 'center', color: '#000' }}>{i + 1}</td>
                                <td style={{ border: '1px solid #ccc', padding: '3px 5px', fontWeight: 'bold', color: '#000' }}>{s.fullName}</td>
                                <td style={{ border: '1px solid #ccc', padding: '3px 5px', textAlign: 'center', color: '#000' }}>{s.group || '—'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '3px 5px', textAlign: 'center', color: '#000' }}>{s.birthDate || '—'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '3px 5px', maxWidth: 120, color: '#000' }}>{s.address || '—'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '3px 5px', color: '#000' }}>{s.policeRegistry.isRegistered ? (s.policeRegistry.district || '—') : '—'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '3px 5px', maxWidth: 180, fontSize: 8, color: '#000' }}>{s.policeRegistry.isRegistered ? (s.policeRegistry.registrationType || '—') : '—'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '3px 5px', textAlign: 'center', color: '#000' }}>{s.internalRegistry.registrationDate ? (s.internalRegistry.status || 'Да') : 'Нет'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '3px 5px', textAlign: 'center', color: '#000' }}>{s.policeRegistry.isRegistered ? 'Да' : 'Нет'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '3px 5px', textAlign: 'center', color: '#000' }}>{s.internalRegistry.registrationDate || '—'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '3px 5px', textAlign: 'center', color: '#000' }}>{s.internalRegistry.status || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#000' }}>
                    <span>Зам. директора: ___________________</span>
                    <span>Психолог: ___________________</span>
                    <span>Дата: {today}</span>
                </div>
            </div>
        </div>
    );
}

// Also export a printable version that shows when printing
export function PrintableJournal({ students }: { students: Student[] }) {
    const today = new Date().toLocaleDateString('ru-RU');
    return (
        <div className="print-only" style={{ fontFamily: 'Times New Roman, serif', fontSize: 11, color: 'black' }}>
            <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 8 }}>
                АТФИТК — Журнал учёта студентов · {today}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                <thead>
                    <tr>
                        {['№', 'ФИО', 'Группа', 'Дата рождения', 'Район УП', 'Вид учёта', 'Учёт колл.', 'Учёт УП', 'Дата', 'Статус'].map(h => (
                            <th key={h} style={{ border: '1px solid #000', padding: '3px 5px', background: '#f0f0f0', fontWeight: 'bold' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {students.map((s, i) => (
                        <tr key={s.id}>
                            <td style={{ border: '1px solid #000', padding: '2px 5px', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 5px', fontWeight: 'bold' }}>{s.fullName}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 5px', textAlign: 'center' }}>{s.group}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 5px', textAlign: 'center' }}>{s.birthDate}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 5px' }}>{s.policeRegistry.isRegistered ? s.policeRegistry.district : '—'}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 5px', fontSize: 9 }}>{s.policeRegistry.isRegistered ? s.policeRegistry.registrationType?.substring(0, 40) : '—'}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 5px', textAlign: 'center' }}>{s.internalRegistry.registrationDate ? 'Да' : 'Нет'}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 5px', textAlign: 'center' }}>{s.policeRegistry.isRegistered ? 'Да' : 'Нет'}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 5px', textAlign: 'center' }}>{s.internalRegistry.registrationDate}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 5px', textAlign: 'center' }}>{s.internalRegistry.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <span>Зам. директора: ___________________</span>
                <span>Психолог: ___________________</span>
                <span>Дата: {today}</span>
            </div>
        </div>
    );
}
