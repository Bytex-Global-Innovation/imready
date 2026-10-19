'use strict';

/** Default campus challenges and per-mission content (mirrors original student UI). */
const DEFAULT_PROBLEM_STATEMENTS = [
  'Long queues at the canteen during lunch breaks, causing students to waste time waiting for food.',
  'Crowding at the printing shop during exams, leading to delays in printing assignments and notes.',
  'Low student participation in the college gymnasium despite its availability.',
  'Students struggling to find empty classrooms for group discussions and project work.',
];

const MISSION_TIPS = {
  1: {
    advisorLabel: 'Advisor',
    quote:
      "Don't just describe. Try to notice behaviour, emotions, and patterns. Look for what people actually do vs what they say.",
  },
  2: {
    advisorLabel: 'Advisor',
    quote: 'People often say one thing, but do another. Look for stories, not opinions.',
  },
  3: {
    advisorLabel: 'Cognitive Momentum Guide',
    quote:
      "Don't just collect information. Connect the dots. The first answer is almost never the real root cause — keep asking why until you see an actionable lever.",
  },
  4: {
    advisorLabel: 'Prototyping Coach',
    quote:
      "Don't build a full app. Test a small idea quickly. Good prototypes answer one specific question without premature polish.",
  },
  5: {
    advisorLabel: 'Impact Advisor',
    quote:
      'Numbers convince more than adjectives. Say how many people you checked back with and what changed for them.',
  },
};

const WHY_LAYERS = [
  { key: 'why1', label: 'Why: First Layer (Symptom)' },
  { key: 'why2', label: 'Why: Second Layer' },
  { key: 'why3', label: 'Why: Third Layer' },
  { key: 'why4', label: 'Why: Fourth Layer (Operational)' },
];

const DEFAULT_PATTERN_TAGS = ['Information Gap', 'Counter Congestion', 'Communication Flow'];

function missionQuestions(missionId) {
  switch (missionId) {
    case 1:
      return [
        {
          answerKey: 'caption',
          label: 'Short title / caption',
          helper: 'Keep it concise and clear about the friction trigger.',
          placeholder: 'e.g. Lunch rush queue at main canteen counter',
        },
        {
          answerKey: 'reflection',
          question: 'Reflect on what you noticed',
          helper: 'A few lines about what surprised you. What stood out?',
          placeholder: 'Type your observation here...',
        },
      ];
    case 2:
      return [
        {
          answerKey: 'observation',
          label: 'Field observation',
          helper: 'Summarize what you saw or heard during conversations.',
          placeholder: 'Describe the situation you investigated...',
        },
        {
          answerKey: 'surprise',
          question: 'What surprised you the most during this interaction?',
          helper: 'Identifies behavior that contradicts assumptions.',
          placeholder: 'What caught you off guard?',
        },
        {
          answerKey: 'quotes',
          question: 'Any direct quotes that capture their frustration or mindset?',
          helper: 'Capture verbatim language instead of translating into your own words.',
          placeholder: '"I never know when my order is ready..."',
        },
        {
          answerKey: 'patterns',
          question: 'What repeating patterns do you see across multiple conversations?',
          helper: 'Highlight recurring feelings, wait loops, or workarounds.',
          placeholder: 'e.g. Everyone checks the counter repeatedly...',
        },
      ];
    case 3:
      return [
        ...WHY_LAYERS.map((layer) => ({
          answerKey: layer.key,
          label: layer.label,
          helper: 'Ask why this happens — dig one layer deeper.',
          placeholder: 'Because...',
        })),
        {
          answerKey: 'rootCause',
          question: 'What is the root cause you uncovered?',
          helper: 'State the underlying issue you can actually influence.',
          placeholder: 'The real problem is...',
        },
        {
          answerKey: 'pattern',
          question: 'What fundamental pattern did you detect?',
          helper: 'Connect observations from missions 1 and 2.',
          placeholder: 'The pattern across conversations is...',
        },
      ];
    case 4:
      return [
        {
          answerKey: 'presentationVideoUrl',
          label: 'Presentation video link',
          helper:
            'Paste a public YouTube link or a Google Drive link to your prototype/demo video.',
          placeholder: 'https://www.youtube.com/watch?v=... or https://drive.google.com/file/d/.../view',
        },
        {
          answerKey: 'description',
          label: 'Describe your prototype',
          helper: 'What did you build or test?',
          placeholder: 'We tried a simple token board at the counter...',
        },
        {
          answerKey: 'respond',
          question: 'How did people respond when you tested it?',
          helper: 'Note real reactions from 2–3 users.',
          placeholder: 'Students said...',
        },
        {
          answerKey: 'worked',
          question: 'What worked?',
          helper: 'Be specific about positive signals.',
          placeholder: 'Wait time felt shorter because...',
        },
        {
          answerKey: 'didntWork',
          question: "What didn't work?",
          helper: 'Honest friction points from the test.',
          placeholder: 'Some students still...',
        },
        {
          answerKey: 'improve',
          question: 'What is one improvement you would make next?',
          helper: 'One small iteration based on feedback.',
          placeholder: 'Next time I would...',
        },
      ];
    case 5:
      return [
        {
          answerKey: 'validation',
          question: 'How did you validate it?',
          helper: 'Who did you check back with and how?',
          placeholder: 'e.g. Checked back with 3 students who used the solution...',
        },
        {
          answerKey: 'impact',
          question: 'What impact did it have?',
          helper: 'What changed for them because of your fix?',
          placeholder: 'What changed for them because of your fix?',
        },
      ];
    default:
      return [];
  }
}

