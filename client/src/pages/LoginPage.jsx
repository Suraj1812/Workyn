import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useAuth } from '../context/AuthContext.jsx';
import { getApiError } from '../utils/formatters.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (submitError) {
      setError(getApiError(submitError, 'Unable to sign in.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Sign in to Workyn
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Pick up your workflows right where you left them.
      </Typography>

      <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
        {error ? <Alert severity="error">{error}</Alert> : null}
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
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Login'}
        </Button>
      </Stack>

      <Typography sx={{ mt: 3 }} color="text.secondary">
        New here? <Link to="/register">Create an account</Link>
      </Typography>
    </Box>
  );
};

export default LoginPage;
