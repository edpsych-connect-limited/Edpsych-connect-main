# Manual Verification Checklist for Beta Launch

> **EdPsych Connect - Final Human Verification**  
> **Date:** November 2025  
> **Version:** 1.0.0

---

## Overview

This document contains all manual verification tasks that require human testing before beta launch. Each task has been categorised by priority and includes step-by-step instructions.

**Test Environment:** https://www.edpsychconnect.com  
**Test Accounts:** See [Test Credentials](#test-credentials) section

---

## Test Credentials

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | admin@edpsychconnect.com | *Contact Scott* | Full system access |
| Teacher | teacher@demo.com | Test123! | Standard teacher account |
| SENCO | senco@demo.com | Test123! | SENCO role access |
| EP | ep@demo.com | Test123! | Educational Psychologist |

---

## 🔴 CRITICAL - Must Pass Before Beta

### 1. Authentication Flow

**Test Login:**
- [ ] Visit `/en/login`
- [ ] Enter valid credentials
- [ ] Verify redirect to `/dashboard`
- [ ] Verify user name displays in header
- [ ] Verify session persists across page refresh

**Test Logout:**
- [ ] Click logout button
- [ ] Verify redirect to home page
- [ ] Verify cannot access protected routes without re-login

**Test Failed Login:**
- [ ] Enter invalid email
- [ ] Verify error message displays
- [ ] Enter valid email, wrong password
- [ ] Verify error message displays
- [ ] Verify no account lockout after 3 attempts (rate limiting shows)

**Test Password Reset:**
- [ ] Click "Forgot password"
- [ ] Enter registered email
- [ ] Check email arrives (within 5 minutes)
- [ ] Click reset link
- [ ] Set new password
- [ ] Login with new password

### 2. Core Page Loading

Visit each page and verify it loads without errors:

| Page | URL | Expected | ✓ |
|------|-----|----------|---|
| Home | `/en` | Landing page with hero section | [ ] |
| Login | `/en/login` | Login form | [ ] |
| Signup | `/en/signup` | Registration form | [ ] |
| Dashboard | `/en/dashboard` | User dashboard (requires auth) | [ ] |
| Students | `/en/students` | Student list | [ ] |
| Assessments | `/en/assessments` | Assessment library | [ ] |
| Reports | `/en/reports` | Report generator | [ ] |
| Cases | `/en/cases` | Case management | [ ] |
| Training | `/en/training` | Training centre | [ ] |
| Help | `/en/help` | Help centre | [ ] |
| About | `/en/about` | Company information | [ ] |
| Contact | `/en/contact` | Contact form | [ ] |
| Pricing | `/en/pricing` | Pricing tiers | [ ] |
| Privacy | `/en/privacy` | Privacy policy | [ ] |
| Terms | `/en/terms` | Terms of service | [ ] |
| Blog | `/en/blog` | Blog articles | [ ] |

### 3. Form Submissions

**Contact Form:**
- [ ] Navigate to `/en/contact`
- [ ] Fill all required fields
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify email received (check Resend/inbox)

**Feedback Widget:**
- [ ] Click feedback button (bottom left of screen)
- [ ] Select feedback type (Bug, Feature, etc.)
- [ ] Enter description
- [ ] Submit
- [ ] Verify success message

---

## 🟡 HIGH PRIORITY - Should Pass

### 4. Voice Assistant (UK English)

**Test Voice Recognition:**
- [ ] Navigate to `/en/dashboard`
- [ ] Press `Ctrl+Shift+V` or click voice button
- [ ] Speak clearly: "Go to help"
- [ ] Verify navigation to help page
- [ ] Speak: "Search for dyslexia"
- [ ] Verify search results appear

**Test UK Accents:**
- [ ] Test with Southern English accent
- [ ] Test with Northern English accent (Yorkshire, Manchester)
- [ ] Test with Scottish accent
- [ ] Test with Welsh accent
- [ ] Test with London accent

**Notes for accent testing:**
- Voice recognition should understand "colour" not just "color"
- Numbers like "Year 3" should be recognised
- School-specific terms (SENCO, EHCP, SEN Support) should be understood

### 5. Dark Mode

**Visual Verification:**
- [ ] Navigate to Settings or click dark mode toggle
- [ ] Enable dark mode
- [ ] Check all pages for readability:
  - [ ] Home page
  - [ ] Dashboard
  - [ ] Student profiles
  - [ ] Assessment pages
  - [ ] Help centre
  - [ ] Blog posts
- [ ] Verify no white flashes on navigation
- [ ] Verify all text is readable (sufficient contrast)
- [ ] Verify buttons and links are visible
- [ ] Verify form inputs have visible borders

### 6. Mobile Responsiveness

**Test on Mobile Device or DevTools (375px width):**

| Page | Touch Works | Text Readable | No Horizontal Scroll | Menu Works |
|------|-------------|---------------|---------------------|------------|
| Home | [ ] | [ ] | [ ] | [ ] |
| Login | [ ] | [ ] | [ ] | [ ] |
| Dashboard | [ ] | [ ] | [ ] | [ ] |
| Student List | [ ] | [ ] | [ ] | [ ] |
| Help Centre | [ ] | [ ] | [ ] | [ ] |

**Touch Interactions:**
- [ ] Buttons respond to tap (not just click)
- [ ] Swipe gestures work where applicable
- [ ] Modal close buttons accessible
- [ ] Dropdown menus openable

### 7. Battle Royale Game

**Test at `/en/battle-royale`:**
- [ ] Game loads without errors
- [ ] Tutorial screen displays on first play
- [ ] Questions relate to UK curriculum/SEND topics
- [ ] Sound effects toggle works
- [ ] Score increments correctly
- [ ] Combo system functions
- [ ] Difficulty levels (Easy/Medium/Hard) change question complexity
- [ ] Accessible text mode works for screen reader users

---

## 🟢 MEDIUM PRIORITY - Nice to Have

### 8. Accessibility Testing

**Screen Reader (NVDA/VoiceOver):**
- [ ] Navigate entire site using keyboard only (Tab, Enter, Escape)
- [ ] Verify all images have alt text
- [ ] Verify form labels are announced
- [ ] Verify error messages are announced
- [ ] Verify modal dialogs trap focus correctly
- [ ] Verify page titles change on navigation

**Keyboard Navigation:**
- [ ] Tab order is logical (left to right, top to bottom)
- [ ] Focus indicators are visible
- [ ] Skip link appears on Tab (skip to main content)
- [ ] Modals can be closed with Escape
- [ ] Dropdowns navigable with arrow keys

**Colour Contrast:**
- [ ] Use browser extension (axe DevTools or WAVE)
- [ ] Run on home page - no critical issues
- [ ] Run on login page - no critical issues
- [ ] Run on dashboard - no critical issues

### 9. Performance

**Lighthouse Audit (Chrome DevTools):**

Run Lighthouse on these pages:

| Page | Performance | Accessibility | Best Practices | SEO | Pass (90+) |
|------|-------------|---------------|----------------|-----|------------|
| Home | _ | _ | _ | _ | [ ] |
| Dashboard | _ | _ | _ | _ | [ ] |
| Help | _ | _ | _ | _ | [ ] |

**Page Load Times:**
- [ ] Home page loads in < 3 seconds
- [ ] Dashboard loads in < 4 seconds
- [ ] Images don't cause layout shift

### 10. SEO Verification

**Check Meta Tags (View Page Source):**
- [ ] Home page has unique title
- [ ] Home page has meta description
- [ ] Open Graph tags present (og:title, og:description, og:image)
- [ ] Twitter card tags present

**Check Sitemap:**
- [ ] Visit `/sitemap.xml`
- [ ] Verify all major pages listed
- [ ] No 404 links in sitemap

**Check Robots:**
- [ ] Visit `/robots.txt`
- [ ] Sitemap reference present
- [ ] No sensitive paths exposed

---

## 🔵 OPTIONAL - Post-Launch

### 11. Stripe Payment (Test Mode)

**Test Successful Payment:**
- [ ] Navigate to `/en/pricing`
- [ ] Select Professional tier
- [ ] Click "Get Started"
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date
- [ ] CVC: Any 3 digits
- [ ] Complete checkout
- [ ] Verify success message
- [ ] Verify subscription active in dashboard

**Test Failed Payment:**
- [ ] Use card: `4000 0000 0000 0002`
- [ ] Verify decline message shows
- [ ] User not charged

### 12. Video Content

**Test Video Playback:**
- [ ] Navigate to Training Centre
- [ ] Click on any course
- [ ] Verify video loads
- [ ] Verify video plays
- [ ] Verify video has captions/subtitles

### 13. Multi-Language (Welsh)

**Test Welsh Translation:**
- [ ] Change language to Welsh (if available)
- [ ] Verify key UI elements translated
- [ ] Verify navigation works in Welsh
- [ ] Change back to English

---

## Issue Reporting

If you find any issues during testing:

1. **Take a screenshot** (or screen recording for interactions)
2. **Note the URL** where issue occurred
3. **Note browser and device** (Chrome 119, Windows 11, etc.)
4. **Describe steps to reproduce**
5. **Use the feedback widget** or email: help@edpsychconnect.com

---

## Sign-Off

| Tester Name | Date | Sections Completed | Issues Found |
|-------------|------|--------------------|--------------|
| | | | |
| | | | |

**Final Approval:**

- [ ] All CRITICAL tests passed
- [ ] All HIGH PRIORITY tests passed
- [ ] No blocking issues remaining
- [ ] Beta launch approved

**Approved by:** _______________________  
**Date:** _______________________

---

## Quick Reference Commands

**Browser DevTools:**
- `F12` - Open DevTools
- `Ctrl+Shift+M` - Mobile view toggle
- Lighthouse: DevTools > Lighthouse tab

**Keyboard Shortcuts in App:**
- `Ctrl+K` - Search
- `Ctrl+Shift+V` - Voice assistant
- `?` - Help

---

*Document Version: 1.0.0*  
*Created: November 2025*  
*EdPsych Connect Limited*
