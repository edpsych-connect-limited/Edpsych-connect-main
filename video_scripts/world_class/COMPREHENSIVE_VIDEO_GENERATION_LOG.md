# Comprehensive Video Generation Log
## Generated: 30 November 2025

### Summary
- **Total NEW Videos Generated Today**: 26 videos
- **Previous Videos (already generated)**: 59 videos (4 marketing + 6 onboarding + 48 training + 1 LA portal intro)
- **Grand Total**: 85 videos
- **Credits Used Today**: ~2,070 (from 33,990 to ~31,920)
- **Remaining Credits**: 31,920

---

## NEW Videos Generated Today

### Help Centre Videos (5 videos)
| ID | Title | HeyGen Video ID |
|----|-------|-----------------|
| `help-getting-started` | Getting Started with EdPsych Connect | `07d374d539174c3f8422495fbb20609f` |
| `help-first-assessment` | Running Your First Assessment | `1d50e458b10844e6b1a98abdcbb5c0e7` |
| `help-data-security` | How We Protect Your Data | `5fabc6b18a8a430789e95076f933c328` |
| `help-finding-interventions` | Finding and Implementing Interventions | `753871923bfd4c99b8ea34cd934506a4` |
| `help-technical-support` | Getting Technical Support | `4ffdb5a86da845198c204fc8bfb4fea1` |

### EHCP Process Videos (4 videos)
| ID | Title | HeyGen Video ID |
|----|-------|-----------------|
| `ehcp-application-journey` | Your EHCP Application Journey | `c812bcbcf87d411e9a414693960a6465` |
| `ehcp-evidence-gathering` | Gathering Strong EHCP Evidence | `aad5f91743b042a29b5b86264aeefbca` |
| `ehcp-annual-review` | Preparing for Your EHCP Annual Review | `f80c4070477943bc8b2dd924271c0def` |
| `ehcp-appeals-process` | Understanding the EHCP Appeals Process | `6d355128bd27475b8f68860908196551` |

### LA (Local Authority) Specific Videos (2 videos)
| ID | Title | HeyGen Video ID |
|----|-------|-----------------|
| `la-dashboard-overview` | Your LA Dashboard Overview | `639b683948e143fea9d0805a1d305aef` |
| `la-coordinator-hub` | LA EHCP Coordinator Hub | `1cf3e3279c41491ca56588272ca132df` |

### Parent Portal Videos (4 videos)
| ID | Title | HeyGen Video ID |
|----|-------|-----------------|
| `parent-portal-welcome` | Welcome to the Parent Portal | `4d8a0bf3d1ec42fcb2b96822ec6d10de` |
| `parent-support-plan` | Understanding Your Child's Support Plan | `ca164ca97ac0445da232296e11054efa` |
| `parent-communication` | Communicating with School | `85033c3f9da24de8b3f93705e99dbbfc` |
| `parent-home-support` | Supporting Learning at Home | `7ccd705b61aa467e98450532fb26710d` |

### Feature Walkthrough Videos (7 videos)
| ID | Title | HeyGen Video ID |
|----|-------|-----------------|
| `feature-dashboard` | Mastering Your Dashboard | `a80eeff63d1d43a7a692a83a61ddf161` |
| `feature-no-child-engine` | The No Child Left Behind Engine | `64747d9d902f4bcdb9a0b89f4f9b26d3` |
| `feature-battle-royale` | Battle Royale Professional Development | `60d603daaff94cbf9b788252a491e194` |
| `feature-reports` | Generating Professional Reports | `a1faf44438634ba39eefb50eb3a04767` |
| `feature-interventions` | Navigating the Intervention Library | `d82d21fa04734f879055a1da6e46beda` |
| `feature-collaboration` | Collaborating with Colleagues | `9fde657e5998446db4354ce8ab2f2460` |
| `feature-senco-analytics` | SENCO Analytics Dashboard | `9077ac27c7ff42e9b59520acfe296de0` |

### Error Recovery Videos (4 videos)
| ID | Title | HeyGen Video ID |
|----|-------|-----------------|
| `error-general` | When Things Go Wrong | `da5d980ed22c47e9baca700e254cc94c` |
| `error-connection` | Fixing Connection Issues | `29b65338afca48cfa77605c1e5ddde61` |
| `error-data-sync` | Resolving Data Sync Issues | `e2bb5cebab7740b5a3cac518264864ea` |
| `error-account-access` | Recovering Account Access | `f312a449093c491799db5793f56c26d3` |

### Compliance & Safeguarding Videos (2 videos)
| ID | Title | HeyGen Video ID |
|----|-------|-----------------|
| `compliance-data-protection` | Data Protection for Educators | `697a99ea2d3446858a85d4e23732aaf2` |
| `safeguarding-features` | Safeguarding Features and Protocols | `5b8a90fd262b4c24ae26c1ce6c75f009` |

---

## Video Specifications
- **Resolution**: 1920x1080 (Full HD)
- **Aspect Ratio**: 16:9
- **Avatar**: Adrian_public_3_20240312 (Professional male)
- **Voice**: 453c20e1525a429080e2ad9e4b26f2cd (UK accent, Archer)
- **Speed**: 1.0 (normal pacing)
- **Background**: #1e293b (Dark slate blue)

---

## Previous Videos (Already Generated)

### Marketing Videos (4 videos)
- `platform-introduction`: 4db447c48f65403e991e37ec0be981d6
- `data-autonomy`: 99735ae8bf3d410fb73ee651d8fac4f7
- `no-child-left-behind`: 70ec101b44744460a79c70cee1573bb0
- `gamification-integrity`: 810c3c4bdd644530b498f2dff546409a

### LA Portal Intro (1 video)
- `la-ehcp-portal-intro`: c96239e50f494303a529dcf7ce066f2e

### Onboarding Videos (6 videos)
- See world_class/onboarding-video-ids.ts for details

### Training Course Videos (48 videos)
- 16 Autism videos (autism-m1-l1 through autism-m8-l2)
- 16 ADHD videos (adhd-m1-l1 through adhd-m8-l2)
- 16 Dyslexia videos (dyslexia-m1-l1 through dyslexia-m8-l2)

---

## To Download Videos
Once videos are processed (check status at HeyGen dashboard), download them to:
```
public/content/training_videos/
├── help-centre/
├── ehcp/
├── parent-portal/
├── features/
├── error-recovery/
├── compliance/
└── la-portal/
```

Use this PowerShell command to check video status:
```powershell
curl.exe -s "https://api.heygen.com/v1/video_status.get?video_id=VIDEO_ID_HERE" -H "X-Api-Key: $env:HEYGEN_API_KEY"
```
