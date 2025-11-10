export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface FontSizeConfig {
  body: string;
  reference: string;
  title: string;
  lineHeight: string;
}

export const fontSizeConfig: Record<FontSize, FontSizeConfig> = {
  small: {
    body: '16px',
    reference: '13px',
    title: '12px',
    lineHeight: '1.75',
  },
  medium: {
    body: '18px',
    reference: '14px',
    title: '13px',
    lineHeight: '1.9',
  },
  large: {
    body: '22px',
    reference: '16px',
    title: '14px',
    lineHeight: '2.05',
  },
  xlarge: {
    body: '26px',
    reference: '18px',
    title: '15px',
    lineHeight: '2.15',
  },
};
