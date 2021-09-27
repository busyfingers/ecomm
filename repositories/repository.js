const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const randomBytes = util.promisify(crypto.randomBytes);

module.exports = class Repository {
  constructor(sourcename) {
    if (!sourcename) {
      throw new Error('Creating a repository requires a sourcename');
    }

    this.sourcename = sourcename;
    this.ensureSourceExists();
  }

  ensureSourceExists() {
    try {
      fs.accessSync(this.sourcename);
    } catch (err) {
      fs.writeFileSync(this.sourcename, '[]');
    }
  }

  async getAll() {
    return JSON.parse(await fs.promises.readFile(this.sourcename, { encoding: 'utf8' }));
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find(record => record.id === id);
  }

  async getOneBy(filters) {
    const records = await this.getAll();

    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }

      if (found) {
        return record;
      }
    }
  }

  async create(attrs) {
    attrs.id = await this.randomId();
    const records = await this.getAll();
    records.push(attrs);
    await this.writeAll(records);

    return attrs;
  }

  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find(record => record.id === id);

    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }

    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter(record => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  async writeAll(records) {
    await fs.promises.writeFile(this.sourcename, JSON.stringify(records, null, 2));
  }

  async randomId() {
    return (await randomBytes(4)).toString('hex');
  }
};
