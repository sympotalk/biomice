export type DoctorRaw = {
  externalId: string;
  name: string;
  department: string;
  specialty?: string;
  position?: string;
  profileUrl?: string;
  notes?: string;
};

export type ScheduleRaw = {
  weekdays: Record<string, ("AM" | "PM" | "휴진")[]>;
  updatedAt: string;
};

export interface HospitalAdapter {
  code: string;
  name: string;
  region: string;
  doctorListUrl?: string;
  fetchDoctors(): Promise<DoctorRaw[]>;
  fetchDoctorSchedule(externalId: string): Promise<ScheduleRaw | null>;
}
