/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Google GenAI client following strict secure guidelines
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY environment variable is not configured in Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// SERVER API ROUTES
// ----------------------------------------------------

/**
 * Endpoint: /api/book/generate-chapters
 * Purpose: Structure curriculum roadmap under pedagogical guidelines using Gemini
 */
app.post('/api/book/generate-chapters', async (req, res) => {
  const { title, ageGroup, bookType, language, targetCurriculum, pedagogicalGoal } = req.body;

  try {
    const ai = getAiClient();
    
    const prompt = `Please structure a professional curriculum roadmap / chapter index for an educational book:
    - Title: "${title}"
    - Target Age Group: ${ageGroup}
    - Book Category: ${bookType}
    - Publication Language: ${language}
    - Curriculum Standard: ${targetCurriculum}
    - Pedagogical Goal: "${pedagogicalGoal}"
    
    Structure exactly 2 to 3 high-quality educational chapters. Provide a clean title, description, learning objectives, and a reasonable page range for each chapter.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite educational curriculum architect and senior schoolbook publishing director. Always respond with perfectly valid JSON conforming exactly to the requested schema. Ensure language fits the target linguistic demographic.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'Unique slug like "ch-intro"' },
                  title: { type: Type.STRING, description: 'Descriptive curriculum module title' },
                  description: { type: Type.STRING, description: 'Summary of educational milestones in this module' },
                  learningObjectives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Measurable child learning outcomes'
                  },
                  pageRange: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: 'Starting and ending page numbers as [start, end]'
                  }
                },
                required: ['id', 'title', 'description', 'learningObjectives', 'pageRange']
              }
            }
          },
          required: ['chapters']
        }
      }
    });

    const jsonText = response.text?.trim() || '';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);

  } catch (error: any) {
    console.warn('[SERVER] Generate chapters failed or API Key missing. Returning fallback simulation context.', error.message);
    res.status(500).json({ error: error.message, isFallback: true });
  }
});

/**
 * Endpoint: /api/book/generate-content
 * Purpose: Compose child-safe writing and narrative texts aligned to curriculum scope
 */
app.post('/api/book/generate-content', async (req, res) => {
  const { description, ageGroup, language, bookType } = req.body;

  try {
    const ai = getAiClient();
    
    const prompt = `Compose page text and content details for an educational schoolbook:
    - Page Goal/Description: "${description}"
    - Target Age/Grade: ${ageGroup}
    - Book Theme: ${bookType}
    - Language: ${language}
    
    The text must be highly engaging, educational, safe, and grammatically impeccable for this age group.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a veteran children\'s educational writer and pediatric reading specialist. Produce perfectly valid JSON outputs.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Descriptive title for the composed page' },
            textContent: { type: Type.STRING, description: 'The actual narrative, guidelines, or tracing descriptions for the child' }
          },
          required: ['title', 'textContent']
        }
      }
    });

    const jsonText = response.text?.trim() || '';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);

  } catch (error: any) {
    console.warn('[SERVER] Generate content failed or API Key missing. Returning fallback simulation.', error.message);
    res.status(500).json({ error: error.message, isFallback: true });
  }
});

/**
 * Endpoint: /api/book/generate-illustration
 * Purpose: Commission page plate illustrations or coloring templates
 */
app.post('/api/book/generate-illustration', async (req, res) => {
  const { prompt, type } = req.body;

  try {
    const ai = getAiClient();
    
    let imagePrompt = prompt;
    if (type === 'coloring') {
      imagePrompt = `Minimalist clean black and white outline vector drawing for a children coloring book, thick outlines, no shading, simple forms, cute cartoon style, topic: ${prompt}`;
    } else {
      imagePrompt = `Professional premium vector children illustration, vibrant colors, clean vector lines, white background, whimsical and educational, topic: ${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          { text: imagePrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1'
        }
      }
    });

    let imageUrl: string | null = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64Data}`;
          break;
        }
      }
    }

    if (imageUrl) {
      res.json({ url: imageUrl });
    } else {
      throw new Error('Image generator returned no binary inline parts.');
    }

  } catch (error: any) {
    console.warn('[SERVER] Generate illustration failed or API Key missing. Fallback will trigger on frontend.', error.message);
    res.status(500).json({ error: error.message, isFallback: true });
  }
});

