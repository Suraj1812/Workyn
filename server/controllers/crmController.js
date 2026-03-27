import { processUserAction } from '../ai-engine/services/behaviorTracker.js';
import {
  createLead as createLeadRecord,
  deleteLeadByIdAndUser,
  findLeadByIdAndUser,
  listLeadsByUser,
  updateLeadByIdAndUser,
} from '../repositories/leadsRepository.js';

export const getLeads = async (req, res, next) => {
  try {
    const leads = await listLeadsByUser(req.user._id);
    res.json({ success: true, leads });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const { name, status = 'New', notes = '' } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Lead name is required.');
    }

    const lead = await createLeadRecord({
      name,
      status,
      notes,
      createdBy: req.user._id,
    });

    await processUserAction({
      userId: req.user._id,
      module: 'crm',
      actionType: 'crm.lead_created',
      metadata: {
        leadId: lead._id.toString(),
        leadName: lead.name,
        status: lead.status,
        notesLength: lead.notes?.length || 0,
      },
    });

    res.status(201).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const existingLead = await findLeadByIdAndUser(req.params.id, req.user._id);

    if (!existingLead) {
      res.status(404);
      throw new Error('Lead not found.');
    }

    const lead = await updateLeadByIdAndUser(req.params.id, req.user._id, req.body);

    const changedFields = Object.keys(req.body).filter(
      (field) => JSON.stringify(existingLead[field]) !== JSON.stringify(lead[field]),
    );

    await processUserAction({
      userId: req.user._id,
      module: 'crm',
      actionType: 'crm.lead_updated',
      metadata: {
        leadId: lead._id.toString(),
        leadName: lead.name,
        status: lead.status,
        changedFields,
      },
    });

    res.json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const lead = await deleteLeadByIdAndUser(req.params.id, req.user._id);

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found.');
    }

    res.json({ success: true, message: 'Lead deleted.' });
  } catch (error) {
    next(error);
  }
};
