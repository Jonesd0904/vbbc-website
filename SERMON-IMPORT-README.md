# VBBC Sermon Import System

## Overview

The sermon import system allows you to bulk add sermons to your website with AI-powered summary generation and sermon series management.

## Features

- **Bulk Sermon Import**: Add multiple sermons at once with all metadata
- **AI Summary Generation**: Auto-generate themes, key points, and descriptions based on sermon title and scripture
- **Sermon Series Management**: Organize sermons into series with custom images (matching the original VBBC website)
- **Series Images**: Each series can have a custom cover image that displays on the sermons page

## Setup Instructions

### 1. Run the Database Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/vjgxldrlflqqeztbbniw
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-sermon-series-schema.sql`
4. Click **Run**

This will create:
- `sermon_series` table with all 14 series from the original VBBC website
- Proper indexes and security policies

### 2. Create Storage Bucket for Audio (Optional)

If you want to upload sermon audio files:

1. Go to **Storage** in your Supabase dashboard
2. Click **New Bucket**
3. Name it `audio`
4. Make sure **Public bucket** is enabled
5. Click **Create bucket**

### 3. Upload Series Images

Series images should be uploaded to the `images` bucket in Supabase Storage, or placed in:
```
public/images/series/
```

Recommended image naming convention:
- `rock-solid.jpg`
- `galatians.jpg`
- `ephesians.jpg`
- `faith-building.jpg`
- `salvation.jpg`
- `first-peter.jpg`
- `second-peter.jpg`
- `acts.jpg`
- `gospel-of-john.jpg`
- `end-times.jpg`
- `share-christ.jpg`
- `elijah.jpg`
- `colossians.jpg`
- `philippians.jpg`
- `standalone.jpg`

**Recommended image size**: 800x450px (16:9 aspect ratio)

## How to Use

### Accessing the Sermon Import Page

1. Go to `/admin` and log in with password: `vbbc2024`
2. Click the **Sermon Import** card on the sidebar
3. Or navigate directly to `/admin/sermons`

### Importing Sermons

1. Click **Add Sermon** to create a new sermon entry
2. Fill in the required fields:
   - **Sermon Title** (required)
   - **Speaker** (required) - Select from dropdown
   - **Date** (required)
3. Optional fields:
   - **Series** - Select a sermon series
   - **Scripture Reference** - e.g., "John 3:16"
   - **YouTube URL** - For video playback
   - **Description** - Brief summary

### Using AI Summary

1. Fill in the title, scripture, and series fields
2. Click the **AI Summary** button
3. The system will generate:
   - A theme based on the scripture and series
   - Key points for the message
   - A description suitable for the website

### Managing Series

1. Go to the **Manage Series** tab
2. Edit series names, descriptions, and scripture references
3. Click on the image to upload a new series image

### Viewing All Sermons

1. Go to the **All Sermons** tab
2. View all sermons in the database
3. Sermons are listed with title, speaker, date, series, and scripture

## Sermon Series (from Original Website)

| Series | Scripture | Description |
|--------|-----------|-------------|
| Rock Solid | Deuteronomy 32:31 | Building your life on the solid foundation |
| Galatians | Galatians | Freedom in Christ |
| Ephesians | Ephesians | Riches of God's grace |
| Faith Building Series | - | Strengthening your faith |
| The Truth About Salvation | - | Understanding the gospel |
| First Peter | 1 Peter | Hope in trials |
| Second Peter | 2 Peter | Growing in grace |
| Acts of the Apostles | Acts | The early church |
| The Gospel of John | John | That ye might believe |
| End Times Prophecy | - | Bible prophecy |
| How to Share Christ | - | Effective evangelism |
| The Life of Elijah | 1 Kings 17-19 | Lessons from Elijah |
| Colossians | Colossians | Christ the preeminent one |
| Philippians | Philippians | Joy in the Lord |
| Stand-Alone Messages | - | Individual messages |

## Troubleshooting

### "Supabase not connected" warning

Make sure your `.env.local` file has the correct Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://vjgxldrlflqqeztbbniw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Images not loading

1. Check that the images bucket is public in Supabase Storage
2. Verify the image URL is correct
3. For local images, ensure they're in `public/images/series/`

### AI Summary not working

The AI summary uses a fallback algorithm based on scripture and series. For more advanced AI features, you can integrate the Claude API by adding your API key to `.env.local`:
```
ANTHROPIC_API_KEY=your-api-key
```

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── sermons/
│   │       └── page.tsx      # Sermon import page
│   ├── api/
│   │   └── generate-summary/
│   │       └── route.ts      # AI summary API
│   └── sermons/
│       └── page.tsx          # Public sermons page
└── lib/
    ├── sermons.ts            # Sermon/series functions
    └── supabase.ts           # Supabase client

public/
└── images/
    └── series/               # Series images

supabase-sermon-series-schema.sql  # Database schema
```

## Next Steps

1. Run the SQL schema in Supabase
2. Upload series images
3. Start importing sermons!
4. Consider adding audio file upload support
