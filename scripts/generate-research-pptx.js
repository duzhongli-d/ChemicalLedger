const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "深度调研功能介绍";
pres.author = "ChemicalLedger";

// Color palette - Teal Trust (professional, scientific feel)
const C = {
  primary: "028090",     // teal
  secondary: "00A896",   // seafoam
  accent: "02C39A",      // mint
  dark: "16404D",        // dark teal (for dark backgrounds)
  darkBg: "0D3D4D",      // very dark teal
  lightBg: "F0FDFA",     // very light mint
  white: "FFFFFF",
  offWhite: "F8FFFE",
  textDark: "1E3A3A",
  textMuted: "5C8A8A",
  cardBg: "FFFFFF",
  highlight: "FFE8D6",   // warm highlight
};

// Font settings
const FONT_HEAD = "Trebuchet MS";
const FONT_BODY = "Calibri";

// Helper: factory for shadows (never reuse objects)
const cardShadow = () => ({
  type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.1,
});
const iconShadow = () => ({
  type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.12,
});

// ─────────────────────────────────────────────
// SLIDE 1: Title
// ─────────────────────────────────────────────
{
  const slide = pres.addSlide();
  slide.background = { color: C.darkBg };

  // Decorative circle top-right
  slide.addShape(pres.shapes.OVAL, {
    x: 7.5, y: -1.5, w: 4, h: 4,
    fill: { color: C.primary, transparency: 30 },
  });
  // Decorative circle bottom-left
  slide.addShape(pres.shapes.OVAL, {
    x: -1, y: 4, w: 3, h: 3,
    fill: { color: C.secondary, transparency: 40 },
  });

  // Title
  slide.addText("深度调研功能介绍", {
    x: 0.8, y: 1.8, w: 8.4, h: 1.2,
    fontSize: 44, fontFace: FONT_HEAD, bold: true,
    color: C.white, align: "left",
  });

  // Subtitle
  slide.addText("基于 AI 的研究助手，助您高效管理学术资料与智能问答", {
    x: 0.8, y: 3.1, w: 7, h: 0.6,
    fontSize: 18, fontFace: FONT_BODY,
    color: C.accent, align: "left",
  });

  // Bottom bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.1, w: 10, h: 0.525,
    fill: { color: C.primary },
  });
  slide.addText("QC 台账管家  |  研究功能", {
    x: 0.8, y: 5.15, w: 8, h: 0.45,
    fontSize: 13, fontFace: FONT_BODY, color: C.white, align: "left", valign: "middle",
  });
}

// ─────────────────────────────────────────────
// SLIDE 2: 功能概览 (4 modules)
// ─────────────────────────────────────────────
{
  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // Title
  slide.addText("功能概览", {
    x: 0.6, y: 0.35, w: 8, h: 0.65,
    fontSize: 32, fontFace: FONT_HEAD, bold: true, color: C.textDark,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 0.95, w: 1.2, h: 0.07,
    fill: { color: C.primary },
  });

  // 4 cards: 2x2 grid
  const modules = [
    { icon: "📓", title: "学术空间", desc: "创建与管理研究笔记本，分类整理不同课题" },
    { icon: "📄", title: "来源管理", desc: "上传 PDF/TEXT，支持添加网址与音视频链接" },
    { icon: "💬", title: "智能问答", desc: "基于资料内容 AI 回答问题，实时流式响应" },
    { icon: "🧠", title: "内容生成", desc: "一键生成学习指南、思维导图与 PPT 大纲" },
  ];
  const positions = [
    { x: 0.5, y: 1.3 }, { x: 5.1, y: 1.3 },
    { x: 0.5, y: 3.3 }, { x: 5.1, y: 3.3 },
  ];

  modules.forEach((mod, i) => {
    const pos = positions[i];
    // Card background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: pos.x, y: pos.y, w: 4.3, h: 1.7,
      fill: { color: C.cardBg }, shadow: cardShadow(),
    });
    // Left accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: pos.x, y: pos.y, w: 0.08, h: 1.7,
      fill: { color: C.primary },
    });
    // Icon circle
    slide.addShape(pres.shapes.OVAL, {
      x: pos.x + 0.25, y: pos.y + 0.3, w: 0.8, h: 0.8,
      fill: { color: C.primary, transparency: 15 },
    });
    slide.addText(mod.icon, {
      x: pos.x + 0.25, y: pos.y + 0.32, w: 0.8, h: 0.8,
      fontSize: 26, align: "center", valign: "middle",
    });
    // Title
    slide.addText(mod.title, {
      x: pos.x + 1.2, y: pos.y + 0.25, w: 2.9, h: 0.45,
      fontSize: 17, fontFace: FONT_HEAD, bold: true, color: C.textDark,
    });
    // Description
    slide.addText(mod.desc, {
      x: pos.x + 1.2, y: pos.y + 0.7, w: 2.9, h: 0.75,
      fontSize: 12, fontFace: FONT_BODY, color: C.textMuted,
    });
  });
}

