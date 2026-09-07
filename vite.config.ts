import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
}

type MiddlewareStack = {
  use: (
    route: string,
    handler: (
      request: IncomingMessage,
      response: ServerResponse,
      next: () => void,
    ) => void,
  ) => void
}

type OpenRouterError = {
  message?: string
  metadata?: {
    raw?: string
    provider_name?: string
  }
}

const careerContext = `
Roshan Karki is a Full Stack Software Engineer based in the United States with 13 years shipping software.
Current role: Full Stack Engineer at Insulet Corporation, building regulated MedTech software with React, TypeScript, Node.js, Python, Azure, Redis, PostgreSQL, ETL, Delta Lake, Databricks, Salesforce, and Okta integrations.
2024-2025: Full Stack Engineer at Satisfi Labs in Tampa, FL. Shipped conversational AI platform work with NestJS, reusable design systems, Redis queues, GCP, Kubernetes, AlloyDB, Pinecone, and RAG architecture.
2024: Full Stack Engineer at ClearDhan LLC in New Jersey. Engineered trading-platform systems with real-time market ingestion, AI/ML prediction workflows, Redis caching, GCP infrastructure, and LLM-enabled RAG patterns.
2020-2023: Full Stack Software Engineer at EKAA Inc in Toronto, Canada. Designed microservice architecture with Spring Boot, Node.js, Firebase, GraphQL, Stripe, Algolia, React, TypeScript, and Expo mobile experiences.
2013-2020: Founder and Product Builder for Birthday Forest, Blooms, and Goingto.do across Nepal, Singapore, and the USA. Built mobile apps, Spring and Node APIs, AWS deployments, CMS migrations, and marketplace workflows.
Featured project: PR Release Intelligence Platform, an agentic coding build for spotting risky pull requests, missing branch propagation, and Jira compliance issues before release. Built with GPT-5.5, Codex, React, TypeScript, Vite, and TypeScript analysis services.
Strengths: agentic AI systems, RAG, LLM-assisted workflows, vector databases, full-stack platforms, cloud-native delivery, data intelligence, ETL, analytics, compliance signals, and stakeholder-facing dashboards.
Selected stack: React, TypeScript, Node.js, NestJS, Spring Boot, Python, Azure, GCP, Redis, PostgreSQL, Databricks, Delta Lake, Pinecone, AlloyDB, GraphQL, and React Native.
Recognition: Winner of Pivot Nepal mobile app developers competition for Birthday Forest, supported by The World Bank competition. The Manthan Award special mention for using information technology for social impact.
Contact links: GitHub https://github.com/rosnk, LinkedIn https://www.linkedin.com/in/roshan-karki-32699973, email rosn_kark@outlook.com.
`.trim()

const readRequestBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return Buffer.concat(chunks).toString('utf8')
}

const sendJson = (
  response: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>,
) => {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

const getOpenRouterErrorMessage = (error?: OpenRouterError) => {
  if (!error) {
    return 'OpenRouter request failed.'
  }

  if (error.metadata?.raw) {
    try {
      const raw = JSON.parse(error.metadata.raw) as {
        error?: { message?: string; code?: string }
      }
      const rawMessage = raw.error?.message

      if (rawMessage) {
        return error.metadata.provider_name
          ? `${error.metadata.provider_name}: ${rawMessage}`
          : rawMessage
      }
    } catch {
      return error.message || 'OpenRouter request failed.'
    }
  }

  return error.message || 'OpenRouter request failed.'
}

const installOpenRouterChat = (middlewares: MiddlewareStack, apiKey: string) => {
  middlewares.use('/api/roshan-chat', async (request, response) => {
    if (request.method !== 'POST') {
      sendJson(response, 405, { error: 'Method not allowed' })
      return
    }

    if (!apiKey) {
      sendJson(response, 500, { error: 'OPENROUTER_API_KEY is missing.' })
      return
    }

    try {
      const body = JSON.parse(await readRequestBody(request)) as {
        messages?: ChatMessage[]
      }
      const messages = Array.isArray(body.messages)
        ? body.messages
            .filter(
              (message) =>
                (message.role === 'assistant' || message.role === 'user') &&
                typeof message.content === 'string',
            )
            .slice(-10)
        : []

      const openRouterResponse = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'Roshan Karki Portfolio',
          },
          body: JSON.stringify({
            model: 'minimax/minimax-m3',
            messages: [
              {
                role: 'system',
                content: `You are the digital version of Roshan Karki on his portfolio site. Answer in first person as Roshan, warmly and professionally. Use only the career context below. If asked about something not in the context, say what you know from the context and invite the visitor to contact Roshan for details.\n\n${careerContext}`,
              },
              ...messages,
            ],
            temperature: 0.45,
            max_tokens: 650,
          }),
        },
      )

      const data = (await openRouterResponse.json()) as {
        choices?: { message?: { content?: string } }[]
        error?: OpenRouterError
      }

      if (!openRouterResponse.ok) {
        sendJson(response, openRouterResponse.status, {
          error: getOpenRouterErrorMessage(data.error),
        })
        return
      }

      const reply = data.choices?.[0]?.message?.content?.trim()

      if (!reply) {
        sendJson(response, 502, { error: 'OpenRouter returned an empty reply.' })
        return
      }

      sendJson(response, 200, { reply })
    } catch (error) {
      sendJson(response, 500, {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to complete the chat request.',
      })
    }
  })
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.OPENROUTER_API_KEY || ''

  return {
    plugins: [
      react(),
      {
        name: 'roshan-openrouter-chat',
        configureServer(server) {
          installOpenRouterChat(server.middlewares, apiKey)
        },
        configurePreviewServer(server) {
          installOpenRouterChat(server.middlewares, apiKey)
        },
      },
    ],
  }
})
