// const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('../../config/param-validation');
// const userCtrl = require('./group_session_controller');

// const router = express.Router();
// router.route('/')

//   /** POST /api/users - Create new user */
//   .post(validate(paramValidation.createUser), userCtrl.create);

// router.route('/:userId')
//   /** GET /api/users/:userId - Get user */
//   .get(userCtrl.get)

//   /** PUT /api/users/:userId - Update user */
//   .put(validate(paramValidation.updateUser), userCtrl.update)

//   /** DELETE /api/users/:userId - Delete user */
//   .delete(userCtrl.remove);

// /** Load user when API with userId route parameter is hit */
// router.param('userId', userCtrl.load);

// module.exports = router;

