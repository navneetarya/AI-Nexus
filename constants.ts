import { Category, Tool } from './types';

export const SITE_CONFIG = {
  name: "AI Nexus",
  tagline: "The Master List of AI Tools",
  bio: "Curated collection of the best AI tools to automate your business, boost creativity, and accelerate development. Click any card to get started.",
  profileImage: "https://picsum.photos/150/150",
  instagramUrl: "https://instagram.com/yourhandle",
  email: "contact@example.com"
};

export const TOOLS: Tool[] = [
  // --- WRITING (16 Tools) ---
  {
    id: 'w1',
    name: 'Jasper',
    description: 'Advanced AI writing assistant for marketing copy, blog posts, and content creation.',
    category: Category.WRITING,
    affiliateLink: 'https://jasper.ai?fpr=yourlink',
    iconName: 'PenTool',
    color: '#818cf8'
  },
  {
    id: 'w2',
    name: 'Copy.ai',
    description: 'Generate high-converting marketing copy and content in seconds.',
    category: Category.WRITING,
    affiliateLink: 'https://copy.ai?via=yourlink',
    iconName: 'Copy',
    color: '#a3e635'
  },
  {
    id: 'w3',
    name: 'Writesonic',
    description: 'AI writer for creating SEO-friendly content for blogs, Facebook ads, and Google ads.',
    category: Category.WRITING,
    affiliateLink: 'https://writesonic.com?via=yourlink',
    iconName: 'FileText',
    color: '#a855f7'
  },
  {
    id: 'w4',
    name: 'Rytr',
    description: 'A better, faster way to write profile bios, Facebook ads, and landing page copies.',
    category: Category.WRITING,
    affiliateLink: 'https://rytr.me?via=yourlink',
    iconName: 'Type',
    color: '#fca5a5'
  },
  {
    id: 'w5',
    name: 'Quillbot',
    description: 'AI-powered paraphrasing tool to enhance your writing and ensure clarity.',
    category: Category.WRITING,
    affiliateLink: 'https://quillbot.com?via=yourlink',
    iconName: 'Wand2',
    color: '#4ade80'
  },
  {
    id: 'w6',
    name: 'Sudowrite',
    description: 'The AI writing partner for creative writers and novelists.',
    category: Category.WRITING,
    affiliateLink: 'https://sudowrite.com/?via=yourlink',
    iconName: 'PenTool',
    color: '#38bdf8'
  },
  {
    id: 'w7',
    name: 'Scalenut',
    description: 'Manage your entire content lifecycle with AI-powered SEO and writing tools.',
    category: Category.WRITING,
    affiliateLink: 'https://scalenut.com?via=yourlink',
    iconName: 'BarChart',
    color: '#fb923c'
  },
  {
    id: 'w8',
    name: 'Anyword',
    description: 'Data-driven copywriting AI that knows what converts.',
    category: Category.WRITING,
    affiliateLink: 'https://anyword.com?via=yourlink',
    iconName: 'MessageSquare',
    color: '#60a5fa'
  },
  {
    id: 'w9',
    name: 'Frase',
    description: 'Research, write, and optimize high-quality SEO content in minutes.',
    category: Category.WRITING,
    affiliateLink: 'https://frase.io?via=yourlink',
    iconName: 'Search',
    color: '#2dd4bf'
  },
  {
    id: 'w10',
    name: 'NeuralText',
    description: 'Automate your content operations with AI writing and SEO tools.',
    category: Category.WRITING,
    affiliateLink: 'https://neuraltext.com?via=yourlink',
    iconName: 'Cpu',
    color: '#818cf8'
  },
  {
    id: 'w11',
    name: 'Copysmith',
    description: 'AI content creation for enterprise and eCommerce teams.',
    category: Category.WRITING,
    affiliateLink: 'https://copysmith.ai?via=yourlink',
    iconName: 'FileText',
    color: '#c084fc'
  },
  {
    id: 'w12',
    name: 'Wordtune',
    description: 'Your personal writing companion that helps you say exactly what you mean.',
    category: Category.WRITING,
    affiliateLink: 'https://wordtune.com?via=yourlink',
    iconName: 'Wand2',
    color: '#f472b6'
  },
  {
    id: 'w13',
    name: 'ParagraphAI',
    description: 'World\'s first GPT-powered AI writing app for instant, better writing.',
    category: Category.WRITING,
    affiliateLink: 'https://paragraphai.com?via=yourlink',
    iconName: 'Type',
    color: '#fbbf24'
  },
  {
    id: 'w14',
    name: 'LongShot AI',
    description: 'Create long-form content that ranks on Google.',
    category: Category.WRITING,
    affiliateLink: 'https://longshot.ai?via=yourlink',
    iconName: 'Target',
    color: '#ef4444'
  },
  {
    id: 'w15',
    name: 'Hypotenuse AI',
    description: 'Turn a few keywords into original, insightful articles and product descriptions.',
    category: Category.WRITING,
    affiliateLink: 'https://hypotenuse.ai?via=yourlink',
    iconName: 'Zap',
    color: '#6366f1'
  },
  {
    id: 'w16',
    name: 'Originality.ai',
    description: 'The most accurate AI content detector and plagiarism checker.',
    category: Category.WRITING,
    affiliateLink: 'https://originality.ai?via=yourlink',
    iconName: 'Shield',
    color: '#f43f5e'
  },

  // --- IMAGE (15 Tools) ---
  {
    id: 'i1',
    name: 'Midjourney',
    description: 'Generates stunning, photorealistic images from simple text prompts.',
    category: Category.IMAGE,
    affiliateLink: 'https://midjourney.com',
    iconName: 'ImageIcon',
    color: '#f472b6'
  },
  {
    id: 'i2',
    name: 'Leonardo.ai',
    description: 'Create production-quality visual assets for your projects with unprecedented control.',
    category: Category.IMAGE,
    affiliateLink: 'https://leonardo.ai/?via=yourlink',
    iconName: 'Wand2',
    color: '#c084fc'
  },
  {
    id: 'i3',
    name: 'PhotoRoom',
    description: 'Remove backgrounds and create professional product photography with AI.',
    category: Category.IMAGE,
    affiliateLink: 'https://photoroom.com/?via=yourlink',
    iconName: 'Crop',
    color: '#818cf8'
  },
  {
    id: 'i4',
    name: 'Fotor',
    description: 'All-in-one AI photo editor and creative design platform.',
    category: Category.IMAGE,
    affiliateLink: 'https://fotor.com/?via=yourlink',
    iconName: 'Palette',
    color: '#fbbf24'
  },
  {
    id: 'i5',
    name: 'NightCafe',
    description: 'AI art generator to create amazing artworks using the power of AI.',
    category: Category.IMAGE,
    affiliateLink: 'https://nightcafe.studio?via=yourlink',
    iconName: 'ImageIcon',
    color: '#f59e0b'
  },
  {
    id: 'i6',
    name: 'StarryAI',
    description: 'Generate art simply by describing what you want to see.',
    category: Category.IMAGE,
    affiliateLink: 'https://starryai.com?via=yourlink',
    iconName: 'Sparkles',
    color: '#10b981'
  },
  {
    id: 'i7',
    name: 'GetIMG',
    description: 'Everything you need to create images with AI. Generate, edit, and expand.',
    category: Category.IMAGE,
    affiliateLink: 'https://getimg.ai?via=yourlink',
    iconName: 'ImageIcon',
    color: '#3b82f6'
  },
  {
    id: 'i8',
    name: 'Stockimg.ai',
    description: 'Generate stock images, wallpapers, logos, posters, and more.',
    category: Category.IMAGE,
    affiliateLink: 'https://stockimg.ai?via=yourlink',
    iconName: 'Layout',
    color: '#ec4899'
  },
  {
    id: 'i9',
    name: 'PicWish',
    description: 'AI photo editor to remove background, unblur, and enhance photos.',
    category: Category.IMAGE,
    affiliateLink: 'https://picwish.com?via=yourlink',
    iconName: 'Wand2',
    color: '#8b5cf6'
  },
  {
    id: 'i10',
    name: 'Cutout.pro',
    description: 'Visual AI platform for image and video editing and generation.',
    category: Category.IMAGE,
    affiliateLink: 'https://cutout.pro?via=yourlink',
    iconName: 'Crop',
    color: '#f43f5e'
  },
  {
    id: 'i11',
    name: 'VanceAI',
    description: 'AI photo enhancement and editing tools to boost productivity.',
    category: Category.IMAGE,
    affiliateLink: 'https://vanceai.com?via=yourlink',
    iconName: 'Zap',
    color: '#eab308'
  },
  {
    id: 'i12',
    name: 'Icons8',
    description: 'AI-generated faces, photos, and design assets.',
    category: Category.IMAGE,
    affiliateLink: 'https://icons8.com?via=yourlink',
    iconName: 'Box',
    color: '#14b8a6'
  },
  {
    id: 'i13',
    name: 'Playground AI',
    description: 'A free-to-use online AI image creator.',
    category: Category.IMAGE,
    affiliateLink: 'https://playgroundai.com?via=yourlink',
    iconName: 'Palette',
    color: '#6366f1'
  },
  {
    id: 'i14',
    name: 'Artsmart.ai',
    description: 'AI image generator optimized for marketers and content creators.',
    category: Category.IMAGE,
    affiliateLink: 'https://artsmart.ai?via=yourlink',
    iconName: 'ImageIcon',
    color: '#ec4899'
  },
  {
    id: 'i15',
    name: 'HeadshotPro',
    description: 'Professional corporate headshots for remote teams.',
    category: Category.IMAGE,
    affiliateLink: 'https://headshotpro.com?via=yourlink',
    iconName: 'User',
    color: '#06b6d4'
  },

  // --- VIDEO (15 Tools) ---
  {
    id: 'v1',
    name: 'Synthesia',
    description: 'Create professional AI videos from text in 120+ languages with avatars.',
    category: Category.VIDEO,
    affiliateLink: 'https://synthesia.io/?via=yourlink',
    iconName: 'Video',
    color: '#34d399'
  },
  {
    id: 'v2',
    name: 'Runway',
    description: 'Applied AI research company shaping the next era of art and video editing.',
    category: Category.VIDEO,
    affiliateLink: 'https://runwayml.com?via=yourlink',
    iconName: 'Film',
    color: '#ec4899'
  },
  {
    id: 'v3',
    name: 'HeyGen',
    description: 'Turn text into professional spokesperson videos in minutes.',
    category: Category.VIDEO,
    affiliateLink: 'https://heygen.com/?via=yourlink',
    iconName: 'User',
    color: '#818cf8'
  },
  {
    id: 'v4',
    name: 'Descript',
    description: 'All-in-one video and audio editing, as easy as a doc.',
    category: Category.VIDEO,
    affiliateLink: 'https://descript.com/?via=yourlink',
    iconName: 'FileText',
    color: '#60a5fa'
  },
  {
    id: 'v5',
    name: 'InVideo',
    description: 'Turn ideas into videos instantly with AI-powered video creation.',
    category: Category.VIDEO,
    affiliateLink: 'https://invideo.io?via=yourlink',
    iconName: 'MonitorPlay',
    color: '#38bdf8'
  },
  {
    id: 'v6',
    name: 'Pictory',
    description: 'Automatically create short, highly-sharable branded videos from long form content.',
    category: Category.VIDEO,
    affiliateLink: 'https://pictory.ai?ref=yourlink',
    iconName: 'Film',
    color: '#f472b6'
  },
  {
    id: 'v7',
    name: 'Fliki',
    description: 'Turn text into videos with AI voices.',
    category: Category.VIDEO,
    affiliateLink: 'https://fliki.ai/?via=yourlink',
    iconName: 'Video',
    color: '#e879f9'
  },
  {
    id: 'v8',
    name: 'D-ID',
    description: 'Create realistic digital humans from a single photo.',
    category: Category.VIDEO,
    affiliateLink: 'https://d-id.com?via=yourlink',
    iconName: 'User',
    color: '#f97316'
  },
  {
    id: 'v9',
    name: 'Elai.io',
    description: 'Build AI videos from just text with a real human presenter.',
    category: Category.VIDEO,
    affiliateLink: 'https://elai.io?via=yourlink',
    iconName: 'Video',
    color: '#6366f1'
  },
  {
    id: 'v10',
    name: 'Colossyan',
    description: 'AI video creator for workplace learning and corporate communications.',
    category: Category.VIDEO,
    affiliateLink: 'https://colossyan.com?via=yourlink',
    iconName: 'Briefcase',
    color: '#10b981'
  },
  {
    id: 'v11',
    name: 'DeepBrain',
    description: 'AI Studios for text-to-video creation with hyper-realistic AI avatars.',
    category: Category.VIDEO,
    affiliateLink: 'https://deepbrain.io?via=yourlink',
    iconName: 'BrainCircuit',
    color: '#3b82f6'
  },
  {
    id: 'v12',
    name: 'Steve.ai',
    description: 'Video making tool for social media and content marketing.',
    category: Category.VIDEO,
    affiliateLink: 'https://steve.ai?via=yourlink',
    iconName: 'Zap',
    color: '#ef4444'
  },
  {
    id: 'v13',
    name: 'Veed.io',
    description: 'Simple online video editing with auto-subtitles and more.',
    category: Category.VIDEO,
    affiliateLink: 'https://veed.io?via=yourlink',
    iconName: 'Film',
    color: '#fca5a5'
  },
  {
    id: 'v14',
    name: 'Opus Clip',
    description: 'Repurpose long videos into shorts in one click.',
    category: Category.VIDEO,
    affiliateLink: 'https://opus.pro?via=yourlink',
    iconName: 'Crop',
    color: '#fbbf24'
  },
  {
    id: 'v15',
    name: 'Munch',
    description: 'Extract the most engaging clips from your long-form videos.',
    category: Category.VIDEO,
    affiliateLink: 'https://getmunch.com?via=yourlink',
    iconName: 'Video',
    color: '#ec4899'
  },

  // --- AUDIO (10 Tools) ---
  {
    id: 'a1',
    name: 'ElevenLabs',
    description: 'The most realistic and versatile AI speech software.',
    category: Category.AUDIO,
    affiliateLink: 'https://elevenlabs.io/?via=yourlink',
    iconName: 'Mic',
    color: '#fbbf24'
  },
  {
    id: 'a2',
    name: 'Murf AI',
    description: 'Go from text to speech with a versatile AI voice generator.',
    category: Category.AUDIO,
    affiliateLink: 'https://murf.ai/?via=yourlink',
    iconName: 'Speaker',
    color: '#a78bfa'
  },
  {
    id: 'a3',
    name: 'Speechify',
    description: 'The #1 text to speech reader. Power through docs, articles, PDFs, emails.',
    category: Category.AUDIO,
    affiliateLink: 'https://speechify.com/?via=yourlink',
    iconName: 'BookOpen',
    color: '#60a5fa'
  },
  {
    id: 'a4',
    name: 'LOVO',
    description: 'Award-winning AI Voice Generator and Text to Speech software.',
    category: Category.AUDIO,
    affiliateLink: 'https://lovo.ai/?via=yourlink',
    iconName: 'Mic',
    color: '#f472b6'
  },
  {
    id: 'a5',
    name: 'Play.ht',
    description: 'AI Voice Generator. Realistic Text to Speech & Audio Generator.',
    category: Category.AUDIO,
    affiliateLink: 'https://play.ht?via=yourlink',
    iconName: 'Speaker',
    color: '#ec4899'
  },
  {
    id: 'a6',
    name: 'Listnr',
    description: 'AI Text to Speech Generator with over 900+ voices.',
    category: Category.AUDIO,
    affiliateLink: 'https://listnr.tech?via=yourlink',
    iconName: 'ListMusic',
    color: '#3b82f6'
  },
  {
    id: 'a7',
    name: 'Resemble AI',
    description: 'Clone your voice and create AI text to speech.',
    category: Category.AUDIO,
    affiliateLink: 'https://resemble.ai?via=yourlink',
    iconName: 'Mic',
    color: '#6366f1'
  },
  {
    id: 'a8',
    name: 'Podcastle',
    description: 'Studio-quality recording, AI editing, and seamless exporting.',
    category: Category.AUDIO,
    affiliateLink: 'https://podcastle.ai?via=yourlink',
    iconName: 'Headphones',
    color: '#10b981'
  },
  {
    id: 'a9',
    name: 'Krisp',
    description: 'AI noise cancellation app that mutes background noise in calls.',
    category: Category.AUDIO,
    affiliateLink: 'https://krisp.ai?via=yourlink',
    iconName: 'Mic',
    color: '#f97316'
  },
  {
    id: 'a10',
    name: 'Cleanvoice',
    description: 'Removes filler words, stuttering, and mouth sounds from your audio.',
    category: Category.AUDIO,
    affiliateLink: 'https://cleanvoice.ai?via=yourlink',
    iconName: 'Wand2',
    color: '#f43f5e'
  },

  // --- MARKETING (15 Tools) ---
  {
    id: 'm1',
    name: 'AdCreative.ai',
    description: 'Generate conversion-focused ad creatives and social media post creatives.',
    category: Category.MARKETING,
    affiliateLink: 'https://adcreative.ai/?via=yourlink',
    iconName: 'Megaphone',
    color: '#f43f5e'
  },
  {
    id: 'm2',
    name: 'Surfer SEO',
    description: 'Rank your content with the power of AI and SEO data.',
    category: Category.MARKETING,
    affiliateLink: 'https://surferseo.com/?via=yourlink',
    iconName: 'BarChart',
    color: '#fbbf24'
  },
  {
    id: 'm3',
    name: 'Semrush',
    description: 'Online visibility management platform with AI writing assistants.',
    category: Category.MARKETING,
    affiliateLink: 'https://semrush.com/?via=yourlink',
    iconName: 'Globe',
    color: '#fb923c'
  },
  {
    id: 'm4',
    name: 'Ocoya',
    description: 'Create, schedule, and analyze social media content 10x faster.',
    category: Category.MARKETING,
    affiliateLink: 'https://ocoya.com?via=yourlink',
    iconName: 'Share2',
    color: '#8b5cf6'
  },
  {
    id: 'm5',
    name: 'Predis.ai',
    description: 'AI social media post generator with creative designs.',
    category: Category.MARKETING,
    affiliateLink: 'https://predis.ai?via=yourlink',
    iconName: 'Palette',
    color: '#ec4899'
  },
  {
    id: 'm6',
    name: 'Repurpose.io',
    description: 'Automate your content workflow: TikTok to Reels to YouTube Shorts.',
    category: Category.MARKETING,
    affiliateLink: 'https://repurpose.io?via=yourlink',
    iconName: 'Share2',
    color: '#3b82f6'
  },
  {
    id: 'm7',
    name: 'Brand24',
    description: 'Media monitoring tool to track your brand across the web.',
    category: Category.MARKETING,
    affiliateLink: 'https://brand24.com?via=yourlink',
    iconName: 'Search',
    color: '#10b981'
  },
  {
    id: 'm8',
    name: 'Reply.io',
    description: 'AI sales engagement platform to automate cold outreach.',
    category: Category.MARKETING,
    affiliateLink: 'https://reply.io?via=yourlink',
    iconName: 'MessageSquare',
    color: '#ef4444'
  },
  {
    id: 'm9',
    name: 'Seamless.ai',
    description: 'Find verified emails and phone numbers for your sales leads.',
    category: Category.MARKETING,
    affiliateLink: 'https://seamless.ai?via=yourlink',
    iconName: 'SearchCode',
    color: '#06b6d4'
  },
  {
    id: 'm10',
    name: 'Albert.ai',
    description: 'Autonomous digital marketer that optimizes your ad campaigns.',
    category: Category.MARKETING,
    affiliateLink: 'https://albert.ai?via=yourlink',
    iconName: 'Bot',
    color: '#f59e0b'
  },
  {
    id: 'm11',
    name: 'Taplio',
    description: 'The all-in-one AI-powered tool for LinkedIn growth.',
    category: Category.MARKETING,
    affiliateLink: 'https://taplio.com?via=yourlink',
    iconName: 'User',
    color: '#3b82f6'
  },
  {
    id: 'm12',
    name: 'Tweethunter',
    description: 'Build and monetize your Twitter audience with AI.',
    category: Category.MARKETING,
    affiliateLink: 'https://tweethunter.io?via=yourlink',
    iconName: 'MessageSquare',
    color: '#22d3ee'
  },
  {
    id: 'm13',
    name: 'Chatbase',
    description: 'Build an AI chatbot trained on your data.',
    category: Category.MARKETING,
    affiliateLink: 'https://chatbase.co?via=yourlink',
    iconName: 'Bot',
    color: '#111827'
  },
  {
    id: 'm14',
    name: 'Botsonic',
    description: 'Custom ChatGPT chatbot builder for your website.',
    category: Category.MARKETING,
    affiliateLink: 'https://writesonic.com/botsonic?via=yourlink',
    iconName: 'Bot',
    color: '#a855f7'
  },
  {
    id: 'm15',
    name: 'Dante AI',
    description: 'Custom AI Chatbots trained on your data, zero coding required.',
    category: Category.MARKETING,
    affiliateLink: 'https://dante-ai.com?via=yourlink',
    iconName: 'MessageSquare',
    color: '#f43f5e'
  },

  // --- DESIGN (10 Tools) ---
  {
    id: 'd1',
    name: 'Canva',
    description: 'Design for everyone. Now with powerful Magic AI tools.',
    category: Category.DESIGN,
    affiliateLink: 'https://canva.com',
    iconName: 'Palette',
    color: '#2dd4bf'
  },
  {
    id: 'd2',
    name: 'Beautiful.ai',
    description: 'Presentation software that designs for you.',
    category: Category.DESIGN,
    affiliateLink: 'https://beautiful.ai/?via=yourlink',
    iconName: 'Layout',
    color: '#f472b6'
  },
  {
    id: 'd3',
    name: 'Looka',
    description: 'Design your own beautiful brand and logo with AI.',
    category: Category.DESIGN,
    affiliateLink: 'https://looka.com?via=yourlink',
    iconName: 'PenTool',
    color: '#3b82f6'
  },
  {
    id: 'd4',
    name: 'Uizard',
    description: 'Design wireframes, mockups, and prototypes in minutes.',
    category: Category.DESIGN,
    affiliateLink: 'https://uizard.io?via=yourlink',
    iconName: 'Layout',
    color: '#f59e0b'
  },
  {
    id: 'd5',
    name: 'Designs.ai',
    description: 'Agency-as-a-service platform to create logos, videos, and banners.',
    category: Category.DESIGN,
    affiliateLink: 'https://designs.ai?via=yourlink',
    iconName: 'Palette',
    color: '#6366f1'
  },
  {
    id: 'd6',
    name: 'Kittl',
    description: 'The most intuitive design platform for creators.',
    category: Category.DESIGN,
    affiliateLink: 'https://kittl.com?via=yourlink',
    iconName: 'Target',
    color: '#14b8a6'
  },
  {
    id: 'd7',
    name: 'Microsoft Designer',
    description: 'Stunning designs in a flash with Microsoft AI.',
    category: Category.DESIGN,
    affiliateLink: 'https://designer.microsoft.com',
    iconName: 'Wand2',
    color: '#ea580c'
  },
  {
    id: 'd8',
    name: 'Gamma',
    description: 'A new medium for presenting ideas. Powered by AI.',
    category: Category.DESIGN,
    affiliateLink: 'https://gamma.app?via=yourlink',
    iconName: 'Layout',
    color: '#c084fc'
  },
  {
    id: 'd9',
    name: 'Tome',
    description: 'The AI-powered storytelling format for work and ideas.',
    category: Category.DESIGN,
    affiliateLink: 'https://tome.app?via=yourlink',
    iconName: 'BookOpen',
    color: '#111827'
  },
  {
    id: 'd10',
    name: 'SlidesAI',
    description: 'Create presentation slides with AI in seconds.',
    category: Category.DESIGN,
    affiliateLink: 'https://slidesai.io?via=yourlink',
    iconName: 'MonitorPlay',
    color: '#fca5a5'
  },

  // --- CODING (10 Tools) ---
  {
    id: 'c1',
    name: 'GitHub Copilot',
    description: 'Your AI pair programmer that helps you write code faster.',
    category: Category.CODING,
    affiliateLink: 'https://github.com/features/copilot',
    iconName: 'Code2',
    color: '#94a3b8'
  },
  {
    id: 'c2',
    name: 'Phind',
    description: 'The AI search engine optimized for developers.',
    category: Category.CODING,
    affiliateLink: 'https://phind.com',
    iconName: 'SearchCode',
    color: '#60a5fa'
  },
  {
    id: 'c3',
    name: 'Tabnine',
    description: 'AI assistant for software developers that anticipates your next coding needs.',
    category: Category.CODING,
    affiliateLink: 'https://tabnine.com/?via=yourlink',
    iconName: 'Code2',
    color: '#818cf8'
  },
  {
    id: 'c4',
    name: 'Amazon CodeWhisperer',
    description: 'Build applications faster with the AI coding companion.',
    category: Category.CODING,
    affiliateLink: 'https://aws.amazon.com/codewhisperer/',
    iconName: 'Terminal',
    color: '#f97316'
  },
  {
    id: 'c5',
    name: 'CodiumAI',
    description: 'Generate meaningful tests for your code automatically.',
    category: Category.CODING,
    affiliateLink: 'https://codium.ai?via=yourlink',
    iconName: 'CheckSquare',
    color: '#10b981'
  },
  {
    id: 'c6',
    name: 'Codeium',
    description: 'Free AI Code Completion & Chat for developers.',
    category: Category.CODING,
    affiliateLink: 'https://codeium.com?via=yourlink',
    iconName: 'Code2',
    color: '#2dd4bf'
  },
  {
    id: 'c7',
    name: 'Replit',
    description: 'Build software collaboratively with the power of AI.',
    category: Category.CODING,
    affiliateLink: 'https://replit.com?via=yourlink',
    iconName: 'Terminal',
    color: '#f43f5e'
  },
  {
    id: 'c8',
    name: 'Sourcegraph Cody',
    description: 'AI coding assistant that knows your entire codebase.',
    category: Category.CODING,
    affiliateLink: 'https://sourcegraph.com/cody?via=yourlink',
    iconName: 'Search',
    color: '#a855f7'
  },
  {
    id: 'c9',
    name: 'Mutable.ai',
    description: 'AI Accelerated Software Development.',
    category: Category.CODING,
    affiliateLink: 'https://mutable.ai?via=yourlink',
    iconName: 'Cpu',
    color: '#3b82f6'
  },
  {
    id: 'c10',
    name: 'Fig',
    description: 'The next-generation command line with AI autocomplete.',
    category: Category.CODING,
    affiliateLink: 'https://fig.io?via=yourlink',
    iconName: 'Terminal',
    color: '#ec4899'
  },

  // --- PRODUCTIVITY (15 Tools) ---
  {
    id: 'p1',
    name: 'Notion AI',
    description: 'Access the limitless power of AI right inside your notes and docs.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://notion.so/?via=yourlink',
    iconName: 'FileText',
    color: '#e2e8f0'
  },
  {
    id: 'p2',
    name: 'Otter.ai',
    description: 'Get an AI meeting assistant that records audio, writes notes, and captures slides.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://otter.ai/?via=yourlink',
    iconName: 'ListMusic',
    color: '#f87171'
  },
  {
    id: 'p3',
    name: 'Taskade',
    description: 'Build a second brain for your team with AI-powered tasks and projects.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://taskade.com/?via=yourlink',
    iconName: 'CheckSquare',
    color: '#ec4899'
  },
  {
    id: 'p4',
    name: 'Motion',
    description: 'Use AI to organize your schedule and focus on deep work.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://usemotion.com/?via=yourlink',
    iconName: 'Zap',
    color: '#fbbf24'
  },
  {
    id: 'p5',
    name: 'Fireflies.ai',
    description: 'Automate your meeting notes. Record, transcribe, and search voice conversations.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://fireflies.ai/?via=yourlink',
    iconName: 'Bot',
    color: '#60a5fa'
  },
  {
    id: 'p6',
    name: 'Mem',
    description: 'The self-organizing workspace for your personal knowledge.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://mem.ai?via=yourlink',
    iconName: 'BrainCircuit',
    color: '#f97316'
  },
  {
    id: 'p7',
    name: 'SaneBox',
    description: 'AI email management that cleans up your inbox.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://sanebox.com?via=yourlink',
    iconName: 'Box',
    color: '#3b82f6'
  },
  {
    id: 'p8',
    name: 'Timely',
    description: 'Automatic time tracking software powered by AI.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://timelyapp.com?via=yourlink',
    iconName: 'Clock',
    color: '#8b5cf6'
  },
  {
    id: 'p9',
    name: 'Trevor AI',
    description: 'AI time blocking app to regain control of your day.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://trevorai.com?via=yourlink',
    iconName: 'Clock',
    color: '#10b981'
  },
  {
    id: 'p10',
    name: 'GPTZero',
    description: 'The gold standard for AI detection.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://gptzero.me?via=yourlink',
    iconName: 'Shield',
    color: '#fbbf24'
  },
  {
    id: 'p11',
    name: 'Winston AI',
    description: 'AI content detector for publishing and education.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://winston.ai?via=yourlink',
    iconName: 'Shield',
    color: '#34d399'
  },
  {
    id: 'p12',
    name: 'Aragon',
    description: 'Turn your selfies into professional AI headshots.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://aragon.ai?via=yourlink',
    iconName: 'User',
    color: '#f472b6'
  },
  {
    id: 'p13',
    name: 'ProfilePicture.ai',
    description: 'Create your perfect profile picture with AI.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://profilepicture.ai?via=yourlink',
    iconName: 'User',
    color: '#6366f1'
  },
  {
    id: 'p14',
    name: 'Merlin',
    description: 'ChatGPT Plus extension for Chrome to use on any website.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://getmerlin.in?via=yourlink',
    iconName: 'Wand2',
    color: '#06b6d4'
  },
  {
    id: 'p15',
    name: 'Rewind',
    description: 'The search engine for your life. Record everything you see and hear.',
    category: Category.PRODUCTIVITY,
    affiliateLink: 'https://rewind.ai?via=yourlink',
    iconName: 'Search',
    color: '#ef4444'
  }
];