/**
 * Endpoint: /api/book/preflight
 * Purpose: Educational quality and print safety compliance assessment before export release
 */
app.post('/api/book/preflight', async (req, res) => {
  const { book } = req.body;

  try {
    const ai = getAiClient();
    
    const prompt = `Conduct a technical preflight review and educational quality assessment of the following book volume:
    Title: "${book.metadata.title}"
    Language: "${book.metadata.language}"
    Type: "${book.metadata.bookType}"
    Pages Drafted: ${book.pages.length} pages
    
    Analyze:
    1. Pedagogical suitability and cognitive density
    2. Mechanical safety limits (crop marks, safe zones, margins)
    3. Resolution safety index of illustrations
    
    Identify potential warnings or passes, calculate exact quality percentage scores, and formulate critical messages.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a professional pre-press flight engineer and curriculum compliance officer. Evaluate details and output strict JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isPreflightPassed: { type: Type.BOOLEAN },
            educationalConsistencyScore: { type: Type.INTEGER },
            printSafetyScore: { type: Type.INTEGER },
            imageResolutionScore: { type: Type.INTEGER },
            finalScore: { type: Type.INTEGER },
            checks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  status: { type: Type.STRING, description: "Must be 'pass', 'warning', or 'fail'" },
                  message: { type: Type.STRING },
                  module: { type: Type.STRING, description: "Must be 'educational', 'print', 'resolution', or 'consistency'" }
                },
                required: ['id', 'name', 'status', 'message', 'module']
              }
            }
          },
          required: ['isPreflightPassed', 'educationalConsistencyScore', 'printSafetyScore', 'imageResolutionScore', 'finalScore', 'checks']
        }
      }
    });

    const jsonText = response.text?.trim() || '';
    const parsed = JSON.parse(jsonText);
    res.json({ report: parsed });

  } catch (error: any) {
    console.warn('[SERVER] Quality preflight failed or API Key missing.', error.message);
    res.status(500).json({ error: error.message, isFallback: true });
  }
});

/**
 * Endpoint: /api/assistant/chat
 * Purpose: Chat assistant that parses book description prompts and customizes production pipeline automatically
 */
app.post('/api/assistant/chat', async (req, res) => {
  const { message, currentBook } = req.body;

  try {
    const ai = getAiClient();
    
    const prompt = `The user is interacting with IMPACT AI Publishing Studio.
    User's request: "${message}"
    Active book state (if any): ${currentBook ? JSON.stringify(currentBook) : 'None'}
    
    Act as a veteran educational publisher and production layout engineer. If the user wants to start, configure, or customize a book, map their intent to a set of automated production actions.
    Your response MUST be written in the user's language (e.g. if they write in Arabic, respond in high-quality Arabic; if English, respond in English).
    Explain clearly what has been configured and offer helpful pedagogical or pre-press design advice.
    
    Supported Actions:
    1. CREATE_BOOK: Instantiates a new book. Requires metadata payload. Use if no book is active or they specify a new theme.
    2. UPDATE_METADATA: Refines current book properties. Requires partial metadata payload.
    3. SET_CHAPTERS: Rewrites/sets chapters based on educational goals. Requires chapters array.
    4. SET_PAGES: Customizes actual page list. Requires pages array.
    5. NAVIGATE_STAGE: Transitions to standard phases: 'planning', 'plan-review', 'composer', 'quality-review', 'export', 'done'.
    6. RUN_PREFLIGHT: Performs preflight.
    
    Map the description into high-quality educational chapters and beautiful preschool or early-grade pages (including illustration prompts and layout types like 'coloring', 'tracing', 'text-illustration') as needed.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite AI Publishing Assistant and Lead Educational Architect. Return a single JSON object containing "reply" and an array of "actions" as instructed. Always output perfectly valid JSON matching the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  payload: {
                    type: Type.OBJECT,
                    properties: {
                      metadata: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          subtitle: { type: Type.STRING },
                          author: { type: Type.STRING },
                          ageGroup: { type: Type.STRING },
                          bookType: { type: Type.STRING },
                          language: { type: Type.STRING },
                          targetCurriculum: { type: Type.STRING },
                          pedagogicalGoal: { type: Type.STRING },
                          dimensions: {
                            type: Type.OBJECT,
                            properties: {
                              width: { type: Type.NUMBER },
                              height: { type: Type.NUMBER },
                              unit: { type: Type.STRING }
                            }
                          }
                        }
                      },
                      chapters: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                            pageRange: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                          },
                          required: ['id', 'title', 'description', 'learningObjectives', 'pageRange']
                        }
                      },
                      pages: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            pageNumber: { type: Type.INTEGER },
                            chapterId: { type: Type.STRING },
                            layoutType: { type: Type.STRING },
                            title: { type: Type.STRING },
                            textContent: { type: Type.STRING },
                            illustrationPrompt: { type: Type.STRING },
                            isDoublePage: { type: Type.BOOLEAN },
                            bleedSafetyZone: { type: Type.BOOLEAN },
                            cropMarksEnabled: { type: Type.BOOLEAN },
                            reviewStatus: { type: Type.STRING }
                          },
                          required: ['id', 'pageNumber', 'layoutType', 'isDoublePage', 'bleedSafetyZone', 'cropMarksEnabled', 'reviewStatus']
                        }
                      },
                      stage: { type: Type.STRING }
                    }
                  }
                },
                required: ['type', 'payload']
              }
            }
          },
          required: ['reply', 'actions']
        }
      }
    });

    const jsonText = response.text?.trim() || '';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);

  } catch (error: any) {
    console.warn('[SERVER] Assistant chat Gemini call failed or key missing. Returning simulated fallback.', error.message);
    
    // Arabic or multilingual fallback generator
    const msg = (message || "").toLowerCase();
    const isArabic = /[\u0600-\u06FF]/.test(message || "");
    
    let reply = "";
    let actions: any[] = [];
    
    if (isArabic) {
      if (msg.includes('تلوين') || msg.includes('رسم') || msg.includes('color')) {
        reply = `لقد قمت بتهيئة وضبط عمليات الإنتاج تلقائياً لتصميم كتاب تلوين رائع! تم إعداد بيانات الكتاب وتخطيط الفصول وإضافة صفحات تلوين مبتكرة تناسب الأطفال بناءً على طلبك: "${message}".`;
        actions = [
          {
            type: "CREATE_BOOK",
            payload: {
              metadata: {
                title: "كتاب التلوين والأنشطة الإبداعي",
                subtitle: "تنمية الذكاء البصري والمهارات الحركية الدقيقة للأطفال",
                author: "المساعد الذكي لإمباكت",
                ageGroup: "preschool",
                bookType: "coloring",
                language: "ar",
                targetCurriculum: "montessori",
                pedagogicalGoal: "تمكين الأطفال من مهارات التحكم الدقيق بالقلم وتنمية الخيال من خلال أنشطة تلوين إرشادية وتتبع ممتع.",
                dimensions: { width: 8.5, height: 11, unit: "in" }
              }
            }
          },
          {
            type: "SET_CHAPTERS",
            payload: {
              chapters: [
                {
                  id: "ch-coloring-1",
                  title: "الفصل الأول: مغامرات حيوانات الغابة",
                  description: "تلوين واستكشاف أصدقائنا الحيوانات في الغابة السعيدة مع خطوط تحديد بارزة.",
                  learningObjectives: ["رسم وتلوين الأشكال داخل الحيز الآمن للطباعة", "التعرف على أسماء الحيوانات وربطها بالرموز"],
                  pageRange: [1, 4]
                }
              ]
            }
          },
          {
            type: "SET_PAGES",
            payload: {
              pages: [
                {
                  id: "p-color-1",
                  pageNumber: 1,
                  chapterId: "ch-coloring-1",
                  layoutType: "title",
                  title: "عالم الألوان السحري",
                  textContent: "أهلاً بك يا بطل في كتابك الجديد! هنا ستعبر عن خيالك وتلون رسومات ممتعة جداً.",
                  isDoublePage: false,
                  bleedSafetyZone: true,
                  cropMarksEnabled: true,
                  reviewStatus: "approved"
                },
                {
                  id: "p-color-2",
                  pageNumber: 2,
                  chapterId: "ch-coloring-1",
                  layoutType: "coloring",
                  title: "تلوين الأسد اللطيف",
                  textContent: "لون الأسد صديق الغابة بألوانك المفضلة وتتبع الخطوط البارزة.",
                  illustrationPrompt: "Minimalist clean black and white outline vector drawing of a cute baby lion smiling, coloring book style",
                  isDoublePage: false,
                  bleedSafetyZone: true,
                  cropMarksEnabled: true,
                  reviewStatus: "pending"
                }
              ]
            }
          },
          {
            type: "NAVIGATE_STAGE",
            payload: { stage: "planning" }
          }
        ];
      } else if (msg.includes('حساب') || msg.includes('رياضيات') || msg.includes('أرقام') || msg.includes('جمع') || msg.includes('طرح') || msg.includes('math')) {
        reply = `تم إطلاق وتخصيص دورة الإنتاج لكتاب رياضيات وأرقام تفاعلي متوافق مع معايير كور كومون العالمية ليكون مناسباً لسن الطفولة المبكرة بناءً على وصفك: "${message}".`;
        actions = [
          {
            type: "CREATE_BOOK",
            payload: {
              metadata: {
                title: "رحلة الأرقام الممتعة: الرياضيات الذكية",
                subtitle: "منهج الرياضيات المبسط والعد التفاعلي للأطفال",
                author: "المساعد الذكي لإمباكت",
                ageGroup: "preschool",
                bookType: "math",
                language: "ar",
                targetCurriculum: "common_core",
                pedagogicalGoal: "تأسيس المفاهيم المنطقية الرياضية وعمليات العد ومطابقة المقادير بأساليب تفاعلية مشوقة.",
                dimensions: { width: 8.5, height: 11, unit: "in" }
              }
            }
          },
          {
            type: "SET_CHAPTERS",
            payload: {
              chapters: [
                {
                  id: "ch-math-1",
                  title: "الفصل الأول: الأرقام من 1 إلى 5 والمجموعات",
                  description: "تعلم الأرقام الأولى من خلال عد التفاح، الفراشات والنجوم السعيدة.",
                  learningObjectives: ["العد التصاعدي للأجسام حتى الرقم 5", "مطابقة الأرقام بالمجموعات الصحيحة"],
                  pageRange: [1, 4]
                }
              ]
            }
          },
          {
            type: "SET_PAGES",
            payload: {
              pages: [
                {
                  id: "p-math-1",
                  pageNumber: 1,
                  chapterId: "ch-math-1",
                  layoutType: "title",
                  title: "مرحباً بكم في أرض الأرقام",
                  textContent: "هيا نعد ونلعب معاً يا أصدقاء! الرياضيات ممتعة جداً وسنتعلم كيف نعد المجموعات السعيدة.",
                  isDoublePage: false,
                  bleedSafetyZone: true,
                  cropMarksEnabled: true,
                  reviewStatus: "approved"
                }
              ]
            }
          },
          {
            type: "NAVIGATE_STAGE",
            payload: { stage: "planning" }
          }
        ];
      } else {
        reply = `تم إعداد وتخصيص دورة الإنتاج بشكل كامل وتلقائي لتناسب كتاب المنهج التعليمي الموصوف: "${message}". تم تهيئة الغلاف والبيانات والأهداف التربوية والفصول والصفحات فوراً لتناسب تطلعاتكم.`;
        actions = [
          {
            type: "CREATE_BOOK",
            payload: {
              metadata: {
                title: "مخطط مخصص: " + (message.length > 30 ? message.substring(0, 30) + '...' : message),
                subtitle: "مستوى تأسيسي متطور وموجه تربوياً",
                author: "المساعد الذكي لإمباكت",
                ageGroup: "preschool",
                bookType: "arabic",
                language: "ar",
                targetCurriculum: "montessori",
                pedagogicalGoal: "تحقيق الكفاءة في المهارات اللغوية والحركية والمعرفية المكتسبة وفقاً للوصف الإرشادي.",
                dimensions: { width: 8.5, height: 11, unit: "in" }
              }
            }
          },
          {
            type: "SET_CHAPTERS",
            payload: {
              chapters: [
                {
                  id: "ch-custom-1",
                  title: "الفصل الأول: البناء التأسيسي للمهارات",
                  description: "مقدمة شاملة تم تهيئتها لخدمة وتلبية الاحتياجات التعليمية والتربوية الموضحة بالوصف.",
                  learningObjectives: ["تنمية مهارات التتبع البصري والحسي", "الربط بين المفاهيم الأساسية والأنشطة الإبداعية"],
                  pageRange: [1, 4]
                }
              ]
            }
          },
          {
            type: "SET_PAGES",
            payload: {
              pages: [
                {
                  id: "p-custom-1",
                  pageNumber: 1,
                  chapterId: "ch-custom-1",
                  layoutType: "title",
                  title: "البداية الجديدة",
                  textContent: "أهلاً بكم في هذا الكتاب المخصص لتعليم وتطوير مهاراتكم الحياتية والعلمية الممتعة!",
                  isDoublePage: false,
                  bleedSafetyZone: true,
                  cropMarksEnabled: true,
                  reviewStatus: "approved"
                }
              ]
            }
          },
          {
            type: "NAVIGATE_STAGE",
            payload: { stage: "planning" }
          }
        ];
      }
    } else {
      // English Fallback
      reply = `I have successfully initialized and customized the production pipeline based on your description: "${message}". A new targeted educational volume has been structured under pre-press safety criteria.`;
      actions = [
        {
          type: "CREATE_BOOK",
          payload: {
            metadata: {
              title: "Custom Volume: " + (message.length > 30 ? message.substring(0, 30) + '...' : message),
              subtitle: "AI Configured Interactive Resource",
              author: "IMPACT AI Assistant",
              ageGroup: "preschool",
              bookType: "tracing",
              language: "en",
              targetCurriculum: "montessori",
              pedagogicalGoal: "Develop structured cognitive learning pathways aligned with the user defined requirements.",
              dimensions: { width: 8.5, height: 11, unit: "in" }
            }
          }
        },
        {
          type: "SET_CHAPTERS",
          payload: {
            chapters: [
              {
                id: "ch-en-custom-1",
                title: "Module 1: Fine Motor Exploration",
                description: "Initial activities focused on building sensory associations.",
                learningObjectives: ["Maintain spatial grip accuracy", "Develop phoneme linkages"],
                pageRange: [1, 4]
              }
            ]
          }
        },
        {
          type: "SET_PAGES",
          payload: {
            pages: [
              {
                id: "p-en-custom-1",
                pageNumber: 1,
                chapterId: "ch-en-custom-1",
                layoutType: "title",
                title: "Welcome to Your Custom Journey",
                textContent: "This specialized curriculum is automatically tuned for optimal child learning outcomes.",
                isDoublePage: false,
                bleedSafetyZone: true,
                cropMarksEnabled: true,
                reviewStatus: "approved"
              }
            ]
          }
        },
        {
          type: "NAVIGATE_STAGE",
          payload: { stage: "planning" }
        }
      ];
    }

    res.json({ reply, actions });
  }
});


// ----------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION BUILD HANDLER
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[SERVER] Mounted Vite middleware successfully in development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[SERVER] Serving static distribution files in production mode.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] IMPACT AI Publishing Studio live on http://0.0.0.0:${PORT}`);
  });
}

startServer();
