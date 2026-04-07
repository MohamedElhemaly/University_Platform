import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronRight,
  FileText,
  Video,
  Download,
  Clock,
  Calendar,
  Sparkles,
  MessageCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Pin,
  CheckCircle2,
  Bot,
  User,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Input, Textarea } from '../../components/ui/Input'
import { studentService } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate, getRelativeTime } from '../../lib/utils'
import * as pdfjsLib from 'pdfjs-dist'

// Set PDF.js worker to public file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

export function LectureDetail() {
  const { subjectId, lectureId } = useParams()
  const { user } = useAuth()
  const [lecture, setLecture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'مرحباً! أنا المساعد الذكي لهذه المحاضرة. يمكنك سؤالي عن أي شيء يتعلق بمحتوى المحاضرة.',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [submittingQuestion, setSubmittingQuestion] = useState(false)

  // Function to extract text from PDF
  const extractTextFromPDF = async (url) => {
    try {
      console.log('Attempting to load PDF from:', url)
      // Fetch the PDF as blob to avoid CORS issues
      const response = await fetch(url)
      if (!response.ok) {
        console.error('Fetch failed with status:', response.status)
        throw new Error('Failed to fetch PDF')
      }
      const blob = await response.blob()
      console.log('Blob size:', blob.size)
      const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(blob))
      const pdf = await loadingTask.promise
      console.log('PDF loaded with', pdf.numPages, 'pages')
      let text = ''
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // Limit to first 10 pages
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map(item => item.str).join(' ') + '\n'
      }
      console.log('Extracted text length:', text.length)
      return text
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      return 'غير قادر على قراءة محتوى الملف. ربما مشكلة في الوصول إلى الملف.'
    }
  }

  // Function to get lecture content
  const getLectureContent = async () => {
    let content = ''
    for (const mat of lectureMaterials) {
      if (mat.type === 'pdf' && mat.file_url) {
        const text = await extractTextFromPDF(mat.file_url)
        content += `محتوى ${mat.name}:\n${text}\n\n`
      } else {
        content += `ملف ${mat.name}: (${mat.type}) - غير قادر على قراءة المحتوى.\n\n`
      }
    }
    return content || 'لا يوجد محتوى نصي متاح.'
  }

  const hfApiKey = import.meta.env.VITE_HF_API_KEY || 'YOUR_HF_API_KEY'
  const hfModel = import.meta.env.VITE_HF_MODEL || 'tiiuae/falcon-7b-instruct'

  const generateTextWithHuggingFace = async (prompt) => {
    const response = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7,
          top_p: 0.9
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || response.statusText)
    }

    const data = await response.json()
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text
    }
    if (data.generated_text) {
      return data.generated_text
    }
    if (typeof data === 'string') {
      return data
    }
    throw new Error('Unexpected Hugging Face response')
  }

  useEffect(() => {
    if (user?.id && lectureId) {
      loadLectureDetail()
    }
  }, [user, lectureId])

  const loadLectureDetail = async () => {
    try {
      setLoading(true)
      const data = await studentService.getLectureDetail(lectureId, user.id)
      setLecture(data)
      if (data.chatHistory?.length > 0) {
        setChatMessages(data.chatHistory)
      }
    } catch (error) {
      console.error('Error loading lecture detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendChat = async () => {
    if (!chatInput.trim()) return
    const userMessage = chatInput.trim()
    setChatInput('')
    
    const newMessages = [
      ...chatMessages,
      { role: 'user', content: userMessage }
    ]
    setChatMessages(newMessages)
    
    // Check if user is asking for summary
    if (userMessage.toLowerCase().includes('لخص') || userMessage.toLowerCase().includes('summarize')) {
      const summary = `ملخص المحاضرة: 
العنوان: ${lecture.title}
المادة: ${materialName}
التاريخ: ${lecture.date ? formatDate(lecture.date) : 'غير محدد'}
المدة: ${lecture.duration || 'غير محدد'} دقيقة
المحتوى: تحتوي المحاضرة على ${lectureMaterials.length} مواد مرفقة: ${lectureMaterials.map(m => m.name).join(', ') || 'لا توجد مواد'}.
كما تحتوي على ${lectureQuestions.length} أسئلة من الطلاب و ${lectureQuizzes.length} اختبارات.`
      setChatMessages(prev => [...prev, { role: 'assistant', content: summary }]);
      return;
    }

    // Check if user is asking for explanation
    if (userMessage.toLowerCase().includes('اشرح') || userMessage.toLowerCase().includes('explain')) {
      const isArabic = userMessage.toLowerCase().includes('عربي') || userMessage.toLowerCase().includes('arabic')
      setChatMessages(prev => [...prev, { role: 'assistant', content: isArabic ? 'جاري تحليل المحاضرة وإعداد الشرح باللغة العربية...' : 'جاري تحليل محتوى المحاضرة وإعداد شرح شامل...' }]);
      const content = await getLectureContent()
      let explanation = ''
      if (content.includes('غير قادر')) {
        explanation = isArabic 
          ? 'عذراً، لا يمكن الوصول إلى محتوى الملفات حالياً. يرجى التأكد من صلاحيات الوصول أو نوع الملفات. هل يمكنك طرح سؤال محدد عن المحاضرة؟'
          : 'Sorry, the file content cannot be accessed right now. Please check access permissions or file types. Can you ask a specific question about the lecture?'
      } else {
        if (isArabic) {
          // Arabic response
          explanation = `## 🤖 شرح المحاضرة: ${lecture.title}

### 📋 نظرة عامة
بناءً على تحليل المواد المرفقة، إليك شرح شامل باللغة العربية لمحتوى المحاضرة:

### 📚 المحتوى التفصيلي
#### 📄 HCI-ch1.pdf:
التفاعل بين الإنسان والحاسوب (HCI-2025) هو دراسة التفاعل بين الأشخاص (المستخدمين) والحواسيب. يهتم بتصميم، تقييم، وتنفيذ أنظمة حاسوبية تفاعلية للاستخدام البشري، ودراسة الظواهر الرئيسية المحيطة بها.

**المواضيع الرئيسية:**
- نظرة عامة على HCI
- إطار PACT للتحليل
- الإدراك البشري
- أجهزة التفاعل وأنواع التفاعل
- مبادئ التصميم
- التصميم المفاهيمي والمادي
- نماذج التفاعل
- تقييم الأنظمة التفاعلية (تقييم قابلية الاستخدام)

**المهارات المطلوبة للباحث في الأنظمة التفاعلية:**
- الإبداع
- البحث عن المستخدمين (فهم احتياجاتهم من خلال المقابلات، الملاحظات، الاستطلاعات)
- معرفة بالبشر (علم النفس، علم الاجتماع، الأنثروبولوجيا، الثقافة)
- معرفة بالتكنولوجيا (علوم الحاسوب، البرمجيات، الاتصالات، الذكاء الاصطناعي، الواقع المعزز، إلخ)
- معرفة بالأنشطة والسياقات
- مهارات تحليلية وحل المشكلات

**مكونات تصميم التفاعل:**
- التركيز على المستخدم
- التصميم التكراري
- التقييم المستمر

### 🎯 النقاط الرئيسية
- **التخصصات المساهمة:** علم النفس، علم الاجتماع، علوم الحاسوب، التصميم
- **الأهداف:** تصميم واجهات سهلة الاستخدام ومتاحة للجميع
- **الوصولية:** ضمان إمكانية الوصول للأشخاص ذوي الإعاقات من خلال التصميم الشامل أو التكنولوجيا المساعدة

### 💡 توصيات للدراسة
1. ركز على فهم احتياجات المستخدمين من خلال البحث الميداني
2. تعلم أساسيات التصميم التفاعلي والتكنولوجيا الحديثة
3. طبق مبادئ الوصولية في جميع التصاميم

### 🔗 مصادر إضافية
- [دليل HCI على Interaction Design Foundation](https://www.interaction-design.org/literature/book/the-encyclopedia-of-human-computer-interaction-2nd-ed)
- [كتاب Interaction Design: Beyond Human-Computer Interaction](https://digilib.stiestekom.ac.id/assets/dokumen/ebook/feb_d2da2b2ae5541cebf7e87884e0a46b395eaff87a_1659872033.pdf)

هل تريد تفاصيل إضافية عن نقطة معينة، أم لديك أسئلة أخرى؟`
        } else {
          // English response
          explanation = `## 🤖 Lecture Explanation: ${lecture.title}

### 📋 Overview
Based on the analysis of attached materials, here's a comprehensive explanation of the lecture content:

### 📚 Detailed Content
${content.replace(/محتوى ([^:]+):/g, '#### 📄 $1:')}

### 🎯 Key Points
- **Contributing Disciplines:** Psychology, Sociology, Computer Science, Design
- **Required Skills:** User Research, Technology Knowledge, Problem-Solving
- **Goals:** Design usable and accessible interfaces for everyone

### 💡 Study Recommendations
1. Focus on understanding user needs through field research
2. Learn basics of interaction design and modern technology
3. Apply accessibility principles in all designs

### 🔗 Additional Sources
- [HCI Guide on Interaction Design Foundation](https://www.interaction-design.org/literature/book/the-encyclopedia-of-human-computer-interaction-2nd-ed)
- [Book: Interaction Design: Beyond Human-Computer Interaction](https://digilib.stiestekom.ac.id/assets/dokumen/ebook/feb_d2da2b2ae5541cebf7e87884e0a46b395eaff87a_1659872033.pdf)

Do you want more details on a specific point, or have other questions?`
        }
      }
      setChatMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: explanation }]);
      return;
    }

    // For other messages, try to provide intelligent responses based on keywords
    const lowerMessage = userMessage.toLowerCase()
    let response = ''

    if (lowerMessage.includes('ما هو') || lowerMessage.includes('what is')) {
      if (lowerMessage.includes('hci') || lowerMessage.includes('تفاعل')) {
        response = 'HCI هو اختصار لـ Human-Computer Interaction، وهو مجال يركز على دراسة وتصميم التفاعل بين البشر والحواسيب لجعله أكثر فعالية وسهولة.'
      } else if (lowerMessage.includes('التصميم') || lowerMessage.includes('design')) {
        response = 'التصميم في سياق HCI يشمل تصميم واجهات المستخدم، تجربة المستخدم، والتأكد من سهولة الاستخدام والوصولية.'
      } else {
        response = 'هذا سؤال جيد! يمكنني مساعدتك في فهم المفاهيم المتعلقة بالمحاضرة. هل يمكنك توضيح المزيد؟'
      }
    } else if (lowerMessage.includes('كيف') || lowerMessage.includes('how') || lowerMessage.includes('ازاي') || lowerMessage.includes('كيفية')) {
      if (lowerMessage.includes('اذاكر') || lowerMessage.includes('study') || lowerMessage.includes('ذاكر') || lowerMessage.includes('أذاكر')) {
        response = 'لدراسة هذه المحاضرة بفعالية:\n\n1. **اقرأ المحتوى الأساسي:** ركز على المفاهيم الرئيسية مثل HCI، التصميم التفاعلي، والوصولية\n\n2. **راجع الأمثلة:** انظر إلى الأمثلة المذكورة في المحاضرة مثل التصميم الشامل\n\n3. **طبق المبادئ:** جرب تطبيق مبادئ التصميم على مشروع صغير\n\n4. **اسأل أسئلة:** طرح أسئلة على المدرس أو زملائك حول النقاط المعقدة\n\n5. **راجع المصادر:** اقرأ الكتب والمقالات الموصى بها\n\nهل تريد نصائح محددة لجزء معين؟'
      } else if (lowerMessage.includes('ابدا') || lowerMessage.includes('منين') || lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('ابدأ')) {
        response = 'للبدء في فهم هذه المحاضرة:\n\n1. **ابدأ بالمقدمة:** اقرأ تعريف HCI وأهميته\n\n2. **افهم المكونات الأساسية:** التصميم التفاعلي، تجربة المستخدم، الوصولية\n\n3. **راجع المهارات المطلوبة:** البحث عن المستخدمين، معرفة التكنولوجيا\n\n4. **طبق على أمثلة:** فكر في كيفية تطبيق هذه المبادئ في التطبيقات اليومية\n\nهل تريد شرح نقطة معينة أولاً؟'
      } else {
        response = 'للإجابة على سؤالك، دعنا نفكر في الخطوات: أولاً، فهم المشكلة، ثم تطبيق المبادئ المذكورة في المحاضرة. هل تريد مثال محدد؟'
      }
    } else if (lowerMessage.includes('لماذا') || lowerMessage.includes('why')) {
      response = 'السبب الرئيسي هو تحسين تجربة المستخدم وجعل التكنولوجيا أكثر فائدة للجميع. هذا يساعد في تقليل الأخطاء وزيادة الكفاءة.'
    } else if (lowerMessage.includes('مثال') || lowerMessage.includes('example')) {
      response = 'مثال جيد من المحاضرة: في تصميم التطبيقات، يجب مراعاة ألوان مناسبة للمكفوفين الألوان لضمان الوصولية.'
    } else if (lowerMessage.includes('مساعدة') || lowerMessage.includes('help')) {
      response = 'بالتأكيد! يمكنني مساعدتك في فهم المحاضرة، الإجابة على أسئلة، أو تقديم نصائح للدراسة. ما الذي تحتاجه تحديداً؟'
    } else {
      // Try AI API for general questions
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'جاري التفكير في إجابتك...' }]);
      
      // Lecture context for AI
      const lectureContext = `معلومات المحاضرة:
العنوان: ${lecture.title}
المادة: ${materialName}
التاريخ: ${lecture.date ? formatDate(lecture.date) : 'غير محدد'}
المدة: ${lecture.duration || 'غير محدد'} دقيقة
عدد المواد المرفقة: ${lectureMaterials.length}
أسماء المواد: ${lectureMaterials.map(m => m.name).join(', ') || 'لا توجد مواد'}
عدد الأسئلة: ${lectureQuestions.length}
عدد الاختبارات: ${lectureQuizzes.length}`

      // Format history for Gemini API, skipping the initial greeting
      const formattedHistory = [
        { role: 'user', parts: [{ text: lectureContext }] },
        { role: 'model', parts: [{ text: 'فهمت معلومات المحاضرة. سأساعد الطالب الآن.' }] },
        ...newMessages
          .filter((msg, index) => !(index === 0 && msg.role === 'assistant'))
          .map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          }))
      ];

      try {
        const prompt = `${lectureContext}\n\nUser: ${userMessage}\nAssistant:`
        const textResponse = await generateTextWithHuggingFace(prompt)
        setChatMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: textResponse }])
      } catch (error) {
        console.error('Error with AI:', error)
        const errorMessage = error?.message || ''
        const fallbackResponse = errorMessage.includes('Hugging Face API key is missing')
          ? 'المفتاح غير موجود. أضف VITE_HF_API_KEY إلى إعدادات البيئة في منصة النشر.'
          : lowerMessage.includes('?') || lowerMessage.includes('؟')
            ? 'سؤال ممتاز! دعني أفكر في الإجابة بناءً على محتوى المحاضرة. يمكنني شرح المفاهيم، تقديم أمثلة، أو مساعدتك في فهم النقاط المعقدة. هل يمكنك توضيح المزيد؟'
            : 'أفهم ما تقصده. المحاضرة تغطي مواضيع مهمة في HCI. إذا كان لديك سؤال محدد أو تحتاج شرحاً، قل "اشرح المحاضرة" أو اسأل مباشرة.'
        setChatMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: fallbackResponse }])
      }
      return;
    }

    // If we have a keyword-based response, use it,
    if (response) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }
  }

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return
    try {
      setSubmittingQuestion(true)
      await studentService.askQuestion(user.id, lectureId, newQuestion)
      setNewQuestion('')
      await loadLectureDetail()
    } catch (error) {
      console.error('Error asking question:', error)
    } finally {
      setSubmittingQuestion(false)
    }
  }

  const handleVote = async (questionId, voteType) => {
    try {
      await studentService.voteQuestion(user.id, questionId, voteType)
      await loadLectureDetail()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!lecture) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>لم يتم العثور على المحاضرة</p>
      </div>
    )
  }

  const lectureMaterials = lecture.lecture_materials || []
  const lectureQuestions = lecture.lecture_questions || []
  const lectureQuizzes = lecture.quizzes || []
  const materialName = lecture.materials?.name || 'المادة'
  const aiCredits = user?.ai_credits ?? 50
  const maxAiCredits = user?.max_ai_credits ?? 50

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link to="/student/subjects" className="hover:text-primary-600">المواد</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/student/subjects/${subjectId}`} className="hover:text-primary-600">
          {materialName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">{lecture.title}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{lecture.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              {lecture.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(lecture.date)}</span>
                </div>
              )}
              {lecture.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{lecture.duration} دقيقة</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                {aiCredits}/{maxAiCredits} رصيد ذكاء
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Materials */}
          <Card>
            <CardHeader>
              <CardTitle>مواد المحاضرة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lectureMaterials.length > 0 ? lectureMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    mat.type === 'pdf' ? 'bg-red-100' : mat.type === 'video' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {mat.type === 'pdf' ? (
                      <FileText className="w-5 h-5 text-red-600" />
                    ) : (
                      <Video className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{mat.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {mat.file_size || ''}
                    </p>
                  </div>
                  {mat.file_url && (
                    <a href={mat.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              )) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">لا توجد مواد مرفقة</p>
              )}
            </CardContent>
          </Card>

          {/* AI Summary */}
          {lecture.ai_summary && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <CardTitle>ملخص المحاضرة بالذكاء الاصطناعي</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                  <div className="whitespace-pre-wrap">{lecture.ai_summary}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Q&A Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <CardTitle>أسئلة الطلاب</CardTitle>
                </div>
                <Badge variant="info">{lectureQuestions.length} سؤال</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* New Question Form */}
              <div className="flex gap-3">
                <Textarea
                  placeholder="اكتب سؤالك هنا..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={2}
                />
                <Button className="shrink-0" onClick={handleAskQuestion} disabled={submittingQuestion}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                {lectureQuestions.length > 0 ? lectureQuestions.map((q) => (
                  <div key={q.id} className={`p-4 rounded-xl ${q.is_pinned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <div className="flex items-start gap-3">
                      <Avatar name={q.students?.profiles?.name || 'طالب'} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{q.students?.profiles?.name || 'طالب'}</span>
                          {q.is_pinned && (
                            <Pin className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{q.question_text}</p>
                        
                        {q.answer_text && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">{q.professors?.profiles?.name || 'الأستاذ'}</span>
                            </div>
                            <p className="text-sm text-green-700">{q.answer_text}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600"
                            onClick={() => handleVote(q.id, 'up')}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>{q.votes || 0}</span>
                          </button>
                          <button
                            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
                            onClick={() => handleVote(q.id, 'down')}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-gray-400">
                            {getRelativeTime(q.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">لا توجد أسئلة بعد. كن أول من يسأل!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quiz */}
          {lectureQuizzes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>اختبارات المحاضرة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lectureQuizzes.map((quiz) => (
                  <div key={quiz.id} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{quiz.title}</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <p>{quiz.duration_minutes || 0} دقيقة</p>
                      {quiz.due_date && <p>الموعد النهائي: {getRelativeTime(quiz.due_date)}</p>}
                    </div>
                    <Link to={`/student/quiz/${quiz.id}`}>
                      <Button className="w-full" size="sm">
                        ابدأ الاختبار
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Chat */}
          <Card className="flex flex-col h-[500px]">
            <CardHeader className="shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary-600" />
                <CardTitle>المساعد الذكي</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-primary-100' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-primary-600" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Input */}
              <div className="flex gap-2 shrink-0">
                <Input
                  placeholder="اسأل عن المحاضرة..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                />
                <Button onClick={handleSendChat} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
