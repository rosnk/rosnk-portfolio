import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  Bot,
  BrainCircuit,
  Building2,
  Cloud,
  Code2,
  DatabaseZap,
  LoaderCircle,
  Mail,
  Network,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import './App.css'

const journey = [
  {
    period: '2025 - Present',
    role: 'Full Stack Engineer',
    company: 'Insulet Corporation',
    location: 'United States',
    detail:
      'Building regulated MedTech software across React, TypeScript, Node.js, Python, Azure, Redis, PostgreSQL, ETL, Delta Lake, Databricks, Salesforce, and Okta integrations.',
  },
  {
    period: '2024 - 2025',
    role: 'Full Stack Engineer',
    company: 'Satisfi Labs',
    location: 'Tampa, FL',
    detail:
      'Shipped conversational AI platform work with NestJS, reusable design systems, Redis queues, GCP, Kubernetes, AlloyDB, Pinecone, and RAG architecture for contextual answers.',
  },
  {
    period: '2024',
    role: 'Full Stack Engineer',
    company: 'ClearDhan LLC',
    location: 'New Jersey',
    detail:
      'Engineered trading-platform systems with real-time market ingestion, AI/ML prediction workflows, Redis caching, GCP infrastructure, and LLM-enabled RAG patterns.',
  },
  {
    period: '2020 - 2023',
    role: 'Full Stack Software Engineer',
    company: 'EKAA Inc',
    location: 'Toronto, Canada',
    detail:
      'Designed microservice architecture with Spring Boot, Node.js, Firebase, GraphQL, Stripe, Algolia, React, TypeScript, and Expo mobile experiences.',
  },
  {
    period: '2013 - 2020',
    role: 'Founder and Product Builder',
    company: 'Birthday Forest, Blooms, Goingto.do',
    location: 'Nepal, Singapore, USA',
    detail:
      'Moved from senior frontend craft into full product ownership: mobile apps, Spring/Node APIs, AWS deployments, CMS migrations, marketplace workflows, and award-winning civic tech.',
  },
]

const capabilities = [
  {
    icon: BrainCircuit,
    title: 'Agentic AI systems',
    copy: 'RAG architecture, LLM-assisted workflows, vector databases, AI coding, and production dashboards that compress review cycles.',
  },
  {
    icon: Network,
    title: 'Full-stack platforms',
    copy: 'React, TypeScript, Node.js, NestJS, Spring Boot, GraphQL, REST, reusable component systems, and cross-platform React Native apps.',
  },
  {
    icon: Cloud,
    title: 'Cloud-native delivery',
    copy: 'Azure, GCP, Kubernetes, Cloudflare Pages, CI/CD, serverless functions, Redis, PostgreSQL, MySQL, MongoDB, AlloyDB, and AWS Aurora.',
  },
  {
    icon: DatabaseZap,
    title: 'Data and intelligence',
    copy: 'ETL, Delta Lake, Databricks, analytics utilities, compliance signals, automation, and stakeholder-facing insight surfaces.',
  },
]

const stack = [
  'React',
  'TypeScript',
  'Node.js',
  'NestJS',
  'Spring Boot',
  'Python',
  'Azure',
  'GCP',
  'Redis',
  'PostgreSQL',
  'Databricks',
  'Delta Lake',
  'Pinecone',
  'AlloyDB',
  'GraphQL',
  'React Native',
]

type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
}

const starterPrompts = [
  'What kind of engineering roles fit Roshan best?',
  'Tell me about Roshan’s AI and RAG experience.',
  'Summarize Roshan’s cloud and backend background.',
]

