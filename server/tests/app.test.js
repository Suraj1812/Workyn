import request from 'supertest';

import app from '../app.js';

describe('Workyn API', () => {
  test('returns a healthy response', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('validates registration input before persistence', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'invalid',
      password: '123',
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Validation failed.');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});
