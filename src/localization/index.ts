/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { usePublishingStore } from '../store/publishingStore';
import { TRANSLATIONS } from './translations';

export function useTranslation() {
  const uiLanguage = usePublishingStore((state) => state.uiLanguage);

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const translationSet = TRANSLATIONS[key];
    if (!translationSet) {
      return key;
    }

    let text = translationSet[uiLanguage] || translationSet['en'] || key;

    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, String(value));
      });
    }

    return text;
  };

  const isRtl = uiLanguage === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  return { t, uiLanguage, isRtl, dir };
}
