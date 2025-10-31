import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/firebaseAuth';
import { Org } from '../models/Org';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/organizations
 * Get all organizations with active jobs
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const orgs = await Org.findAll();
    
    logger.info('Organizations fetched successfully', { count: orgs.length });
    
    res.json(orgs);
  } catch (error) {
    logger.error('Failed to fetch organizations', { error });
    res.status(500).json({ 
      error: 'Failed to fetch organizations',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * GET /api/organizations/:id
 * Get organization by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const org = await Org.findById(id);
    
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    logger.info('Organization fetched successfully', { orgId: id });
    
    res.json(org);
  } catch (error) {
    logger.error('Failed to fetch organization', { error, orgId: req.params.id });
    res.status(500).json({ 
      error: 'Failed to fetch organization',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;
