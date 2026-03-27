import { AddRounded, DeleteOutlineRounded, EditRounded } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import EmptyState from '../../components/EmptyState.jsx';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import AIModuleSuggestions from '../../components/ai/AIModuleSuggestions.jsx';
import { useAI } from '../../context/AIContext.jsx';
import clinicService from '../../services/clinicService.js';
import { formatDateTime, getApiError } from '../../utils/formatters.js';

const createDefaultAppointment = () => ({
  date: '',
  doctor: '',
  notes: '',
  status: 'Scheduled',
});

const createDefaultPatient = () => ({
  name: '',
  age: '',
  history: '',
  appointments: [createDefaultAppointment()],
});

const ClinicPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState(createDefaultPatient);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { refreshAi } = useAI();

  const upcomingAppointments = useMemo(
    () =>
      patients
        .flatMap((patient) =>
          patient.appointments.map((appointment, index) => ({
            ...appointment,
            patientName: patient.name,
            key: `${patient._id}-${index}`,
          })),
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 6),
    [patients],
  );

  const fetchPatients = async () => {
    try {
      const response = await clinicService.getPatients();
      setPatients(response.patients || []);
    } catch (fetchError) {
      setError(getApiError(fetchError, 'Unable to load patients.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const openCreateDialog = () => {
    setEditingPatient(null);
    setForm(createDefaultPatient());
    setOpen(true);
  };

  const openEditDialog = (patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name,
      age: patient.age,
      history: patient.history,
      appointments:
        patient.appointments.length > 0
          ? patient.appointments.map((appointment) => ({
              date: appointment.date?.slice?.(0, 16) || '',
              doctor: appointment.doctor,
              notes: appointment.notes,
              status: appointment.status,
            }))
          : [createDefaultAppointment()],
    });
    setOpen(true);
  };

  const updateAppointment = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      appointments: previous.appointments.map((appointment, appointmentIndex) =>
        appointmentIndex === index ? { ...appointment, [field]: value } : appointment,
      ),
    }));
  };

  const addAppointment = () => {
    setForm((previous) => ({
      ...previous,
      appointments: [...previous.appointments, createDefaultAppointment()],
    }));
  };

  const removeAppointment = (index) => {
    setForm((previous) => ({
      ...previous,
      appointments: previous.appointments.filter(
        (_appointment, appointmentIndex) => appointmentIndex !== index,
      ),
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        age: Number(form.age),
        appointments: form.appointments.filter((appointment) => appointment.date),
      };

      if (editingPatient) {
        await clinicService.updatePatient(editingPatient._id, payload);
      } else {
        await clinicService.createPatient(payload);
      }

      setOpen(false);
      setForm(createDefaultPatient());
      setEditingPatient(null);
      await fetchPatients();
      await refreshAi({ silent: true });
    } catch (submitError) {
      setError(getApiError(submitError, 'Unable to save patient.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen label="Loading clinic workspace..." />;
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Clinic"
        title="Manage patients and appointments"
        subtitle="Capture clinical history, maintain patient records, and keep upcoming visits visible."
        action={
          <Button variant="contained" startIcon={<AddRounded />} onClick={openCreateDialog}>
            Add patient
          </Button>
        }
      />

      <AIModuleSuggestions
        module="clinic"
        title="Clinic AI suggestions"
        subtitle="Appointment reminders, frequent-patient alerts, and missing-info checks"
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      {!patients.length ? (
        <EmptyState
          title="No patients yet"
          description="Add your first patient record and schedule appointments from one shared form."
          actionLabel="Add patient"
          onAction={openCreateDialog}
        />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <SectionCard title="Patient records" subtitle="Basic history and appointment overview">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>History</TableCell>
                    <TableCell>Appointments</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient._id} hover>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        {patient.history || 'No history'}
                      </TableCell>
                      <TableCell>{patient.appointments.length}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => openEditDialog(patient)}>
                          <EditRounded />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </Grid>

          <Grid item xs={12} lg={4}>
            <SectionCard title="Upcoming appointments" subtitle="The next scheduled visits">
              <Stack spacing={1.5}>
                {upcomingAppointments.length ? (
                  upcomingAppointments.map((appointment) => (
                    <Box
                      key={appointment.key}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {appointment.patientName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {appointment.doctor || 'Assigned clinician'}
                      </Typography>
                      <Typography variant="body2">{formatDateTime(appointment.date)}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    Upcoming appointments will appear here when you add them to patient records.
                  </Typography>
                )}
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingPatient ? 'Edit patient' : 'Add patient'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Patient name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, name: event.target.value }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Age"
                  type="number"
                  value={form.age}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, age: event.target.value }))
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField
              label="History"
              value={form.history}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, history: event.target.value }))
              }
              multiline
              minRows={4}
              fullWidth
            />

            <Stack spacing={2}>
              {form.appointments.map((appointment, index) => (
                <Box
                  key={`appointment-${index}`}
                  sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <strong>Appointment {index + 1}</strong>
                    {form.appointments.length > 1 ? (
                      <IconButton color="error" onClick={() => removeAppointment(index)}>
                        <DeleteOutlineRounded />
                      </IconButton>
                    ) : null}
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Date and time"
                        type="datetime-local"
                        value={appointment.date}
                        onChange={(event) => updateAppointment(index, 'date', event.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Doctor"
                        value={appointment.doctor}
                        onChange={(event) => updateAppointment(index, 'doctor', event.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Status"
                        value={appointment.status}
                        onChange={(event) => updateAppointment(index, 'status', event.target.value)}
                        fullWidth
                      >
                        {['Scheduled', 'Completed', 'Cancelled'].map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Appointment notes"
                        value={appointment.notes}
                        onChange={(event) => updateAppointment(index, 'notes', event.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button variant="outlined" startIcon={<AddRounded />} onClick={addAppointment}>
                Add appointment
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : editingPatient ? 'Update patient' : 'Create patient'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClinicPage;
