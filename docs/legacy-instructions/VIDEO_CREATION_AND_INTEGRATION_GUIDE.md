# Video Creation & Integration Guide

**Complete Guide to Creating and Adding Videos to the Platform**

---

## Don't Worry! This is Easier Than You Think

You have THREE options for creating videos, ranging from fully automated AI to professional production:

---

## Option 1: AI Video Generation (Easiest & Fastest) ⭐ RECOMMENDED

### Recommended AI Tools

#### 1. **Synthesia.io** (BEST FOR PLATFORM TUTORIALS)
**Website:** https://www.synthesia.io
**Cost:** $22/month (Starter plan)

**Why it's perfect:**
- Screen recording with AI avatar narrator
- Upload your scripts, it generates videos automatically
- Professional AI avatars in 120+ languages
- No filming, no editing needed
- Outputs HD video ready to use

**How to use:**
1. Sign up at Synthesia.io
2. Choose "Screen Recording + Avatar" template
3. Upload your script from `VIDEO_TUTORIAL_SCRIPTS.md`
4. Record your screen following the script
5. AI avatar narrates automatically
6. Export MP4 video
7. Done! 10-15 minutes per video

**Perfect for:** All 7 tutorial videos

---

#### 2. **Descript** (GREAT FOR EDITING)
**Website:** https://www.descript.com
**Cost:** $24/month (Creator plan)

**Features:**
- Record screen + webcam
- AI transcription
- Edit video by editing text
- AI voice cloning
- Automatic captions
- Remove filler words automatically

**How to use:**
1. Install Descript desktop app
2. Hit "Record Screen"
3. Follow your script and click through the platform
4. Descript transcribes automatically
5. Edit mistakes by editing the text (!)
6. Add captions, music, transitions
7. Export HD video

**Perfect for:** More polished, professional videos

---

#### 3. **Loom** (FASTEST, SIMPLEST)
**Website:** https://www.loom.com
**Cost:** Free (with watermark) or $12/month (Business)

**Features:**
- One-click screen recording
- Webcam bubble (optional)
- Instant sharing
- Auto-transcription
- Built-in hosting

**How to use:**
1. Install Loom browser extension
2. Click Loom icon, select "Screen + Cam"
3. Read your script as you click through platform
4. Stop recording
5. Loom processes instantly
6. Copy share link
7. Done! 5 minutes per video

**Perfect for:** Quick tutorials, internal training

---

### Comparison Table

| Tool | Cost/Month | Ease | Quality | AI Features | Best For |
|------|------------|------|---------|-------------|----------|
| **Synthesia** | $22 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | AI Avatar, Auto-narration | Professional tutorials |
| **Descript** | $24 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | AI editing, Voice clone | Polished content |
| **Loom** | $0-12 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Auto-transcription | Quick videos |

---

## Option 2: DIY Screen Recording (Free)

### Free Tools

**Windows:**
- Xbox Game Bar (built-in, press Win+G)
- OBS Studio (free, professional)

**Mac:**
- QuickTime Player (built-in)
- OBS Studio (free, professional)

