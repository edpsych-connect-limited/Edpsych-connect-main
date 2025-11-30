# EdPsych Connect - Batch Video Generation Script
# Run in PowerShell: .\tools\generate-videos.ps1

$API_KEY = "sk_V2_hgu_kCXZPri8zVW_USKActgMJqFGEFzXfxRhYB1F5Jm9MqUz"
$API_URL = "https://api.heygen.com/v2/video/generate"

# Avatar and voice configuration
$avatar_id = "Adrian_public_3_20240312"
$voice_id = "aba5ce361bfa433480f4bf281cc4c4f9"

# Video scripts array
$videos = @(
    @{
        id = "ehcp-application-journey"
        title = "Your EHCP Application Journey"
        script = "Let's talk about something that can feel overwhelming: the EHCP application process. If you're watching this, chances are you're supporting a child who needs more help than a standard school can provide on its own. And that's okay. That's exactly what EHCPs are designed for. EHCP stands for Education, Health and Care Plan. Think of it as a comprehensive blueprint that brings together everything a child needs to thrive, whether that's specialist teaching, therapy support, or equipment. Here's the good news: this platform makes the process significantly less stressful. The journey starts with a request. Usually from the school's SENCO, sometimes from parents directly. You'll gather evidence of the support already tried, assessment results, and professional observations. Once submitted, the Local Authority has six weeks to decide whether to assess. If they agree, assessments begin. Educational psychologists, speech therapists, occupational therapists and others each contribute their expertise. Then comes the magic of our platform. Instead of chasing emails and manually combining reports, our system automatically organises every contribution into the correct EHCP sections. What used to take days now happens in minutes. The whole process has a 20-week statutory deadline, and we track every milestone so nothing falls through the cracks. Remember: an EHCP application isn't a criticism of a school. It's a recognition that a child deserves more support than standard funding allows. You're advocating for a child's future. Let's make this journey as smooth as possible."
    },
    @{
        id = "ehcp-evidence-gathering"
        title = "Gathering Strong EHCP Evidence"
        script = "The strength of an EHCP application lives and dies by its evidence. Let me show you how to build a compelling case. Think of evidence like a story you're telling about a child's needs. Each piece should answer a simple question: what has been tried, and why does this child need more? Start with the basics. Assessment results that quantify difficulties. Reading ages, cognitive profiles, standardised test scores. Numbers matter because they're objective. But numbers alone don't tell the whole story. You need observations. Detailed descriptions of how difficulties affect daily learning. Not just struggles with reading but loses place repeatedly, requires one-to-one support to complete a paragraph, shows visible frustration that leads to avoidance. Include the interventions already tried. What programmes were implemented? For how long? What were the outcomes? This demonstrates that the school has done everything within its power. Don't forget the child's voice and the family's perspective. What does the child find hardest? What do parents see at home? These human elements matter enormously. Our platform provides structured templates for each evidence type, ensuring you capture everything needed without missing crucial details. Pro tip: quality beats quantity. Ten pages of specific, dated observations outweigh fifty pages of vague generalities every time. Your evidence tells a child's story. Make it compelling."
    },
    @{
        id = "help-getting-started"
        title = "Getting Started with EdPsych Connect"
        script = "Welcome to EdPsych Connect World. Let me show you around so you can hit the ground running. After logging in, you'll land on your dashboard. Think of this as mission control. Everything important is here at a glance: your pending tasks, recent activity, and quick access to the tools you use most. On the left, you'll see the main navigation. The exact options depend on your role, but typically you'll find Assessments, Interventions, Students, Reports, Training, and Settings. Each section flows naturally into the next. The search bar at the top is incredibly powerful. Type anything: a student name, an assessment type, an intervention strategy. It searches across the entire platform and shows relevant results instantly. See those notification indicators? They're not spam. They're genuinely useful alerts: assessment deadlines, collaboration requests from colleagues, new resources matching your interests. Your profile, in the top right, is where you'll manage your settings, track your CPD progress, and customise your experience. Here's my best advice for getting started: don't try to learn everything at once. Pick one task you need to accomplish today. Maybe running an assessment, finding an intervention, or completing a training module. Do that one thing, and you'll naturally discover more. The platform is designed to be intuitive. If you ever get stuck, click the help icon in the corner. You'll find answers, tutorials, and a way to reach our support team. You're going to do great. Let's make some magic happen."
    },
    @{
        id = "help-first-assessment"
        title = "Running Your First Assessment"
        script = "Ready to run your first assessment? Let me walk you through it step by step. Start by navigating to Assessments in the main menu. You'll see a library of over fifty validated assessment tools covering everything from reading ability to emotional wellbeing. Choose the assessment that matches your need. Use the filters to narrow by category, age range, or time required. Each assessment card shows exactly what it measures and how long it takes. Before you begin, you'll need to link the assessment to a student. Search for their name or create a new student profile if they're not in the system yet. Now here's the clever part. You can administer the assessment in two ways. For younger children or those needing support, you run it directly, recording their responses as they go. For older students, you can assign it as a self-directed task they complete independently. As the assessment progresses, responses are saved automatically. If you need to pause and continue later, no problem. Everything's preserved. When complete, the platform generates instant analysis. Not just raw scores, but meaningful interpretation: percentile rankings, comparison to age norms, and automatically highlighted areas of concern. From there, one click takes you to matching interventions. The system knows what the results mean and suggests evidence-based strategies to address identified needs. That's the workflow: Assess, Understand, Act. You've got this."
    },
    @{
        id = "help-data-security"
        title = "How We Protect Your Data"
        script = "Let's talk about something crucial: how we protect the sensitive information you trust us with. Every piece of data, whether it's a student assessment, a report, or a message between colleagues, is encrypted. When it travels between your browser and our servers, it's encrypted using TLS 1.3, the highest standard available. When it's stored in our database, it's encrypted at rest using AES-256. For Local Authorities and large trusts, we offer something called Bring Your Own Database. This means your data never actually lives on our servers. It stays in your own infrastructure, under your complete control. We provide the tools; you keep the data. Access controls are granular. Teachers see only their students. SENCOs see their school. Local Authority staff see only their LA's data. Nobody can access information they're not authorised for. Every action is logged in an immutable audit trail. Who accessed what, when, and what they did. This isn't about surveillance. It's about accountability and being able to demonstrate compliance if ever questioned. We're fully GDPR compliant. Data processing agreements are available for every organisation. Subject access requests can be fulfilled with a few clicks. Our servers are in the UK, specifically AWS London region. Your data never leaves the country without explicit consent. Security isn't a feature we added. It's the foundation we built everything on. Your trust is the most valuable thing we have."
    },
    @{
        id = "la-dashboard-overview"
        title = "Your LA Dashboard Overview"
        script = "Welcome to your Local Authority EHCP Dashboard. Let me show you how to make the most of this powerful command centre. When you log in, you'll see the key metrics that matter most. Active applications currently in progress. Cases approaching their 20-week deadline, colour-coded by urgency: green means on track, amber means attention needed, red means immediate action required. Below the metrics, you'll find your assigned caseload. Each application shows the child's initials, current stage, days remaining, and any pending actions. Click any row to dive into the full application detail. The filters at the top let you slice the data however you need. View only urgent cases. View only cases awaiting specific professional input. View cases by allocated caseworker if you're a manager supervising the team. On the right side, you'll see the activity feed. Real-time updates showing what's happening across your caseload. A contribution just submitted. A deadline approaching. A case ready for panel review. The search function works across everything. Search by child reference, school name, caseworker, or status. Results appear instantly. At the bottom, compliance analytics show your LA's overall performance. 20-week completion rates, average processing times, bottleneck identification. The data you need for reporting to the DfE or senior leadership. This dashboard gives you visibility without overwhelm. Everything important, nothing superfluous. You've got complete control. Let's use it."
    },
    @{
        id = "parent-portal-welcome"
        title = "Welcome to the Parent Portal"
        script = "Hello, and welcome. If you're watching this, chances are your child's school or Local Authority has invited you to join EdPsych Connect. Let me show you what this means for you. This parent portal gives you visibility into your child's support journey. Not everything, the school and professionals still have their own spaces, but the information that matters to you as a parent. When you log in, you'll see your child's profile. Current support in place. Upcoming appointments or reviews. Documents that have been shared with you. It's all in one place, no more hunting through emails or paper folders. If your child is going through an EHCP assessment, you can track progress here. Where in the process are things? What's happening next? You'll see updates as they happen, not weeks after the fact. The portal is also where you contribute your voice. Your perspective on your child matters enormously. We provide structured ways for you to share your views, your child's views, and your aspirations for their future. Need to communicate with the school? Secure messaging keeps everything in context. Your messages become part of the record, ensuring nothing gets lost. You'll also find resources here. Guides explaining processes in plain English. Articles about supporting specific needs at home. Information designed for parents, not just professionals. This is about partnership. You know your child better than anyone. We help you participate fully in decisions about their education. Welcome aboard. Let's work together."
    },
    @{
        id = "compliance-data-protection"
        title = "Data Protection for Educators"
        script = "Data protection might not be the most exciting topic, but it's essential. Let me give you what you need to know without the jargon. The core principle is simple: only access and share information you genuinely need for your work. It's called data minimisation. If you don't need to know a student's home address to teach them maths, don't look it up. Consent matters. Before collecting sensitive information, there should be a clear reason and, usually, explicit consent from parents or the young person if they're old enough. The platform tracks consent automatically, so you can see what's been agreed. Keep information accurate. If you notice something's wrong, whether it's a misspelled name or outdated contact details, flag it for correction. Inaccurate data isn't just annoying. It can lead to real problems. Retention periods exist for a reason. We don't keep data forever. Different categories have different timescales. The platform handles this automatically, archiving and deleting according to policy. Subject access requests are a right. If a parent asks to see all the data held about their child, we must provide it. The platform makes this straightforward, generating comprehensive exports when needed. Security is everyone's responsibility. Use strong passwords. Don't share login credentials. Log out on shared computers. Report anything suspicious immediately. Here's the mindset shift: think of student data like you'd think of their physical safety. Protect it. Handle it carefully. Share it thoughtfully. Compliance isn't bureaucracy. It's care."
    }
)

