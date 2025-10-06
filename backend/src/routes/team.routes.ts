import { Router } from 'express';
import {
  addWorkerToTeam,
  removeWorkerFromTeam,
  updateTeamMember,
  getMyTeam,
  getWorkerTeams,
  checkTeamMembership,
} from '../controllers/team.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.post('/', authenticate, authorize(UserRole.EMPLOYER), addWorkerToTeam);
router.delete('/:id', authenticate, authorize(UserRole.EMPLOYER), removeWorkerFromTeam);
router.put('/:id', authenticate, authorize(UserRole.EMPLOYER), updateTeamMember);
router.get('/my-team', authenticate, authorize(UserRole.EMPLOYER), getMyTeam);
router.get('/my-teams', authenticate, authorize(UserRole.WORKER), getWorkerTeams);
router.get('/check', checkTeamMembership);

export default router;
