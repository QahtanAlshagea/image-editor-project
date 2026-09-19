<div align="center">

# 🌟 Lumen Studio — استوديو لومن لتحرير الصور
### محرر صور احترافي متكامل (Full-Stack) مستوحى من كبرى برامج التصميم العالمية (Photoshop / Canva / Photopea)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.13-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)
[![Pillow](https://img.shields.io/badge/Pillow-12.1-yellow?style=for-the-badge)](https://python-pillow.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

**[English Summary](#-english-overview) • [الميزات الرئيسية](#-الميزات-الرئيسية) • [التشغيل السريع](#-التشغيل-السريع-بنقرة-واحدة-windows) • [التثبيت اليدوي](#-التشغيل-والتثبيت-اليدوي) • [توثيق الـ API](#-توثيق-واجهة-البرمجة-api) • [هيكل المشروع](#-هيكل-المشروع)**

</div>

---

## 📖 نبذة عن المشروع

**Lumen Studio** هو تطبيق ويب متكامل لتحرير الصور ومعالجتها، مبني بمعمارية حديثة تجمع بين واجهة مستخدم تفاعلية وسريعة الاستجابة مبنية بـ **React 18 + Vite**، وخلفية حسابية قوية لمعالجة الصور مبنية بـ **Python Flask** بالاعتماد على خوارزميات **OpenCV** و **Pillow** و **NumPy** و **SciPy**.

يتميز التطبيق بمعمارية **Stateless API** بالكامل، حيث لا يتم تخزين أي صورة على الخادم لحماية خصوصية المستخدم، مع إمكانية التشغيل **بدون إنترنت (Offline-first)** وبسرعة فائقة.

---

## ✨ الميزات الرئيسية

| # | الميزة | الوصف التقني | أين تجدها |
|---|---|---|---|
| **1** | **تحويل صيغ الصور** | تحويل فوري عالي الجودة بين صيغ (`PNG`, `JPEG`, `WEBP`, `BMP`, `GIF`, `TIFF`) مع التحكم بنسبة الضغط والجودة. | لوحة **الصيغة** |
| **2** | **إزالة الخلفية الذكية** | محرك خوارزمي هجين متطور يعتمد على تحليل تدرج ألوان الحواف في فضاء الألوان `LAB`، متبوعاً بقناع `GrabCut` مدعوم بالتنظيف المورفولوجي وتنعيم الحواف لمنع التشوه. | لوحة **الخلفية** ← تبويب *إزالة الخلفية* |
| **3** | **تطبيق خلفيات المنتجات (استوديو احترافي)** | وضع المنتجات والأشياء على خلفيات استوديو عالية الدقة أو خلفيات مخصصة، مع قص هوامش الشفافية التلقائي، تحجيم نسبي دقيق للكانفاس، وإسقاط ظل ناعم واقعي (`Photorealistic Drop Shadow`). | لوحة **الخلفية** ← تبويب *خلفية المنتج* |
| **4** | **التحويل والهندسة (Transform)** | قص تفاعلي بحرية أو بنسب ثابتة (`1:1`, `4:3`, `16:9`)، تغيير الحجم بالأبعاد أو النسبة المئوية مع الحفاظ على التناسب، تدوير بزوايا `90° / 180° / 270°`، وقلب أفقي ورأسي. | لوحة **القص والتحويل** |
| **5** | **تحسينات البكسل والإضاءة** | معالجة دقيقة للسطوع، التباين، التشبع، التعريض، حرارة اللون، وتصحيح الجاما باستخدام مصفوفات `NumPy` عالية السرعة. | لوحة **تحسين البكسل** |
| **6** | **الفلاتر والتأثيرات** | تطبيق فلاتر فنية واحترافية: التنعيم (Blur)، زيادة الحدة (Sharpen)، كشف الحواف (Sobel/Laplacian)، السيبيا (Sepia)، التأثير الكرتوني (Cartoon)، والتدرج الرمادي. | لوحة **الفلاتر** |
| **7** | **دمج ومزج صورتين** | رفع صورتين ومزجهما بأنماط دمج فوتوشوب الاحترافية (`Normal`, `Multiply`, `Screen`, `Overlay`, `Darken`, `Lighten`) مع التحكم بالشفافية والحجم والموضع. | لوحة **الدمج** |
| **8** | **الرسم والكتابة على الصور** | لوحة رسم تفاعلية متكاملة تدعم القلم الحر، رسم الخطوط، المستطيلات، الدوائر، الأسهم، وإضافة النصوص بخطوط مخصصة وألوان متعددة. | لوحة **الرسم** |
| **9** | **أدوات إبداعية إضافية** | - **تحسين تلقائي بضغطة زر** (Equalization & Auto Contrast).<br>- **تمويه الوجوه** لحماية الخصوصية عبر Haar-Cascades.<br>- **إضافة علامة مائية** نصية.<br>- **استخراج لوحة الألوان** السائدة في الصورة (K-Means Clustering). | لوحة **أدوات إبداعية** |

---

## 🎯 مزايا تجربة المستخدم الاحترافية (UX)

- 🔄 **تراجع وإعادة غير محدود (Undo / Redo):** احتفاظ بتاريخ التعديلات خطوة بخطوة مع إمكانية التراجع بأي لحظة.
- 🎞️ **شريط التاريخ المصغر (History Strip):** استعراض مصغرات لكل مرحلة تعديل والقفز إليها مباشرة.
- 👁️ **معاينة حية (Live Preview):** تجربة التعديل ومقارنة النتيجة قبل تثبيتها.
- 🔍 **تحكم كامل بالكانفاس (Zoom & Pan):** تكبير/تصغير سلس عبر أزرار التحكم أو عبر `Ctrl + Scroll` مع خيار "ملائمة الشاشة" السريع.
- 🌐 **دعم كامل للغة العربية (RTL):** واجهة عربية راقية وعصرية مبنية خصيصاً للمستخدم العربي.
- 📱 **تصميم متجاوب (Responsive):** يعمل بكفاءة على الشاشات الكبيرة والشاشات اللوحية والهواتف.

---

## ⚡ التشغيل السريع بنقرة واحدة (Windows)

تم تزويد المشروع بملفات تشغيل تلقائية مخصصة لبيئة Windows لتوفير تشغيل فوري دون الحاجة لكتابة أوامر:

### 1. لتشغيل النظام:
انقر مرتين (**Double Click**) على ملف:
```text
start.bat
```
> سيقوم السكربت بالتحقق من وجود البيئة الافتراضية وحزم الـ npm وتثبيتها إن لزم، ثم تشغيل خادم الباك إند والفرونت إند و**فتح المتصفح تلقائياً على الرابط:**
> **[http://localhost:5173](http://localhost:5173)**

### 2. لإيقاف النظام:
عند الرغبة في إغلاق الخوادم، انقر مرتين (**Double Click**) على ملف:
```text
stop.bat
```

---

## 🛠️ التشغيل والتثبيت اليدوي

### المتطلبات الأساسية
- **Python 3.10+**
- **Node.js 18+** و **npm**

### الخطوة 1: تشغيل الخادم الخلفي (Backend)
```bash
# الانتقال لمجلد الباك إند
cd backend

# إنشاء وتفعيل البيئة الافتراضية
python -m venv .venv
# على ويندوز:
.venv\Scripts\activate
# على لينكس/ماك:
source .venv/bin/activate

# تثبيت المكتبات المطلوبة
pip install -r requirements.txt

# تشغيل الخادم
python run.py
```
> يعمل الخادم الخلفي على: `http://localhost:5000`

### الخطوة 2: تشغيل الواجهة الأمامية (Frontend)
في نافذة طرفية أخرى:
```bash
# الانتقال لمجلد الواجهة
cd frontend

# تثبيت حزم الاعتماديات
npm install

# تشغيل خادم التطوير
npm run dev
```
> تعمل الواجهة على: `http://localhost:5173` وترتبط تلقائياً بالخادم الخلفي عبر الـ Proxy.

---

## 📁 هيكل المشروع

```text
image-editor-project/
├── start.bat                   # سكربت تشغيل النظام وفتح المتصفح بنقرة واحدة
├── stop.bat                    # سكربت إيقاف خوادم النظام بنقرة واحدة
├── README.md                   # التوثيق الشامل للمشروع
├── .gitignore                  # الملفات المستثناة من التتبع البرمجي
│
├── backend/                    # الخادم الخلفي (Python Flask REST API)
│   ├── run.py                  # نقطة الدخول الرئيسية لتشغيل السيرفر
│   ├── requirements.txt        # مكتبات البايثون (Flask, OpenCV, Pillow, etc.)
│   ├── app/
│   │   ├── __init__.py         # تهيئة تطبيق Flask والـ Blueprints و CORS
│   │   ├── routes/             # نقاط النهاية (API Routes)
│   │   │   ├── background_routes.py # إزالة وتطبيق الخلفيات
│   │   │   ├── convert_routes.py    # تحويل الصيغ
│   │   │   ├── creative_routes.py   # الأدوات الإبداعية ولوحة الألوان
│   │   │   ├── draw_routes.py       # تطبيق الرسومات والنصوص
│   │   │   ├── enhance_routes.py    # تحسينات البكسل والإضاءة
│   │   │   ├── filter_routes.py     # تطبيق الفلاتر
│   │   │   ├── merge_routes.py      # دمج ومزج الصور
│   │   │   └── transform_routes.py  # القص، التدوير، وتغيير الحجم
│   │   ├── services/           # منطق المعالجة الحسابية والخوارزميات
│   │   │   ├── background_removal.py # خوارزمية إزالة الخلفيات ودمج المنتجات
│   │   │   ├── creative_service.py   # كشف الوجوه واستخراج الألوان
│   │   │   ├── draw_service.py       # محرك الرسم وإضافة الأشكال
│   │   │   ├── enhance_service.py    # معالجات البكسل الرياضية
│   │   │   ├── filter_service.py     # مصفوفات الفلاتر النقطية
│   │   │   ├── image_io.py           # معالجة واستيراد وتصدير الصور
│   │   │   ├── library_service.py    # إدارة مكتبة الخلفيات الجاهزة
│   │   │   ├── merge_service.py      # دمج وتراكب الصور
│   │   │   └── transform_service.py  # التحويلات الهندسية
│   │   └── static/             # الموارد الثابتة (الخلفيات، الخطوط، المصغرات)
│   └── scripts/
│       └── generate_backgrounds.py   # أداة توليد مكتبة الخلفيات الجاهزة
│
└── frontend/                   # الواجهة الأمامية (React + Vite)
    ├── package.json            # اعتماديات الواجهة الأمامية
    ├── vite.config.js          # إعدادات Vite مع إعداد الـ Proxy لربط الـ API
    ├── index.html              # الصفحة الرئيسية
    └── src/
        ├── App.jsx             # المكون الرئيسي للواجهة
        ├── main.jsx            # نقطة البداية لـ React
        ├── api/                # عميل الـ HTTP وإرسال طلبات الـ API
        ├── components/         # عناصر ومكونات الواجهة
        │   ├── CanvasStage.jsx # مساحة عرض الكانفاس والتكبير والتصغير
        │   ├── HistoryStrip.jsx# شريط تاريخ التعديلات
        │   ├── Sidebar.jsx     # القائمة الجانبية للأدوات
        │   ├── TopBar.jsx      # الشريط العلوي للتطبيق
        │   ├── panels/         # لوحات التحكم الخاصة بكل أداة
        │   └── ui/             # عناصر واجهة المستخدم المشتركة
        ├── hooks/              # خطافات إدارة الحالة المخصصة
        └── styles/             # ملفات التنسيق المخصصة (Custom CSS)
```

---

## 📡 توثيق واجهة البرمجة (API Reference)

جميع الطلبات تُرسل عبر `POST` باستخدام صيغة `multipart/form-data` مع إرفاق الصورة بحقل `image`، وتُعيد الصورة الناتجة كتدفق بايتات مباشر (باستثناء مسارات الاستعلام):

| المسار | الطريقة | المعاملات | الوصف |
|---|:---:|---|---|
| `/api/health` | `GET` | — | فحص حالة وصحة اتصال الخادم. |
| `/api/convert` | `POST` | `target_format`, `quality` | تحويل صيغة الصورة وضبط الجودة. |
| `/api/background/remove` | `POST` | `shadow` | إزالة الخلفية تلقائياً بدقة مع خيار الظل. |
| `/api/background/library` | `GET` | — | جلب قائمة مكتبة الخلفيات الجاهزة. |
| `/api/background/apply` | `POST` | `background_id` / `background`, `x`, `y`, `scale`, `shadow`, `auto_remove` | تطبيق خلفية جاهزة أو مخصصة مع قص الهوامش والتحجيم الدقيق. |
| `/api/transform/crop` | `POST` | `x`, `y`, `width`, `height` | قص جزء محدد من الصورة. |
| `/api/transform/resize` | `POST` | `width`, `height` | تغيير أبعاد الصورة بدقة. |
| `/api/transform/rotate` | `POST` | `angle` | تدوير الصورة بزاوية محددة. |
| `/api/transform/flip` | `POST` | `direction` (`horizontal`/`vertical`) | قلب الصورة أفقياً أو رأسياً. |
| `/api/enhance/pixel` | `POST` | `brightness`, `contrast`, `saturation`, `exposure`, `gamma`, `temperature` | تطبيق تعديلات البكسل والإضاءة. |
| `/api/filters` | `POST` | `filter_name` | تطبيق الفلاتر اللونية والفنية. |
| `/api/merge` | `POST` | `overlay`, `blend_mode`, `opacity`, `x`, `y`, `scale` | مزج صورتين معاً بأنماط دمج متقدمة. |
| `/api/draw/apply` | `POST` | `drawing_data` | دمج الرسومات والنصوص داخل الصورة. |
| `/api/creative/auto_enhance` | `POST` | — | تحسين تباين وألوان الصورة تلقائياً. |
| `/api/creative/face_blur` | `POST` | `factor` | كشف الوجوه وتمويهها لحفظ الخصوصية. |
| `/api/creative/watermark` | `POST` | `text`, `opacity`, `position`, `size` | إضافة علامة مائية نصية مخصصة. |
| `/api/creative/palette` | `POST` | `num_colors` | استخراج لوحة الألوان السائدة بصيغة JSON. |

---

## 🌐 English Overview

**Lumen Studio** is a modern, high-performance in-browser photo editing suite that replicates the core capabilities of desktop tools like Photoshop, Canva, and Photopea.

### Key Highlights:
- **Full-Stack Architecture:** Ultra-fast React 18 + Vite frontend paired with a modular Python Flask backend.
- **Advanced Processing:** Powered by OpenCV, NumPy, SciPy, and Pillow.
- **Smart Background Removal:** Robust local segmentation combining perceptual LAB color distance analysis with mask-seeded GrabCut, morphological hole-filling, component filtering, and smooth anti-aliased edge matting.
- **Accurate Product Placement:** Clean bounding-box trimming, automatic canvas fitting, relative proportional scaling, and soft ground shadow casting.
- **Zero-Storage Privacy:** 100% stateless API architecture ensuring user images are processed purely in memory and never stored.
- **Double-Click Automation:** Native 1-click Windows scripts (`start.bat` / `stop.bat`) for instant local launch.

---

<div align="center">
  <b>صنع بكل شغف وإتقان بواسطة قحطان الشجاع ❤️</b><br>
  <sub>Lumen Studio © 2026 — All rights reserved.</sub>
</div>
