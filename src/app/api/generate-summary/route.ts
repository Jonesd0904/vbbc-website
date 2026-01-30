import { NextRequest, NextResponse } from 'next/server'

// Bible book info for intelligent summary generation
const bibleBooks: Record<string, { testament: string; genre: string; themes: string[] }> = {
  'genesis': { testament: 'Old', genre: 'narrative', themes: ['creation', 'covenant', 'faith', 'beginnings'] },
  'exodus': { testament: 'Old', genre: 'narrative', themes: ['deliverance', 'law', 'worship', 'redemption'] },
  'leviticus': { testament: 'Old', genre: 'law', themes: ['holiness', 'sacrifice', 'atonement', 'worship'] },
  'numbers': { testament: 'Old', genre: 'narrative', themes: ['wilderness', 'faith', 'obedience', 'journey'] },
  'deuteronomy': { testament: 'Old', genre: 'law', themes: ['covenant', 'obedience', 'blessing', 'love'] },
  'joshua': { testament: 'Old', genre: 'narrative', themes: ['conquest', 'faith', 'promise', 'courage'] },
  'judges': { testament: 'Old', genre: 'narrative', themes: ['cycles', 'deliverance', 'faithfulness', 'sin'] },
  'ruth': { testament: 'Old', genre: 'narrative', themes: ['redemption', 'loyalty', 'providence', 'love'] },
  '1 samuel': { testament: 'Old', genre: 'narrative', themes: ['kingship', 'obedience', 'heart', 'faith'] },
  '2 samuel': { testament: 'Old', genre: 'narrative', themes: ['kingship', 'sin', 'grace', 'covenant'] },
  '1 kings': { testament: 'Old', genre: 'narrative', themes: ['wisdom', 'idolatry', 'faithfulness', 'judgment'] },
  '2 kings': { testament: 'Old', genre: 'narrative', themes: ['judgment', 'prophecy', 'faithfulness', 'exile'] },
  '1 chronicles': { testament: 'Old', genre: 'narrative', themes: ['worship', 'temple', 'faithfulness', 'lineage'] },
  '2 chronicles': { testament: 'Old', genre: 'narrative', themes: ['worship', 'revival', 'faithfulness', 'judgment'] },
  'ezra': { testament: 'Old', genre: 'narrative', themes: ['restoration', 'worship', 'obedience', 'return'] },
  'nehemiah': { testament: 'Old', genre: 'narrative', themes: ['rebuilding', 'prayer', 'leadership', 'restoration'] },
  'esther': { testament: 'Old', genre: 'narrative', themes: ['providence', 'courage', 'deliverance', 'faith'] },
  'job': { testament: 'Old', genre: 'wisdom', themes: ['suffering', 'faith', 'sovereignty', 'trust'] },
  'psalm': { testament: 'Old', genre: 'poetry', themes: ['worship', 'praise', 'trust', 'prayer'] },
  'psalms': { testament: 'Old', genre: 'poetry', themes: ['worship', 'praise', 'trust', 'prayer'] },
  'proverbs': { testament: 'Old', genre: 'wisdom', themes: ['wisdom', 'fear of God', 'righteousness', 'guidance'] },
  'ecclesiastes': { testament: 'Old', genre: 'wisdom', themes: ['meaning', 'vanity', 'wisdom', 'eternity'] },
  'song of solomon': { testament: 'Old', genre: 'poetry', themes: ['love', 'marriage', 'beauty', 'devotion'] },
  'isaiah': { testament: 'Old', genre: 'prophecy', themes: ['salvation', 'judgment', 'Messiah', 'hope'] },
  'jeremiah': { testament: 'Old', genre: 'prophecy', themes: ['judgment', 'repentance', 'covenant', 'hope'] },
  'lamentations': { testament: 'Old', genre: 'poetry', themes: ['sorrow', 'judgment', 'hope', 'faithfulness'] },
  'ezekiel': { testament: 'Old', genre: 'prophecy', themes: ['glory', 'judgment', 'restoration', 'holiness'] },
  'daniel': { testament: 'Old', genre: 'prophecy', themes: ['faithfulness', 'sovereignty', 'prophecy', 'courage'] },
  'hosea': { testament: 'Old', genre: 'prophecy', themes: ['love', 'faithfulness', 'repentance', 'restoration'] },
  'joel': { testament: 'Old', genre: 'prophecy', themes: ['judgment', 'repentance', 'Spirit', 'restoration'] },
  'amos': { testament: 'Old', genre: 'prophecy', themes: ['justice', 'judgment', 'righteousness', 'repentance'] },
  'obadiah': { testament: 'Old', genre: 'prophecy', themes: ['judgment', 'pride', 'deliverance', 'sovereignty'] },
  'jonah': { testament: 'Old', genre: 'narrative', themes: ['obedience', 'mercy', 'repentance', 'mission'] },
  'micah': { testament: 'Old', genre: 'prophecy', themes: ['justice', 'mercy', 'Messiah', 'restoration'] },
  'nahum': { testament: 'Old', genre: 'prophecy', themes: ['judgment', 'sovereignty', 'comfort', 'justice'] },
  'habakkuk': { testament: 'Old', genre: 'prophecy', themes: ['faith', 'justice', 'sovereignty', 'trust'] },
  'zephaniah': { testament: 'Old', genre: 'prophecy', themes: ['judgment', 'restoration', 'joy', 'salvation'] },
  'haggai': { testament: 'Old', genre: 'prophecy', themes: ['priorities', 'temple', 'obedience', 'blessing'] },
  'zechariah': { testament: 'Old', genre: 'prophecy', themes: ['Messiah', 'restoration', 'vision', 'hope'] },
  'malachi': { testament: 'Old', genre: 'prophecy', themes: ['faithfulness', 'worship', 'covenant', 'judgment'] },
  'matthew': { testament: 'New', genre: 'gospel', themes: ['kingdom', 'Messiah', 'discipleship', 'fulfillment'] },
  'mark': { testament: 'New', genre: 'gospel', themes: ['service', 'faith', 'discipleship', 'suffering'] },
  'luke': { testament: 'New', genre: 'gospel', themes: ['salvation', 'compassion', 'prayer', 'joy'] },
  'john': { testament: 'New', genre: 'gospel', themes: ['belief', 'eternal life', 'love', 'truth'] },
  'acts': { testament: 'New', genre: 'narrative', themes: ['Spirit', 'mission', 'church', 'witness'] },
  'romans': { testament: 'New', genre: 'epistle', themes: ['righteousness', 'grace', 'faith', 'salvation'] },
  '1 corinthians': { testament: 'New', genre: 'epistle', themes: ['unity', 'gifts', 'love', 'resurrection'] },
  '2 corinthians': { testament: 'New', genre: 'epistle', themes: ['comfort', 'ministry', 'giving', 'weakness'] },
  'galatians': { testament: 'New', genre: 'epistle', themes: ['freedom', 'grace', 'faith', 'Spirit'] },
  'ephesians': { testament: 'New', genre: 'epistle', themes: ['unity', 'grace', 'spiritual warfare', 'church'] },
  'philippians': { testament: 'New', genre: 'epistle', themes: ['joy', 'humility', 'contentment', 'perseverance'] },
  'colossians': { testament: 'New', genre: 'epistle', themes: ['supremacy of Christ', 'fullness', 'new life', 'wisdom'] },
  '1 thessalonians': { testament: 'New', genre: 'epistle', themes: ['return of Christ', 'faith', 'hope', 'holiness'] },
  '2 thessalonians': { testament: 'New', genre: 'epistle', themes: ['perseverance', 'judgment', 'work', 'hope'] },
  '1 timothy': { testament: 'New', genre: 'epistle', themes: ['leadership', 'sound doctrine', 'godliness', 'faith'] },
  '2 timothy': { testament: 'New', genre: 'epistle', themes: ['perseverance', 'Scripture', 'ministry', 'faithfulness'] },
  'titus': { testament: 'New', genre: 'epistle', themes: ['good works', 'sound doctrine', 'grace', 'godliness'] },
  'philemon': { testament: 'New', genre: 'epistle', themes: ['forgiveness', 'reconciliation', 'love', 'grace'] },
  'hebrews': { testament: 'New', genre: 'epistle', themes: ['supremacy of Christ', 'faith', 'perseverance', 'covenant'] },
  'james': { testament: 'New', genre: 'epistle', themes: ['faith and works', 'wisdom', 'trials', 'practical living'] },
  '1 peter': { testament: 'New', genre: 'epistle', themes: ['suffering', 'hope', 'holiness', 'submission'] },
  '2 peter': { testament: 'New', genre: 'epistle', themes: ['growth', 'false teachers', 'return of Christ', 'knowledge'] },
  '1 john': { testament: 'New', genre: 'epistle', themes: ['love', 'truth', 'fellowship', 'assurance'] },
  '2 john': { testament: 'New', genre: 'epistle', themes: ['truth', 'love', 'discernment', 'obedience'] },
  '3 john': { testament: 'New', genre: 'epistle', themes: ['hospitality', 'truth', 'example', 'support'] },
  'jude': { testament: 'New', genre: 'epistle', themes: ['contending for faith', 'false teachers', 'perseverance', 'mercy'] },
  'revelation': { testament: 'New', genre: 'prophecy', themes: ['victory', 'worship', 'judgment', 'eternal life'] },
}

