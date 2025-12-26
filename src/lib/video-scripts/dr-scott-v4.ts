// Thin re-export layer to allow app code to consume the Dr. Scott V4 script library
// without importing from outside `src/` all over the codebase.
//
// NOTE: This file intentionally re-exports from the project root `video_scripts/` folder.
// That keeps captions/transcript logic close to the running app.

export {
  EHCP_VIDEOS,
  HELP_CENTRE_VIDEOS,
  LA_PORTAL_VIDEOS,
  PARENT_PORTAL_VIDEOS,
  COMPLIANCE_VIDEOS,
  ASSESSMENT_VIDEOS,
} from '../../../video_scripts/world_class/comprehensive-video-scripts-v4-dr-scott';
