import { processUserAction } from '../ai-engine/services/behaviorTracker.js';
import {
  createLead as createLeadRecord,
  countLeadsByWorkspace,
  deleteLeadByIdAndUser,
  findLeadByIdAndUser,
  listLeadsByWorkspace,
  updateLeadByIdAndUser,
} from '../repositories/leadsRepository.js';
import { recordActivity } from '../services/activityService.js';
import { sendNotification } from '../services/notificationService.js';

export const getLeads = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 25);
    const filters = {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      status: req.query.status,
      search: req.query.search,
      assignedTo: req.query.assignedTo,
      includeMineOnly: req.query.mine === true || req.query.mine === 'true',
      limit,
      offset: (page - 1) * limit,
    };

    const [leads, total] = await Promise.all([
      listLeadsByWorkspace(filters),
      countLeadsByWorkspace(filters),
    ]);

    res.json({
      success: true,
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
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
      workspaceId: req.workspace.id,
      name,
      status,
      notes,
      assignedTo: req.body.assignedTo,
      followUpAt: req.body.followUpAt,
      createdBy: req.user.id,
    });

    await processUserAction({
      userId: req.user.id,
      workspaceId: req.workspace.id,
      module: 'crm',
      actionType: 'crm.lead_created',
      metadata: {
        leadId: lead.id,
        leadName: lead.name,
        status: lead.status,
        notesLength: lead.notes?.length || 0,
      },
    });

    await recordActivity({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: 'crm',
      action: 'crm.lead_created',
      entityType: 'lead',
      entityId: lead.id,
      description: `${req.user.name} added lead ${lead.name}.`,
      metadata: {
        status: lead.status,
      },
    });

    if (lead.assignedTo && lead.assignedTo !== req.user.id) {
      await sendNotification({
        io: req.app.get('io'),
        workspaceId: req.workspace.id,
        userId: lead.assignedTo,
        type: 'lead_assigned',
        title: 'New lead assigned',
        message: `${lead.name} was assigned to you.`,
        link: '/crm',
        metadata: {
          leadId: lead.id,
        },
      });
    }

    res.status(201).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const existingLead = await findLeadByIdAndUser(req.params.id, req.user.id, req.workspace.id);

    if (!existingLead) {
      res.status(404);
      throw new Error('Lead not found.');
    }

    const lead = await updateLeadByIdAndUser(
      req.params.id,
      req.user.id,
      req.body,
      req.workspace.id,
    );

    const changedFields = Object.keys(req.body).filter(
      (field) => JSON.stringify(existingLead[field]) !== JSON.stringify(lead[field]),
    );

    await processUserAction({
      userId: req.user.id,
      workspaceId: req.workspace.id,
      module: 'crm',
      actionType: 'crm.lead_updated',
      metadata: {
        leadId: lead.id,
        leadName: lead.name,
        status: lead.status,
        changedFields,
      },
    });

    await recordActivity({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: 'crm',
      action: 'crm.lead_updated',
      entityType: 'lead',
      entityId: lead.id,
      description: `${req.user.name} updated lead ${lead.name}.`,
      metadata: {
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
    const lead = await deleteLeadByIdAndUser(req.params.id, req.user.id, req.workspace.id);

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found.');
    }

    await recordActivity({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: 'crm',
      action: 'crm.lead_deleted',
      entityType: 'lead',
      entityId: lead.id,
      description: `${req.user.name} deleted lead ${lead.name}.`,
    });

    res.json({ success: true, message: 'Lead deleted.' });
  } catch (error) {
    next(error);
  }
};
