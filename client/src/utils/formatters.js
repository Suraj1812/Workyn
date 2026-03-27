export const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'N/A';

export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
      }).format(new Date(value))
    : 'N/A';

export const getApiError = (error, fallbackMessage = 'Something went wrong.') =>
  error?.response?.data?.message || error?.message || fallbackMessage;
