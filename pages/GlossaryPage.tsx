import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { SITE_CONFIG } from '../constants';
import { SharedNav } from './SharedNav';

const C = {
  bg:'var(--bg)', surf:'var(--surf)', a1:'var(--a1)', a2:'var(--a2)',
  txt:'var(--txt)', mut:'var(--mut)', mut2:'var(--mut2)',
  a1card:'var(--a1-card)', a1brd:'var(--a1-brd)', brd:'var(--brd)',
  barBg:'var(--bar-bg)', barBrd:'var(--bar-brd)',
};

interface GlossaryTerm {
  term: string;
  definition: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  { term: "AGI (Artificial General Intelligence)", definition: "A hypothetical type of AI that can understand, learn, and apply knowledge across any intellectual task a human can perform. Unlike today's narrow AI systems, AGI would exhibit flexible reasoning, common sense, and the ability to transfer skills between domains without retraining." },
  { term: "AI Agent", definition: "An autonomous AI system that can perceive its environment, make decisions, and take actions to accomplish specific goals. AI agents often chain multiple tool calls — such as web searches, code execution, or API requests — to complete complex, multi-step tasks without constant human oversight." },
  { term: "Alignment", definition: "The research field focused on ensuring AI systems behave in ways consistent with human values and intentions. Alignment techniques aim to prevent AI from pursuing goals that conflict with what its creators or users actually want, especially as systems become more capable." },
  { term: "ANI (Artificial Narrow Intelligence)", definition: "AI systems designed and trained for a single specific task or a narrow set of related tasks. Every AI product available today — from chatbots to image generators — is a form of ANI. These systems excel within their domain but cannot generalize to unrelated problems." },
  { term: "API (Application Programming Interface)", definition: "A set of rules and protocols that allows different software applications to communicate with each other. In the AI space, APIs let developers send prompts to language models (like GPT or Claude) and receive generated responses, enabling integration of AI capabilities into apps and workflows." },
  { term: "Attention Mechanism", definition: "A neural network component that allows models to focus on the most relevant parts of an input when producing an output. Attention is the core innovation behind Transformers — it lets the model weigh the importance of each word or token relative to every other, enabling better understanding of context and long-range dependencies." },
  { term: "Autoregressive Model", definition: "A model that generates output one token at a time, where each new token is predicted based on all previously generated tokens. Most large language models — including GPT and Claude — are autoregressive, producing text sequentially from left to right." },
  { term: "Backpropagation", definition: "The fundamental algorithm used to train neural networks by calculating how much each weight contributed to the model's error. It works by propagating the error signal backward from the output layer through the network, adjusting weights to minimize mistakes on future predictions." },
  { term: "Bias (in AI)", definition: "Systematic errors or unfair preferences in an AI system's outputs, often reflecting biases present in training data or design choices. AI bias can lead to discriminatory outcomes in hiring, lending, content moderation, and other applications. Identifying and mitigating bias is a major focus of responsible AI development." },
  { term: "Chain-of-Thought (CoT)", definition: "A prompting technique that encourages a language model to break down complex reasoning into intermediate steps before arriving at a final answer. Chain-of-thought prompting has been shown to significantly improve accuracy on math, logic, and multi-step reasoning tasks." },
  { term: "Computer Vision", definition: "A field of AI that enables machines to interpret and understand visual information from images and videos. Applications include facial recognition, object detection, medical image analysis, autonomous driving, and tools like Google Lens or Apple's Visual Look Up." },
  { term: "Constitutional AI", definition: "An alignment approach developed by Anthropic where an AI system is trained using a set of written principles (a \"constitution\") that guide its behavior. The model critiques and revises its own responses based on these principles, reducing the need for extensive human feedback while improving safety." },
  { term: "Deep Learning", definition: "A subset of machine learning that uses neural networks with many layers (hence \"deep\") to learn complex patterns from large amounts of data. Deep learning powers most modern AI breakthroughs — including image recognition, speech processing, and large language models." },
  { term: "Diffusion Model", definition: "A type of generative AI model that creates images (or other data) by learning to reverse a gradual noising process. During training, the model learns to remove noise step by step; during generation, it starts from pure noise and iteratively refines it into a coherent image. DALL·E, Midjourney, and Stable Diffusion all use this approach." },
  { term: "Edge AI", definition: "Running AI models directly on local devices — such as smartphones, laptops, or IoT sensors — instead of sending data to cloud servers. Edge AI enables faster response times, offline functionality, and improved privacy since data never leaves the device." },
  { term: "Embedding", definition: "A numerical representation of text, images, or other data as a dense vector (list of numbers) in a high-dimensional space. Embeddings capture semantic meaning — so similar concepts end up close together in vector space. They power search, recommendation systems, and retrieval-augmented generation (RAG)." },
  { term: "Few-Shot Learning", definition: "A technique where a language model is given a small number of examples (\"shots\") in the prompt to demonstrate the desired task or output format. Few-shot prompting helps models produce more accurate and consistent results without requiring any fine-tuning." },
  { term: "Fine-Tuning", definition: "The process of taking a pre-trained AI model and further training it on a smaller, task-specific dataset to improve its performance on that particular task. Fine-tuning is how general-purpose models get customized — for example, training a base LLM on medical literature to create a healthcare assistant." },
  { term: "Foundation Model", definition: "A large AI model trained on broad, diverse data that can be adapted to a wide range of downstream tasks. GPT-4, Claude, Llama, and Gemini are all foundation models. They serve as the \"foundation\" that can be fine-tuned, prompted, or extended for specific applications." },
  { term: "GAN (Generative Adversarial Network)", definition: "A generative AI architecture where two neural networks compete: a generator creates fake data, and a discriminator tries to distinguish real from fake. This adversarial training produces increasingly realistic outputs. GANs were pioneering in AI image generation before diffusion models became dominant." },
  { term: "GPT (Generative Pre-trained Transformer)", definition: "A family of large language models developed by OpenAI that generate text by predicting the next token in a sequence. \"Generative\" means it creates new content, \"Pre-trained\" means it learns from vast internet data before any task-specific training, and \"Transformer\" refers to its underlying architecture." },
  { term: "Hallucination", definition: "When an AI model generates information that sounds plausible but is factually incorrect or entirely fabricated. Hallucinations are a fundamental challenge with current language models because they predict statistically likely text rather than verified facts. Always fact-check critical AI-generated claims." },
  { term: "Inference", definition: "The process of using a trained AI model to generate predictions or outputs from new inputs. When you send a prompt to ChatGPT and get a response, that's inference. Inference costs (compute, latency, energy) are a key factor in AI product pricing and deployment strategy." },
  { term: "Latent Space", definition: "An abstract, compressed representation of data learned by a neural network, where similar items are positioned near each other. In image generation, the model works in latent space to manipulate visual concepts efficiently before decoding them back into full-resolution images." },
  { term: "LLM (Large Language Model)", definition: "A neural network trained on massive amounts of text data that can understand, generate, and reason about human language. LLMs like GPT-4, Claude, Gemini, and Llama power chatbots, writing assistants, code generators, and a wide range of AI applications." },
  { term: "LoRA (Low-Rank Adaptation)", definition: "A parameter-efficient fine-tuning technique that adds small, trainable adapter layers to a frozen pre-trained model instead of updating all its weights. LoRA dramatically reduces the compute and memory required for fine-tuning, making it practical to customize large models on consumer hardware." },
  { term: "Machine Learning", definition: "A branch of AI where systems learn patterns from data and improve their performance without being explicitly programmed for every scenario. Machine learning encompasses supervised, unsupervised, and reinforcement learning — and is the foundation for most modern AI applications." },
  { term: "Multimodal AI", definition: "AI systems that can process and generate multiple types of data — such as text, images, audio, and video — within a single model. GPT-4o, Gemini, and Claude are multimodal models that can understand images alongside text, enabling richer and more versatile interactions." },
  { term: "Neural Network", definition: "A computing system inspired by the structure of biological brains, consisting of interconnected layers of artificial neurons (nodes). Neural networks learn by adjusting the strength of connections between nodes based on training data. They are the foundation of virtually all modern AI systems." },
  { term: "NLP (Natural Language Processing)", definition: "The field of AI focused on enabling computers to understand, interpret, and generate human language. NLP covers tasks like sentiment analysis, translation, summarization, question answering, and text generation — essentially any AI application that works with text or speech." },
  { term: "NLU (Natural Language Understanding)", definition: "A subfield of NLP focused specifically on a machine's ability to comprehend the meaning and intent behind human language — not just the words themselves. NLU powers features like intent detection in chatbots, semantic search, and contextual understanding in virtual assistants." },
  { term: "OCR (Optical Character Recognition)", definition: "Technology that converts images of text — such as scanned documents, photos of signs, or handwritten notes — into machine-readable, editable text. Modern OCR systems use deep learning to achieve high accuracy across fonts, languages, and handwriting styles." },
  { term: "Overfitting", definition: "When a machine learning model learns the training data too well — including its noise and quirks — and performs poorly on new, unseen data. An overfitted model essentially memorizes instead of generalizing. Techniques like dropout, regularization, and larger datasets help prevent overfitting." },
  { term: "Prompt Engineering", definition: "The practice of crafting effective instructions (prompts) to get the best possible output from an AI model. Good prompt engineering involves clear task descriptions, relevant context, output format specifications, and techniques like few-shot examples or chain-of-thought reasoning." },
  { term: "RAG (Retrieval-Augmented Generation)", definition: "A technique that enhances AI responses by first retrieving relevant documents from an external knowledge base, then feeding that context to the language model alongside the user's query. RAG reduces hallucinations and keeps answers grounded in up-to-date, verified information." },
  { term: "Reinforcement Learning", definition: "A machine learning paradigm where an agent learns to make decisions by receiving rewards or penalties for its actions within an environment. The agent optimizes its strategy to maximize cumulative reward over time. Reinforcement learning is used in game-playing AI, robotics, and recommendation systems." },
  { term: "RLHF (Reinforcement Learning from Human Feedback)", definition: "A training technique where human evaluators rank AI outputs by quality, and those rankings are used to train a reward model that guides further model optimization. RLHF is a key technique behind making language models more helpful, harmless, and aligned with user preferences." },
  { term: "Speech-to-Text (STT)", definition: "AI technology that converts spoken language into written text in real time or from recorded audio. Also called automatic speech recognition (ASR), it powers transcription services (Otter.ai, Descript), voice assistants, and accessibility features like live captions." },
  { term: "Stable Diffusion", definition: "An open-source diffusion model for generating images from text prompts, developed by Stability AI. Because it's open-source, Stable Diffusion can be run locally, fine-tuned with custom datasets (using LoRA or DreamBooth), and modified by the community — making it a foundation for many AI image tools." },
  { term: "Supervised Learning", definition: "A machine learning approach where the model is trained on labeled data — input-output pairs where the correct answer is provided. The model learns to map inputs to outputs and can then predict labels for new, unseen inputs. Image classification, spam detection, and language translation are common supervised learning tasks." },
  { term: "Synthetic Data", definition: "Artificially generated data that mimics the statistical properties of real-world data, used to train or augment AI models. Synthetic data is valuable when real data is scarce, expensive, or raises privacy concerns — for example, generating realistic medical images without using actual patient records." },
  { term: "Text-to-Speech (TTS)", definition: "AI technology that converts written text into natural-sounding spoken audio. Modern TTS systems like ElevenLabs, Murf AI, and OpenAI's voice models can clone voices, adjust tone and pacing, and produce speech nearly indistinguishable from human recordings." },
  { term: "Token", definition: "The basic unit of text that language models process — typically a word, part of a word, or punctuation mark. For example, the word \"understanding\" might be split into the tokens \"under\" and \"standing\". LLM pricing, context limits, and speed are all measured in tokens." },
  { term: "Tokenization", definition: "The process of splitting text into tokens before feeding it into a language model. Different models use different tokenization strategies — some split by words, others by subword units (byte-pair encoding). Tokenization affects model efficiency, multilingual performance, and context window utilization." },
  { term: "Transfer Learning", definition: "A technique where a model trained on one task is reused as the starting point for a different but related task. Instead of training from scratch, transfer learning leverages knowledge already learned — dramatically reducing the data and compute needed. Fine-tuning a foundation model is the most common form of transfer learning in AI." },
  { term: "Transformer", definition: "The neural network architecture behind virtually all modern language models, introduced in the 2017 paper \"Attention Is All You Need.\" Transformers use self-attention mechanisms to process entire sequences in parallel (rather than sequentially), enabling them to capture long-range dependencies and scale efficiently to billions of parameters." },
  { term: "Unsupervised Learning", definition: "A machine learning approach where the model learns patterns from data without labeled examples or explicit correct answers. The model discovers structure on its own — such as clusters, anomalies, or latent features. Common applications include customer segmentation, anomaly detection, and dimensionality reduction." },
  { term: "Vector Database", definition: "A specialized database optimized for storing and searching high-dimensional vector embeddings. Vector databases enable semantic search — finding results by meaning rather than exact keyword match. They are essential infrastructure for RAG pipelines, recommendation engines, and similarity search applications. Popular options include Pinecone, Weaviate, and Chroma." },
  { term: "Zero-Shot Learning", definition: "A technique where an AI model performs a task it was never explicitly trained on, using only a natural language instruction — no examples provided. For instance, asking a language model to classify sentiment or translate text without showing it any labeled examples first. Zero-shot capability is a hallmark of powerful foundation models." },
];

