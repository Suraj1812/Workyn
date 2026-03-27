import { processUserAction } from '../ai-engine/services/behaviorTracker.js';
import {
  createPatient as createPatientRecord,
  findPatientByIdAndUser,
  listPatientsByUser,
  updatePatientByIdAndUser,
} from '../repositories/patientsRepository.js';

const getNextAppointmentDate = (appointments = []) =>
  appointments
    .map((appointment) => appointment.date)
    .filter(Boolean)
    .sort((left, right) => new Date(left) - new Date(right))[0] || null;

export const getPatients = async (req, res, next) => {
  try {
    const patients = await listPatientsByUser(req.user._id);
    res.json({ success: true, patients });
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
      name,
      age,
      history,
      appointments,
      createdBy: req.user._id,
    });

    await processUserAction({
      userId: req.user._id,
      module: 'clinic',
      actionType: 'clinic.patient_created',
      metadata: {
        patientId: patient._id.toString(),
        patient: {
          _id: patient._id.toString(),
          name: patient.name,
          history: patient.history,
          appointments: patient.appointments,
          nextAppointmentDate: getNextAppointmentDate(patient.appointments),
        },
      },
    });

    res.status(201).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const existingPatient = await findPatientByIdAndUser(req.params.id, req.user._id);

    if (!existingPatient) {
      res.status(404);
      throw new Error('Patient not found.');
    }

    const patient = await updatePatientByIdAndUser(req.params.id, req.user._id, req.body);

    const changedFields = Object.keys(req.body).filter(
      (field) => JSON.stringify(existingPatient[field]) !== JSON.stringify(patient[field]),
    );

    await processUserAction({
      userId: req.user._id,
      module: 'clinic',
      actionType: 'clinic.patient_updated',
      metadata: {
        patientId: patient._id.toString(),
        changedFields,
        patient: {
          _id: patient._id.toString(),
          name: patient.name,
          history: patient.history,
          appointments: patient.appointments,
          nextAppointmentDate: getNextAppointmentDate(patient.appointments),
        },
      },
    });

    res.json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};
