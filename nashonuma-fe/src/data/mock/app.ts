// Sample data shared by several pages (copied from logic.js). Page-only samples live next to their page builder.

export type Role = 'supervisor' | 'clinician' | 'programme' | 'researcher' | 'admin' | 'parent';

/** [key, label, icon, description] */
export const ROLES: [Role, string, string, string][] = [
  ['supervisor', 'Supervisor', 'users', 'Team, referrals, data quality'],
  ['clinician', 'Clinician', 'stethoscope', 'Referral queue and outcomes'],
  ['programme', 'Programme manager', 'map', 'Districts, DHIS2, exports'],
  ['researcher', 'Researcher', 'flask-conical', 'Validation study'],
  ['admin', 'Admin', 'settings-2', 'Instruments, users, audit'],
  ['parent', 'Parent (mother)', 'smartphone', 'Check my child and myself']
];

/** Sidebar per role: [page, icon, label]. The first page is the role's home. */
export const NAV: Record<Role, [string, string, string][]> = {
  supervisor: [['overview', 'layout-dashboard', 'Overview'], ['referrals', 'send', 'Overdue referrals'], ['quality', 'shield-check', 'Data quality']],
  clinician: [['queue', 'inbox', 'Referral queue'], ['completed', 'circle-check', 'Completed'], ['reports', 'smartphone', 'Parent reports'], ['mothers', 'activity', 'Mothers’ wellbeing'], ['children', 'users', 'Children'], ['morbas', 'clipboard-check', 'MORBAS assessment'], ['exercises', 'play', 'Child exercises']],
  parent: [['pcheck', 'smartphone', 'Check my child'], ['psent', 'history', 'My checks'], ['pwell', 'activity', 'My wellbeing'], ['pexer', 'play', 'Play with my child']],
  programme: [['dashboard', 'map', 'District dashboard'], ['dhis', 'refresh-cw', 'DHIS2 sync'], ['exports', 'download', 'Exports']],
  researcher: [['validation', 'activity', 'Validation study'], ['pairs', 'link', 'Linked pairs']],
  admin: [['instruments', 'list-checks', 'Instruments'], ['users', 'users', 'Users & access'], ['audit', 'history', 'Audit log'], ['consent', 'user-x', 'Consent withdrawal']]
};

export const isRole = (r: string | undefined): r is Role => !!r && r in NAV;

/** [initials, name, job] */
export const USERS: Record<Role, [string, string, string]> = {
  supervisor: ['RB', 'Rukhsana Begum', 'Supervisor'],
  clinician: ['SI', 'Dr Sana Iqbal', 'Paediatrician'],
  programme: ['IK', 'Imran Khattak', 'Programme manager'],
  researcher: ['HM', 'Dr Hira Malik', 'Research lead'],
  admin: ['FA', 'Faisal Ahmed', 'System admin'],
  parent: ['SB', 'Shazia Bibi', 'Mother']
};

/** Bell notifications: [text, when] */
export const NOTES: Record<Role, [string, string][]> = {
  supervisor: [['Farzana Gul hasn’t synced for 6 days', '2 hours ago'], ['3 referrals are now over 14 days late', 'Today, 08:00']],
  clinician: [['Ali Raza (RF-0418) has arrived', '10 min ago'], ['2 new referrals from Takht Bhai', 'Yesterday']],
  programme: [['Export EXP-0092 is awaiting approval', 'Today'], ['DHIS2 push failed on 13 Oct', '2 days ago']],
  researcher: [['2 screenings need a clinic match', 'Today']],
  admin: [['New consent withdrawal request', '26 Oct'], ['Instrument v2.1 is ready to publish', 'Today']],
  parent: [['Your clinic read your check for Bilal', 'Yesterday']]
};

/** Clinic referral queue: [id, child, age, band, days waiting, health worker, status, caregiver, referred on] */
export type Referral = [string, string, string, string, number, string, string, string, string];
export const REF: Referral[] = [
  ['RF-0418', 'Ali Raza', '1y 8m (corrected 1y 6m)', 'High', 12, 'Nasreen Bibi', 'Arrived', 'Shazia (mother) · 0312 ••• 482', '15 Oct'],
  ['RF-0423', 'Arham Shah', '5y 1m', 'High', 8, 'Salma Khan', 'Arrived', 'Nadia (mother) · 0315 ••• 907', '19 Oct'],
  ['RF-0402', 'Saad Ullah', '3y 2m', 'High', 47, 'Robina Kausar', 'Booked', 'Kiran (mother) · 0333 ••• 210', '10 Sep'],
  ['RF-0391', 'Bilal Khan', '2y 4m', 'High', 35, 'Nasreen Bibi', 'Not booked', 'Akbar (father) · 0301 ••• 554', '22 Sep'],
  ['RF-0409', 'Zainab Ahmed', '11m', 'High', 26, 'Nasreen Bibi', 'Booked', 'Rabia (mother) · 0345 ••• 118', '1 Oct'],
  ['RF-0412', 'Hira Bibi', '1y 11m', 'Medium', 39, 'Farzana Gul', 'Not booked', 'Sajida (mother) · 0300 ••• 342', '18 Sep'],
  ['RF-0420', 'Mahnoor', '2y 6m', 'Medium', 10, 'Kulsoom Bibi', 'Booked', 'Asma (mother) · 0321 ••• 655', '17 Oct']
];

/** Clinic outcomes: [key, label] */
export const OC: [string, string][] = [['asd', 'Autism (ASD)'], ['dd', 'Developmental delay'], ['both', 'Both ASD and DD'], ['typical', 'Typical development'], ['other', 'Other condition'], ['dna', 'Did not attend']];
export const ocLabel = (k: string) => (OC.find(o => o[0] === k) || OC[0])[1];

/** Consent withdrawal requests: [id, child, code, requested via, date, status] */
export const WR0: string[][] = [
  ['WR-0009', 'Hamid', 'NN-0377', 'Robina Kausar · spoken, witnessed', '26 Oct', 'Verified'],
  ['WR-0008', 'Areeba', 'NN-0341', 'Helpline call', '21 Oct', 'Awaiting ID'],
  ['WR-0007', 'Usman', 'NN-0233', 'Nasreen Bibi · signature', '25 Oct', 'Completed']
];
/** Requests with the ones deleted in this session marked Completed. */
export const consentRequests = (done: Record<string, boolean>) => WR0.map(r => (done[r[0]] ? r.slice(0, 5).concat(['Completed']) : r));

/** Instruments: [key, name, description, version, status, updated] */
export const instruments = (published: boolean): string[][] => [
  ['sdq', 'SDQ – Strengths and Difficulties', '25 items · 5 scales · children and teenagers', 'v1.0', 'Draft', '9 Nov'],
  ['morbas', 'MORBAS – Mongolian Rapid Baby Scale', '161 items · 7 areas · 16 days–42 months', 'v1.0', 'Live', '5 Nov'],
  ['scc', 'Social & talking check', '20 items · 16–30 months', 'v2.1', published ? 'Live' : 'Draft', 'Today'],
  ['msc', 'Milestones check', '6 age sets · 0–6 years', 'v3.0', 'Live', '3 Mar'],
  ['fup', 'Follow-up questions', 'Asked after Medium or High', 'v2.0', 'Live', '3 Mar'],
  ['mov', 'Movement check', '12 items · 6–48 months', 'v1.1', 'Live', '12 Jan']
];
