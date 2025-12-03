/**
 * Generate LA EHCP Portal Walkthrough Video via HeyGen API
 * 
 * Uses: UK accent (Oliver Bennett), professional avatar, enterprise quality
 */

const HEYGEN_API_KEY = 'Sk_V2_hgu_kCXZPri8zVW_USKActgMJqFGEFzXfxRhYB1F5Jm9MqUz';
const HEYGEN_API_URL = 'https://api.heygen.com/v2/video/generate';
const WEBHOOK_URL = 'https://edpsychconnect.com/webhook';

// UK Voice - Oliver Bennett (Male, UK accent)
const UK_VOICE_ID = 'aba5ce361bfa433480f4bf281cc4c4f9';

// Professional avatar - Adrian (business professional)
const AVATAR_ID = 'Adrian_public_3_20240312';

const narrationScript = `Every Local Authority in England faces the same challenge: coordinating EHCP assessments within the statutory 20-week timeline while ensuring every child receives the comprehensive support they need.

Currently, this means juggling emails, chasing reports, manually collating contributions from educational psychologists, speech therapists, occupational therapists, and schools—all while the clock is ticking.

EdPsych Connect's LA EHCP Support Portal changes everything.

The EHCP assessment process involves coordination across multiple agencies and professionals. A single assessment might require contributions from the child's school and SENCO, an Educational Psychologist, a Speech and Language Therapist, an Occupational Therapist, health professionals, and social care representatives.

Each professional works independently, often using different formats and timescales. The LA caseworker must chase each contribution, ensure completeness, and then manually merge everything into a coherent EHCP—all while tracking statutory deadlines.

Miss a deadline, and the LA faces tribunal challenges. Rush the process, and children don't get the support they need.

The EdPsych Connect LA EHCP Support Portal brings every element of the assessment process into one unified platform.

From the moment a school submits an EHCP request, through professional assessments, to final plan generation—everything is tracked, coordinated, and visible in real-time.

Let me show you how it works.

Your dashboard shows every active application at a glance. Applications approaching their 20-week deadline are automatically flagged—amber for warning, red for urgent. No more spreadsheet tracking. No more missed deadlines.

The process begins when a school's SENCO decides to request an EHCP assessment. Rather than filling out paper forms or sending emails, they use our streamlined submission interface.

The SENCO enters the child's details, uploads supporting evidence—previous assessments, school reports, examples of work—and provides their professional observations.

The moment they click submit, the application enters your system with all information properly structured and the 20-week clock begins.

As applications arrive, caseworkers are assigned either manually or through your existing allocation process. Each caseworker sees only their assigned cases, with clear priority ordering.

The application detail view shows everything in one place: child information, school details, all uploaded documents, and a complete timeline of every action taken.

Every status change is logged automatically, creating an audit trail that satisfies both internal governance and potential tribunal requirements.

Here's where the magic happens. When you request professional advice, each professional receives a secure link to their contribution portal.

Whether it's an Educational Psychologist, Speech Therapist, or Occupational Therapist—they see only what they need: the child's details, the assessment request, and a structured template for their contribution.

Professionals can work at their own pace, saving drafts and returning later. When they submit, their contribution immediately appears in your caseworker view—no chasing, no emails, no delays.

This is the feature LA teams tell us saves them the most time: the intelligent EHCP Merge Tool.

Once all professional contributions are received, click Generate Draft and watch as every piece of advice is automatically organised into the correct EHCP sections.

Section A: Child and family views—populated from school submission and any direct family contributions.

Section B: Special educational needs—intelligently merged from all professional assessments, highlighting areas of agreement and flagging any discrepancies for your review.

Section F: Special educational provision—recommendations from each professional, organised and cross-referenced.

The tool doesn't replace professional judgement—it organises and presents information so caseworkers can focus on quality assurance rather than copy-paste.

Now, let's address what we know is your primary concern: data governance.

EdPsych Connect operates on a Bring Your Own Data principle. This means your children's data—their names, their needs, their assessments—never leaves your control.

Here's how it works.

Option 1: Self-Hosted. Deploy EdPsych Connect within your own infrastructure. Your data stays on your servers, managed by your IT team, subject only to your policies.

Option 2: Dedicated Cloud. We provision a completely isolated environment for your LA. Your data is encrypted, separated from all other authorities, and you retain full export rights at any time.

Option 3: Hybrid. Keep sensitive data on-premise while using our cloud for processing. You define exactly what crosses the boundary.

Unlike other platforms that hold your data hostage, we believe your data belongs to you. Export everything at any time. Leave whenever you want. No penalties, no restrictions.

Your IT team maintains full visibility and control. We provide the tools; you own the data.

For SEND Service Managers and Directors, the platform provides real-time compliance analytics.

Track your 20-week compliance rate, identify bottlenecks in the process, and generate reports for DfE returns—all automatically calculated from the system data.

The EHCP process exists for one reason: to ensure children with special educational needs get the support they deserve.

EdPsych Connect's LA EHCP Support Portal removes the administrative burden so your team can focus on what matters—quality decisions that change children's lives.

20 weeks. Multiple professionals. One platform. Complete control.

EdPsych Connect. Assessment Redefined.`;

async function generateVideo() {
  console.log('🎬 Generating LA EHCP Portal Walkthrough Video via HeyGen API...\n');
  
  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: AVATAR_ID,
          avatar_style: 'normal'
        },
        voice: {
          type: 'text',
          input_text: narrationScript,
          voice_id: UK_VOICE_ID,
          speed: 1.0  // Normal pacing as requested
        },
        background: {
          type: 'color',
          value: '#1e293b'  // Professional dark blue background
        }
      }
    ],
    dimension: {
      width: 1920,
      height: 1080
    },
    aspect_ratio: '16:9',
    test: false,  // Production quality
    callback_url: WEBHOOK_URL
  };

  try {
    const response = await fetch(HEYGEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': HEYGEN_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok && result.data?.video_id) {
      console.log('✅ Video generation initiated successfully!\n');
      console.log('📋 Video ID:', result.data.video_id);
      console.log('🔗 Webhook URL:', WEBHOOK_URL);
      console.log('\n📝 Details:');
      console.log('   - Avatar: Adrian (Professional Male)');
      console.log('   - Voice: Oliver Bennett (UK Male)');
      console.log('   - Resolution: 1920x1080 (16:9)');
      console.log('   - Pacing: Normal (1.0x)');
      console.log('   - Script Length:', narrationScript.split(' ').length, 'words');
      console.log('   - Estimated Duration: ~8-10 minutes');
      console.log('\n⏳ Video is being processed. You will receive a webhook notification');
      console.log('   when the video is ready for download/embedding.');
      console.log('\n💡 To check status, visit: https://app.heygen.com/videos');
      
      // Return the video ID for tracking
      return {
        success: true,
        videoId: result.data.video_id,
        timestamp: new Date().toISOString()
      };
    } else {
      console.error('❌ Error response from HeyGen:', result);
      return {
        success: false,
        error: result
      };
    }
  } catch (error) {
    console.error('❌ Failed to call HeyGen API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Run the generation
generateVideo().then(result => {
  console.log('\n📦 Result:', JSON.stringify(result, null, 2));
}).catch(console.error);
