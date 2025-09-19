const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});

const upload = multer({ 
  storage, 
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Solo imágenes'), false);
    cb(null, true);
  }
});

// ======================
// PUBLIC ROUTES
// ======================
router.get('/', campaignController.list);

// IMPORTANTE: esta ruta debe ir **antes** de router.get('/:id')
router.get('/:id/donations', authMiddleware, allowRoles('admin','organizacion'), campaignController.getDonations);

router.get('/:id', campaignController.get);

// ======================
// PROTECTED ROUTES
// ======================
router.post('/', authMiddleware, allowRoles('admin','organizacion'), upload.single('imagen'), campaignController.create);
router.put('/:id', authMiddleware, allowRoles('admin','organizacion'), upload.single('imagen'), campaignController.update);
router.delete('/:id', authMiddleware, allowRoles('admin','organizacion'), campaignController.remove);

module.exports = router;