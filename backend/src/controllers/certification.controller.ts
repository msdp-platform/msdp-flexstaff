import { Response } from 'express';
import { WorkerCertification } from '../models/WorkerCertification';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// Get all certifications for a worker
export const getCertifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.params.workerId || req.query.workerId;

    if (!workerId) {
      throw new AppError('Worker ID is required', 400);
    }

    const certifications = await WorkerCertification.findAll({
      where: { workerId },
      order: [['createdAt', 'DESC']],
    });

    res.json({ certifications });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch certifications' });
    }
  }
};

// Create new certification
export const createCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      workerId,
      certificationName,
      issuingAuthority,
      issueDate,
      expiryDate,
      documentUrl,
    } = req.body;

    if (!workerId || !certificationName) {
      throw new AppError('Worker ID and certification name are required', 400);
    }

    const certification = await WorkerCertification.create({
      workerId,
      certificationName,
      issuingAuthority,
      issueDate,
      expiryDate,
      documentUrl,
      verificationStatus: 'pending',
    });

    res.status(201).json({
      message: 'Certification created successfully',
      certification,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create certification' });
    }
  }
};

// Update certification
export const updateCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      certificationName,
      issuingAuthority,
      issueDate,
      expiryDate,
      documentUrl,
    } = req.body;

    const certification = await WorkerCertification.findByPk(id);

    if (!certification) {
      throw new AppError('Certification not found', 404);
    }

    await certification.update({
      certificationName,
      issuingAuthority,
      issueDate,
      expiryDate,
      documentUrl,
    });

    res.json({
      message: 'Certification updated successfully',
      certification,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update certification' });
    }
  }
};

// Delete certification
export const deleteCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const certification = await WorkerCertification.findByPk(id);

    if (!certification) {
      throw new AppError('Certification not found', 404);
    }

    await certification.destroy();

    res.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete certification' });
    }
  }
};

// Verify certification (admin only)
export const verifyCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      throw new AppError('Invalid verification status', 400);
    }

    const certification = await WorkerCertification.findByPk(id);

    if (!certification) {
      throw new AppError('Certification not found', 404);
    }

    await certification.update({
      verificationStatus: status,
    });

    res.json({
      message: `Certification ${status} successfully`,
      certification,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to verify certification' });
    }
  }
};
