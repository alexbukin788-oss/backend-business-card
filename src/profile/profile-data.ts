export const PROFILE_ID = 'business-card';

export interface ProfileData {
  name: string;
  description: string;
  links: { label: string; url: string }[];
  skills: { name: string }[];
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    achievements: string[];
  }[];
  projects: { name: string; url: string }[];
}

export function validateProfileData(data: ProfileData): void {
  const text = (value: string, field: string) => {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must not be blank`);
  };
  const url = (value: string) => {
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      throw new Error('Invalid url');
    }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
      throw new Error('url must use HTTP(S) without credentials');
    }
  };
  const date = (value: string) => {
    const parsed = new Date(value);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== value
    ) {
      throw new Error('Date must be a valid YYYY-MM-DD calendar date');
    }
  };
  text(data.name, 'name');
  text(data.description, 'description');
  for (const link of data.links) {
    text(link.label, 'label');
    url(link.url);
  }
  for (const skill of data.skills) text(skill.name, 'skill.name');
  for (const project of data.projects) {
    text(project.name, 'project.name');
    url(project.url);
  }
  for (const job of data.experience) {
    text(job.company, 'company');
    text(job.position, 'position');
    date(job.startDate);
    if (job.endDate !== null) {
      date(job.endDate);
      if (job.endDate < job.startDate) throw new Error('Invalid work period');
    }
    job.achievements.forEach((value) => text(value, 'achievement'));
  }
}
