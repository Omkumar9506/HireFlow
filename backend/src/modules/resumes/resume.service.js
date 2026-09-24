import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { Resume } from './resume.model.js';
import { Candidate } from '../candidates/candidate.model.js';
import { storageService } from '../../services/storage.service.js';
import { aiService } from '../../services/ai.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

export const resumeService = {
  uploadAndParseResume: async (userId, file, isPrimary = false) => {
    const candidate = await Candidate.findOne({ userId });
    if (!candidate) throw new ApiError(404, 'Candidate profile not found');

    if (!file) throw new ApiError(400, 'Resume file is required');

    // Extract text if PDF
    let extractedText = '';
    if (file.mimetype === 'application/pdf') {
      try {
        const parsed = await pdfParse(file.buffer);
        extractedText = parsed.text || '';
      } catch (err) {
        logger.warn('PDF text extraction error:', err.message);
      }
    } else {
      // Fallback for doc/docx or raw buffer
      extractedText = file.buffer.toString('utf8').replace(/[^\x20-\x7E\n]/g, ' ');
    }

    // Upload to Cloudinary / Local
    const uploadResult = await storageService.uploadResume(file);

    // AI Resume Analysis
    const aiAnalysis = await aiService.analyzeResume(extractedText);

    // If marked primary or candidate has no primary, set isPrimary = true
    const existingCount = await Resume.countDocuments({ candidateId: candidate._id });
    const markAsPrimary = isPrimary || existingCount === 0;

    if (markAsPrimary) {
      await Resume.updateMany({ candidateId: candidate._id }, { isPrimary: false });
    }

    const resume = await Resume.create({
      candidateId: candidate._id,
      fileName: file.originalname,
      fileUrl: uploadResult.fileUrl,
      fileType: file.mimetype,
      fileSize: file.size,
      extractedText,
      skills: aiAnalysis.detectedSkills || [],
      experience: aiAnalysis.experienceSummary || '',
      education: aiAnalysis.educationSummary || '',
      aiAnalysis,
      isPrimary: markAsPrimary,
    });

    if (markAsPrimary) {
      candidate.resumeId = resume._id;
      // Also automatically populate candidate skills if candidate has none
      if (!candidate.skills || candidate.skills.length === 0) {
        candidate.skills = aiAnalysis.detectedSkills || [];
      }
      await candidate.save();
    }

    return resume;
  },

  setPrimaryResume: async (userId, resumeId) => {
    const candidate = await Candidate.findOne({ userId });
    if (!candidate) throw new ApiError(404, 'Candidate not found');

    const resume = await Resume.findOne({ _id: resumeId, candidateId: candidate._id });
    if (!resume) throw new ApiError(404, 'Resume not found');

    await Resume.updateMany({ candidateId: candidate._id }, { isPrimary: false });
    resume.isPrimary = true;
    await resume.save();

    candidate.resumeId = resume._id;
    await candidate.save();

    return resume;
  },

  getResumeById: async (resumeId) => {
    const resume = await Resume.findById(resumeId);
    if (!resume) throw new ApiError(404, 'Resume not found');
    return resume;
  },
};
