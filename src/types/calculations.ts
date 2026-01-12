export type BMIResult = {
  value: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obesity';
  interpretation: string;
  color: string;
};
