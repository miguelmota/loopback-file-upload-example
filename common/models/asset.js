'use strict'

const fs = require('fs');
const formidable = require('formidable');

const BUCKET = 'test';

module.exports = function(Asset) {

  Asset.upload = function(req, res, body, cb) {
    try {
      const {name: storageName, root: storageRoot} = Asset.app.dataSources.storage.settings;

      if (storageName === 'storage') {
        const path = `${storageRoot}${BUCKET}/`;

        if (!fs.existsSync(path)) {
          fs.mkdirSync(path);
        }
      }
    } catch (error) {

    }

    const Container = Asset.app.models.Container;
    const form = new formidable.IncomingForm();

    const filePromise = new Promise((resolve, reject) => {
      Container.upload(req, res, {
        container: BUCKET
      }, (error, fileObj) => {
        if (error) {
          return reject(error);
        }

        const fileInfo = fileObj.files.file[0];

        resolve(fileInfo);
      });
    });

    const fieldsPromise = new Promise((resolve, reject) => {
      form.parse(req, function(error, fields, files) {
        if (error) return reject(error);

        resolve(fields);
      });
    });

    Promise.all([filePromise, fieldsPromise])
    .then(([fileInfo, fields]) => {
        // S3 file url
        const url = (fileInfo.providerResponse && fileInfo.providerResponse.location);
        Asset.create(Object.assign({
          filename: fileInfo.name,
          url,
          type: fileInfo.type,
          size: fileInfo.size
        }, fields), (error, reply) => {
          if (error) return cb(error);
          cb(null, reply);
        });
    })
    .catch(error => cb(error));
  };

  Asset.observe('before delete', (context, next) => {
    const Container = Asset.app.models.Container;

    Asset.findOne({where: context.where}, (error, asset) => {
      if (error) return next(error);

      const filename = asset.filename;
      Container.removeFile(BUCKET, filename, (error, reply) => {
        if (error) {
          return next(new Error(error));
        }

        next();
      });
    });
  });

  Asset.remoteMethod('upload', {
    description: 'Uploads a file',
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
      {arg: 'body', type: 'object', http: {source: 'body'}}
    ],
    returns: {
      arg: 'fileObject',
      type: 'object',
      root: true
    },
    http: {verb: 'post'}
  });
};
