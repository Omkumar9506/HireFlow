import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Skeleton } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/StatusBadge';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ResumePage = () => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeResume, setActiveResume] = useState(null);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/candidates/resumes');
      const list = res.data.data || [];
      setResumes(list);
      if (list.length > 0 && !activeResume) {
        setActiveResume(list.find((r) => r.isPrimary) || list[0]);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size exceeds the 5MB maximum limit.');
        return;
      }
      setSelectedFile(file);
      setUploadError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('isPrimary', resumes.length === 0);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadSuccess('Resume uploaded and analyzed by AI successfully!');
      setSelectedFile(null);
      await fetchResumes();
      setActiveResume(res.data.data);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload resume document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = async (resumeId) => {
    try {
      await api.patch(`/resumes/${resumeId}/primary`);
      fetchResumes();
    } catch (err) {
      console.warn('Failed to set primary resume:', err);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/candidates/resumes/${resumeId}`);
      if (activeResume?._id === resumeId) setActiveResume(null);
      fetchResumes();
    } catch (err) {
      console.warn('Failed to delete resume:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Resume & AI Skill Analysis
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload and manage candidate resumes. AI extracts detected competencies and suggests improvements.
        </p>
      </div>

      {/* Upload Box */}
      <Card className="p-6">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload New Resume (PDF, DOC, DOCX up to 5MB)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-300 rounded-lg p-1.5 bg-white"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!selectedFile}
              isLoading={isUploading}
              icon={UploadCloud}
              className="mt-4 sm:mt-5 sm:self-end"
            >
              Analyze Resume
            </Button>
          </div>

          {uploadError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </form>
      </Card>

      {/* Resumes List & AI Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Resumes List */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Uploaded Documents ({resumes.length})
          </h2>

          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : resumes.length === 0 ? (
            <Card className="text-center py-8 text-xs text-slate-500">
              No resumes uploaded yet
            </Card>
          ) : (
            resumes.map((r) => {
              const isSelected = activeResume?._id === r._id;
              return (
                <div
                  key={r._id}
                  onClick={() => setActiveResume(r)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {r.fileName}
                      </span>
                    </div>
                    {r.isPrimary && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                        Primary
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">
                    Uploaded on {new Date(r.createdAt).toLocaleDateString()} • {(r.fileSize / 1024).toFixed(0)} KB
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    {!r.isPrimary ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(r._id);
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        Set as Primary
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Default for applications</span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(r._id);
                      }}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Delete resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: AI Analysis Inspector */}
        <div className="lg:col-span-2">
          {activeResume ? (
            <Card className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI Resume Parsing & Competency Insights
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Document: {activeResume.fileName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">AI-assisted insight</Badge>
                  {activeResume.fileUrl && (
                    <a
                      href={activeResume.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-500 hover:text-blue-600"
                      title="Download file"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Detected Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Detected Technical Proficiencies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(activeResume.aiAnalysis?.detectedSkills || activeResume.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Summary */}
              {activeResume.aiAnalysis?.experienceSummary && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Experience Synopsis
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {activeResume.aiAnalysis.experienceSummary}
                  </p>
                </div>
              )}

              {/* Strengths */}
              {activeResume.aiAnalysis?.strengths && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5">
                    Key Profile Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {activeResume.aiAnalysis.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvement Suggestions */}
              {activeResume.aiAnalysis?.improvementSuggestions && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1.5">
                    Suggested Improvements
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {activeResume.aiAnalysis.improvementSuggestions.map((sug, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ) : (
            <Card className="py-16 text-center text-xs text-slate-500">
              Select an uploaded resume from the left to view AI analysis breakdown.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