// ─────────────────────────────────────────────
// SLIDE 3: 学术空间管理
// ─────────────────────────────────────────────
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Title
  slide.addText("学术空间管理", {
    x: 0.6, y: 0.35, w: 8, h: 0.65,
    fontSize: 32, fontFace: FONT_HEAD, bold: true, color: C.textDark,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 0.95, w: 1.2, h: 0.07,
    fill: { color: C.primary },
  });

  // Left column: explanation
  slide.addText("什么是学术空间？", {
    x: 0.6, y: 1.25, w: 4.5, h: 0.45,
    fontSize: 16, fontFace: FONT_HEAD, bold: true, color: C.primary,
  });
  slide.addText([
    { text: "学术空间（Notebook）是您整理研究资料的核心单元。每个笔记本相互独立，可容纳多个来源文件，专属管理您的某一课题或项目。", options: { breakLine: true } },
  ], {
    x: 0.6, y: 1.7, w: 4.3, h: 1.0,
    fontSize: 13, fontFace: FONT_BODY, color: C.textDark,
  });

  // Rules cards
  const rules = [
    { label: "普通用户", value: "最多 3 个笔记本", icon: "👤" },
    { label: "管理员", value: "无数量限制", icon: "🔐" },
    { label: "笔记本名称", value: "支持中英文，可随时修改", icon: "✏️" },
    { label: "数据隔离", value: "各用户数据完全隔离", icon: "🔒" },
  ];
  rules.forEach((rule, i) => {
    const y = 2.8 + i * 0.6;
    slide.addShape(pres.shapes.OVAL, {
      x: 0.6, y, w: 0.45, h: 0.45,
      fill: { color: C.primary, transparency: 20 },
    });
    slide.addText(rule.icon, {
      x: 0.6, y, w: 0.45, h: 0.45,
      fontSize: 16, align: "center", valign: "middle",
    });
    slide.addText(rule.label, {
      x: 1.15, y, w: 1.6, h: 0.45,
      fontSize: 12, fontFace: FONT_HEAD, bold: true, color: C.textDark, valign: "middle",
    });
    slide.addText(rule.value, {
      x: 2.75, y, w: 2.5, h: 0.45,
      fontSize: 12, fontFace: FONT_BODY, color: C.textMuted, valign: "middle",
    });
  });

  // Right column: screenshot placeholder (decorative card)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.25, w: 4.3, h: 3.8,
    fill: { color: C.lightBg }, shadow: cardShadow(),
  });
  // Mock notebook UI illustration
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.4, y: 1.45, w: 3.9, h: 0.5,
    fill: { color: C.primary, transparency: 80 },
  });
  slide.addText("学术空间选择器", {
    x: 5.5, y: 1.5, w: 3.7, h: 0.4,
    fontSize: 11, fontFace: FONT_BODY, color: C.textMuted, align: "center", valign: "middle",
  });
  // Dropdown mock
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.4, y: 2.05, w: 3.9, h: 0.55,
    fill: { color: C.white }, line: { color: C.primary, width: 1.5 },
  });
  slide.addText("  ▾  选择笔记本...", {
    x: 5.5, y: 2.08, w: 3.7, h: 0.5,
    fontSize: 13, fontFace: FONT_BODY, color: C.textMuted, valign: "middle",
  });
  // Notebooks list
  const mockNbs = ["🔬 化学分析课题", "📊 稳定性研究", "📝 参考文献"];
  mockNbs.forEach((nb, i) => {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.4, y: 2.7 + i * 0.55, w: 3.9, h: 0.48,
      fill: { color: C.white }, shadow: cardShadow(),
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.4, y: 2.7 + i * 0.55, w: 0.06, h: 0.48,
      fill: { color: i === 0 ? C.primary : C.textMuted },
    });
    slide.addText(nb, {
      x: 5.6, y: 2.72 + i * 0.55, w: 3.6, h: 0.44,
      fontSize: 12, fontFace: FONT_BODY, color: C.textDark, valign: "middle",
    });
  });
  // New notebook button
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.4, y: 4.4, w: 3.9, h: 0.5,
    fill: { color: C.primary },
  });
  slide.addText("+ 新建学术空间", {
    x: 5.4, y: 4.4, w: 3.9, h: 0.5,
    fontSize: 13, fontFace: FONT_HEAD, bold: true, color: C.white, align: "center", valign: "middle",
  });
}