function App() {
  const initialMessages = useMemo<ChatMessage[]>(
    () => [
      {
        role: 'assistant',
        content:
          'Hi, I am the digital Roshan. Ask me about my career, projects, stack, or the kind of engineering problems I am best suited to solve.',
      },
    ],
    [],
  )
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [chatInput, setChatInput] = useState('')
  const [isChatting, setIsChatting] = useState(false)
  const [chatError, setChatError] = useState('')

  const askDigitalRoshan = async (question: string) => {
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || isChatting) {
      return
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: trimmedQuestion },
    ]

    setMessages(nextMessages)
    setChatInput('')
    setChatError('')
    setIsChatting(true)

    try {
      const response = await fetch('/api/roshan-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      })

      const data = (await response.json()) as { reply?: string; error?: string }

      const reply = data.reply

      if (!response.ok || !reply) {
        throw new Error(data.error || 'The chat service could not answer.')
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: reply },
      ])
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong while contacting OpenRouter.'
      setChatError(message)
      setMessages((currentMessages) => currentMessages.slice(0, -1))
      setChatInput(trimmedQuestion)
    } finally {
      setIsChatting(false)
    }
  }

  const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void askDigitalRoshan(chatInput)
  }

  return (
    <main>
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Roshan Karki home">
          <span>RK</span>
          <strong>Roshan Karki</strong>
        </a>
        <div className="nav-links">
          <a href="#chat">AI chat</a>
          <a href="#journey">Journey</a>
          <a href="#portfolio">Agentic portfolio</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className="hero-section" id="top">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <Sparkles size={16} />
              Full Stack Software Engineer
            </p>
            <div className="agentic-lockup">
              <span>AGENTIC AI ENGINEER</span>
            </div>
            <h1>
              Enterprise builder with an edge for intelligent, production-grade
              systems.
            </h1>
            <p className="hero-lede">
              I build modern web, cloud, data, and AI products across regulated
              healthcare, conversational AI, trading systems, marketplaces, and
              civic-impact startups. My work sits where polished user experience,
              distributed architecture, and practical automation meet.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#portfolio">
                View agentic work <ArrowUpRight size={18} />
              </a>
              <a
                className="secondary-action"
                href="https://github.com/rosnk"
                target="_blank"
                rel="noreferrer"
              >
                 <Code2 size={18} /> GitHub
              </a>
            </div>
          </div>

          <aside className="hero-panel" aria-label="Profile snapshot">
            <div className="portrait-shell">
              <img
                src="/assets/roshan-karki-original.jpg"
                alt="Roshan Karki"
                className="portrait"
              />
              <div className="portrait-meta">
                <span>United States</span>
                <strong>13 years shipping software</strong>
              </div>
            </div>
            <div className="signal-board">
              <div>
                <span>Current</span>
                <strong>Insulet Corporation</strong>
              </div>
              <div>
                <span>Focus</span>
                <strong>AI + cloud + full stack</strong>
              </div>
              <div>
                <span>Origin</span>
                <strong>Award-winning founder</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="section-kicker">
          <Code2 size={18} />
          About
        </div>
        <div className="about-layout">
          <h2>
            A senior engineer who can turn ambiguity into shipped systems.
          </h2>
          <p>
            My background spans full-stack product engineering, mobile
            development, microservices, data platforms, AI-enabled applications,
            and cloud operations. I have worked with startups and enterprise
            teams worldwide, often owning the path from requirement analysis and
            architecture to implementation, testing, deployment, documentation,
            and CI/CD.
          </p>
        </div>
      </section>

      <section className="section capabilities-section">
        <div className="capability-grid">
          {capabilities.map((item) => {
            const Icon = item.icon
            return (
              <article className="capability-card" key={item.title}>
                <Icon size={24} />
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="section portfolio-section" id="portfolio">
        <div className="section-kicker">
          <Rocket size={18} />
          Agentic Portfolio
        </div>
        <div className="project-showcase">
          <div className="project-copy">
            <p className="project-label">Featured build</p>
            <h2>PR Release Intelligence Platform</h2>
            <p>
              A release-team intelligence dashboard for spotting risky pull
              requests, missing branch propagation, and Jira compliance issues
              before a release goes out. Built with agentic coding in Codex
              using GPT-5.5, React, TypeScript, Vite, and TypeScript analysis
              services.
            </p>
            <div className="metric-row">
              <div>
                <strong>PR risk</strong>
                <span>Status, risk level, Jira validation</span>
              </div>
              <div>
                <strong>Propagation</strong>
                <span>Missing branch visibility</span>
              </div>
              <div>
                <strong>Release health</strong>
                <span>Executive-ready summary</span>
              </div>
            </div>
            <div className="project-actions">
              <a
                className="primary-action"
                href="https://2abc5845.pr-release-intelligence-platform.pages.dev/"
                target="_blank"
                rel="noreferrer"
              >
                Live demo <ArrowUpRight size={18} />
              </a>
              <a
                className="secondary-action"
                href="https://github.com/rosnk/pr-release-intelligence-platform"
                target="_blank"
                rel="noreferrer"
              >
                 <Code2 size={18} /> Repository
              </a>
            </div>
          </div>
          <div className="project-visual">
            <img
              src="/assets/release-intelligence-dashboard.png"
              alt="PR Release Intelligence Platform dashboard"
            />
          </div>
        </div>
      </section>

      <section className="section chat-section" id="chat">
        <div className="section-kicker">
          <Bot size={18} />
          Digital Roshan
        </div>
        <div className="chat-layout">
          <div className="chat-copy">
            <h2>Ask my AI double about my career.</h2>
            <p>
              This assistant answers from my public portfolio context: roles,
              projects, technical strengths, and the engineering environments
              where I do my best work.
            </p>
            <div className="starter-prompts" aria-label="Suggested questions">
              {starterPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => void askDigitalRoshan(prompt)}
                  disabled={isChatting}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="chat-panel" aria-label="Chat with digital Roshan">
            <div className="chat-thread">
              {messages.map((message, index) => {
                const isUser = message.role === 'user'
                const Icon = isUser ? UserRound : Bot

                return (
                  <article
                    className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}
                    key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
                  >
                    <span className="chat-avatar" aria-hidden="true">
                      <Icon size={17} />
                    </span>
                    <p>{message.content}</p>
                  </article>
                )
              })}
              {isChatting ? (
                <div className="chat-loading" aria-live="polite">
                  <LoaderCircle size={18} />
                  Thinking
                </div>
              ) : null}
            </div>

            {chatError ? <p className="chat-error">{chatError}</p> : null}

            <form className="chat-form" onSubmit={handleChatSubmit}>
              <label className="sr-only" htmlFor="career-chat-input">
                Ask about Roshan&apos;s career
              </label>
              <textarea
                id="career-chat-input"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about my career, stack, projects, or fit for a role..."
                rows={3}
                disabled={isChatting}
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={isChatting || !chatInput.trim()}
              >
                {isChatting ? (
                  <LoaderCircle className="chat-submit-loading" size={18} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="section journey-section" id="journey">
        <div className="section-kicker">
          <Building2 size={18} />
          Career Journey
        </div>
        <div className="journey-header">
          <h2>From civic-tech founder to enterprise AI platform engineer.</h2>
        </div>
        <div className="timeline">
          {journey.map((item) => (
            <article className="timeline-item" key={`${item.company}-${item.period}`}>
              <div className="timeline-date">{item.period}</div>
              <div className="timeline-body">
                <h3>{item.role}</h3>
                <p className="timeline-company">
                  {item.company} <span>{item.location}</span>
                </p>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section proof-section">
        <div className="proof-card">
          <BadgeCheck size={24} />
          <strong>Winner, Pivot Nepal mobile app developers competition</strong>
          <span>Birthday Forest, supported by The World Bank competition</span>
        </div>
        <div className="proof-card">
          <ShieldCheck size={24} />
          <strong>The Manthan Award, special mention</strong>
          <span>Recognized for using information technology for social impact</span>
        </div>
      </section>

      <section className="section stack-section">
        <div className="section-kicker">Selected Stack</div>
        <div className="stack-cloud">
          {stack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <footer className="footer" id="contact">
        <div>
          <p className="eyebrow">Available for high-trust engineering work</p>
          <h2>Let’s build systems that make teams sharper.</h2>
        </div>
        <div className="footer-actions">
          <a href="mailto:rosn_kark@outlook.com">
            <Mail size={18} /> Email
          </a>
          <a
            href="https://www.linkedin.com/in/roshan-karki-32699973"
            target="_blank"
            rel="noreferrer"
          >
             <Network size={18} /> LinkedIn
          </a>
          <a href="https://github.com/rosnk" target="_blank" rel="noreferrer">
             <Code2 size={18} /> GitHub
          </a>
        </div>
      </footer>

      <a
        className="chat-fab"
        href="#chat"
        aria-label="Go to the AI chat and ask Digital Roshan about my career"
      >
        <span className="chat-fab-badge" aria-hidden="true">
          <Bot size={20} />
          <span className="chat-fab-status" />
        </span>
        <span className="chat-fab-text">
          <strong>Ask Digital Roshan</strong>
          <small>Live AI chat</small>
        </span>
      </a>
    </main>
  )
}

export default App