Write-Host "🎬 EdPsych Connect - Batch Video Generation" -ForegroundColor Cyan
Write-Host "==========================================`n"
Write-Host "📊 Videos to generate: $($videos.Count)"

$results = @()

foreach ($video in $videos) {
    Write-Host "`n🎥 Generating: $($video.title)..." -ForegroundColor Yellow
    
    $payload = @{
        video_inputs = @(
            @{
                character = @{
                    type = "avatar"
                    avatar_id = $avatar_id
                    avatar_style = "normal"
                }
                voice = @{
                    type = "text"
                    input_text = $video.script
                    voice_id = $voice_id
                    speed = 1.0
                }
                background = @{
                    type = "color"
                    value = "#1e293b"
                }
            }
        )
        dimension = @{
            width = 1920
            height = 1080
        }
        aspect_ratio = "16:9"
        test = $false
        title = $video.title
        callback_url = "https://edpsychconnect.com/webhook"
    }
    
    $json = $payload | ConvertTo-Json -Depth 10 -Compress
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $json -Encoding UTF8
    
    try {
        $response = curl.exe -s -X POST $API_URL -H "X-Api-Key: $API_KEY" -H "Content-Type: application/json" -d "@$tempFile"
        $result = $response | ConvertFrom-Json
        
        if ($result.data.video_id) {
            Write-Host "   ✅ Success: $($result.data.video_id)" -ForegroundColor Green
            $results += @{
                id = $video.id
                title = $video.title
                video_id = $result.data.video_id
                status = "success"
            }
        } else {
            Write-Host "   ❌ Failed: $response" -ForegroundColor Red
            $results += @{
                id = $video.id
                title = $video.title
                error = $response
                status = "failed"
            }
        }
    } catch {
        Write-Host "   ❌ Error: $_" -ForegroundColor Red
        $results += @{
            id = $video.id
            title = $video.title
            error = $_.Exception.Message
            status = "failed"
        }
    }
    
    Remove-Item $tempFile -Force
    
    # Rate limiting - wait 5 seconds between requests
    Start-Sleep -Seconds 5
}

Write-Host "`n`n📊 SUMMARY" -ForegroundColor Cyan
Write-Host "=========="

$successful = $results | Where-Object { $_.status -eq "success" }
$failed = $results | Where-Object { $_.status -eq "failed" }

Write-Host "✅ Successful: $($successful.Count)" -ForegroundColor Green
Write-Host "❌ Failed: $($failed.Count)" -ForegroundColor Red

Write-Host "`n📋 Video IDs:" -ForegroundColor Yellow
foreach ($r in $successful) {
    Write-Host "   '$($r.id)': '$($r.video_id)',"
}

Write-Host "`n✨ Generation complete!" -ForegroundColor Green