// ─────────────────────────────────────────────
// SLIDE 4: 来源管理
// ─────────────────────────────────────────────
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Title
  slide.addText("来源管理", {
    x: 0.6, y: 0.35, w: 8, h: 0.65,
    fontSize: 32, fontFace: FONT_HEAD, bold: true, color: C.textDark,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 0.95, w: 1.2, h: 0.07,
    fill: { color: C.primary },
  });

  // Source types grid
  const sourceTypes = [
    { icon: "📕", label: "PDF", desc: "研究报告、文献、手册" },
    { icon: "🔗", label: "URL", desc: "网页文章、在线文档" },
    { icon: "📝", label: "TEXT", desc: "纯文本、笔记、CSV" },
    { icon: "🎬", label: "VIDEO", desc: "教学视频、讲座录像" },
    { icon: "🎙️", label: "AUDIO", desc: "播客、访谈、会议录音" },
  ];

  sourceTypes.forEach((st, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.6 + col * 3.05;
    const y = 1.2 + row * 1.1;
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.85, h: 0.95,
      fill: { color: C.cardBg }, shadow: cardShadow(),
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.06, h: 0.95,
      fill: { color: C.primary },
    });
    slide.addText(st.icon + "  " + st.label, {
      x: x + 0.2, y: y + 0.1, w: 2.5, h: 0.38,
      fontSize: 14, fontFace: FONT_HEAD, bold: true, color: C.textDark,
    });
    slide.addText(st.desc, {
      x: x + 0.2, y: y + 0.48, w: 2.5, h: 0.38,
      fontSize: 11, fontFace: FONT_BODY, color: C.textMuted,
    });
  });

  // Processing flow
  slide.addText("上传与处理流程", {
    x: 0.6, y: 3.5, w: 4, h: 0.45,
    fontSize: 15, fontFace: FONT_HEAD, bold: true, color: C.primary,
  });

  const flowSteps = [
    { label: "上传文件", status: "PENDING", color: "94A3B8" },
    { label: "后台处理", status: "PROCESSING", color: "F59E0B" },
    { label: "处理完成", status: "READY", color: "10B981" },
    { label: "出错重试(3次)", status: "ERROR", color: "EF4444" },
  ];

  flowSteps.forEach((step, i) => {
    const x = 0.6 + i * 2.35;
    // Circle
    slide.addShape(pres.shapes.OVAL, {
      x, y: 4.0, w: 0.55, h: 0.55,
      fill: { color: step.color },
    });
    slide.addText(step.label, {
      x, y: 4.0, w: 0.55, h: 0.55,
      fontSize: 9, fontFace: FONT_BODY, color: C.white, align: "center", valign: "middle",
    });
    slide.addText(step.label, {
      x: x - 0.2, y: 4.6, w: 0.95, h: 0.35,
      fontSize: 9, fontFace: FONT_BODY, color: C.textMuted, align: "center",
    });
    // Arrow
    if (i < flowSteps.length - 1) {
      slide.addShape(pres.shapes.LINE, {
        x: x + 0.65, y: 4.28, w: 1.6, h: 0,
        line: { color: "CBD5E1", width: 1.5 },
      });
    }
  });
}

