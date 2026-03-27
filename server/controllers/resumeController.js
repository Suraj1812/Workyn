import { processUserAction } from '../ai-engine/services/behaviorTracker.js';
import { findResumeByUser, upsertResume } from '../repositories/resumesRepository.js';
import { recordActivity } from '../services/activityService.js';

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
    const existingResume = await findResumeByUser(req.user.id, req.workspace.id);

    const resume = await upsertResume({
      userId: req.user.id,
      workspaceId: req.workspace.id,
      data,
      template,
    });

    const changedSections = ['personal', 'skills', 'experience'].filter(
      (section) =>
        JSON.stringify(existingResume?.data?.[section] || null) !==
        JSON.stringify(resume.data?.[section] || null),
    );

    await processUserAction({
      userId: req.user.id,
      workspaceId: req.workspace.id,
      module: 'resume',
      actionType: 'resume.saved',
      metadata: {
        resumeId: resume.id,
        isNewResume: !existingResume,
        changedSections,
        resumeData: resume.data,
      },
    });

    await recordActivity({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: 'resume',
      action: 'resume.saved',
      entityType: 'resume',
      entityId: resume.id,
      description: `${req.user.name} saved a resume draft.`,
      metadata: {
        changedSections,
      },
    });

    res.status(201).json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (req, res, next) => {
  try {
    const resume = await findResumeByUser(req.user.id, req.workspace.id);

    res.json({
      success: true,
      resume: resume || {
        userId: req.user.id,
        workspaceId: req.workspace.id,
        data: emptyResume,
        template: 'modern',
      },
    });
  } catch (error) {
    next(error);
  }
};
