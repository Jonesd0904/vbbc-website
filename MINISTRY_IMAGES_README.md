# Ministry Images & Carousel Feature

## Overview
The ministries section now supports:
1. **Main Ministry Image** - A single featured image for each ministry
2. **Image Carousel** - Optional multiple-image carousel that visitors can browse through

## How to Use

### Admin Dashboard Access
1. Go to `/admin` and log in with password: `vbbc2024`
2. Navigate to the **Ministries** tab in the sidebar

### Adding a Main Ministry Image
1. Click on any ministry card to expand it
2. Locate the **Ministry Image** section
3. Click **Upload Image** button
4. Select an image from your computer
5. Image uploads automatically to Supabase Storage
6. Recommended: Landscape images (16:9 ratio) work best

### Enabling the Carousel
1. In the expanded ministry card, find the **Image Carousel** section
2. Toggle the switch to **ON**
3. Once enabled, you can add multiple images:
   - Click **Add Carousel Image**
   - Select an image from your computer
   - Repeat to add more images
4. To remove a carousel image:
   - Hover over the image thumbnail
   - Click the red X button that appears

### Saving Changes
- Click the **Save Ministry** button at the bottom of each ministry card
- Individual saves allow you to work on multiple ministries without affecting others
- Changes are immediately saved to the database

## Display Behavior

### On the Ministries Page (`/ministries`):

**If Carousel is Enabled:**
- Shows a full-width image carousel at the top of the ministry card
- Visitors can navigate using arrow buttons or dots
- Smooth transitions between images

**If Only Main Image:**
- Displays the main image full-width at the top
- No carousel navigation

**If No Images:**
- Falls back to the traditional icon display
- Icon is shown in a navy circle with gold color

## Technical Details

### Database Schema
The `ministries` table now includes:
```sql
image_url TEXT              -- Main ministry image URL
carousel_enabled BOOLEAN    -- Toggle for carousel feature
carousel_images TEXT[]      -- Array of carousel image URLs
```

### Image Storage
- All images are stored in Supabase Storage bucket: `images`
- Naming convention: `ministry-{timestamp}.{ext}` for main images
- Naming convention: `ministry-carousel-{timestamp}.{ext}` for carousel images
- Supported formats: JPG, PNG, WEBP

### File Size
- Supabase Storage supports files up to 50MB
- Recommended image size: 1920x1080 pixels or smaller
- Images are automatically optimized by Next.js

## Migration Instructions

### To Apply Database Changes:
1. Open your Supabase project
2. Go to SQL Editor
3. Copy and paste the contents of `/supabase/migrations/add_ministry_images.sql`
4. Execute the query
5. Verify the new columns exist in the `ministries` table

### If You're Starting Fresh:
The new fields are already included in the default Ministry type, so new database setups will automatically have these columns.

## Troubleshooting

### Images Not Uploading
- Verify Supabase Storage bucket `images` exists
- Check bucket permissions are set to public
- Ensure you're logged into the admin dashboard

### Carousel Not Showing
- Make sure carousel_enabled is toggled ON
- Verify at least one carousel image has been added
- Check that images are accessible (public URLs)

### Images Not Displaying
- Verify image URLs are valid
- Check Supabase Storage bucket is public
- Ensure CORS is configured in Supabase

## Design Recommendations

### Image Specifications:
- **Main Image**: 1920x1080px (16:9 ratio)
- **Carousel Images**: Consistent size across all images
- **File Format**: JPEG for photos, PNG for graphics with transparency
- **File Size**: Under 2MB per image for optimal loading

### Content Guidelines:
- Use high-quality, relevant images
- Keep carousel to 3-5 images max for best UX
- Ensure images are church-appropriate
- Consider mobile display when selecting images

## Future Enhancements
Potential features to add:
- Image alt text for accessibility
- Drag-and-drop reordering of carousel images
- Automatic image optimization/compression
- Image cropping tool
- Bulk image upload