// Series themes
const seriesThemes: Record<string, string[]> = {
  'Rock Solid': ['foundation', 'stability', 'trust in God', 'building on Christ'],
  'Galatians': ['freedom in Christ', 'grace vs law', 'walking in the Spirit', 'faith'],
  'Ephesians': ['spiritual blessings', 'unity in Christ', 'the church', 'spiritual warfare'],
  'Faith Building Series': ['growing in faith', 'trusting God', 'overcoming doubt', 'spiritual maturity'],
  'The Truth About Salvation': ['the gospel', 'grace', 'faith alone', 'eternal security'],
  'First Peter': ['suffering well', 'holy living', 'hope in trials', 'submission'],
  'Second Peter': ['spiritual growth', 'false teaching', 'Christ\'s return', 'knowledge of God'],
  'Acts of the Apostles': ['the Holy Spirit', 'the early church', 'missions', 'witness'],
  'The Gospel of John': ['believing in Jesus', 'eternal life', 'the deity of Christ', 'signs and miracles'],
  'End Times Prophecy': ['Christ\'s return', 'prophetic fulfillment', 'heaven', 'tribulation'],
  'How to Share Christ': ['evangelism', 'the gospel', 'witnessing', 'making disciples'],
  'The Life of Elijah': ['faith under pressure', 'standing for truth', 'God\'s provision', 'spiritual courage'],
  'Colossians': ['the supremacy of Christ', 'new life', 'putting off the old', 'wisdom'],
  'Philippians': ['joy in all circumstances', 'humility', 'pressing on', 'contentment'],
}