// ─────────────────────────────────────────────
// SLIDE 5: 智能问答
// ─────────────────────────────────────────────
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Title
  slide.addText("智能问答", {
    x: 0.6, y: 0.35, w: 8, h: 0.65,
    fontSize: 32, fontFace: FONT_HEAD, bold: true, color: C.textDark,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 0.95, w: 1.2, h: 0.07,
    fill: { color: C.primary },
  });

  // Left: description
  slide.addText("基于来源内容的 AI 问答", {
    x: 0.6, y: 1.25, w: 4.3, h: 0.4,
    fontSize: 15, fontFace: FONT_HEAD, bold: true, color: C.primary,
  });
  slide.addText([
    { text: "输入问题后，AI 会基于您上传的资料实时生成答案。回答会以流式方式展现，支持来源引用标注。", options: { breakLine: true, breakLine: true } },
    { text: "\n示例引用格式：", options: { bold: true, breakLine: true } },
    { text: "根据报告 [1: compound_analysis.pdf]，化合物纯度达 99.8%。", options: { italic: true } },
  ], {
    x: 0.6, y: 1.7, w: 4.3, h: 1.5,
    fontSize: 12, fontFace: FONT_BODY, color: C.textDark,
  });

  // Chat mockup
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.15, w: 4.4, h: 3.9,
    fill: { color: C.lightBg }, shadow: cardShadow(),
  });
  // Chat header
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.15, w: 4.4, h: 0.5,
    fill: { color: C.primary },
  });
  slide.addText("💬  智能问答", {
    x: 5.2, y: 1.18, w: 4.2, h: 0.44,
    fontSize: 13, fontFace: FONT_HEAD, bold: true, color: C.white, valign: "middle",
  });

  // User bubble
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.7, y: 1.8, w: 2.6, h: 0.45,
    fill: { color: C.primary }, radius: 0.08,
  });
  slide.addText("该化合物的有效期是多久？", {
    x: 6.75, y: 1.82, w: 2.5, h: 0.42,
    fontSize: 10, fontFace: FONT_BODY, color: C.white, align: "left", valign: "middle",
  });

  // AI bubble
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 2.4, w: 3.5, h: 0.9,
    fill: { color: C.white }, line: { color: "E2E8F0", width: 1 }, radius: 0.08,
  });
  slide.addText([
    { text: "根据稳定性研究报告 [1: stability_report.pdf]，", options: { breakLine: true } },
    { text: "该化合物在 ", options: { breakLine: false } },
    { text: "25°C 条件下有效期为 24 个月", options: { bold: true, breakLine: true } },
    { text: "（[1] 中 3.2 节数据）。", options: {} },
  ], {
    x: 5.35, y: 2.48, w: 3.2, h: 0.8,
    fontSize: 10, fontFace: FONT_BODY, color: C.textDark,
  });

  // Citation chip
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.3, y: 3.5, w: 1.6, h: 0.35,
    fill: { color: C.primary, transparency: 85 }, radius: 0.05,
  });
  slide.addText("[1] stability_report.pdf", {
    x: 5.3, y: 3.5, w: 1.6, h: 0.35,
    fontSize: 9, fontFace: FONT_BODY, color: C.primary, align: "center", valign: "middle",
  });

  // Input box mockup
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 4.0, w: 4.1, h: 0.5,
    fill: { color: C.white }, line: { color: "CBD5E1", width: 1 }, radius: 0.06,
  });
  slide.addText("输入您的问题...", {
    x: 5.3, y: 4.02, w: 3.0, h: 0.46,
    fontSize: 11, fontFace: FONT_BODY, color: C.textMuted, valign: "middle",
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 8.7, y: 4.0, w: 0.55, h: 0.5,
    fill: { color: C.primary }, radius: 0.06,
  });
  slide.addText("发送", {
    x: 8.7, y: 4.0, w: 0.55, h: 0.5,
    fontSize: 11, fontFace: FONT_HEAD, bold: true, color: C.white, align: "center", valign: "middle",
  });

  // Usage note
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 3.6, w: 4.2, h: 1.4,
    fill: { color: C.lightBg }, radius: 0.1,
  });
  slide.addText("💡 使用提示", {
    x: 0.75, y: 3.7, w: 3.8, h: 0.38,
    fontSize: 12, fontFace: FONT_HEAD, bold: true, color: C.primary,
  });
  slide.addText([
    { text: "• 请确保来源文件已处理完成（状态为就绪）", options: { breakLine: true } },
    { text: "• 点击引用标注可定位到对应来源", options: { breakLine: true } },
    { text: "• 每日有配额限制（普通用户 10 次/天）", options: { breakLine: true } },
  ], {
    x: 0.75, y: 4.08, w: 3.9, h: 0.9,
    fontSize: 11, fontFace: FONT_BODY, color: C.textMuted,
  });
}

