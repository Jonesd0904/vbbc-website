import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let title = ''
  let speaker = ''
  let scripture: string | undefined
  let series: string | undefined
  let notes: string | undefined
  
  try {
    const body = await request.json()
    title = body.title
    speaker = body.speaker
    scripture = body.scripture
    series = body.series
    notes = body.notes
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Check if Anthropic API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY not configured, using fallback summaries')
      return NextResponse.json(generateFallbackSummary(title, speaker, scripture, series, notes))
    }
    
    // Generate AI summary using Claude
    const prompt = buildPrompt(title, speaker, scripture, series, notes)
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text
    
    // Parse the structured response
    const parsed = parseAIResponse(content)
    
    return NextResponse.json({
      theme: parsed.theme,
      description: parsed.description,
      keyPoints: parsed.keyPoints || []
    })
    
  } catch (error) {
    console.error('Error generating AI summary:', error)
    
    // Fallback to basic summary on error
    const fallback = generateFallbackSummary(
      title, 
      speaker, 
      scripture, 
      series,
      notes
    )
    
    return NextResponse.json(fallback)
  }
}

function buildPrompt(title: string, speaker: string, scripture?: string, series?: string, notes?: string): string {
  let prompt = `You are a Baptist church content writer creating sermon summaries for Victory Bible Baptist Church's website.

Generate a formal, theologically sound summary for this sermon:

Title: ${title}
Speaker: ${speaker || 'our pastor'}
${scripture ? `Scripture: ${scripture}` : ''}
${series ? `Sermon Series: ${series}` : ''}`

  // Add notes if provided
  if (notes && notes.trim()) {
    prompt += `

Sermon Notes/Outline:
${notes.trim()}`
  }

  prompt += `

Provide the following in this exact format:

THEME: [One concise sentence describing the main theological theme or message]

DESCRIPTION: [2-3 formal, engaging sentences for the church website. Use traditional church language like "expository message," "examines," "explores," "reveals," "demonstrates." Focus on what biblical truth is being taught and how it applies to Christian living.]

KEY_POINTS:
- [First key biblical principle or takeaway]
- [Second key biblical principle or takeaway]
- [Third key biblical principle or takeaway]

Guidelines:
- Use formal, traditional Baptist theological language
- Focus on biblical exposition and application
- Be specific to the scripture if provided
${notes ? '- Base your summary on the sermon notes/outline provided above' : ''}
- Keep theme to ONE sentence (under 100 characters)
- Make description compelling yet reverent (2-3 sentences)
- Ensure key points are substantive theological insights, not generic statements
- Reference the scripture passage specifically when describing the message`

  return prompt
}

function parseAIResponse(content: string): { theme: string; description: string; keyPoints: string[] } {
  // Extract theme
  const themeMatch = content.match(/THEME:\s*(.+?)(?=\n|DESCRIPTION:|$)/s)
  const theme = themeMatch 
    ? themeMatch[1].trim().replace(/^["']|["']$/g, '') 
    : 'Biblical insights from God\'s Word'

  // Extract description
  const descMatch = content.match(/DESCRIPTION:\s*(.+?)(?=\n\n|KEY_POINTS:|$)/s)
  const description = descMatch 
    ? descMatch[1].trim().replace(/^["']|["']$/g, '').replace(/\n/g, ' ')
    : 'An expository message examining Scripture and its application to Christian living.'

  // Extract key points
  const keyPointsMatch = content.match(/KEY_POINTS:\s*(.+?)$/s)
  const keyPoints = keyPointsMatch
    ? keyPointsMatch[1]
        .split('\n')
        .map(p => p.replace(/^[-•*]\s*/, '').trim())
        .filter(p => p.length > 10)
        .slice(0, 4)
    : []

  return { theme, description, keyPoints }
}

function generateFallbackSummary(
  title: string, 
  speaker: string, 
  scripture?: string, 
  series?: string,
  notes?: string
): { theme: string; description: string; keyPoints: string[] } {
  // Basic fallback when API is unavailable
  const theme = scripture 
    ? `Exploring biblical truth through ${scripture}`
    : `Biblical insights from "${title}"`
  
  const description = scripture
    ? `In this expository message${series ? ` from the ${series} series` : ''}, ${speaker || 'our pastor'} examines ${scripture}, providing theological depth and practical application for Christian living.`
    : `${speaker || 'Our pastor'} presents "${title}"${series ? ` as part of the ${series} series` : ''}, offering biblical teaching and practical wisdom for spiritual growth.`

  const keyPoints = [
    'Understanding the biblical context and original meaning',
    'Theological insights for spiritual growth',
    'Practical application for daily Christian living'
  ]

  return { theme, description, keyPoints }
}
