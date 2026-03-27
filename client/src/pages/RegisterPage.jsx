import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';

import Seo from '../components/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import workspaceService from '../services/workspaceService.js';
import { getApiError } from '../utils/formatters.js';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await register(form);
      const inviteToken = searchParams.get('inviteToken');
      if (inviteToken) {
        await workspaceService.acceptInvite(inviteToken);
      }

      const redirectTo = location.state?.from
        ? `${location.state.from.pathname}${location.state.from.search || ''}`
        : inviteToken
          ? '/team'
          : '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(getApiError(submitError, 'Unable to create account.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Seo
        title="Create Account"
        description="Create a Workyn workspace to manage team chat, CRM, resume workflows, clinic operations, automation, and analytics in one place."
        path="/register"
        robots="noindex, nofollow, noarchive"
      />
      <Typography variant="h4" sx={{ mb: 1 }}>
        Create your Workyn workspace
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Launch a unified control center for conversations, clients, talent, and care.
      </Typography>
      {searchParams.get('inviteToken') ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Create your account to join the invited workspace.
        </Alert>
      ) : null}

      <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="Full name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
          fullWidth
          helperText="Use a strong password in production."
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </Button>
      </Stack>

      <Typography sx={{ mt: 3 }} color="text.secondary">
        Already have an account? <Link to="/login">Sign in</Link>
      </Typography>
    </Box>
  );
};

export default RegisterPage;
