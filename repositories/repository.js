const crypto = require('crypto');
const util = require('util');
const { getDb } = require('./mongoUtil');
const { ObjectId } = require('bson');

module.exports = class Repository {
  constructor(sourcename) {
    if (!sourcename) {
      throw new Error('Creating a repository requires a sourcename');
    }

    this.sourcename = sourcename;
  }

  async getAll() {
    return await getDb().collection(this.sourcename).find().toArray();
  }

  async getOne(id) {
    return await getDb()
      .collection(this.sourcename)
      .findOne({ _id: new ObjectId(id) });
  }

  async getOneBy(filters) {
    return await getDb().collection(this.sourcename).findOne(filters);
  }

  async create(attrs) {
    await getDb().collection(this.sourcename).insertOne(attrs);

    return attrs;
  }

  async update(id, attrs) {
    const result = await getDb()
      .collection(this.sourcename)
      .updateOne({ _id: new ObjectId(id) }, { $set: attrs });

    if (result.matchedCount !== 1) {
      throw new Error(`Record with id ${id} not found`);
    }

    if (!result.acknowledged) {
      throw new Error(
        `Unable to update document with id ${id} from collection ${this.sourcename}`
      );
    }
  }

  async delete(id) {
    await getDb()
      .collection(this.sourcename)
      .deleteOne({ _id: new ObjectId(id) });
  }
};
