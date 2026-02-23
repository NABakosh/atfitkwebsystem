export type UserRole = 'director' | 'psychologist';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  displayName: string;
}

export interface FamilyMember {
  fullName: string;
  workplace: string;
  phone: string;
}

export interface Guardian {
  fullName: string;
  relationship: string;
  phone: string;
}

export interface FamilyData {
  mother: FamilyMember;
  father: FamilyMember;
  guardian: Guardian;
  familyType: 'Полная' | 'Неполная' | '';
  childrenCount: number;
  socialStatus: string;
}

export interface InternalRegistry {
  registrationDate: string;
  grounds: string[];
  responsible: string;
  preventiveWork: string;
  result: string;
  status: 'На учете' | 'Снят' | '';
  removalDate: string;
  removalGrounds: string;
}

export interface PoliceRegistry {
  isRegistered: boolean;
  region: string;
  district: string;
  policeOrgan: string;
  registrationType: string;
  registrationDate: string;
  grounds: string;
  inspector: string;
  removalDate: string;
  removalGrounds: string;
}

export interface Consultation {
  id: string;
  date: string;
  workType: string;
  description: string;
  problems: string;
  recommendations: string;
  conclusion: string;
  dynamics: string;
}

// 1. Учёт у психолога колледжа
export interface PsychologistRegistry {
  isRegistered: boolean;
  registrationDate: string;
  grounds: string;
  responsible: string;
  preventiveWork: string;
  status: 'На учете' | 'Снят' | '';
  removalDate: string;
  removalGrounds: string;
  notes: string;
}

// 2. Группа сопровождения
export interface SupportGroup {
  isMember: boolean;
  groupName: string;
  joinDate: string;
  responsible: string;
  workDescription: string;
  result: string;
  exitDate: string;
  exitGrounds: string;
}

// 3. Учёт у психиатра / ЦПП
export interface PsychiatristRegistry {
  isRegistered: boolean;
  organization: string; // ЦПП, психиатр и т.д.
  registrationDate: string;
  diagnosis: string;
  doctor: string;
  treatmentPlace: string;
  status: 'На учете' | 'Снят' | '';
  removalDate: string;
  notes: string;
}

// 4. Сопровождение ЦПП
export interface CppAccompaniment {
  isActive: boolean;
  startDate: string;
  specialist: string;
  workType: string;
  goals: string;
  results: string;
  endDate: string;
  notes: string;
}

// 5. Суицидальный учёт
export interface SuicideRegistry {
  hasFacts: boolean;
  incidents: SuicideIncident[];
}

export interface SuicideIncident {
  id: string;
  date: string;
  type: 'Суицид' | 'Попытка суицида' | 'Суицидальные мысли' | 'Суицидальные угрозы' | '';
  description: string;
  measures: string;
  specialist: string;
  parentNotified: boolean;
  policeNotified: boolean;
  hospitalized: boolean;
  notes: string;
}

export interface Student {
  id: string;
  photo: string; // base64
  fullName: string;
  birthDate: string;
  group: string;
  iin: string;
  previousSchool: string;
  specialty: string;
  course: string;
  address: string;
  phone: string;
  family: FamilyData;
  internalRegistry: InternalRegistry;
  policeRegistry: PoliceRegistry;
  consultations: Consultation[];
  psychologistRegistry: PsychologistRegistry;
  supportGroup: SupportGroup;
  psychiatristRegistry: PsychiatristRegistry;
  cppAccompaniment: CppAccompaniment;
  suicideRegistry: SuicideRegistry;
  createdAt: string;
  updatedAt: string;
}

export const INTERNAL_REGISTRY_GROUNDS = [
  'Неуспеваемость',
  'Прогулы занятий',
  'Агрессивное поведение',
  'Конфликтность',
  'Употребление ПАВ',
  'Правонарушения',
  'Трудная жизненная ситуация',
  'Социально опасное положение',
  'Другое',
];

export const ALMATY_DISTRICTS = [
  'Алатауский',
  'Алмалинский',
  'Ауэзовский',
  'Бостандыкский',
  'Жетысуский',
  'Медеуский',
  'Наурызбайский',
  'Турксибский',
];

export const OBLAST_DISTRICTS = [
  'Балхашский',
  'Енбекшиказахский',
  'Жамбылский',
  'Илийский',
  'Карасайский',
  'Кегенский',
  'Райымбекский',
  'Талгарский',
  'Уйгурский',
];

export const POLICE_REGISTRY_TYPES = [
  'Профилактический учет в ОЮП «Несовершеннолетний, не посещающий по неуважительным причинам»',
  'Учет за административное правонарушение',
  'Учет за уголовное правонарушение',
  'Учет несовершеннолетнего в социально опасном положении',
  'Учет безнадзорного или склонного к бродяжничеству',
  'Учет за нарушение общественного порядка',
  'Учет за употребление психоактивных, токсических веществ, наркотических средств, спиртных напитков, табакокурение. Учет несовершеннолетнего группы риска',
  'Учет неблагополучной семьи',
  'Игровая и интернет-зависимость, лудомания',
  'Учет условно осужденного несовершеннолетнего',
];