function parseScripture(scripture: string): { book: string; chapter?: string; verse?: string } | null {
  if (!scripture) return null
  
  // Clean and normalize
  const cleaned = scripture.toLowerCase().trim()
  
  // Try to match book name
  for (const bookName of Object.keys(bibleBooks)) {
    if (cleaned.includes(bookName)) {
      const match = cleaned.match(/(\d+)?:?(\d+)?-?(\d+)?$/)
      return {
        book: bookName,
        chapter: match?.[1],
        verse: match?.[2],
      }
    }
  }
  
  return null
}

function generateTheme(title: string, scripture: string | undefined, series: string | undefined): string {
  const parsed = scripture ? parseScripture(scripture) : null
  
  if (parsed && bibleBooks[parsed.book]) {
    const bookInfo = bibleBooks[parsed.book]
    const theme = bookInfo.themes[Math.floor(Math.random() * bookInfo.themes.length)]
    return `Exploring ${theme} through ${scripture}`
  }
  
  if (series && seriesThemes[series]) {
    const themes = seriesThemes[series]
    const theme = themes[Math.floor(Math.random() * themes.length)]
    return `Understanding ${theme} as part of the ${series} series`
  }
  
  // Generate from title
  const titleWords = title.toLowerCase()
  if (titleWords.includes('faith')) return 'Building a strong foundation of faith'
  if (titleWords.includes('love')) return 'Understanding God\'s love for us'
  if (titleWords.includes('hope')) return 'Finding hope in God\'s promises'
  if (titleWords.includes('grace')) return 'Living in the grace of God'
  if (titleWords.includes('prayer')) return 'Developing a powerful prayer life'
  if (titleWords.includes('victory')) return 'Walking in victory through Christ'
  
  return `Biblical insights from "${title}"`
}

function generateKeyPoints(title: string, scripture: string | undefined, series: string | undefined): string[] {
  const parsed = scripture ? parseScripture(scripture) : null
  const points: string[] = []
  
  if (parsed && bibleBooks[parsed.book]) {
    const bookInfo = bibleBooks[parsed.book]
    points.push(`Understanding the ${bookInfo.genre === 'gospel' ? 'Gospel' : bookInfo.testament + ' Testament'} context`)
    points.push(`Key themes: ${bookInfo.themes.slice(0, 2).join(' and ')}`)
  }
  
  if (series && seriesThemes[series]) {
    const themes = seriesThemes[series]
    points.push(`Continuing the ${series} series focus on ${themes[0]}`)
  }
  
  // Add general points
  points.push('Practical application for daily Christian living')
  points.push('Growing deeper in relationship with God')
  
  // Ensure we have at least 3 points
  while (points.length < 3) {
    const genericPoints = [
      'Understanding biblical truth',
      'Applying Scripture to our lives',
      'Walking in obedience to God',
      'Growing in spiritual maturity',
    ]
    points.push(genericPoints[points.length % genericPoints.length])
  }
  
  return points.slice(0, 4)
}

function generateDescription(
  title: string,
  speaker: string,
  scripture: string | undefined,
  series: string | undefined
): string {
  const parts: string[] = []
  
  if (series) {
    parts.push(`In this message from our ${series} series,`)
  } else {
    parts.push('In this message,')
  }
  
  parts.push(`${speaker} explores`)
  
  if (scripture) {
    parts.push(`${scripture},`)
  }
  
  parts.push(`sharing insights on "${title}".`)
  
  const parsed = scripture ? parseScripture(scripture) : null
  if (parsed && bibleBooks[parsed.book]) {
    const bookInfo = bibleBooks[parsed.book]
    parts.push(`Discover how themes of ${bookInfo.themes.slice(0, 2).join(' and ')} apply to your life today.`)
  } else {
    parts.push('This message provides biblical teaching and practical application for spiritual growth.')
  }
  
  return parts.join(' ')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, scripture, series, speaker } = body
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }
    
    // Generate AI-like summary
    const theme = generateTheme(title, scripture, series)
    const keyPoints = generateKeyPoints(title, scripture, series)
    const description = generateDescription(title, speaker || 'our pastor', scripture, series)
    
    return NextResponse.json({
      theme,
      keyPoints,
      description,
    })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
