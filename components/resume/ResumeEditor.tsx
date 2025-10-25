'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}

interface ParsedData {
  skills: string[];
  experience: Experience[];
  education: Education[];
}

interface ResumeVersion {
  id: string;
  resumeId: string;
  rawText: string | null;
  parsedData: ParsedData;
  version: number;
  createdAt: string;
}

interface ResumeEditorProps {
  resumeId: string;
  onSave?: () => void;
}

export default function ResumeEditor({ resumeId, onSave }: ResumeEditorProps) {
  const { accessToken } = useAuth();
  const [isParsing, setIsParsing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ResumeVersion | null>(null);
  const [editedData, setEditedData] = useState<ParsedData>({
    skills: [],
    experience: [],
    education: [],
  });

  useEffect(() => {
    loadVersions();
  }, [resumeId]);

  const loadVersions = async () => {
    if (!accessToken) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate/resumes`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load resume versions');
      }
      
      const data = await response.json();
      const resume = data.resumes.find((r: any) => r.id === resumeId);
      
      if (resume && resume.versions) {
        setVersions(resume.versions);
        if (resume.versions.length > 0) {
          setSelectedVersion(resume.versions[0]);
          setEditedData(resume.versions[0].parsedData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load versions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParse = async () => {
    if (!accessToken) return;
    
    setIsParsing(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate/resume/parse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to parse resume');
      }
      
      const data = await response.json();
      await loadVersions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse resume');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...editedData.skills];
    newSkills[index] = value;
    setEditedData({ ...editedData, skills: newSkills });
  };

  const handleAddSkill = () => {
    setEditedData({ ...editedData, skills: [...editedData.skills, ''] });
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = editedData.skills.filter((_, i) => i !== index);
    setEditedData({ ...editedData, skills: newSkills });
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    const newExperience = [...editedData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setEditedData({ ...editedData, experience: newExperience });
  };

  const handleAddExperience = () => {
    setEditedData({
      ...editedData,
      experience: [
        ...editedData.experience,
        { company: '', title: '', startDate: '', description: '' },
      ],
    });
  };

  const handleRemoveExperience = (index: number) => {
    const newExperience = editedData.experience.filter((_, i) => i !== index);
    setEditedData({ ...editedData, experience: newExperience });
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const newEducation = [...editedData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEditedData({ ...editedData, education: newEducation });
  };

  const handleAddEducation = () => {
    setEditedData({
      ...editedData,
      education: [
        ...editedData.education,
        { institution: '', degree: '', field: '', graduationDate: '' },
      ],
    });
  };

  const handleRemoveEducation = (index: number) => {
    const newEducation = editedData.education.filter((_, i) => i !== index);
    setEditedData({ ...editedData, education: newEducation });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Version Selector */}
      {versions.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Version:</label>
            <select
              value={selectedVersion?.id || ''}
              onChange={(e) => {
                const version = versions.find((v) => v.id === e.target.value);
                if (version) {
                  setSelectedVersion(version);
                  setEditedData(version.parsedData);
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  Version {version.version} - {new Date(version.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleParse}
            disabled={isParsing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isParsing ? 'Parsing...' : 'Parse Resume'}
          </button>
        </div>
      )}

      {versions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No parsed versions yet</p>
          <button
            onClick={handleParse}
            disabled={isParsing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isParsing ? 'Parsing...' : 'Parse Resume'}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {selectedVersion && (
        <div className="space-y-8">
          {/* Skills Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
              <button
                onClick={handleAddSkill}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Skill
              </button>
            </div>
            <div className="space-y-2">
              {editedData.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter skill"
                  />
                  <button
                    onClick={() => handleRemoveSkill(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
              <button
                onClick={handleAddExperience}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Experience
              </button>
            </div>
            <div className="space-y-6">
              {editedData.experience.map((exp, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRemoveExperience(index)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Job Title"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Start Date"
                    />
                    <input
                      type="text"
                      value={exp.endDate || ''}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="End Date (or Present)"
                    />
                  </div>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Education</h3>
              <button
                onClick={handleAddEducation}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Education
              </button>
            </div>
            <div className="space-y-6">
              {editedData.education.map((edu, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRemoveEducation(index)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Institution"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Field of Study"
                    />
                  </div>
                  <input
                    type="text"
                    value={edu.graduationDate}
                    onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Graduation Date"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
