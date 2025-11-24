import React from 'react';
import AssessmentSandboxWizard from '@/components/demo/AssessmentSandboxWizard';

export const metadata = {
  title: 'Assessment Sandbox | EdPsych Connect',
  description: 'Try the EdPsych Connect assessment workflow in a sandbox environment.',
};

export default function AssessmentDemoPage() {
  return <AssessmentSandboxWizard />;
}
