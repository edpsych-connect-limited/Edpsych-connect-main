# EdPsych Connect World - Self-Service Guide

> **For Schools, Multi-Academy Trusts, and Local Authorities**

This guide walks you through everything you need to know to get started with EdPsych Connect World. Our platform is designed to be fully self-service - you can complete your entire setup without needing to contact support.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Registration & Account Setup](#registration--account-setup)
3. [Onboarding Wizard](#onboarding-wizard)
4. [Connecting Your Systems](#connecting-your-systems)
5. [User Management](#user-management)
6. [Role-Based Access](#role-based-access)
7. [Feature Overview by Role](#feature-overview-by-role)
8. [Troubleshooting](#troubleshooting)
9. [Getting Help](#getting-help)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- ✅ A modern web browser (Chrome, Firefox, Safari, or Edge)
- ✅ A valid email address for your organization
- ✅ Your organization's details (URN/DfE number for schools)
- ✅ Optional: API credentials for your MIS system (Wonde, SIMS, Arbor)

### Quick Start Steps

1. **Register** at [www.edpsychconnect.com/register](https://www.edpsychconnect.com/register)
2. **Verify** your email address
3. **Complete** the onboarding wizard
4. **Connect** your school systems (optional but recommended)
5. **Invite** your team members
6. **Start** using the platform!

---

## Registration & Account Setup

### For Schools

1. Navigate to **Register** > **School**
2. Enter your school's URN (Unique Reference Number)
3. We'll automatically populate your school's details from the DfE database
4. Choose your role (Headteacher, SENCO, Teacher, etc.)
5. Create your password (minimum 8 characters, must include a number and special character)
6. Verify your email

### For Multi-Academy Trusts (MATs)

1. Navigate to **Register** > **Organization**
2. Select "Multi-Academy Trust"
3. Enter your MAT's details and DfE group ID
4. The first registered user becomes the Trust Administrator
5. After setup, you can add schools under your trust umbrella

### For Local Authorities

1. Contact us via **partnerships@edpsychconnect.com** for LA licensing
2. We'll provision your LA account with:
   - Dedicated LA Administrator account
   - School linking capabilities
   - Cross-school reporting features
   - Educational Psychology service tools

---

## Onboarding Wizard

When you first log in, our 6-step onboarding wizard will guide you through setup:

### Step 1: Welcome
- Introduction to the platform
- Quick overview video (2 minutes)

### Step 2: Role Selection
- Choose your primary role
- This determines your default dashboard and feature access

### Step 3: Profile Setup
- Complete your professional profile
- Add qualifications and specializations
- Upload profile photo (optional)

### Step 4: Feature Tour
- Interactive walkthrough of key features
- Customized to your role

### Step 5: Quick Wins
- Set up your first case/student
- Create your first assessment
- See immediate value

### Step 6: Completion
- Access your personalized dashboard
- Get started with your workflow

**Tip:** You can skip the wizard and complete it later by clicking "Skip for now".

---

## Connecting Your Systems

EdPsych Connect integrates with major UK school management systems for seamless data sync.

### Supported Integrations

| System | Type | Data Synced |
|--------|------|-------------|
| **Wonde** | Universal API | Students, Staff, Timetables, Attendance |
| **SIMS** | Direct/Gateway | Students, Assessments, Behaviour |
| **Arbor** | Cloud API | Full MIS data, Behaviour, SEND |
| **CPOMS** | Safeguarding | Safeguarding alerts, Incidents |
| **Microsoft Entra ID** | SSO | User authentication, Group sync |

### Setting Up Wonde (Recommended)

Wonde provides the easiest integration route as it connects to most UK MIS systems.

1. Go to **Admin** > **Integrations**
2. Find **Wonde** and click **Connect**
3. Log in to your [Wonde Portal](https://portal.wonde.com)
4. Navigate to **API Settings**
5. Generate an API Token
6. Paste the token into EdPsych Connect
7. Authorize data access permissions
8. Click **Test Connection**

Once connected, your student data will sync automatically every night, with real-time updates available on demand.

### Setting Up SIMS Direct

For schools hosting SIMS on-premise:

1. Download the EdPsych Connector from **Admin** > **Integrations** > **SIMS**
2. Have your IT administrator install on your SIMS server
3. Note the Gateway URL generated during installation
4. Enter the Gateway URL in EdPsych Connect
5. Test the connection

### Microsoft SSO Setup

Enable Single Sign-On for your organization:

1. Go to **Admin** > **Integrations** > **Microsoft Entra ID**
2. You'll need:
   - Tenant ID (from Azure Portal)
   - Client ID (create an App Registration)
   - Client Secret
3. Enter these credentials
4. Map your Azure groups to EdPsych roles
5. Users can now log in with their Microsoft accounts

---

## User Management

### Adding Individual Users

1. Go to **Admin** > **Users** > **Invite**
2. Enter the user's email address
3. Select their role
4. Optional: Assign to specific classes/students
5. Click **Send Invitation**

The user will receive an email to complete their registration.

### Bulk User Import

For adding many users at once:

1. Go to **Admin** > **Users** > **Import**
2. Download the CSV template
3. Fill in user details (email, name, role)
4. Upload the completed CSV
5. Review the preview
6. Confirm import

### Managing User Permissions

Each role has default permissions, but you can customize:

1. Go to **Admin** > **Roles**
2. Select a role to modify
3. Toggle features on/off
4. Save changes

---

## Role-Based Access

### Available Roles

| Role | Description | Key Features |
|------|-------------|--------------|
| **Administrator** | Full system access | All features, user management, billing |
| **SENCO** | Special Educational Needs Coordinator | EHCP, Assessments, Interventions, Progress |
| **Teacher** | Classroom teacher | Teaching tools, Student cases, Basic assessments |
| **Teaching Assistant** | Classroom support | Student interaction, Progress notes |
| **Parent** | Parent/Guardian | Child progress view, Communication |
| **Student** | Learner | Personalized learning, Self-assessment |
| **Educational Psychologist** | EP professional | Full assessment suite, Report generation |
| **Researcher** | Research access | Analytics, Anonymized data |

### Requesting Role Changes

If you need a different role:

1. Contact your school Administrator
2. Or request via **Settings** > **Request Role Change**

---

## Feature Overview by Role

### For SENCOs

Your dashboard includes:
- **Cases**: Manage all SEND students
- **EHCP Tools**: Generate and track EHCPs
- **Assessments**: Conduct and review cognitive assessments
- **Interventions**: Track evidence-based interventions
- **Progress**: Monitor student progress over time
- **Reports**: Generate reports for LA submissions

### For Teachers

Your dashboard includes:
- **Classroom Cockpit**: Daily class management
- **Quick Assessments**: Rapid screening tools
- **Lesson Differentiation**: AI-powered lesson adaptation
- **Student Notes**: Add observations and notes
- **Communication**: Message parents and colleagues

### For Educational Psychologists

Your dashboard includes:
- **Full Assessment Suite**: ECCA framework and cognitive tools
- **Report Writer**: Generate comprehensive EP reports
- **Case Consultation**: Track consultations
- **Supervision Tools**: Trainee EP supervision features
- **Research Access**: Anonymized data analytics

### For Parents

Your dashboard includes:
- **Child Progress**: View your child's progress
- **Reports**: Access shared reports
- **Communication**: Message teachers
- **Resources**: Parenting guides and tips
- **Appointments**: Book and manage appointments

---

## Troubleshooting

### Login Issues

**Problem**: Can't log in
**Solutions**:
1. Check you're using the correct email
2. Try the "Forgot Password" link
3. Clear your browser cache
4. Try a different browser
5. Check if your account was deactivated

**Problem**: Two-Factor Authentication code not working
**Solutions**:
1. Check your phone's time is correct
2. Wait for the code to refresh
3. Use backup codes if available
4. Contact your Administrator for reset

### Data Sync Issues

**Problem**: Student data not appearing
**Solutions**:
1. Go to **Admin** > **Integrations**
2. Check connection status
3. Click **Sync Now** to force a refresh
4. Verify API credentials are still valid
5. Check MIS system is online

### Performance Issues

**Problem**: Pages loading slowly
**Solutions**:
1. Refresh the page
2. Clear browser cache
3. Check your internet connection
4. Try during off-peak hours
5. Disable browser extensions

---

## Getting Help

### Self-Service Resources

- **Help Center**: Click the ❓ icon anywhere in the app
- **Documentation**: [docs.edpsychconnect.com](https://docs.edpsychconnect.com)
- **Video Tutorials**: [youtube.com/@edpsychconnect](https://youtube.com/@edpsychconnect)
- **Community Forum**: [community.edpsychconnect.com](https://community.edpsychconnect.com)

### AI Chat Support

Our AI assistant is available 24/7:
- Click the 💬 chat icon in the bottom right
- Ask any question about the platform
- Get immediate answers and guidance

### Human Support

For complex issues:

| Channel | Response Time | Best For |
|---------|--------------|----------|
| Email: help@edpsychconnect.com | Within 24 hours | Non-urgent queries |
| Live Chat | Within 2 hours | Urgent issues (weekdays 9am-5pm) |
| Phone: 0800 XXX XXXX | Immediate | Critical issues only |

### Feature Requests

Have an idea to improve EdPsych Connect?
1. Go to **Settings** > **Feedback**
2. Select "Feature Request"
3. Describe your idea
4. Our product team reviews all submissions

---

## Appendix: Data Protection

### Your Data Rights

Under GDPR, you have the right to:
- Access your data
- Correct inaccurate data
- Delete your data
- Export your data
- Restrict processing

### Data Processing

- All data is processed in the UK
- We are fully GDPR compliant
- Student data is encrypted at rest and in transit
- We never sell or share data with third parties

### Security

- SOC 2 Type II certified
- Annual penetration testing
- 99.9% uptime SLA
- Daily encrypted backups

---

**Last Updated**: ${new Date().toLocaleDateString('en-GB')}

**Version**: 1.0

© ${new Date().getFullYear()} EdPsych Connect Limited. Company No: 14989115
