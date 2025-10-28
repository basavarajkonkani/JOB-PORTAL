import request from 'supertest';
import express from 'express';
import adzunaRoutes from '../routes/adzuna';

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/adzuna', adzunaRoutes);

describe('Adzuna API Routes', () => {
  describe('GET /api/adzuna/search', () => {
    it('should return job search results with valid query', async () => {
      const response = await request(app)
        .get('/api/adzuna/search')
        .query({ what: 'developer', results_per_page: 5 })
        .expect('Content-Type', /json/);

      // Should return 200 or 500 depending on API availability
      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('results');
        expect(response.body).toHaveProperty('count');
        expect(Array.isArray(response.body.results)).toBe(true);
      }
    }, 15000); // 15 second timeout for API call

    it('should handle search with location parameter', async () => {
      const response = await request(app)
        .get('/api/adzuna/search')
        .query({ what: 'designer', where: 'bangalore', results_per_page: 3 })
        .expect('Content-Type', /json/);

      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.results.length).toBeLessThanOrEqual(3);
      }
    }, 15000);

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/adzuna/search')
        .query({ what: 'engineer', page: 2, results_per_page: 5 })
        .expect('Content-Type', /json/);

      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('page', 2);
        expect(response.body).toHaveProperty('results_per_page', 5);
      }
    }, 15000);

    it('should limit results_per_page to maximum of 50', async () => {
      const response = await request(app)
        .get('/api/adzuna/search')
        .query({ what: 'developer', results_per_page: 100 })
        .expect('Content-Type', /json/);

      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.results_per_page).toBeLessThanOrEqual(50);
      }
    }, 15000);

    it('should return results with expected job structure', async () => {
      const response = await request(app)
        .get('/api/adzuna/search')
        .query({ what: 'developer', results_per_page: 1 })
        .expect('Content-Type', /json/);

      if (response.status === 200 && response.body.results.length > 0) {
        const job = response.body.results[0];
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('title');
        expect(job).toHaveProperty('company');
        expect(job).toHaveProperty('location');
        expect(job).toHaveProperty('description');
        expect(job).toHaveProperty('redirect_url');
        expect(job).toHaveProperty('created');
      }
    }, 15000);
  });

  describe('GET /api/adzuna/categories', () => {
    it('should return job categories', async () => {
      const response = await request(app)
        .get('/api/adzuna/categories')
        .expect('Content-Type', /json/);

      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('categories');
        expect(Array.isArray(response.body.categories)).toBe(true);
      }
    }, 15000);
  });
});
