import { IconName } from '../components/ui/Icon';
export type OnboardingPage = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  icon: IconName;
  accent: string;
  background: string;
  steps: string[];
};
// Product guidance, not fabricated community data.
export const onboardingPages: OnboardingPage[] = [
  {
    eyebrow: '01 / NOTICE. CAPTURE. REPORT.',
    title: 'Small reports.',
    highlight: 'Big changes.',
    description:
      'A broken light. A damaged road. See something that needs attention? Give it a voice with a photo and a location.',
    icon: 'camera',
    accent: '#087D91',
    background: '#EAF7F8',
    steps: ['Take a photo', 'Pin the place', 'Share your report'],
  },
  {
    eyebrow: '02 / STAY CLOSE TO PROGRESS.',
    title: 'Follow the fix.',
    highlight: 'See the difference.',
    description:
      'Follow the issues that matter to you and watch their status change. Your neighborhood’s progress, all in one place.',
    icon: 'activity',
    accent: '#0878C9',
    background: '#EDF5FC',
    steps: ['Reported', 'In progress', 'Resolved'],
  },
  {
    eyebrow: '03 / BETTER, TOGETHER.',
    title: 'Your neighborhood.',
    highlight: 'Our shared future.',
    description:
      'Confirm issues you’ve noticed and help your community see what needs care. A better city begins with people like you.',
    icon: 'heart',
    accent: '#258443',
    background: '#EFF8E8',
    steps: ['Notice what matters', 'Support your neighbors', 'Build a better city'],
  },
];
