module.exports = {
  getError(errors, prop) {
    try {
      return errors.mapped()[prop].msg;
    } catch (err) {
      // errors undefined or requested prop doesn't exist
      return '';
    }
  }
};