function groupByLetter(terms: GlossaryTerm[]): Record<string, GlossaryTerm[]> {
  const groups: Record<string, GlossaryTerm[]> = {};
  for (const t of terms) {
    const letter = t.term[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(t);
  }
  return groups;
}

export function GlossaryPage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return GLOSSARY_TERMS;
    const q = query.toLowerCase();
    return GLOSSARY_TERMS.filter(t =>
      t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => groupByLetter(filtered), [filtered]);
  const letters = Object.keys(grouped).sort();

  const definedTermSetSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "AI Glossary — Key Terms Explained (2026)",
    "description": "A comprehensive glossary of 49 commonly searched artificial intelligence terms with clear, beginner-friendly definitions.",
    "url": `${SITE_CONFIG.siteUrl}/glossary`,
    "hasDefinedTerm": GLOSSARY_TERMS.map(t => ({
      "@type": "DefinedTerm",
      "name": t.term,
      "description": t.definition,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_CONFIG.siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Glossary", "item": `${SITE_CONFIG.siteUrl}/glossary` },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.txt }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: C.mut, marginBottom: 24 }}>
          <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ color: C.a1, textDecoration: 'none', fontWeight: 500 }}>Home</a>
          <span style={{ margin: '0 8px', opacity: 0.5 }}>›</span>
          <span style={{ color: C.txt, fontWeight: 500 }}>Glossary</span>
        </nav>

        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(24px,5vw,36px)', color: C.txt, margin: '0 0 12px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            AI Glossary — Key Terms Explained (2026)
          </h1>
          <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.7, fontWeight: 300, maxWidth: 620, margin: 0 }}>
            Clear, jargon-free definitions for {GLOSSARY_TERMS.length} essential AI terms — from LLMs and prompt engineering to RLHF and vector databases. Bookmark this page as your quick reference while exploring AI tools.
          </p>
        </header>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.mut, pointerEvents: 'none' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search terms…"
            aria-label="Search glossary terms"
            style={{
              width: '100%', boxSizing: 'border-box' as const,
              padding: '12px 16px 12px 40px', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
              background: C.surf, color: C.txt, border: `1.5px solid ${C.barBrd}`,
              borderRadius: 12, outline: 'none',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = C.a1; }}
            onBlur={e => { e.currentTarget.style.borderColor = C.barBrd; }}
          />
        </div>

        {/* Letter quick-jump */}
        {!query.trim() && (
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 32 }}>
            {letters.map(l => (
              <a key={l} href={`#letter-${l}`} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: 8, fontSize: 13, fontWeight: 600,
                fontFamily: "'Syne', sans-serif", color: C.a1, background: C.a1card,
                border: `1px solid ${C.a1brd}`, textDecoration: 'none',
                transition: 'background .15s',
              }}>{l}</a>
            ))}
          </div>
        )}

        {/* No results */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: '40px 0', color: C.mut }}>
            <p style={{ fontSize: 15, margin: 0 }}>No terms match "<strong style={{ color: C.txt }}>{query}</strong>". Try a different search.</p>
          </div>
        )}

        {/* Glossary entries */}
        {letters.map(letter => (
          <section key={letter} id={`letter-${letter}`} style={{ marginBottom: 36 }}>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22,
              color: C.a1, marginBottom: 16, paddingBottom: 8,
              borderBottom: `2px solid ${C.a1brd}`, letterSpacing: '-0.02em',
            }}>{letter}</div>

            <dl style={{ margin: 0 }}>
              {grouped[letter].map(({ term, definition }) => (
                <article key={term} style={{
                  background: C.surf, borderRadius: 14,
                  border: `1px solid ${C.barBrd}`, padding: '20px 24px',
                  marginBottom: 10,
                }}>
                  <dt>
                    <h3 style={{
                      fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 16,
                      color: C.txt, margin: '0 0 8px', letterSpacing: '-0.015em',
                    }}>{term}</h3>
                  </dt>
                  <dd style={{ margin: 0 }}>
                    <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.7, fontWeight: 300, margin: 0 }}>{definition}</p>
                  </dd>
                </article>
              ))}
            </dl>
          </section>
        ))}

        {/* Footer */}
        <footer style={{
          marginTop: 48, paddingTop: 24,
          borderTop: `1px solid ${C.barBrd}`,
          textAlign: 'center' as const, fontSize: 13, color: C.mut,
        }}>
          <p style={{ margin: '0 0 8px' }}>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
          <p style={{ margin: 0 }}>
            This site uses affiliate links.{' '}
            <a href="/disclosure" onClick={e => { e.preventDefault(); navigate('/disclosure'); }}
              style={{ color: C.a1, textDecoration: 'none', fontWeight: 500 }}>Read our full affiliate disclosure →</a>
          </p>
        </footer>

      </div>
    </div>
  );
}