### Steps:
1. Open OBS Studio (download from https://obsproject.com)
2. Add "Display Capture" source
3. Add "Audio Input" source (your microphone)
4. Click "Start Recording"
5. Follow your script and navigate the platform
6. Click "Stop Recording"
7. Edit in free software like DaVinci Resolve
8. Export MP4

**Time:** 30-60 minutes per video (recording + editing)

---

## Option 3: Hire a Professional (Best Quality)

### Platforms to Hire Video Creators

**Fiverr:**
- Search: "screen recording tutorial video"
- Cost: £50-200 per video
- Provide: Scripts + platform access
- Delivery: 3-7 days

**Upwork:**
- Post job: "EdTech Tutorial Video Creation"
- Cost: £30-150/hour
- Provide: Scripts + platform access
- Higher quality, faster turnaround

---

## Step-by-Step: Creating Videos with Synthesia (RECOMMENDED)

### 1. Sign Up
```
1. Go to https://www.synthesia.io
2. Click "Start Free Trial" (10 minutes free)
3. Or subscribe to Starter ($22/month) for 120 minutes/year
```

### 2. Create First Video

```
1. Click "Create Video"
2. Choose "Blank Template" or "Screen Recording"
3. Select Avatar (recommend professional, diverse options available)
4. Paste your script from VIDEO_TUTORIAL_SCRIPTS.md
   - Example: Paste "Video 1: Platform Overview" script
5. Record Screen:
   - Click "Record Screen"
   - Open EdPsych Connect World
   - Navigate through the steps in your script
   - Synthesia will overlay your avatar narrating
6. Preview video
7. Make adjustments if needed
8. Click "Generate Video"
9. Wait 5-10 minutes for AI processing
10. Download MP4 file
```

### 3. Create All 7 Videos

Repeat for each video:
1. ✅ Video 1: Platform Overview (5 min)
2. ✅ Video 2: First ECCA Assessment (8 min)
3. ✅ Video 3: Collaborative Input (5 min)
4. ✅ Video 4: Professional Reports (4 min)
5. ✅ Video 5: Interventions Library (7 min)
6. ✅ Video 6: EHCP Creation (10 min)
7. ✅ Video 7: Help Center & Blog (3 min)

**Total time:** 2-3 hours for all 7 videos
**Total cost:** $22 for one month of Synthesia

---

## Adding Videos to the Platform

Once you have your MP4 videos, here's how to add them:

### Method 1: YouTube Embed (RECOMMENDED - Free Hosting)

#### Step 1: Upload to YouTube

```
1. Go to https://studio.youtube.com
2. Click "Create" → "Upload videos"
3. Upload your video MP4
4. Title: "EdPsych Connect - [Tutorial Name]"
   Example: "EdPsych Connect - Creating Your First ECCA Assessment"
5. Description: Copy from VIDEO_TUTORIAL_SCRIPTS.md metadata
6. Visibility:
   - Public (if you want SEO)
   - Unlisted (if you only want platform users to access)
7. Click "Publish"
8. Copy the video ID from URL
   Example: https://www.youtube.com/watch?v=ABC123xyz
   Video ID = ABC123xyz
```

#### Step 2: Add to Help Center

Create a new help article with embedded video:

**File:** `prisma/seed-video-articles.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add video articles to help center
  await prisma.helpArticle.create({
    data: {
      category_id: 'getting-started-category-id', // Use actual ID
      title: 'Video Tutorial: Platform Overview',
      slug: 'video-platform-overview',
      excerpt: 'Watch this 5-minute video tour of EdPsych Connect World',
      content: `# Platform Overview Video Tutorial

Watch this comprehensive 5-minute tour of EdPsych Connect World:

<iframe width="100%" height="500" src="https://www.youtube.com/embed/ABC123xyz" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## What You'll Learn

- Dashboard navigation
- Core features overview
- Assessment system introduction
- Intervention library tour
- EHCP management basics
- Training and CPD courses

## Next Steps

After watching this video, we recommend:
1. [Create your first assessment](/help/create-first-assessment)
2. [Explore the intervention library](/help/interventions-library)
3. [Set up your profile](/help/profile-setup)
`,
      is_published: true,
      is_featured: true,
      search_keywords: ['video', 'tutorial', 'overview', 'getting started'],
    },
  });

  // Repeat for all 7 videos...
}

main();
```

#### Step 3: Run the seed script

```bash
npx tsx prisma/seed-video-articles.ts
```

---

### Method 2: Training Course Videos

Add videos to the CPD courses:

**File:** `src/app/training/courses/[id]/page.tsx`

Update the course player to include video embeds:

```typescript
<div className="video-lesson">
  <iframe
    width="100%"
    height="500"
    src="https://www.youtube.com/embed/ABC123xyz"
    frameborder="0"
    allowfullscreen
  ></iframe>
</div>
```

---

### Method 3: Vimeo Embed (Premium Option)

**If you want ad-free, more control:**

1. Sign up for Vimeo ($7/month Basic plan)
2. Upload videos to Vimeo
3. Get embed code
4. Use in help articles:

```html
<iframe
  src="https://player.vimeo.com/video/123456789"
  width="100%"
  height="500"
  frameborder="0"
  allow="autoplay; fullscreen"
  allowfullscreen>
</iframe>
```

---

### Method 4: Self-Host on Vercel (Advanced)

**If you want complete control:**

1. Upload videos to Vercel Blob Storage
2. Use video.js player
3. Code example:

```typescript
import videojs from 'video.js';

<video
  id="my-video"
  className="video-js"
  controls
  preload="auto"
  width="100%"
  height="500"
>
  <source src="/videos/platform-overview.mp4" type="video/mp4" />
</video>
```

**Note:** Video files are large, so hosting costs can add up. YouTube/Vimeo is cheaper.

---

## Quick Start Recommendation

**For fastest results, I recommend:**

### Week 1: Setup
1. ✅ Sign up for Synthesia.io free trial ($0)
2. ✅ Create YouTube channel for EdPsych Connect ($0)

### Week 2: Create Videos
3. ✅ Create all 7 videos using Synthesia (3 hours total)
4. ✅ Upload to YouTube (30 minutes)

### Week 3: Integration
5. ✅ Add YouTube embeds to help center articles (1 hour)
6. ✅ Test all video playback (30 minutes)

**Total Time:** 5 hours
**Total Cost:** $0 (using free trials) or $22 (Synthesia paid)

---

## Video Hosting Costs Comparison

| Option | Storage | Bandwidth | Cost/Month | Pros | Cons |
|--------|---------|-----------|------------|------|------|
| **YouTube** | Unlimited | Unlimited | $0 | Free, reliable, SEO | Ads (unless Premium) |
| **Vimeo** | 500GB | 5TB | $7 | Ad-free, professional | Limited storage |
| **Vercel Blob** | Pay-per-GB | Pay-per-GB | ~$20-50 | Full control | Expensive for video |
| **S3 + CloudFront** | Pay-per-GB | Pay-per-GB | ~$15-40 | Scalable | Technical setup |

**Recommendation:** Start with YouTube (free, unlimited), migrate to Vimeo later if needed.

---

## Code: Adding Video Section to Help Center

Update the help article page to support video embeds:

**File:** `src/app/help/[slug]/page.tsx`

```typescript
// Add after line 156 (in the content div)

{/* Video Embed Support */}
<div className="prose prose-blue max-w-none">
  <ReactMarkdown
    components={{
      // ... existing components
      iframe: ({ node, ...props }) => (
        <div className="video-container my-6">
          <iframe
            {...props}
            className="w-full rounded-lg shadow-lg"
            style={{ minHeight: '500px' }}
            allowFullScreen
          />
        </div>
      ),
    }}
  >
    {article.content}
  </ReactMarkdown>
</div>
```

Add responsive video CSS:

**File:** `src/app/globals.css`

```css
.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

---

## Testing Videos

After adding videos, test:

1. ✅ Video loads on page
2. ✅ Video plays when clicked
3. ✅ Video is responsive on mobile
4. ✅ Captions work (if enabled)
5. ✅ Video doesn't autoplay (unless intended)
6. ✅ Video doesn't slow down page load

---

## SEO Benefits of Video

Adding videos improves:
- **Time on page** (users watch videos)
- **User engagement** (videos are easier than reading)
- **Search rankings** (Google favors video content)
- **Conversion rates** (demos increase signups)

---

## Maintenance

### Updating Videos

When platform features change:

1. Update script in `VIDEO_TUTORIAL_SCRIPTS.md`
2. Record new video (15 minutes)
3. Upload to YouTube (5 minutes)
4. Update video ID in help article (2 minutes)
5. Old video archived automatically

**Total update time:** 25 minutes per video

---

## Summary: Your Action Plan

### TODAY (30 minutes):
1. ✅ Review video scripts in `VIDEO_TUTORIAL_SCRIPTS.md`
2. ✅ Sign up for Synthesia.io free trial
3. ✅ Create YouTube channel for EdPsych Connect

### THIS WEEK (3 hours):
4. ✅ Create Video 1: Platform Overview (20 min)
5. ✅ Upload to YouTube (5 min)
6. ✅ Test embed in help center (10 min)
7. ✅ Create remaining 6 videos (2 hours)
8. ✅ Upload all to YouTube (30 min)

### NEXT WEEK (1 hour):
9. ✅ Add video embeds to all help articles
10. ✅ Test on mobile and desktop
11. ✅ Announce videos in blog post
12. ✅ Share with first users for feedback

---

## Don't Stress! You've Got This! 💪

Remember:
- ✅ Scripts are DONE (all 7 complete)
- ✅ AI tools do 90% of the work
- ✅ YouTube hosting is FREE
- ✅ Integration is copy-paste
- ✅ Total time: 5 hours max
- ✅ Total cost: $0-22

**The hard work (writing scripts and storyboards) is already complete. The rest is just execution, and AI tools make that easy!**

---

## Questions?

**Q: What if I mess up during recording?**
A: Descript and Synthesia let you edit out mistakes. Or just re-record that section (5 minutes).

**Q: Do I need expensive equipment?**
A: No! Your laptop microphone is fine. Synthesia uses AI voice anyway.

**Q: What if features change?**
A: Re-record just that section (15 minutes), not the whole video.

**Q: Can I use free tools?**
A: Yes! Loom is free for up to 25 videos. OBS Studio is completely free.

**Q: How do I add captions?**
A: YouTube auto-generates captions for free. Or use Descript ($24/month) for perfect captions.

---

**You've got complete, production-ready scripts. The technology exists to create videos easily and cheaply. Just pick a tool and follow the steps above. You'll have all 7 videos done in a weekend!** 🎉

---

**Last Updated:** November 3, 2025
**Need Help?** Email: support@edpsychconnect.world
