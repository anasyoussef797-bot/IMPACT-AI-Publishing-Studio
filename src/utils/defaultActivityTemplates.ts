import { ActivityWorksheetConfig, Page } from '../types';

export function createDefaultActivityWorksheet(): ActivityWorksheetConfig {
  return {
    headerTitleAr: 'ورقة نشاط ممتعة للأطفال',
    headerTitleEn: 'Kindergarten Activity Worksheet',
    headerSubtitle: 'تلوين وتعلم ومطابقة وتتبع - Fun Learning',
    headerThemeColor: '#2563eb',
    footerTextAr: 'أحسنت! 🌟 عمل رائع في التعلم!',
    footerTextEn: 'You did it! 🌟 Great job learning!',
    blocks: [
      {
        id: 'block-1',
        title: 'Activity 1 - LOOK',
        icon: 'search',
        borderColor: 'blue',
        bgColor: '#f0f9ff',
        borderStyle: 'solid',
        widthSpan: 'half',
        minHeight: 200,
        instructionAr: 'انظر إلى الصورة واستكشف.',
        instructionEn: 'Look at the picture.',
        contentType: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500&auto=format&fit=crop&q=80',
        textAr: 'الأبطال الصغار',
        textEn: 'Young Explorers'
      },
      {
        id: 'block-2',
        title: 'Activity 2 - COLOR',
        icon: 'crayon',
        borderColor: 'yellow',
        bgColor: '#fffbeb',
        borderStyle: 'solid',
        widthSpan: 'half',
        minHeight: 200,
        instructionAr: 'لون الصورة بشكل جميل.',
        instructionEn: 'Color the picture.',
        contentType: 'tracing',
        tracingText: 'لون الشكل 🎨'
      },
      {
        id: 'block-3',
        title: 'Activity 3 - FIND',
        icon: 'search',
        borderColor: 'green',
        bgColor: '#f0fdf4',
        borderStyle: 'solid',
        widthSpan: 'half',
        minHeight: 200,
        instructionAr: 'ضع دائرة حول الإجابة الصحيحة.',
        instructionEn: 'Circle the correct answer.',
        contentType: 'text',
        textAr: '• Head / رأس\n• Hand / يد\n• Foot / قدم\n• Eye / عين'
      },
      {
        id: 'block-4',
        title: 'Activity 4 - MATCH',
        icon: 'link',
        borderColor: 'purple',
        bgColor: '#faf5ff',
        borderStyle: 'solid',
        widthSpan: 'half',
        minHeight: 200,
        instructionAr: 'صل كل عنصر بوظيفته المناسبة.',
        instructionEn: 'Match each item to its function.',
        contentType: 'matching',
        matchingPairs: [
          { left: 'Head (رأس)', right: 'Think (فكر)' },
          { left: 'Eye (عين)', right: 'See (يرى)' },
          { left: 'Foot (قدم)', right: 'Walk (يمشي)' }
        ]
      },
      {
        id: 'block-5',
        title: 'Activity 5 - TRACE',
        icon: 'pencil',
        borderColor: 'orange',
        bgColor: '#fff7ed',
        borderStyle: 'dashed',
        widthSpan: 'half',
        minHeight: 180,
        instructionAr: 'تتبع الشكل المتقطع بقلمك.',
        instructionEn: 'Trace the dotted lines.',
        contentType: 'tracing',
        tracingText: 'رَأْس • Head'
      },
      {
        id: 'block-6',
        title: 'Activity 6 - SAY',
        icon: 'chat',
        borderColor: 'teal',
        bgColor: '#f0fdfa',
        borderStyle: 'solid',
        widthSpan: 'half',
        minHeight: 180,
        instructionAr: 'قل الكلمة بصوت واضح ورائع.',
        instructionEn: 'Say the word out loud.',
        contentType: 'text',
        textAr: 'Head 🗣️\nرَأْسُ الإِنْسَانِ',
        textEn: 'Say: Head / رأس'
      }
    ]
  };
}

export function createDefaultTextPageProps(pageNumber: number): Partial<Page> {
  return {
    layoutType: 'text-only',
    title: `صفحة قراءة ونص - صفحة ${pageNumber}`,
    textContent: 'هنا يمكنك كتابة القصة التعليمية أو المفردات أو النص التوجيهي للأطفال. تتميز هذه الصفحة بتنسيق نصي أنيق يركز على المحتوى المكتوب مع إمكانية إضافة إطارات ومربعات ملاحظات.',
    extraText: '💡 ملاحظة تربوية للمربي: يُفضل قراءة النص بتمهل مع توجيه أسئلة تفاعلية للطفل حول المعنى.',
    textBgCard: true,
    titleBgCard: true,
    extraTextBgCard: true,
    titleSize: 26,
    titleColor: '#0f172a',
    textSize: 16,
    textColor: '#334155',
    titlePosition: 'top',
    textPosition: 'middle',
    extraTextPosition: 'bottom',
    textPageTheme: 'clean'
  };
}
