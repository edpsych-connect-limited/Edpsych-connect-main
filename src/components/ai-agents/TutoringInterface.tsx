import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen, Target, Lightbulb } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { ProgressBar } from '@/components/ui/ProgressBar';

// Import UI components individually from their actual locations
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

interface TutoringRequest {
  studentId: string;
  subject: string;
  topic: string;
  currentLevel: 'foundation' | 'developing' | 'secure' | 'mastery';
  learningObjectives: string[];
  timeAvailable: number;
  preferredLearningStyle: 'visual' | 'auditory' | 'kinaesthetic' | 'reading';
  specialEducationalNeeds?: string[];
}

interface TutoringResponse {
  personalisedExplanation: string;
  interactiveExercise: {
    type: 'multiple_choice' | 'fill_blank' | 'matching' | 'sequencing';
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  };
  nextSteps: string[];
  resources: {
    type: 'video' | 'diagram' | 'worksheet' | 'interactive';
    title: string;
    url: string;
    description: string;
  }[];
  masteryAssessment: {
    currentLevel: string;
    progressToNextLevel: number;
    recommendedPracticeTime: number;
  };
  motivationalMessage: string;
}

export default function TutoringInterface() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Preparing your request...');
  const [response, setResponse] = useState<TutoringResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submissionAttempted, setSubmissionAttempted] = useState(false);

  // Simulate loading progress for better user feedback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      // Start with initial progress and message
      setLoadingProgress(10);
      setLoadingMessage('Preparing your request...');
      
      // Create an interval to update progress
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            setLoadingMessage('Almost ready...');
            return 90;
          }
          
          // Update loading message based on progress
          if (prev === 10) setLoadingMessage('Analyzing learning objectives...');
          else if (prev === 30) setLoadingMessage('Tailoring content to your style...');
          else if (prev === 50) setLoadingMessage('Preparing personalized exercises...');
          else if (prev === 70) setLoadingMessage('Finalizing your tutoring session...');
          
          return prev + 5;
        });
      }, 800);
    } else {
      // Reset progress when not loading
      setLoadingProgress(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const [formData, setFormData] = useState<TutoringRequest>({
    studentId: user?.email || '',
    subject: '',
    topic: '',
    currentLevel: 'developing',
    learningObjectives: [''],
    timeAvailable: 30,
    preferredLearningStyle: 'visual',
    specialEducationalNeeds: []
  });

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, studentId: user.email || '' }));
    }
  }, [user]);

  const subjects = [
    'Mathematics', 'English', 'Science', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art'
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.subject) {
      errors.subject = "Subject is required";
      isValid = false;
    }

    if (!formData.topic) {
      errors.topic = "Topic is required";
      isValid = false;
    }

    // Check if all learning objectives are filled
    const emptyObjectives = formData.learningObjectives.filter(obj => !obj.trim());
    if (emptyObjectives.length > 0) {
      errors.learningObjectives = "All learning objectives must be filled";
      isValid = false;
    }

    if (formData.timeAvailable < 5 || formData.timeAvailable > 120) {
      errors.timeAvailable = "Time available must be between 5 and 120 minutes";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionAttempted(true);
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Add a unique request ID for tracking/debugging
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Use a safer approach for CSRF protection
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      
      const response = await fetch('/api/orchestrator/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(formData),
        credentials: 'include', // Include cookies for authentication
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        // Handle different error status codes appropriately
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication error. Please login again.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Our team has been notified.');
          // In production, would log to monitoring service here
        }
        
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get tutoring assistance');
        } catch (jsonError) {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      try {
        const data = await response.json();
        if (!data.result) {
          throw new Error('Invalid response format from server');
        }
        setResponse(data.result);
      } catch (parseError) {
        throw new Error('Failed to parse server response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.learningObjectives];
    newObjectives[index] = value;
    setFormData({ ...formData, learningObjectives: newObjectives });
  };

  const addObjective = () => {
    setFormData({
      ...formData,
      learningObjectives: [...formData.learningObjectives, '']
    });
  };

  const removeObjective = (index: number) => {
    const newObjectives = formData.learningObjectives.filter((_, i) => i !== index);
    setFormData({ ...formData, learningObjectives: newObjectives });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            AI Tutoring Assistant
          </CardTitle>
          <p className="text-muted-foreground">
            Get personalized tutoring assistance tailored to your learning needs
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value: string) => {
                    setFormData({ ...formData, subject: value });
                    if (submissionAttempted) {
                      setFormErrors({...formErrors, subject: value ? '' : 'Subject is required'});
                    }
                  }}
                  aria-invalid={!!formErrors.subject}
                  aria-describedby={formErrors.subject ? "subject-error" : undefined}
                >
                  <SelectTrigger className={formErrors.subject ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.subject && (
                  <p id="subject-error" className="text-sm text-red-500 mt-1">
                    {formErrors.subject}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic <span className="text-red-500">*</span></Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => {
                    setFormData({ ...formData, topic: e.target.value });
                    if (submissionAttempted) {
                      setFormErrors({...formErrors, topic: e.target.value ? '' : 'Topic is required'});
                    }
                  }}
                  placeholder="e.g., Algebra, Photosynthesis, World War II"
                  required
                  aria-invalid={!!formErrors.topic}
                  aria-describedby={formErrors.topic ? "topic-error" : undefined}
                  className={formErrors.topic ? "border-red-500" : ""}
                />
                {formErrors.topic && (
                  <p id="topic-error" className="text-sm text-red-500 mt-1">
                    {formErrors.topic}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentLevel">Current Level</Label>
                <Select
                  value={formData.currentLevel}
                  onValueChange={(value: 'foundation' | 'developing' | 'secure' | 'mastery') =>
                    setFormData({ ...formData, currentLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="developing">Developing</SelectItem>
                    <SelectItem value="secure">Secure</SelectItem>
                    <SelectItem value="mastery">Mastery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningStyle">Learning Style</Label>
                <Select
                  value={formData.preferredLearningStyle}
                  onValueChange={(value: 'visual' | 'auditory' | 'kinaesthetic' | 'reading') =>
                    setFormData({ ...formData, preferredLearningStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual</SelectItem>
                    <SelectItem value="auditory">Auditory</SelectItem>
                    <SelectItem value="kinaesthetic">Kinaesthetic</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Learning Objectives <span className="text-red-500">*</span></Label>
              {formErrors.learningObjectives && (
                <p id="objectives-error" className="text-sm text-red-500 mt-1">
                  {formErrors.learningObjectives}
                </p>
              )}
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={objective}
                    onChange={(e) => {
                      handleObjectiveChange(index, e.target.value);
                      if (submissionAttempted) {
                        const newObjectives = [...formData.learningObjectives];
                        newObjectives[index] = e.target.value;
                        const hasEmptyObjectives = newObjectives.some(obj => !obj.trim());
                        setFormErrors({
                          ...formErrors,
                          learningObjectives: hasEmptyObjectives ? 'All learning objectives must be filled' : ''
                        });
                      }
                    }}
                    placeholder="What do you want to learn?"
                    required
                    aria-invalid={!!formErrors.learningObjectives}
                    aria-describedby={formErrors.learningObjectives ? "objectives-error" : undefined}
                    className={formErrors.learningObjectives ? "border-red-500" : ""}
                  />
                  {formData.learningObjectives.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeObjective(index)}
                      aria-label={`Remove objective ${index + 1}`}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addObjective}
                aria-label="Add learning objective"
              >
                Add Objective
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeAvailable">Time Available (minutes) <span className="text-red-500">*</span></Label>
              <Input
                id="timeAvailable"
                type="number"
                min="5"
                max="120"
                value={formData.timeAvailable}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData({ ...formData, timeAvailable: value });
                  if (submissionAttempted) {
                    setFormErrors({
                      ...formErrors,
                      timeAvailable: (value < 5 || value > 120) ? 'Time must be between 5 and 120 minutes' : ''
                    });
                  }
                }}
                required
                aria-invalid={!!formErrors.timeAvailable}
                aria-describedby={formErrors.timeAvailable ? "time-error" : undefined}
                className={formErrors.timeAvailable ? "border-red-500" : ""}
              />
              {formErrors.timeAvailable && (
                <p id="time-error" className="text-sm text-red-500 mt-1">
                  {formErrors.timeAvailable}
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                {error}
              </div>
            )}

            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>{loadingMessage}</span>
                  {loadingProgress > 0 && (
                    <div className="absolute bottom-0 left-0 w-full">
                       <ProgressBar value={loadingProgress} max={100} colorClass="bg-blue-500" heightClass="h-1" className="rounded-none" trackColorClass="bg-transparent" />
                    </div>
                  )}
                </>
              ) : (
                'Get Tutoring Help'
              )}
            </Button>
            
          </form>
        </CardContent>
      </Card>

      {response && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Personalized Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{response.personalisedExplanation}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Exercise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold">{response.interactiveExercise.question}</h4>

                {response.interactiveExercise.options && (
                  <div className="space-y-2">
                    {response.interactiveExercise.options.map((option, index) => (
                      <div key={index} className="p-2 border rounded">
                        {option}
                      </div>
                    ))}
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold">Show Answer & Explanation</summary>
                  <div className="mt-2 p-4 bg-muted rounded">
                    <p><strong>Correct Answer:</strong> {response.interactiveExercise.correctAnswer}</p>
                    <p className="mt-2"><strong>Explanation:</strong> {response.interactiveExercise.explanation}</p>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {response.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-gray-500 rounded">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {response.resources.map((resource, index) => (
                    <div key={index} className="p-3 border rounded">
                      <h5 className="font-semibold">{resource.title}</h5>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded mt-1">
                        {resource.type}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mastery Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Current Level:</span>
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded">
                    {response.masteryAssessment.currentLevel}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress to Next Level</span>
                    <span>{response.masteryAssessment.progressToNextLevel}%</span>
                  </div>
                  <ProgressBar value={response.masteryAssessment.progressToNextLevel} max={100} colorClass="bg-blue-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Recommended practice time: {response.masteryAssessment.recommendedPracticeTime} minutes
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Motivational Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg italic">&quot;{response.motivationalMessage}&quot;</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}