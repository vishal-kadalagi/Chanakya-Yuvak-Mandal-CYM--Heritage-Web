export type CommitteeCategory = 'all' | 'office' | 'core' | 'youth';

export interface CommitteeMember {
  id: string;
  nameEn: string;
  nameKn: string;
  roleEn: string;
  roleKn: string;
  category: 'office' | 'core' | 'youth';
  servicePeriodEn: string;
  servicePeriodKn: string;
  photoUrl?: string;
  isFounding?: boolean;
}

export const committeeMembers: CommitteeMember[] = [
  // Office Bearers
  {
    id: "m01",
    nameEn: "Santosh Patil",
    nameKn: "ಸಂತೋಷ ಪಾಟೀಲ",
    roleEn: "President",
    roleKn: "ಅಧ್ಯಕ್ಷರು",
    category: "office",
    servicePeriodEn: "Founding Member (2019 – Present)",
    servicePeriodKn: "ಸ್ಥಾಪಕ ಸದಸ್ಯರು (2019 ರಿಂದ ನಿರಂತರ)",
    isFounding: true
  },
  {
    id: "m02",
    nameEn: "Basavaraj Kamble",
    nameKn: "ಬಸವರಾಜ ಕಾಂಬಳೆ",
    roleEn: "Vice President",
    roleKn: "ಉಪಾಧ್ಯಕ್ಷರು",
    category: "office",
    servicePeriodEn: "Founding Member (2019 – Present)",
    servicePeriodKn: "ಸ್ಥಾಪಕ ಸದಸ್ಯರು (2019 ರಿಂದ ನಿರಂತರ)",
    isFounding: true
  },
  {
    id: "m03",
    nameEn: "Praveen Kadam",
    nameKn: "ಪ್ರವೀಣ ಕದಮ್",
    roleEn: "General Secretary",
    roleKn: "ಪ್ರಧಾನ ಕಾರ್ಯದರ್ಶಿ",
    category: "office",
    servicePeriodEn: "Active Leader (2019 – Present)",
    servicePeriodKn: "ಸಕ್ರಿಯ ನಾಯಕರು (2019 ರಿಂದ ನಿರಂತರ)",
    isFounding: true
  },
  {
    id: "m04",
    nameEn: "Chetan Shinde",
    nameKn: "ಚೇತನ ಶಿಂದೆ",
    roleEn: "Treasurer",
    roleKn: "ಖಜಾಂಚಿ",
    category: "office",
    servicePeriodEn: "Managing Trustee (2020 – Present)",
    servicePeriodKn: "ಖಜಾಂಚಿ (2020 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m05",
    nameEn: "Raju Pujari",
    nameKn: "ರಾಜು ಪೂಜಾರಿ",
    roleEn: "Chief Cultural Coordinator",
    roleKn: "ಮುಖ್ಯ ಸಾಂಸ್ಕೃತಿಕ ಸಂಯೋಜಕರು",
    category: "office",
    servicePeriodEn: "Founding Member (2019 – Present)",
    servicePeriodKn: "ಸ್ಥಾಪಕ ಸದಸ್ಯರು (2019 ರಿಂದ ನಿರಂತರ)",
    isFounding: true
  },

  // Core Committee
  {
    id: "m06",
    nameEn: "Anand Metri",
    nameKn: "ಆನಂದ ಮೇತ್ರಿ",
    roleEn: "Core Committee Member",
    roleKn: "ಕೋರ್ ಕಮಿಟಿ ಸದಸ್ಯರು",
    category: "core",
    servicePeriodEn: "Pandal Architect (2019 – Present)",
    servicePeriodKn: "ಮಂಟಪ ನಿರ್ವಹಣೆ (2019 ರಿಂದ ನಿರಂತರ)",
    isFounding: true
  },
  {
    id: "m07",
    nameEn: "Kiran Naik",
    nameKn: "ಕಿರಣ ನಾಯ್ಕ",
    roleEn: "Core Committee Member",
    roleKn: "ಕೋರ್ ಕಮಿಟಿ ಸದಸ್ಯರು",
    category: "core",
    servicePeriodEn: "Logistics Head (2019 – Present)",
    servicePeriodKn: "ವ್ಯವಸ್ಥಾಪಕರು (2019 ರಿಂದ ನಿರಂತರ)",
    isFounding: true
  },
  {
    id: "m08",
    nameEn: "Sachin Badiger",
    nameKn: "ಸಚಿನ್ ಬಡಿಗೇರ",
    roleEn: "Core Committee Member",
    roleKn: "ಕೋರ್ ಕಮಿಟಿ ಸದಸ್ಯರು",
    category: "core",
    servicePeriodEn: "Pooja & Rituals Lead (2020 – Present)",
    servicePeriodKn: "ಧಾರ್ಮಿಕ ಪೂಜಾ ಉಸ್ತುವಾರಿ (2020 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m09",
    nameEn: "Vinod Talwar",
    nameKn: "ವಿನೋದ ತಳವಾರ",
    roleEn: "Core Committee Member",
    roleKn: "ಕೋರ್ ಕಮಿಟಿ ಸದಸ್ಯರು",
    category: "core",
    servicePeriodEn: "Maha Prasad In-Charge (2019 – Present)",
    servicePeriodKn: "ಮಹಾಪ್ರಸಾದ ಉಸ್ತುವಾರಿ (2019 ರಿಂದ ನಿರಂತರ)",
    isFounding: true
  },
  {
    id: "m10",
    nameEn: "Mallikarjun Hugar",
    nameKn: "ಮಲ್ಲಿಕಾರ್ಜುನ ಹೂಗಾರ",
    roleEn: "Core Committee Member",
    roleKn: "ಕೋರ್ ಕಮಿಟಿ ಸದಸ್ಯರು",
    category: "core",
    servicePeriodEn: "Sound & Illumination Lead (2021 – Present)",
    servicePeriodKn: "ಧ್ವನಿ ಮತ್ತು ದೀಪಾಲಂಕಾರ (2021 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m11",
    nameEn: "Manjunath Desai",
    nameKn: "ಮಂಜುನಾಥ ದೇಸಾಯಿ",
    roleEn: "Senior Advisor",
    roleKn: "ಹಿರಿಯ ಮಾರ್ಗದರ್ಶಕರು",
    category: "core",
    servicePeriodEn: "Guiding Elder (2019 – Present)",
    servicePeriodKn: "ಹಿರಿಯ ಮಾರ್ಗದರ್ಶಕರು (2019 ರಿಂದ ನಿರಂತರ)",
    isFounding: true
  },
  {
    id: "m12",
    nameEn: "Sunil Goundi",
    nameKn: "ಸುನೀಲ ಗೌಂಡಿ",
    roleEn: "Core Committee Member",
    roleKn: "ಕೋರ್ ಕಮಿಟಿ ಸದಸ್ಯರು",
    category: "core",
    servicePeriodEn: "Visarjan Coordination (2019 – Present)",
    servicePeriodKn: "ವಿಸರ್ಜನಾ ಸಂಯೋಜನೆ (2019 ರಿಂದ ನಿರಂತರ)",
    isFounding: true
  },

  // Youth Volunteers
  {
    id: "m13",
    nameEn: "Darshan Patil",
    nameKn: "ದರ್ಶನ ಪಾಟೀಲ",
    roleEn: "Youth Wing Leader",
    roleKn: "ಯುವ ಘಟಕದ ಪ್ರಮುಖರು",
    category: "youth",
    servicePeriodEn: "Youth Volunteer (2021 – Present)",
    servicePeriodKn: "ಯುವ ಸ್ವಯಂಸೇವಕರು (2021 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m14",
    nameEn: "Abhishek Kulkarni",
    nameKn: "ಅಭಿಷೇಕ ಕುಲಕರ್ಣಿ",
    roleEn: "Media & Digital Outreach",
    roleKn: "ಮಾಧ್ಯಮ ಮತ್ತು ಪ್ರಚಾರ",
    category: "youth",
    servicePeriodEn: "Digital Archiving (2022 – Present)",
    servicePeriodKn: "ಡಿಜಿಟಲ್ ದಾಖಲೀಕರಣ (2022 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m15",
    nameEn: "Rohit Jadhav",
    nameKn: "ರೋಹಿತ ಜಾದವ",
    roleEn: "Youth Seva Coordinator",
    roleKn: "ಯುವ ಸೇವಾ ಸಂಯೋಜಕರು",
    category: "youth",
    servicePeriodEn: "Youth Volunteer (2022 – Present)",
    servicePeriodKn: "ಯುವ ಸ್ವಯಂಸೇವಕರು (2022 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m16",
    nameEn: "Shashikant More",
    nameKn: "ಶಶಿಕಾಂತ ಮೋರೆ",
    roleEn: "Crowd & Safety Volunteer",
    roleKn: "ಭದ್ರತಾ ಸ್ವಯಂಸೇವಕರು",
    category: "youth",
    servicePeriodEn: "Safety Lead (2020 – Present)",
    servicePeriodKn: "ಭಕ್ತರ ರಕ್ಷಣೆ (2020 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m17",
    nameEn: "Akash Kambale",
    nameKn: "ಆಕಾಶ ಕಾಂಬಳೆ",
    roleEn: "Youth Volunteer",
    roleKn: "ಸಕ್ರಿಯ ಯುವ ಸದಸ್ಯರು",
    category: "youth",
    servicePeriodEn: "Youth Volunteer (2021 – Present)",
    servicePeriodKn: "ಯುವ ಸ್ವಯಂಸೇವಕರು (2021 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m18",
    nameEn: "Ganesh Pujari",
    nameKn: "ಗಣೇಶ ಪೂಜಾರಿ",
    roleEn: "Youth Volunteer",
    roleKn: "ಸಕ್ರಿಯ ಯುವ ಸದಸ್ಯರು",
    category: "youth",
    servicePeriodEn: "Youth Volunteer (2023 – Present)",
    servicePeriodKn: "ಯುವ ಸ್ವಯಂಸೇವಕರು (2023 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m19",
    nameEn: "Suraj Rathod",
    nameKn: "ಸೂರಜ ರಾಥೋಡ",
    roleEn: "Youth Volunteer",
    roleKn: "ಸಕ್ರಿಯ ಯುವ ಸದಸ್ಯರು",
    category: "youth",
    servicePeriodEn: "Youth Volunteer (2022 – Present)",
    servicePeriodKn: "ಯುವ ಸ್ವಯಂಸೇವಕರು (2022 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m20",
    nameEn: "Naveen Metri",
    nameKn: "ನವೀನ ಮೇತ್ರಿ",
    roleEn: "Youth Volunteer",
    roleKn: "ಸಕ್ರಿಯ ಯುವ ಸದಸ್ಯರು",
    category: "youth",
    servicePeriodEn: "Youth Volunteer (2023 – Present)",
    servicePeriodKn: "ಯುವ ಸ್ವಯಂಸೇವಕರು (2023 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m21",
    nameEn: "Vittal Chougle",
    nameKn: "ವಿಠ್ಠಲ ಚೌಗುಲೆ",
    roleEn: "Youth Volunteer",
    roleKn: "ಸಕ್ರಿಯ ಯುವ ಸದಸ್ಯರು",
    category: "youth",
    servicePeriodEn: "Youth Volunteer (2021 – Present)",
    servicePeriodKn: "ಯುವ ಸ್ವಯಂಸೇವಕರು (2021 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  },
  {
    id: "m22",
    nameEn: "Kiran Badiger",
    nameKn: "ಕಿರಣ ಬಡಿಗೇರ",
    roleEn: "Youth Volunteer",
    roleKn: "ಸಕ್ರಿಯ ಯುವ ಸದಸ್ಯರು",
    category: "youth",
    servicePeriodEn: "Youth Volunteer (2024 – Present)",
    servicePeriodKn: "ಯುವ ಸ್ವಯಂಸೇವಕರು (2024 ರಿಂದ ನಿರಂತರ)",
    isFounding: false
  }
];
