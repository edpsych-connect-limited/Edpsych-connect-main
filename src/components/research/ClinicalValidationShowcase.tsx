/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from "react";

export default function ClinicalValidationShowcase() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Evidence-Based Validation</h2>
        <p>
          Our platform has undergone rigorous clinical validation in collaboration with
          educational psychologists and research institutions. Studies confirm improvements
          in learner engagement, retention, and measurable outcomes.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Research Foundation</h2>
        <p>
          The system is grounded in peer-reviewed research, aligned with the UK curriculum,
          and compliant with ethical standards for data protection and safeguarding.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Ongoing Studies</h2>
        <ul className="list-disc list-inside">
          <li>Randomised controlled trials with Year Groups 7–9</li>
          <li>Longitudinal studies on cognitive load reduction</li>
          <li>Collaborations with UK universities and NHS partners</li>
        </ul>
      </section>
    </div>
  );
}