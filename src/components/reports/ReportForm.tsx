'use client'

import { logger } from "@/lib/logger";

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportData, Recommendation } from '@/lib/reports/report-generator';
import { Plus, Trash2, Save, Download } from 'lucide-react';

export function ReportForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const [formData, setFormData] = useState<ReportData>({
    type: 'assessment',
    date: new Date(),
    student: {
      name: '',
      dob: new Date(),
      school: '',
      yearGroup: '',
    },
    ep: {
      name: '',
      hcpcNumber: '',
      organization: '',
    },
    sections: [
      { title: 'Background Information', content: '' },
      { title: 'Assessment Findings', content: '' },
    ],
    recommendations: [],
    outcomes: [],
    evidence: [],
  });

  const handleStudentChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      student: { ...prev.student, [field]: field === 'dob' ? new Date(value) : value }
    }));
  };

  const handleEpChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      ep: { ...prev.ep, [field]: value }
    }));
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { title: 'New Section', content: '' }]
    }));
  };

  const updateSection = (index: number, field: 'title' | 'content', value: string) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const addRecommendation = () => {
    setFormData(prev => ({
      ...prev,
      recommendations: [...prev.recommendations, {
        area: '',
        recommendation: '',
        rationale: '',
        responsibility: '',
        timescale: '',
        priority: 'medium'
      }]
    }));
  };

  const updateRecommendation = (index: number, field: keyof Recommendation, value: string) => {
    const newRecs = [...formData.recommendations];
    newRecs[index] = { ...newRecs[index], [field]: value };
    setFormData(prev => ({ ...prev, recommendations: newRecs }));
  };

  const removeRecommendation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${formData.student.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (_error) {
      console._error('Error:', _error);
      alert('Failed to generate report. Please check the console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Report Generator</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => logger.debug('Form data:', formData)}>
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button onClick={handleSubmit} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" /> 
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="evidence">Evidence & Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>Basic information about the report, student, and EP.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val: any) => setFormData(prev => ({ ...prev, type: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assessment">Assessment Report</SelectItem>
                      <SelectItem value="ehcp_advice">EHCP Advice</SelectItem>
                      <SelectItem value="intervention_review">Intervention Review</SelectItem>
                      <SelectItem value="progress">Progress Monitoring</SelectItem>
                      <SelectItem value="annual_review">Annual Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Report Date</Label>
                  <Input 
                    type="date" 
                    value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={formData.student.name}
                      onChange={(e) => handleStudentChange('name', e.target.value)}
                      placeholder="Student Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input 
                      type="date"
                      value={formData.student.dob instanceof Date ? formData.student.dob.toISOString().split('T')[0] : ''}
                      onChange={(e) => handleStudentChange('dob', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>School</Label>
                    <Input 
                      value={formData.student.school}
                      onChange={(e) => handleStudentChange('school', e.target.value)}
                      placeholder="School Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year Group</Label>
                    <Input 
                      value={formData.student.yearGroup}
                      onChange={(e) => handleStudentChange('yearGroup', e.target.value)}
                      placeholder="e.g. Year 5"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">EP Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>EP Name</Label>
                    <Input 
                      value={formData.ep.name}
                      onChange={(e) => handleEpChange('name', e.target.value)}
                      placeholder="Dr. Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>HCPC Number</Label>
                    <Input 
                      value={formData.ep.hcpcNumber}
                      onChange={(e) => handleEpChange('hcpcNumber', e.target.value)}
                      placeholder="PYL..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization</Label>
                    <Input 
                      value={formData.ep.organization}
                      onChange={(e) => handleEpChange('organization', e.target.value)}
                      placeholder="EdPsych Connect"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4 mt-4">
          {formData.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  Section {index + 1}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => removeSection(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                    placeholder="Section Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea 
                    value={section.content}
                    onChange={(e) => updateSection(index, 'content', e.target.value)}
                    placeholder="Enter section content..."
                    className="min-h-[200px]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button onClick={addSection} className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Section
          </Button>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4 mt-4">
          {formData.recommendations.map((rec, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  Recommendation {index + 1}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => removeRecommendation(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Area of Need</Label>
                    <Input 
                      value={rec.area}
                      onChange={(e) => updateRecommendation(index, 'area', e.target.value)}
                      placeholder="e.g. Literacy, Social Skills"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={rec.priority} 
                      onValueChange={(val: any) => updateRecommendation(index, 'priority', val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Recommendation</Label>
                  <Textarea 
                    value={rec.recommendation}
                    onChange={(e) => updateRecommendation(index, 'recommendation', e.target.value)}
                    placeholder="What should be done?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rationale</Label>
                  <Textarea 
                    value={rec.rationale}
                    onChange={(e) => updateRecommendation(index, 'rationale', e.target.value)}
                    placeholder="Why is this recommended?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Responsibility</Label>
                    <Input 
                      value={rec.responsibility}
                      onChange={(e) => updateRecommendation(index, 'responsibility', e.target.value)}
                      placeholder="e.g. Class Teacher, SENCO"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timescale</Label>
                    <Input 
                      value={rec.timescale}
                      onChange={(e) => updateRecommendation(index, 'timescale', e.target.value)}
                      placeholder="e.g. Immediate, Next Term"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button onClick={addRecommendation} className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Recommendation
          </Button>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Evidence & Outcomes</CardTitle>
              <CardDescription>This section is under construction. You can add evidence and outcomes in the generated report for now.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Future updates will allow detailed tracking of evidence sources and specific outcomes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