// ─────────────────────────────────────────────
// SLIDE 6: 内容生成工作室
// ─────────────────────────────────────────────
{
  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // Title
  slide.addText("内容生成工作室", {
    x: 0.6, y: 0.35, w: 8, h: 0.65,
    fontSize: 32, fontFace: FONT_HEAD, bold: true, color: C.textDark,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 0.95, w: 1.2, h: 0.07,
    fill: { color: C.primary },
  });

  // Subtitle
  slide.addText("基于笔记本来源，一键生成结构化学习内容", {
    x: 0.6, y: 1.05, w: 6, h: 0.35,
    fontSize: 13, fontFace: FONT_BODY, color: C.textMuted,
  });

  const studios = [
    {
      icon: "📚",
      title: "学习指南",
      desc: "生成结构化课程内容，包含章节标题与详细讲解",
      example: "Introduction / Key Concepts / Summary",
      color: "0D9488",
    },
    {
      icon: "🧠",
      title: "思维导图",
      desc: "生成层级化的概念关系图，支持缩放与拖拽浏览",
      example: "中心主题 → 分支概念 → 详细节点",
      color: "7C3AED",
    },
    {
      icon: "📊",
      title: "PPT 大纲",
      desc: "生成演示文稿结构，包含每页标题与要点",
      example: "Slide 1: 概述 / Slide 2: 核心要点 / ...",
      color: "EA580C",
    },
  ];

  studios.forEach((st, i) => {
    const x = 0.6 + i * 3.1;

    // Card
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.5, w: 2.9, h: 3.6,
      fill: { color: C.cardBg }, shadow: cardShadow(),
    });

    // Top color bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.5, w: 2.9, h: 0.12,
      fill: { color: st.color },
    });

    // Icon circle
    slide.addShape(pres.shapes.OVAL, {
      x: x + 0.95, y: 1.8, w: 1.0, h: 1.0,
      fill: { color: st.color, transparency: 15 },
    });
    slide.addText(st.icon, {
      x: x + 0.95, y: 1.82, w: 1.0, h: 1.0,
      fontSize: 34, align: "center", valign: "middle",
    });

    // Title
    slide.addText(st.title, {
      x: x + 0.15, y: 2.95, w: 2.6, h: 0.45,
      fontSize: 17, fontFace: FONT_HEAD, bold: true, color: C.textDark, align: "center",
    });

    // Description
    slide.addText(st.desc, {
      x: x + 0.15, y: 3.4, w: 2.6, h: 0.7,
      fontSize: 11, fontFace: FONT_BODY, color: C.textMuted, align: "center",
    });

    // Example box
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.15, y: 4.15, w: 2.6, h: 0.8,
      fill: { color: st.color, transparency: 92 }, radius: 0.06,
    });
    slide.addText("示例输出", {
      x: x + 0.25, y: 4.18, w: 2.4, h: 0.25,
      fontSize: 8, fontFace: FONT_BODY, bold: true, color: st.color,
    });
    slide.addText(st.example, {
      x: x + 0.25, y: 4.42, w: 2.4, h: 0.5,
      fontSize: 9, fontFace: FONT_BODY, color: C.textMuted, italic: true,
    });
  });

  // Bottom tip
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 5.2, w: 9, h: 0.35,
    fill: { color: C.primary, transparency: 90 }, radius: 0.06,
  });
  slide.addText("💡 输入主题关键词，AI 自动分析来源内容，生成对应格式的学习材料", {
    x: 0.7, y: 5.2, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: FONT_BODY, color: C.primary, valign: "middle",
  });
}

