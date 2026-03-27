import { processUserAction } from '../ai-engine/services/behaviorTracker.js';
import {
  countPatientsByWorkspace,
  createPatient as createPatientRecord,
  findPatientByIdAndUser,
  listPatientsByWorkspace,
  updatePatientByIdAndUser,
} from '../repositories/patientsRepository.js';
import { recordActivity } from '../services/activityService.js';

const getNextAppointmentDate = (appointments = []) =>
  appointments
    .map((appointment) => appointment.date)
    .filter(Boolean)
    .sort((left, right) => new Date(left) - new Date(right))[0] || null;

export const getPatients = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 25);
    const filters = {
      workspaceId: req.workspace.id,
      userId: req.user.id,
      search: req.query.search,
      includeMineOnly: req.query.mine === true || req.query.mine === 'true',
      limit,
      offset: (page - 1) * limit,
    };

    const [patients, total] = await Promise.all([
      listPatientsByWorkspace(filters),
      countPatientsByWorkspace(filters),
    ]);

    res.json({
      success: true,
      patients,
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

export const createPatient = async (req, res, next) => {
  try {
    const { name, age, history = '', appointments = [] } = req.body;

    if (!name || age === undefined) {
      res.status(400);
      throw new Error('Patient name and age are required.');
    }

    const patient = await createPatientRecord({
      workspaceId: req.workspace.id,
      name,
      age,
      history,
      appointments,
      createdBy: req.user.id,
    });

    await processUserAction({
      userId: req.user.id,
      workspaceId: req.workspace.id,
      module: 'clinic',
      actionType: 'clinic.patient_created',
      metadata: {
        patientId: patient.id,
        patient: {
          _id: patient.id,
          name: patient.name,
          history: patient.history,
          appointments: patient.appointments,
          nextAppointmentDate: getNextAppointmentDate(patient.appointments),
        },
      },
    });

    await recordActivity({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: 'clinic',
      action: 'clinic.patient_created',
      entityType: 'patient',
      entityId: patient.id,
      description: `${req.user.name} created patient ${patient.name}.`,
    });

    res.status(201).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const existingPatient = await findPatientByIdAndUser(
      req.params.id,
      req.user.id,
      req.workspace.id,
    );

    if (!existingPatient) {
      res.status(404);
      throw new Error('Patient not found.');
    }

    const patient = await updatePatientByIdAndUser(
      req.params.id,
      req.user.id,
      req.body,
      req.workspace.id,
    );

    const changedFields = Object.keys(req.body).filter(
      (field) => JSON.stringify(existingPatient[field]) !== JSON.stringify(patient[field]),
    );

    await processUserAction({
      userId: req.user.id,
      workspaceId: req.workspace.id,
      module: 'clinic',
      actionType: 'clinic.patient_updated',
      metadata: {
        patientId: patient.id,
        changedFields,
        patient: {
          _id: patient.id,
          name: patient.name,
          history: patient.history,
          appointments: patient.appointments,
          nextAppointmentDate: getNextAppointmentDate(patient.appointments),
        },
      },
    });

    await recordActivity({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: 'clinic',
      action: 'clinic.patient_updated',
      entityType: 'patient',
      entityId: patient.id,
      description: `${req.user.name} updated patient ${patient.name}.`,
      metadata: {
        changedFields,
      },
    });

    res.json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};