function evidenceConfigForMission(missionId) {
  const uploadHelper =
    'Upload a PDF or Word document (.pdf, .doc, .docx) that describes your evidence. Include Google Drive links to any photos, videos, or recordings.';
  switch (missionId) {
    case 1:
      return {
        sectionTitle: 'Add evidence from your observation',
        sectionDescription:
          'Upload a document describing what you saw. Include Google Drive links to any photos or recordings.',
        uploadHelper,
      };
    case 2:
      return {
        sectionTitle: 'Add evidence from your conversation',
        sectionDescription:
          'Upload a document with your notes and Google Drive links to any recordings or photos.',
        uploadHelper,
      };
    case 3:
      return { uploadHelper };
    case 4:
      return {
        sectionTitle: 'Share your prototype presentation video',
        sectionDescription:
          'Add a YouTube or Google Drive link to a short video showcasing what you built and tested.',
        videoLinkHelper:
          'Use an unlisted/public YouTube URL or a Google Drive file link with view access for reviewers.',
      };
    case 5:
      return {
        sectionTitle: 'Show your final proof',
        sectionDescription:
          'Upload a document with your final proof and Google Drive links to photos, videos, or recordings.',
        uploadHelper,
      };
    default:
      return { uploadHelper };
  }
}

function buildDefaultMissionConfig(problemText, missionId) {
  const tip = MISSION_TIPS[missionId] || MISSION_TIPS[1];
  return {
    missionId,
    tipAdvisorLabel: tip.advisorLabel,
    tipQuote: tip.quote,
    analyzeContextText:
      missionId === 3 ? `"${problemText.replace(/"/g, "'")}"` : null,
    patternTagOptions: missionId === 3 ? DEFAULT_PATTERN_TAGS : null,
    whyLayerLabels: missionId === 3 ? WHY_LAYERS : null,
    questions: missionQuestions(missionId),
    evidenceConfig: evidenceConfigForMission(missionId),
  };
}

function buildDefaultProblemPayloads() {
  return DEFAULT_PROBLEM_STATEMENTS.map((statementText, index) => ({
    statementText,
    sortOrder: index,
    isActive: true,
    missions: [1, 2, 3, 4, 5].map((missionId) =>
      buildDefaultMissionConfig(statementText, missionId),
    ),
  }));
}

module.exports = {
  DEFAULT_PROBLEM_STATEMENTS,
  buildDefaultProblemPayloads,
  buildDefaultMissionConfig,
  WHY_LAYERS,
};
