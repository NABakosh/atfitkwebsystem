import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudents } from '../context/StudentsContext';
import { useToast } from '../context/ToastContext';
import { v4 as uuid } from 'uuid';
import type { Student, Consultation } from '../types';
import {
    INTERNAL_REGISTRY_GROUNDS, ALMATY_DISTRICTS, OBLAST_DISTRICTS, POLICE_REGISTRY_TYPES
} from '../types';
import { uploadStudentPhoto } from '../api/students';
import {
    User, Users, Building2, Shield, Brain, Save, ArrowLeft, Camera, Plus, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';

const EMPTY_STUDENT = (): Student => ({
    id: '',
    photo: '',
    fullName: '',
    birthDate: '',
    group: '',
    iin: '',
    previousSchool: '',
    specialty: '',
    course: '',
    address: '',
    phone: '',
    family: {
        mother: { fullName: '', workplace: '', phone: '' },
        father: { fullName: '', workplace: '', phone: '' },
        guardian: { fullName: '', relationship: '', phone: '' },
        familyType: '',
        childrenCount: 0,
        socialStatus: '',
    },
    internalRegistry: {
        registrationDate: '',
        grounds: [],
        responsible: '',
        preventiveWork: '',
        result: '',
        status: '',
        removalDate: '',
        removalGrounds: '',
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
    consultations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

const EMPTY_CONSULTATION = (): Consultation => ({
    id: uuid(),
    date: new Date().toISOString().slice(0, 10),
    workType: '',
    description: '',
    problems: '',
    recommendations: '',
    conclusion: '',
    dynamics: '',
});

const TABS = [
    { id: 'basic', label: 'Основные данные', icon: User },
    { id: 'family', label: 'Данные о семье', icon: Users },
    { id: 'internal', label: 'Внутриколледжный учёт', icon: Building2 },
    { id: 'police', label: 'Учёт в УП', icon: Shield },
    { id: 'psychology', label: 'Работа психолога', icon: Brain },
];

export function StudentFormPage() {
    const { id } = useParams<{ id?: string }>();
    const { add, update, students } = useStudents();
    const navigate = useNavigate();
    const toast = useToast();
    const [tab, setTab] = useState('basic');
    const [form, setForm] = useState<Student>(EMPTY_STUDENT);
    const [saving, setSaving] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const fileRef = useRef<HTMLInputElement>(null);
    const isEdit = !!id;

    useEffect(() => {
        if (isEdit) {
            const s = students.find(x => x.id === id);
            if (s) {
                setForm({ ...s });
                setPhotoPreview(s.photo || '');
            }
        }
    }, [id, students]);

    const set = (path: string, value: unknown) => {
        setForm(prev => {
            const next = { ...prev };
            const keys = path.split('.');
            let obj: Record<string, unknown> = next as unknown as Record<string, unknown>;
            for (let i = 0; i < keys.length - 1; i++) {
                obj[keys[i]] = { ...(obj[keys[i]] as Record<string, unknown>) };
                obj = obj[keys[i]] as Record<string, unknown>;
            }
            obj[keys[keys.length - 1]] = value;
            return next;
        });
    };

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        // Show local preview immediately
        const reader = new FileReader();
        reader.onload = ev => setPhotoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleRegionChange = (region: string) => {
        set('policeRegistry.region', region);
        set('policeRegistry.district', '');
        set('policeRegistry.policeOrgan', '');
    };

    const handleDistrictChange = (district: string) => {
        set('policeRegistry.district', district);
        set('policeRegistry.policeOrgan', district ? `УП ${district} района` : '');
    };

    const districts = form.policeRegistry.region === 'г. Алматы'
        ? ALMATY_DISTRICTS
        : form.policeRegistry.region === 'Алматинская область'
            ? OBLAST_DISTRICTS
            : [];

    const toggleGround = (g: string) => {
        const grounds = form.internalRegistry.grounds.includes(g)
            ? form.internalRegistry.grounds.filter(x => x !== g)
            : [...form.internalRegistry.grounds, g];
        set('internalRegistry.grounds', grounds);
    };

    const addConsultation = () => {
        set('consultations', [...form.consultations, EMPTY_CONSULTATION()]);
    };

    const updateConsultation = (idx: number, field: string, value: string) => {
        const updated = form.consultations.map((c, i) =>
            i === idx ? { ...c, [field]: value } : c
        );
        set('consultations', updated);
    };

    const removeConsultation = (idx: number) => {
        set('consultations', form.consultations.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.fullName.trim()) {
            setTab('basic');
            toast.error('Введите ФИО студента');
            return;
        }
        setSaving(true);
        try {
            // Prepare data without photo (photo uploaded separately)
            const studentData = {
                fullName: form.fullName,
                birthDate: form.birthDate,
                group: form.group,
                iin: form.iin,
                previousSchool: form.previousSchool,
                specialty: form.specialty,
                course: form.course,
                address: form.address,
                phone: form.phone,
                family: form.family,
                internalRegistry: form.internalRegistry,
                policeRegistry: form.policeRegistry,
                consultations: form.consultations,
            };

            let savedStudent: Student;
            if (isEdit) {
                savedStudent = await update(id!, studentData);
                toast.success(`Данные студента «${form.fullName}» сохранены`);
            } else {
                savedStudent = await add({ ...studentData, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Parameters<typeof add>[0]);
                toast.success(`Студент «${form.fullName}» добавлен`);
            }

            // Upload photo if a new file was selected
            if (photoFile && savedStudent?.id) {
                try {
                    await uploadStudentPhoto(savedStudent.id, photoFile);
                } catch {
                    toast.error('Студент сохранён, но фото не загрузилось — повторите позже');
                }
            }

            navigate('/dashboard');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
            toast.error(`Ошибка: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <div className="page-header-text">
                    <h1>{isEdit ? 'Редактировать студента' : 'Добавить студента'}</h1>
                    <p>{isEdit ? `Редактирование: ${form.fullName}` : 'Заполните данные нового студента'}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    <ArrowLeft size={15} />
                    Назад
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="tabs">
                    {TABS.map(t => {
                        const Icon = t.icon;
                        return (
                            <button key={t.id} type="button" className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                                <Icon size={14} />
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* ===== BASIC ===== */}
                {tab === 'basic' && (
                    <div className="card">
                        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                            {/* Photo */}
                            <div>
                                <div className="section-title" style={{ fontSize: 12, marginBottom: 12 }}>Фото студента</div>
                                <div className="photo-upload-area" style={{ width: 120, padding: 16 }}
                                    onClick={() => fileRef.current?.click()}>
                                    {photoPreview
                                        ? <img src={photoPreview} alt="Фото" className="photo-preview" style={{ width: 90, height: 120 }} />
                                        : <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <Camera size={28} style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                                            <span style={{ fontSize: 11 }}>Загрузить фото</span>
                                        </div>
                                    }
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                                {photoPreview && (
                                    <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 8, width: '100%' }}
                                        onClick={() => { setPhotoPreview(''); setPhotoFile(null); }}>
                                        Удалить фото
                                    </button>
                                )}
                            </div>

                            {/* Fields */}
                            <div style={{ flex: 1, minWidth: 300 }}>
                                <div className="form-grid">
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label required">ФИО студента</label>
                                        <input className="form-input" type="text" placeholder="Фамилия Имя Отчество"
                                            value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label required">Дата рождения</label>
                                        <input className="form-input" type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ИИН</label>
                                        <input className="form-input" type="text" placeholder="123456789012" maxLength={12}
                                            value={form.iin} onChange={e => set('iin', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Группа</label>
                                        <input className="form-input" type="text" placeholder="ИС-23" value={form.group} onChange={e => set('group', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Курс</label>
                                        <select className="form-select" value={form.course} onChange={e => set('course', e.target.value)}>
                                            <option value="">Выбрать</option>
                                            {['1', '2', '3', '4'].map(c => <option key={c} value={c}>{c} курс</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Специальность</label>
                                        <input className="form-input" type="text" placeholder="Информационные системы" value={form.specialty} onChange={e => set('specialty', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Предыдущая школа</label>
                                        <input className="form-input" type="text" placeholder="СОШ №1" value={form.previousSchool} onChange={e => set('previousSchool', e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Адрес проживания</label>
                                        <input className="form-input" type="text" placeholder="г. Алматы, ул. ..." value={form.address} onChange={e => set('address', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Телефон</label>
                                        <input className="form-input" type="tel" placeholder="+7 (7xx) xxx-xx-xx" value={form.phone} onChange={e => set('phone', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== FAMILY ===== */}
                {tab === 'family' && (
                    <div className="card">
                        <FamilySection label="Мать" prefix="family.mother" form={form} set={set} />
                        <div className="divider" />
                        <FamilySection label="Отец" prefix="family.father" form={form} set={set} />
                        <div className="divider" />
                        <div className="section-title"><Users size={16} />Законный представитель</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">ФИО</label>
                                <input className="form-input" type="text" value={form.family.guardian.fullName} onChange={e => set('family.guardian.fullName', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Родство</label>
                                <input className="form-input" type="text" placeholder="Опекун, бабушка, дядя..." value={form.family.guardian.relationship} onChange={e => set('family.guardian.relationship', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Телефон</label>
                                <input className="form-input" type="tel" value={form.family.guardian.phone} onChange={e => set('family.guardian.phone', e.target.value)} />
                            </div>
                        </div>
                        <div className="divider" />
                        <div className="section-title"><Users size={16} />Состав семьи</div>
                        <div className="form-grid-3">
                            <div className="form-group">
                                <label className="form-label">Тип семьи</label>
                                <div className="radio-group">
                                    {['Полная', 'Неполная'].map(t => (
                                        <label key={t} className="radio-item">
                                            <input type="radio" name="familyType" value={t} checked={form.family.familyType === t} onChange={() => set('family.familyType', t)} />
                                            {t}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Количество детей</label>
                                <input className="form-input" type="number" min={0} max={20} value={form.family.childrenCount || ''}
                                    onChange={e => set('family.childrenCount', parseInt(e.target.value) || 0)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Социальный статус</label>
                                <select className="form-select" value={form.family.socialStatus} onChange={e => set('family.socialStatus', e.target.value)}>
                                    <option value="">Выбрать</option>
                                    <option>Малообеспеченная</option>
                                    <option>Многодетная</option>
                                    <option>Неблагополучная</option>
                                    <option>Опекунская</option>
                                    <option>Благополучная</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== INTERNAL ===== */}
                {tab === 'internal' && (
                    <div className="card">
                        <div className="section-title"><Building2 size={16} />Внутриколледжный учёт</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Дата постановки</label>
                                <input className="form-input" type="date" value={form.internalRegistry.registrationDate} onChange={e => set('internalRegistry.registrationDate', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Статус</label>
                                <div className="radio-group">
                                    {['На учете', 'Снят'].map(s => (
                                        <label key={s} className="radio-item">
                                            <input type="radio" name="intStatus" value={s} checked={form.internalRegistry.status === s}
                                                onChange={() => set('internalRegistry.status', s)} />
                                            {s}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ответственный</label>
                                <input className="form-input" type="text" placeholder="ФИО ответственного" value={form.internalRegistry.responsible} onChange={e => set('internalRegistry.responsible', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Основание постановки</label>
                            <div className="checkbox-group">
                                {INTERNAL_REGISTRY_GROUNDS.map(g => (
                                    <label key={g} className={`checkbox-item ${form.internalRegistry.grounds.includes(g) ? 'checked' : ''}`}
                                        onClick={() => toggleGround(g)}>
                                        <input type="checkbox" checked={form.internalRegistry.grounds.includes(g)} onChange={() => { }} />
                                        {g}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-grid-2" style={{ marginTop: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Профилактическая работа</label>
                                <textarea className="form-textarea" rows={4} value={form.internalRegistry.preventiveWork} onChange={e => set('internalRegistry.preventiveWork', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Результат</label>
                                <textarea className="form-textarea" rows={4} value={form.internalRegistry.result} onChange={e => set('internalRegistry.result', e.target.value)} />
                            </div>
                        </div>
                        {form.internalRegistry.status === 'Снят' && (
                            <div className="form-grid-2" style={{ marginTop: 8, padding: '16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 8 }}>
                                <div className="form-group">
                                    <label className="form-label">Дата снятия</label>
                                    <input className="form-input" type="date" value={form.internalRegistry.removalDate} onChange={e => set('internalRegistry.removalDate', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Основание снятия</label>
                                    <input className="form-input" type="text" value={form.internalRegistry.removalGrounds} onChange={e => set('internalRegistry.removalGrounds', e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== POLICE ===== */}
                {tab === 'police' && (
                    <div className="card">
                        <div className="section-title"><Shield size={16} />Учёт в Управлении полиции</div>
                        <div className="form-group">
                            <label className="form-label">Состоит на учёте в УП?</label>
                            <div className="radio-group">
                                <label className="radio-item">
                                    <input type="radio" name="policeReg" checked={form.policeRegistry.isRegistered === true}
                                        onChange={() => set('policeRegistry.isRegistered', true)} />
                                    Да
                                </label>
                                <label className="radio-item">
                                    <input type="radio" name="policeReg" checked={form.policeRegistry.isRegistered === false}
                                        onChange={() => { set('policeRegistry.isRegistered', false); set('policeRegistry.region', ''); set('policeRegistry.district', ''); set('policeRegistry.policeOrgan', ''); }} />
                                    Нет
                                </label>
                            </div>
                        </div>

                        {form.policeRegistry.isRegistered && (
                            <>
                                <div className="divider" />
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label required">Область</label>
                                        <select className="form-select" value={form.policeRegistry.region} onChange={e => handleRegionChange(e.target.value)}>
                                            <option value="">Выбрать область</option>
                                            <option>г. Алматы</option>
                                            <option>Алматинская область</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label required">Район</label>
                                        <select className="form-select" value={form.policeRegistry.district}
                                            onChange={e => handleDistrictChange(e.target.value)}
                                            disabled={!form.policeRegistry.region}>
                                            <option value="">Выбрать район</option>
                                            {districts.map(d => <option key={d} value={d}>{d} район</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Наименование органа полиции</label>
                                        <input className="form-input" type="text" value={form.policeRegistry.policeOrgan} readOnly
                                            style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Вид учёта несовершеннолетнего</label>
                                    <select className="form-select" value={form.policeRegistry.registrationType} onChange={e => set('policeRegistry.registrationType', e.target.value)}>
                                        <option value="">Выбрать вид учёта</option>
                                        {POLICE_REGISTRY_TYPES.map((t, i) => <option key={i} value={t}>{i + 1}. {t}</option>)}
                                    </select>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Дата постановки</label>
                                        <input className="form-input" type="date" value={form.policeRegistry.registrationDate} onChange={e => set('policeRegistry.registrationDate', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Инспектор полиции (ФИО)</label>
                                        <input className="form-input" type="text" placeholder="ФИО инспектора" value={form.policeRegistry.inspector} onChange={e => set('policeRegistry.inspector', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Дата снятия</label>
                                        <input className="form-input" type="date" value={form.policeRegistry.removalDate} onChange={e => set('policeRegistry.removalDate', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Основание постановки</label>
                                        <textarea className="form-textarea" rows={3} value={form.policeRegistry.grounds} onChange={e => set('policeRegistry.grounds', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Основание снятия</label>
                                        <textarea className="form-textarea" rows={3} value={form.policeRegistry.removalGrounds} onChange={e => set('policeRegistry.removalGrounds', e.target.value)} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ===== PSYCHOLOGY ===== */}
                {tab === 'psychology' && (
                    <div className="card">
                        <div className="card-header">
                            <div className="section-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                                <Brain size={16} />
                                Журнал консультаций психолога
                            </div>
                            <button type="button" className="btn btn-primary btn-sm" onClick={addConsultation}>
                                <Plus size={14} />
                                Добавить запись
                            </button>
                        </div>
                        {form.consultations.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                Записей нет. Нажмите «Добавить запись».
                            </div>
                        )}
                        {form.consultations.map((c, idx) => (
                            <ConsultationEntry key={c.id} entry={c} index={idx}
                                onChange={(f, v) => updateConsultation(idx, f, v)}
                                onRemove={() => removeConsultation(idx)} />
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={15} />
                        Отмена
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        <Save size={15} />
                        {saving ? 'Сохранение…' : isEdit ? 'Сохранить изменения' : 'Добавить студента'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function FamilySection({
    label, prefix, form, set
}: {
    label: string; prefix: string; form: Student; set: (p: string, v: unknown) => void;
}) {
    const parts = prefix.split('.');
    type FamilyKey = 'mother' | 'father' | 'guardian';
    const data = (form as unknown as Record<string, Record<FamilyKey, { fullName: string; workplace: string; phone: string; relationship?: string }>>)[parts[0]][parts[1] as FamilyKey];
    return (
        <>
            <div className="section-title"><Users size={16} />{label}</div>
            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">ФИО</label>
                    <input className="form-input" type="text" value={data.fullName} onChange={e => set(`${prefix}.fullName`, e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Место работы</label>
                    <input className="form-input" type="text" value={data.workplace} onChange={e => set(`${prefix}.workplace`, e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Телефон</label>
                    <input className="form-input" type="tel" value={data.phone} onChange={e => set(`${prefix}.phone`, e.target.value)} />
                </div>
            </div>
        </>
    );
}

function ConsultationEntry({ entry, index, onChange, onRemove }: {
    entry: Consultation; index: number;
    onChange: (field: string, value: string) => void;
    onRemove: () => void;
}) {
    const [open, setOpen] = useState(true);

    return (
        <div className="consultation-entry">
            <div className="consultation-entry-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="entry-number">Запись #{index + 1}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{entry.date}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(o => !o)}>
                        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={onRemove}>
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {open && (
                <div className="form-grid-3">
                    <div className="form-group">
                        <label className="form-label">Дата</label>
                        <input className="form-input" type="date" value={entry.date} onChange={e => onChange('date', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '2 / -1' }}>
                        <label className="form-label">Вид работы</label>
                        <select className="form-select" value={entry.workType} onChange={e => onChange('workType', e.target.value)}>
                            <option value="">Выбрать</option>
                            <option>Индивидуальное консультирование</option>
                            <option>Групповая работа</option>
                            <option>Тестирование</option>
                            <option>Наблюдение</option>
                            <option>Беседа</option>
                            <option>Тренинг</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Описание</label>
                        <textarea className="form-textarea" rows={2} value={entry.description} onChange={e => onChange('description', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Проблемы</label>
                        <textarea className="form-textarea" rows={3} value={entry.problems} onChange={e => onChange('problems', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Рекомендации</label>
                        <textarea className="form-textarea" rows={3} value={entry.recommendations} onChange={e => onChange('recommendations', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Заключение</label>
                        <textarea className="form-textarea" rows={3} value={entry.conclusion} onChange={e => onChange('conclusion', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Динамика</label>
                        <textarea className="form-textarea" rows={2} value={entry.dynamics} onChange={e => onChange('dynamics', e.target.value)} />
                    </div>
                </div>
            )}
        </div>
    );
}
