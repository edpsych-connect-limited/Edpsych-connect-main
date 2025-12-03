/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Video Generation Script for Missing Platform Videos
 * 
 * This script generates video scripts for HeyGen API or manual recording.
 * Each video follows the UK Educational Psychology Practitioner tone.
 * 
 * USAGE:
 * 1. Use these scripts directly with HeyGen API
 * 2. Or use for manual recording with avatar
 * 
 * AVATARS: Dr Sarah Chen (Lead), Marcus Thompson (Technical)
 */

export const MISSING_VIDEO_SCRIPTS = {
  // ============================================================================
  // RESEARCH ETHICS VIDEOS
  // ============================================================================
  'research-ethics-submission': {
    title: 'Research Ethics Submission Guide',
    duration: '4:30',
    avatar: 'dr-sarah-chen',
    script: `
Hello, I'm Dr Sarah Chen, and I'm delighted to guide you through the research ethics submission process on EdPsych Connect.

Our platform takes research ethics extremely seriously. As practitioners working with children and young people with special educational needs, we have a profound responsibility to ensure all research is conducted ethically and safely.

Let me walk you through the submission process:

Step one: Project Details. You'll need to provide your research title, objectives, and a clear timeline. Be specific about what you're investigating and why it matters for educational outcomes.

Step two: Methodology. Describe your research design, whether quantitative, qualitative, or mixed methods. Our platform supports various approaches, but we need to understand exactly how you'll collect and analyse data.

Step three: Participants. This is crucial. Specify age ranges, sample sizes, and how you'll recruit participants. Remember, research involving children under sixteen requires enhanced safeguarding protocols.

Step four: Data Protection. Explain how you'll store, process, and eventually dispose of data. Our platform provides UK GDPR-compliant infrastructure, but you must detail your specific data handling procedures.

Step five: Declaration. You'll confirm your understanding of ethical principles and commitment to participant welfare.

The review process typically takes five to ten working days. Our ethics committee includes educational psychologists, data protection specialists, and safeguarding leads.

Once approved, you'll receive a certificate valid for twelve months. Annual reviews ensure ongoing compliance.

Thank you for your commitment to ethical research. Together, we're building an evidence base that truly serves children and young people.
    `,
  },
  
  'research-data-governance': {
    title: 'Research Data Governance Framework',
    duration: '4:00',
    avatar: 'dr-sarah-chen',
    script: `
Welcome. I'm Dr Sarah Chen, and today we'll explore our Research Data Governance Framework.

Data governance isn't just about compliance—it's about respecting the trust families place in us when they share sensitive information about their children.

Our framework operates on five key principles:

First, Data Minimisation. Collect only what you genuinely need. Every data point should serve a specific research purpose.

Second, Purpose Limitation. Data collected for one research project cannot be repurposed without explicit consent. This protects participants from scope creep.

Third, Anonymisation and Pseudonymisation. We provide robust tools for removing identifying information whilst maintaining research utility. Our techniques meet Information Commissioner's Office standards.

Fourth, Secure Storage. All research data is encrypted at rest and in transit. Access is controlled through role-based permissions that you define.

Fifth, Retention and Disposal. Set clear timelines for data retention. Our platform can automatically flag data for secure deletion when your study concludes.

For longitudinal studies, we offer extended retention with annual consent verification. Participants can withdraw at any point, and their data will be removed within forty-eight hours.

Remember, our Data Protection Officer is available for consultation. We want your research to succeed whilst maintaining the highest ethical standards.

Good data governance leads to better science. Thank you.
    `,
  },
  
  // ============================================================================
  // MIS INTEGRATION VIDEOS
  // ============================================================================
  'mis-wonde-setup': {
    title: 'Wonde MIS Integration Setup',
    duration: '5:00',
    avatar: 'marcus-thompson',
    script: `
Hello, I'm Marcus, and I'll guide you through connecting your school's Management Information System via Wonde.

Wonde acts as a secure bridge between your MIS and EdPsych Connect. It's used by thousands of UK schools and fully complies with Department for Education data standards.

Let's get started:

First, navigate to Settings, then Integrations. Click "Connect MIS" and select Wonde from the provider list.

You'll need your Wonde API key. If your school is already registered with Wonde, your IT administrator can provide this. If not, registration takes about five minutes on the Wonde website.

Enter your API key and click "Verify Connection". Our system will authenticate and display your school name for confirmation.

Next, configure your sync options. You can choose to sync:
- Students and their demographic data
- Staff information including roles
- Class and group assignments
- SEND status and provision information

I recommend starting with student data only. You can enable additional syncs later once you're comfortable with the process.

Set your sync frequency—daily is typical, but some schools prefer real-time updates.

Click "Save Configuration" and then "Run Initial Sync". The first sync may take several minutes depending on your school size.

Once complete, you'll see your students appear in the platform, ready for assessment and intervention tracking.

If you encounter any issues, our technical support team is available during school hours. The most common issue is API key permissions—ensure your Wonde account has read access enabled.

That's it! You're now connected. Welcome to streamlined data management.
    `,
  },
  
  'mis-sims-integration': {
    title: 'SIMS Integration Guide',
    duration: '4:30',
    avatar: 'marcus-thompson',
    script: `
Hello, I'm Marcus. If your school uses Capita SIMS, this video will show you how to integrate it with EdPsych Connect.

SIMS is the UK's most widely used school management system, and we've built a robust integration that respects its data structure.

There are two ways to connect:

Option one: Via Wonde. If you're already using Wonde, or want the easiest setup, use our Wonde integration. It handles the SIMS connection automatically.

Option two: Direct SIMS Connect. For schools preferring direct integration, you'll need your SIMS online credentials and API access enabled by Capita.

Let me walk through the direct connection:

In Settings, Integrations, select "SIMS Direct" from the provider dropdown.

Enter your SIMS online URL—this typically looks like your school domain followed by "simsinternal".

Provide your service account credentials. Your IT team should create a dedicated account for integrations rather than using a personal login.

Click "Test Connection". If successful, you'll see a green tick and your school details.

Configure your data mapping. SIMS uses specific field names—our system automatically maps these, but you can customise if needed.

The most important mapping is SEND Status. Ensure your SIMS SEND codes align with our provision categories. We provide a mapping table in our documentation.

Enable two-way sync if you want assessment results to flow back into SIMS. This requires write permissions in your service account.

Finally, set your sync schedule and run the initial import.

Remember, SIMS data belongs to your school. We only access what you explicitly permit.

Questions? Our SIMS specialists can assist via the help desk.
    `,
  },
  
  'mis-arbor-integration': {
    title: 'Arbor MIS Integration',
    duration: '4:00',
    avatar: 'marcus-thompson',
    script: `
Hello, I'm Marcus. Let's connect your Arbor MIS to EdPsych Connect.

Arbor's modern API makes integration straightforward. Most schools complete setup in under ten minutes.

Start in Settings, Integrations, and select "Arbor" from the dropdown.

You'll need to generate an API token in Arbor. Here's how:

Log into Arbor, go to School Settings, then API Access. Click "Generate New Token". Give it a descriptive name like "EdPsych Connect Integration".

Set the permissions—you'll need read access to Students, Staff, and SEND data. If you want assessment data to sync back, enable write access to Custom Fields.

Copy the generated token immediately—it won't be shown again.

Back in EdPsych Connect, paste your API token and enter your school's Arbor URL.

Click "Verify". The system checks your credentials and confirms the connection.

Now configure your sync preferences:

Student Demographics—recommended for all schools.
SEND Register—essential for intervention tracking.
Attendance Data—useful for correlating support with attendance patterns.
Assessment Data—enables round-trip sync.

Arbor excels at custom fields. You can map our assessment scores and provision data directly into your Arbor student profiles.

Set your sync frequency. Arbor handles real-time syncs efficiently, so we recommend enabling automatic updates.

Run your initial sync and verify the data matches your expectations.

One tip: Arbor's academic year structure differs from SIMS. Ensure your year groups are correctly mapped in the configuration.

That's it—you're connected to Arbor. Enjoy the seamless data flow.
    `,
  },
  
  'mis-sync-troubleshooting': {
    title: 'MIS Sync Troubleshooting',
    duration: '5:30',
    avatar: 'marcus-thompson',
    script: `
Hello, I'm Marcus. Having issues with your MIS sync? Let's troubleshoot together.

Most sync problems fall into four categories: authentication, permissions, data mapping, and network issues.

Authentication Problems:

If you see "Invalid credentials" or "Token expired", your API key may have expired. Most keys last twelve months. Generate a new one in your MIS and update it in EdPsych Connect settings.

For SIMS, ensure your service account password hasn't been changed by IT policy.

Permission Errors:

"Access denied" usually means your API account lacks necessary permissions. In Wonde, check your app has "Read Students" enabled. In Arbor, verify your token includes the required scopes.

Remember, some sensitive data requires explicit approval from your Data Protection Officer.

Data Mapping Issues:

If students appear but data seems wrong, check your field mappings. Common issues include:
- Year group mismatches—UK years versus key stages
- SEND codes that don't translate—ensure your MIS codes match our categories
- Date formats—some systems use American date formats internally

Use our mapping preview tool to see how data will transform before syncing.

Network Problems:

Timeouts often indicate network restrictions. Your school firewall may block our API endpoints. Provide your IT team with our IP whitelist from the documentation.

If syncs start but fail partway, there may be a rate limit. Reduce sync frequency or enable batch mode.

Duplicate Records:

If you see duplicate students, check your unique identifier settings. We recommend using UPN as the primary key.

Still stuck? Our support team can access sync logs with your permission. We'll identify exactly where the process fails.

Thank you for your patience. Most issues resolve within one support ticket.
    `,
  },
};

// Helper function to generate HeyGen API payload
export function generateHeyGenPayload(videoKey: keyof typeof MISSING_VIDEO_SCRIPTS) {
  const video = MISSING_VIDEO_SCRIPTS[videoKey];
  return {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: video.avatar === 'dr-sarah-chen' ? 'avatar_sarah_professional' : 'avatar_marcus_technical',
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          input_text: video.script.trim(),
          voice_id: video.avatar === 'dr-sarah-chen' ? 'voice_uk_female_professional' : 'voice_uk_male_technical',
        },
        background: {
          type: 'color',
          value: '#1e293b', // Slate-800, matches platform theme
        },
      },
    ],
    dimension: {
      width: 1920,
      height: 1080,
    },
    aspect_ratio: '16:9',
    test: false,
  };
}

// Export all scripts for manual use
export default MISSING_VIDEO_SCRIPTS;
