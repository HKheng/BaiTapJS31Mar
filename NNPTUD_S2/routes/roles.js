const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  next();
};
router.post('/', checkAdmin, async function (req, res, next) {
  try {
    let body = req.body;
    if (!body.name) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    let newRole = new roleSchema({ name: body.name });
    await newRole.save();
    
    res.status(201).json({ success: true, data: newRole });
  } catch (error) {
    next(error);
  }
});
const { body, validationResult } = require('express-validator');

router.post(
  '/',
  checkAdmin,
  [body('name').notEmpty().withMessage('Role name is required')],
  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      let body = req.body;
      let newRole = new roleSchema({ name: body.name });
      await newRole.save();

      res.status(201).json({ success: true, data: newRole });
    } catch (error) {
      next(error);
    }
  }
);
router.put('/:id', checkAdmin, async function (req, res, next) {
  try {
    let { id } = req.params;
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    let updatedRole = await roleSchema.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedRole) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    res.json({ success: true, data: updatedRole });
  } catch (error) {
    next(error);
  }
});
router.delete('/:id', checkAdmin, async function (req, res, next) {
  try {
    let { id } = req.params;
    let deletedRole = await roleSchema.findByIdAndDelete(id);

    if (!deletedRole) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    next(error);
  }
});