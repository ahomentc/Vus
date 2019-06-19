/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User schema
 */

const GroupSessionSchema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  hashed_password: { type: String, default: '' },
  salt: { type: String, default: '' }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */

GroupSessionSchema.method({});

/**
 * Statics
 */

// GroupSessionSchema.static({
// 	 /**
//    * Get user
//    * @param {ObjectId} id - The objectId of user.
//    * @returns {Promise<User, APIError>}
//    */
//   get(id) {
//     return this.findById(id)
//       .exec()
//       .then((user) => {
//         if (user) {
//           return user;
//         }
//         const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
//         return Promise.reject(err);
//       });
//   },

//   /**
//    * List users in descending order of 'createdAt' timestamp.
//    * @param {number} skip - Number of users to be skipped.
//    * @param {number} limit - Limit number of users to be returned.
//    * @returns {Promise<User[]>}
//    */
//   list({ skip = 0, limit = 50 } = {}) {
//     return this.find()
//       .sort({ createdAt: -1 })
//       .skip(+skip)
//       .limit(+limit)
//       .exec();
//   }
// });

/**
 * Register
 */

mongoose.model('GroupSession', GroupSessionSchema);
