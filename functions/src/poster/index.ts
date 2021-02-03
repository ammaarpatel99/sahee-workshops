import { storageFn } from '../function-builder';
import {storage} from 'firebase-admin';
import * as sharp from 'sharp';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {Bucket, UploadOptions} from '@google-cloud/storage';
import {ObjectMetadata} from 'firebase-functions/lib/providers/storage';


export const onUpload = storageFn().onFinalize(async (object, context) => {
  if (
    object.metadata?.optimised ||
    !object.name ||
    !object.contentType?.startsWith('image/') ||
    path.basename(object.name) !== 'poster'
  ) {
    return;
  }

  const tmpPath = path.join(os.tmpdir(), 'poster');
  const bucket = storage().bucket();
  await bucket.file(object.name).download({destination: tmpPath});
  const genImgFn = genReactiveImgFn(object, tmpPath, bucket);

  await Promise.all([
    genImgFn({width: 300}, '-s'),
    genImgFn({width: 600}, '-m'),
    genImgFn({width: 1000}, '-l'),
    genImgFn({width: 2000}, '-xl'),
  ]);

  if (object.contentType === 'image/jpeg') {
    await bucket.file(object.name).setMetadata({...getMeta(object).metadata});
  } else {
    await sharp(tmpPath).jpeg().toFile(tmpPath);
    await bucket.upload(tmpPath, {...getMeta(object), contentType: 'image/jpeg', destination: object.name});
  }

  fs.unlinkSync(tmpPath);
});


function genReactiveImgFn(object: ObjectMetadata, tmpPath: string, bucket: Bucket)
  : (size: { width?: number; height?: number }, fileExt: string) => Promise<any> {
  const meta = getMeta(object);
  const serverPath = object.name;
  const uploadFn = saveNormalAndWebpFn(bucket, meta);
  const img = () => sharp(tmpPath);

  return (size: {width?: number; height?: number}, fileExt: string) => {
    const _tmpPath = tmpPath + fileExt;
    const _serverPath = serverPath + fileExt;
    const _img = () => img().resize({...size, withoutEnlargement: true, fit: 'inside'});
    return uploadFn(_img, _tmpPath, _serverPath);
  };
}


function saveNormalAndWebpFn(bucket: Bucket, meta: UploadOptions)
  : (img: () => sharp.Sharp, tmpPath: string, serverPath: string) => Promise<any> {
  return async (img: () => sharp.Sharp, tmpPath: string, serverPath: string): Promise<any> => {
    const tmpPathWebp = tmpPath + '.webp';
    const serverPathWebp = serverPath + '.webp';

    await Promise.all([
      img().jpeg().toFile(tmpPath).then(() =>
        bucket.upload(tmpPath, {
          ...meta,
          destination: serverPath,
          contentType: 'image/jpeg',
        })
      ),
      img().webp().toFile(tmpPathWebp).then(() =>
        bucket.upload(tmpPathWebp, {
          ...meta,
          destination: serverPathWebp,
          contentType: 'image/webp',
        })
      ),
    ]);
    fs.unlinkSync(tmpPath);
    fs.unlinkSync(tmpPathWebp);
  };
}


function getMeta(object: ObjectMetadata): UploadOptions {
  return {
    contentType: object.contentType,
    metadata: {
      contentDisposition: object.contentDisposition,
      cacheControl: object.cacheControl,
      optimised: true,
    },
  };
}
