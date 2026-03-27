import {
  AddRounded,
  DeleteOutlineRounded,
  DownloadRounded,
  SaveRounded,
} from '@mui/icons-material';
import { Alert, Box, Button, Grid, IconButton, Stack, TextField } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';

import LoadingScreen from '../../components/LoadingScreen.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import AIModuleSuggestions from '../../components/ai/AIModuleSuggestions.jsx';
import { useAI } from '../../context/AIContext.jsx';
import resumeService from '../../services/resumeService.js';
import defaultResume from '../../utils/defaultResume.js';
import { getApiError } from '../../utils/formatters.js';
import ResumePreview from './ResumePreview.jsx';

const ResumeBuilderPage = () => {
  const [resume, setResume] = useState(defaultResume);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const previewRef = useRef(null);
  const { refreshAi } = useAI();

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await resumeService.getResume();
        setResume(response.resume?.data || defaultResume);
      } catch (fetchError) {
        setStatus({
          type: 'error',
          message: getApiError(fetchError, 'Unable to load saved resume.'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, []);

  const updatePersonalField = (field, value) => {
    setResume((previous) => ({
      ...previous,
      personal: {
        ...previous.personal,
        [field]: value,
      },
    }));
  };

  const updateExperience = (index, field, value) => {
    setResume((previous) => ({
      ...previous,
      experience: previous.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addExperience = () => {
    setResume((previous) => ({
      ...previous,
      experience: [
        ...previous.experience,
        {
          role: '',
          company: '',
          startDate: '',
          endDate: '',
          summary: '',
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    setResume((previous) => ({
      ...previous,
      experience: previous.experience.filter((_item, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      await resumeService.saveResume({ data: resume, template: 'modern' });
      setStatus({ type: 'success', message: 'Resume saved successfully.' });
      await refreshAi({ silent: true });
    } catch (saveError) {
      setStatus({ type: 'error', message: getApiError(saveError, 'Unable to save resume.') });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = async () => {
    if (!previewRef.current) {
      return;
    }

    setExporting(true);
    setStatus({ type: '', message: '' });

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('workyn-resume.pdf');
      setStatus({ type: 'success', message: 'PDF exported successfully.' });
    } catch (exportError) {
      setStatus({ type: 'error', message: getApiError(exportError, 'Unable to export PDF.') });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <LoadingScreen label="Loading resume builder..." />;
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Resume builder"
        title="Write and export polished resumes"
        subtitle="Edit your resume on the left and watch the preview update live on the right."
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<DownloadRounded />}
              onClick={handleExportPdf}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveRounded />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save resume'}
            </Button>
          </Stack>
        }
      />

      <AIModuleSuggestions
        module="resume"
        title="Resume AI suggestions"
        subtitle="Missing-section detection, skill hints, and export reminders"
      />

      {status.message ? (
        <Alert severity={status.type || 'info'} sx={{ mb: 3 }}>
          {status.message}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <SectionCard title="Resume form" subtitle="Personal details, skills, and experience">
            <Stack spacing={2.5}>
              <TextField
                label="Full name"
                value={resume.personal.fullName}
                onChange={(event) => updatePersonalField('fullName', event.target.value)}
                fullWidth
              />
              <TextField
                label="Title"
                value={resume.personal.title}
                onChange={(event) => updatePersonalField('title', event.target.value)}
                fullWidth
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    value={resume.personal.email}
                    onChange={(event) => updatePersonalField('email', event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    value={resume.personal.phone}
                    onChange={(event) => updatePersonalField('phone', event.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <TextField
                label="Professional summary"
                value={resume.personal.summary}
                onChange={(event) => updatePersonalField('summary', event.target.value)}
                fullWidth
                multiline
                minRows={4}
              />
              <TextField
                label="Skills"
                helperText="Use commas to separate skills."
                value={resume.skills.join(', ')}
                onChange={(event) =>
                  setResume((previous) => ({
                    ...previous,
                    skills: event.target.value
                      .split(',')
                      .map((skill) => skill.trim())
                      .filter(Boolean),
                  }))
                }
                fullWidth
              />

              <Stack spacing={2}>
                {resume.experience.map((item, index) => (
                  <Box
                    key={`experience-${index}`}
                    sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <strong>Experience {index + 1}</strong>
                      {resume.experience.length > 1 ? (
                        <IconButton color="error" onClick={() => removeExperience(index)}>
                          <DeleteOutlineRounded />
                        </IconButton>
                      ) : null}
                    </Stack>
                    <Stack spacing={2}>
                      <TextField
                        label="Role"
                        value={item.role}
                        onChange={(event) => updateExperience(index, 'role', event.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Company"
                        value={item.company}
                        onChange={(event) => updateExperience(index, 'company', event.target.value)}
                        fullWidth
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Start date"
                            value={item.startDate}
                            onChange={(event) =>
                              updateExperience(index, 'startDate', event.target.value)
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="End date"
                            value={item.endDate}
                            onChange={(event) =>
                              updateExperience(index, 'endDate', event.target.value)
                            }
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                      <TextField
                        label="Impact summary"
                        value={item.summary}
                        onChange={(event) => updateExperience(index, 'summary', event.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                      />
                    </Stack>
                  </Box>
                ))}
                <Button variant="outlined" startIcon={<AddRounded />} onClick={addExperience}>
                  Add experience
                </Button>
              </Stack>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard title="Live preview" subtitle="What your exported resume will look like">
            <div ref={previewRef}>
              <ResumePreview resume={resume} />
            </div>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResumeBuilderPage;
