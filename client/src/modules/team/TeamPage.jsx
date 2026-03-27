import { PersonAddRounded, SwapHorizRounded } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
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
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import PageHeader from '../../components/PageHeader.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import Seo from '../../components/Seo.jsx';
import MotionSection from '../../components/feedback/MotionSection.jsx';
import PageSkeleton from '../../components/feedback/PageSkeleton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import workspaceService from '../../services/workspaceService.js';
import { formatDateTime, getApiError } from '../../utils/formatters.js';

const TeamPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [workspaceData, setWorkspaceData] = useState(null);
  const [form, setForm] = useState({ email: '', role: 'member' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inviteToken = searchParams.get('inviteToken');
  const isAdmin = user?.workspaceRole === 'admin';
  const isPro = user?.currentWorkspace?.plan === 'pro';

  const fetchWorkspace = async () => {
    try {
      const response = await workspaceService.getWorkspace();
      setWorkspaceData(response);
    } catch (fetchError) {
      setError(getApiError(fetchError, 'Unable to load workspace details.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  useEffect(() => {
    const acceptInvite = async () => {
      if (!inviteToken) {
        return;
      }

      try {
        await workspaceService.acceptInvite(inviteToken);
        await refreshUser();
        await fetchWorkspace();
        showToast({
          severity: 'success',
          message: 'Workspace invitation accepted.',
        });
        navigate('/team', { replace: true });
      } catch (acceptError) {
        setError(getApiError(acceptError, 'Unable to accept the invitation.'));
      }
    };

    acceptInvite();
  }, [inviteToken]);

  const handleInvite = async () => {
    setSubmitting(true);
    setError('');

    try {
      const response = await workspaceService.inviteMember(form);
      showToast({
        severity: 'success',
        message: response.invitation
          ? `Invitation created for ${response.invitation.email}.`
          : 'Invitation created.',
      });
      setForm({ email: '', role: 'member' });
      await fetchWorkspace();
    } catch (submitError) {
      setError(getApiError(submitError, 'Unable to invite teammate.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchWorkspace = async (workspaceId) => {
    try {
      await workspaceService.switchWorkspace(workspaceId);
      await refreshUser();
      await fetchWorkspace();
      showToast({
        severity: 'success',
        message: 'Workspace switched successfully.',
      });
    } catch (switchError) {
      setError(getApiError(switchError, 'Unable to switch workspace.'));
    }
  };

  if (loading) {
    return (
      <>
        <Seo
          title="Team Collaboration"
          description="Manage workspace members, invitations, roles, and collaboration controls inside Workyn."
          path="/team"
          robots="noindex, nofollow, noarchive"
        />
        <PageSkeleton cards={3} />
      </>
    );
  }

  return (
    <Box>
      <Seo
        title="Team Collaboration"
        description="Manage workspace members, invitations, roles, and collaboration controls inside Workyn."
        path="/team"
        robots="noindex, nofollow, noarchive"
      />
      <PageHeader
        eyebrow="Team"
        title="Collaborate across shared workspaces"
        subtitle="Manage members, invitations, and workspace switching from one place."
      />

      {error ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      {!isPro ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Team collaboration and invitations are available on the Pro plan.
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <MotionSection>
            <SectionCard
              title="Workspace switcher"
              subtitle="Move between workspaces you belong to"
            >
              <TextField
                select
                fullWidth
                label="Current workspace"
                value={user?.currentWorkspace?.id || ''}
                onChange={(event) => handleSwitchWorkspace(event.target.value)}
              >
                {(user?.memberships || []).map((membership) => (
                  <MenuItem key={membership.workspace.id} value={membership.workspace.id}>
                    {membership.workspace.name} • {membership.role}
                  </MenuItem>
                ))}
              </TextField>
            </SectionCard>
          </MotionSection>
        </Grid>
        <Grid item xs={12} lg={8}>
          <MotionSection delay={0.05}>
            <SectionCard
              title="Invite teammates"
              subtitle="Bring collaborators into your current workspace"
              action={
                <Button
                  variant="contained"
                  startIcon={<PersonAddRounded />}
                  onClick={handleInvite}
                  disabled={!isAdmin || !isPro || submitting}
                >
                  {submitting ? 'Inviting...' : 'Send invite'}
                </Button>
              }
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Invite email"
                    fullWidth
                    value={form.email}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, email: event.target.value }))
                    }
                    disabled={!isAdmin || !isPro}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Role"
                    fullWidth
                    value={form.role}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, role: event.target.value }))
                    }
                    disabled={!isAdmin || !isPro}
                  >
                    <MenuItem value="member">Member</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </SectionCard>
          </MotionSection>
        </Grid>
        <Grid item xs={12} lg={7}>
          <MotionSection delay={0.1}>
            <SectionCard title="Members" subtitle="People active in this workspace">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(workspaceData?.members || []).map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar src={member.user?.avatarUrl || undefined}>
                            {member.user?.name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{member.user?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.user?.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <Chip size="small" label={member.status} color="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </MotionSection>
        </Grid>
        <Grid item xs={12} lg={5}>
          <MotionSection delay={0.15}>
            <SectionCard title="Pending invitations" subtitle="Outstanding email invites">
              <Stack spacing={1.5}>
                {(workspaceData?.invitations || []).slice(0, 8).map((invitation) => (
                  <Box
                    key={invitation.id}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="subtitle2">{invitation.email}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {invitation.role} • {invitation.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Invited {formatDateTime(invitation.createdAt)}
                    </Typography>
                  </Box>
                ))}
                {!workspaceData?.invitations?.length ? (
                  <Typography color="text.secondary">No pending invitations.</Typography>
                ) : null}
              </Stack>
            </SectionCard>
          </MotionSection>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeamPage;
