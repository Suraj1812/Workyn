import { CloudUploadRounded, SaveRounded } from '@mui/icons-material';
import { Alert, Avatar, Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import PageHeader from '../../components/PageHeader.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import Seo from '../../components/Seo.jsx';
import MotionSection from '../../components/feedback/MotionSection.jsx';
import PageSkeleton from '../../components/feedback/PageSkeleton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import uploadService from '../../services/uploadService.js';
import workspaceService from '../../services/workspaceService.js';
import { getApiError } from '../../utils/formatters.js';

const SettingsPage = () => {
  const fileInputRef = useRef(null);
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [workspaceForm, setWorkspaceForm] = useState({ name: '', billingEmail: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await workspaceService.getWorkspace();
        setWorkspaceForm({
          name: response.workspace?.name || '',
          billingEmail: response.workspace?.billingEmail || '',
        });
      } catch (fetchError) {
        setError(getApiError(fetchError, 'Unable to load workspace settings.'));
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, []);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      await uploadService.uploadFile({
        file,
        module: 'profile',
      });
      await refreshUser();
      showToast({
        severity: 'success',
        message: 'Profile image updated.',
      });
    } catch (uploadError) {
      setError(getApiError(uploadError, 'Unable to upload profile image.'));
    }
  };

  const handleWorkspaceSave = async () => {
    setSaving(true);
    setError('');

    try {
      await workspaceService.updateWorkspace(workspaceForm);
      await refreshUser();
      showToast({
        severity: 'success',
        message: 'Workspace settings updated.',
      });
    } catch (saveError) {
      setError(getApiError(saveError, 'Unable to update workspace settings.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Seo
          title="Settings"
          description="Update profile assets, workspace metadata, and account settings inside Workyn."
          path="/settings"
          robots="noindex, nofollow, noarchive"
        />
        <PageSkeleton cards={2} />
      </>
    );
  }

  return (
    <Box>
      <Seo
        title="Settings"
        description="Update profile assets, workspace metadata, and account settings inside Workyn."
        path="/settings"
        robots="noindex, nofollow, noarchive"
      />
      <PageHeader
        eyebrow="Settings"
        title="Secure your profile and workspace"
        subtitle="Manage profile assets, workspace metadata, and production-focused account settings."
      />

      {error ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <MotionSection>
            <SectionCard title="Profile" subtitle="Identity and access details">
              <Stack spacing={2} alignItems="flex-start">
                <Avatar
                  src={user?.avatarUrl || undefined}
                  sx={{ width: 88, height: 88, bgcolor: 'primary.main' }}
                >
                  {user?.name?.[0] || 'W'}
                </Avatar>
                <Typography variant="subtitle1">{user?.name}</Typography>
                <Typography color="text.secondary">{user?.email}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Role: {user?.workspaceRole}
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadRounded />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={user?.currentWorkspace?.plan !== 'pro'}
                >
                  Upload profile image
                </Button>
              </Stack>
            </SectionCard>
          </MotionSection>
        </Grid>
        <Grid item xs={12} lg={8}>
          <MotionSection delay={0.05}>
            <SectionCard
              title="Workspace settings"
              subtitle="Shared branding and billing contact details"
              action={
                <Button
                  variant="contained"
                  startIcon={<SaveRounded />}
                  onClick={handleWorkspaceSave}
                  disabled={saving || user?.workspaceRole !== 'admin'}
                >
                  {saving ? 'Saving...' : 'Save settings'}
                </Button>
              }
            >
              <Stack spacing={2}>
                <TextField
                  label="Workspace name"
                  value={workspaceForm.name}
                  onChange={(event) =>
                    setWorkspaceForm((previous) => ({ ...previous, name: event.target.value }))
                  }
                  fullWidth
                  disabled={user?.workspaceRole !== 'admin'}
                />
                <TextField
                  label="Billing email"
                  value={workspaceForm.billingEmail}
                  onChange={(event) =>
                    setWorkspaceForm((previous) => ({
                      ...previous,
                      billingEmail: event.target.value,
                    }))
                  }
                  fullWidth
                  disabled={user?.workspaceRole !== 'admin'}
                />
              </Stack>
            </SectionCard>
          </MotionSection>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
