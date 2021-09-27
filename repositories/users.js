const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
  async create(attrs) {
    attrs.id = await this.randomId();
    const salt = crypto.randomBytes(8).toString('hex');
    const buf = await scrypt(attrs.password, salt, 64);
    const records = await this.getAll();
    const newRecord = {
      ...attrs,
      password: `${buf.toString('hex')}.${salt}`
    };

    records.push(newRecord);

    await this.writeAll(records);

    return newRecord;
  }

  async comparePasswords(saved, supplied) {
    const [hashed, salt] = saved.split('.');
    const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

    return hashed === hashedSuppliedBuf.toString('hex');
  }
}

module.exports = new UsersRepository('users.json');
