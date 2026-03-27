import { DeleteOutlineRounded, EditRounded, PlaylistAddRounded } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import crmService from '../../services/crmService.js';
import { formatDateTime, getApiError } from '../../utils/formatters.js';

const defaultLead = {
  name: '',
  status: 'New',
  notes: '',
};

const statuses = ['New', 'Contacted', 'Converted'];

const statusColors = {
  New: 'info',
  Contacted: 'warning',
  Converted: 'success',
};

const CrmPage = () => {
  const [leads, setLeads] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultLead);
  const [editingLead, setEditingLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { refreshAi } = useAI();

  const groupedLeads = useMemo(
    () =>
      statuses.reduce((accumulator, status) => {
        accumulator[status] = leads.filter((lead) => lead.status === status);
        return accumulator;
      }, {}),
    [leads],
  );

  const fetchLeads = async () => {
    try {
      const response = await crmService.getLeads();
      setLeads(response.leads || []);
    } catch (fetchError) {
      setError(getApiError(fetchError, 'Unable to load leads.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const openCreateDialog = () => {
    setEditingLead(null);
    setForm(defaultLead);
    setOpen(true);
  };

  const openEditDialog = (lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name,
      status: lead.status,
      notes: lead.notes,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      if (editingLead) {
        await crmService.updateLead(editingLead._id, form);
      } else {
        await crmService.createLead(form);
      }

      setOpen(false);
      setForm(defaultLead);
      setEditingLead(null);
      await fetchLeads();
      await refreshAi({ silent: true });
    } catch (submitError) {
      setError(getApiError(submitError, 'Unable to save lead.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (leadId) => {
    const confirmed = window.confirm('Delete this lead?');
    if (!confirmed) {
      return;
    }

    try {
      await crmService.deleteLead(leadId);
      await fetchLeads();
      await refreshAi({ silent: true });
    } catch (deleteError) {
      setError(getApiError(deleteError, 'Unable to delete lead.'));
    }
  };

  if (loading) {
    return <LoadingScreen label="Loading CRM..." />;
  }

  return (
    <Box>
      <PageHeader
        eyebrow="CRM"
        title="Manage your pipeline"
        subtitle="Capture leads, track their status, and keep notes close to every opportunity."
        action={
          <Button variant="contained" startIcon={<PlaylistAddRounded />} onClick={openCreateDialog}>
            Add lead
          </Button>
        }
      />

      <AIModuleSuggestions
        module="crm"
        title="CRM AI suggestions"
        subtitle="Follow-up reminders, automation ideas, and bulk-action hints"
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      {!leads.length ? (
        <EmptyState
          title="No leads yet"
          description="Create your first lead to start building a simple but useful sales pipeline."
          actionLabel="Add lead"
          onAction={openCreateDialog}
        />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SectionCard title="Lead table" subtitle="Edit records and review pipeline detail">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead._id} hover>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>
                        <Chip label={lead.status} color={statusColors[lead.status]} size="small" />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>{lead.notes || 'No notes'}</TableCell>
                      <TableCell>{formatDateTime(lead.updatedAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => openEditDialog(lead)}>
                          <EditRounded />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(lead._id)}>
                          <DeleteOutlineRounded />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </Grid>

          {statuses.map((status) => (
            <Grid item xs={12} md={4} key={status}>
              <SectionCard title={status} subtitle={`${groupedLeads[status].length} lead(s)`}>
                <Stack spacing={1.5}>
                  {groupedLeads[status].length ? (
                    groupedLeads[status].map((lead) => (
                      <Box
                        key={lead._id}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                          {lead.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {lead.notes || 'No notes added yet.'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Updated {formatDateTime(lead.updatedAt)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography color="text.secondary">No leads in this stage.</Typography>
                  )}
                </Stack>
              </SectionCard>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingLead ? 'Edit lead' : 'Add lead'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Lead name"
              value={form.name}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, name: event.target.value }))
              }
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, status: event.target.value }))
              }
              fullWidth
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Notes"
              value={form.notes}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, notes: event.target.value }))
              }
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : editingLead ? 'Update lead' : 'Create lead'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CrmPage;