// ─────────────────────────────────────────────
// SLIDE 7: 配额与限制
// ─────────────────────────────────────────────
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Title
  slide.addText("配额与限制说明", {
    x: 0.6, y: 0.35, w: 8, h: 0.65,
    fontSize: 32, fontFace: FONT_HEAD, bold: true, color: C.textDark,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 0.95, w: 1.2, h: 0.07,
    fill: { color: C.primary },
  });

  // Two columns: user vs admin
  // User column
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 1.25, w: 4.1, h: 3.7,
    fill: { color: C.cardBg }, shadow: cardShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 1.25, w: 4.1, h: 0.6,
    fill: { color: "94A3B8" },
  });
  slide.addText("👤  普通用户", {
    x: 0.75, y: 1.28, w: 3.8, h: 0.55,
    fontSize: 15, fontFace: FONT_HEAD, bold: true, color: C.white, valign: "middle",
  });

  const userLimits = [
    { label: "学术空间数量", value: "3 个笔记本" },
    { label: "每日问答次数", value: "10 次/天" },
    { label: "来源文件类型", value: "PDF / URL / TEXT / VIDEO / AUDIO" },
    { label: "文件大小限制", value: "根据系统配置" },
    { label: "数据访问", value: "仅自己创建的内容" },
  ];
  userLimits.forEach((item, i) => {
    const y = 1.95 + i * 0.58;
    slide.addText(item.label, {
      x: 0.75, y, w: 1.9, h: 0.5,
      fontSize: 11, fontFace: FONT_HEAD, bold: true, color: C.textDark, valign: "middle",
    });
    slide.addText(item.value, {
      x: 2.65, y, w: 1.9, h: 0.5,
      fontSize: 11, fontFace: FONT_BODY, color: C.textMuted, valign: "middle",
    });
    if (i < userLimits.length - 1) {
      slide.addShape(pres.shapes.LINE, {
        x: 0.75, y: y + 0.52, w: 3.8, h: 0,
        line: { color: "F1F5F9", width: 1 },
      });
    }
  });

  // Admin column
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.0, y: 1.25, w: 4.4, h: 3.7,
    fill: { color: C.cardBg }, shadow: cardShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.0, y: 1.25, w: 4.4, h: 0.6,
    fill: { color: C.primary },
  });
  slide.addText("🔐  管理员", {
    x: 5.15, y: 1.28, w: 4.1, h: 0.55,
    fontSize: 15, fontFace: FONT_HEAD, bold: true, color: C.white, valign: "middle",
  });

  const adminLimits = [
    { label: "学术空间数量", value: "无限制" },
    { label: "每日问答次数", value: "无限制" },
    { label: "来源文件类型", value: "PDF / URL / TEXT / VIDEO / AUDIO" },
    { label: "批量处理来源", value: "支持一键处理所有待处理来源" },
    { label: "数据访问", value: "查看所有用户的笔记本与来源" },
  ];
  adminLimits.forEach((item, i) => {
    const y = 1.95 + i * 0.58;
    slide.addText(item.label, {
      x: 5.15, y, w: 2.0, h: 0.5,
      fontSize: 11, fontFace: FONT_HEAD, bold: true, color: C.textDark, valign: "middle",
    });
    slide.addText(item.value, {
      x: 7.15, y, w: 2.1, h: 0.5,
      fontSize: 11, fontFace: FONT_BODY, color: C.primary, valign: "middle",
    });
    if (i < adminLimits.length - 1) {
      slide.addShape(pres.shapes.LINE, {
        x: 5.15, y: y + 0.52, w: 4.1, h: 0,
        line: { color: "F1F5F9", width: 1 },
      });
    }
  });

  // Note at bottom
  slide.addText("📌 每日配额于北京时间次日零点重置，剩余次数显示在页面顶部。", {
    x: 0.6, y: 5.05, w: 8.8, h: 0.4,
    fontSize: 11, fontFace: FONT_BODY, color: C.textMuted,
  });
}

// ─────────────────────────────────────────────
// SLIDE 8: 结束页
// ─────────────────────────────────────────────
{
  const slide = pres.addSlide();
  slide.background = { color: C.darkBg };

  // Decorative circles
  slide.addShape(pres.shapes.OVAL, {
    x: -2, y: -2, w: 5, h: 5,
    fill: { color: C.primary, transparency: 50 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 7, y: 3, w: 4, h: 4,
    fill: { color: C.secondary, transparency: 40 },
  });

  // Icon
  slide.addText("🔬", {
    x: 3.5, y: 1.2, w: 3, h: 1.2,
    fontSize: 60, align: "center", valign: "middle",
  });

  // Title
  slide.addText("开始您的研究之旅", {
    x: 0.5, y: 2.4, w: 9, h: 0.9,
    fontSize: 38, fontFace: FONT_HEAD, bold: true, color: C.white, align: "center",
  });

  // Subtitle
  slide.addText("如需帮助，请联系系统管理员", {
    x: 0.5, y: 3.35, w: 9, h: 0.5,
    fontSize: 16, fontFace: FONT_BODY, color: C.accent, align: "center",
  });

  // Feature pills at bottom
  const features = ["学术空间", "来源管理", "智能问答", "内容生成"];
  features.forEach((f, i) => {
    const x = 1.5 + i * 2.0;
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: 4.2, w: 1.7, h: 0.45,
      fill: { color: C.primary, transparency: 60 }, radius: 0.2,
    });
    slide.addText(f, {
      x, y: 4.2, w: 1.7, h: 0.45,
      fontSize: 12, fontFace: FONT_BODY, color: C.white, align: "center", valign: "middle",
    });
  });
}

// ─────────────────────────────────────────────
// Save
// ─────────────────────────────────────────────
pres.writeFile({ fileName: "docs/research-feature.pptx" })
  .then(() => console.log("PPTX saved: docs/research-feature.pptx"))
  .catch((err) => { console.error("Error:", err); process.exit(1); });