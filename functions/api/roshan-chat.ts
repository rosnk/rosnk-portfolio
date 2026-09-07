/**
 * Cloudflare Pages Function for the "Digital Roshan" chat.
 *
 * File-based routing: this file is served at POST /api/roshan-chat.
 * It mirrors the Vite dev/preview middleware in `vite.config.ts`
 * (`installOpenRouterChat`) so the chat works on the deployed site.
 *
 * Keep `careerContext` below in sync with the copy in `vite.config.ts`
 * and the bio content in `src/App.tsx`.
 *
 * Requires the `OPENROUTER_API_KEY` environment variable, configured in the
 * Cloudflare Pages project settings (Settings -> Variables and Secrets).
 */

type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
}

type OpenRouterError = {
  message?: string
  metadata?: {
    raw?: string
    provider_name?: string
  }
}

type Env = {
  OPENROUTER_API_KEY?: string
}

type PagesContext = {
  request: Request
  env: Env
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

const jsonResponse = (statusCode: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  })

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

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  const apiKey = context.env.OPENROUTER_API_KEY || ''

  if (!apiKey) {
    return jsonResponse(500, { error: 'OPENROUTER_API_KEY is missing.' })
  }

  try {
    const body = (await context.request.json()) as {
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

    const origin = new URL(context.request.url).origin

    const openRouterResponse = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': origin,
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
      return jsonResponse(openRouterResponse.status, {
        error: getOpenRouterErrorMessage(data.error),
      })
    }

    const reply = data.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      return jsonResponse(502, { error: 'OpenRouter returned an empty reply.' })
    }

    return jsonResponse(200, { reply })
  } catch (error) {
    return jsonResponse(500, {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to complete the chat request.',
    })
  }
}

export const onRequest = async (): Promise<Response> =>
  jsonResponse(405, { error: 'Method not allowed' })
