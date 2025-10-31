import { Router, Request, Response } from 'express';
import { OrgModel } from '../models/Org';
import { getFirestore } from '../config/firebase';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/organizations
 * Get all organizations
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('organizations').get();
    
    const orgs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
    
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
    
    const org = await OrgModel.findById(id);
    
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
