import { processUserAction } from '../ai-engine/services/behaviorTracker.js';
import { findResumeByUser, upsertResume } from '../repositories/resumesRepository.js';

const emptyResume = {
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    summary: '',
  },
  skills: [],
  experience: [],
};

export const saveResume = async (req, res, next) => {
  try {
    const { data = emptyResume, template = 'modern' } = req.body;
    const existingResume = await findResumeByUser(req.user._id);

    const resume = await upsertResume({
      userId: req.user._id,
      data,
      template,
    });

    const changedSections = ['personal', 'skills', 'experience'].filter(
      (section) =>
        JSON.stringify(existingResume?.data?.[section] || null) !==
        JSON.stringify(resume.data?.[section] || null),
    );

    await processUserAction({
      userId: req.user._id,
      module: 'resume',
      actionType: 'resume.saved',
      metadata: {
        resumeId: resume._id.toString(),
        isNewResume: !existingResume,
        changedSections,
        resumeData: resume.data,
      },
    });

    res.status(201).json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (req, res, next) => {
  try {
    const resume = await findResumeByUser(req.user._id);

    res.json({
      success: true,
      resume: resume || {
        userId: req.user._id,
        data: emptyResume,
        template: 'modern',
      },
    });
  } catch (error) {
    next(error);
  }
};
