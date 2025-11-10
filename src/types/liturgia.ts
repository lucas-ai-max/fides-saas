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
    lineHeight: '1.7',
  },
  medium: {
    body: '18px',
    reference: '15px',
    title: '14px',
    lineHeight: '1.9',
  },
  large: {
    body: '22px',
    reference: '17px',
    title: '15px',
    lineHeight: '2.0',
  },
  xlarge: {
    body: '26px',
    reference: '19px',
    title: '16px',
    lineHeight: '2.1',
  },
};
