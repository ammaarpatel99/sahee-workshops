import { storageFn } from '../function-builder';
import {storage} from 'firebase-admin';
import * as sharp from 'sharp';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {Bucket, UploadOptions} from '@google-cloud/storage';


type Sizes = [{width: number}, string][];
type FileType = 'webp' | 'jpeg';


const SIZES: Sizes = [
  [{width: 300}, '-s'],
  [{width: 600}, '-m'],
  [{width: 1000}, '-l'],
  [{width: 2000}, '-xl']
];


const FILE_TYPES: FileType[] = [
  'webp',
  'jpeg'
];


export const onUpload = storageFn().onFinalize(async (object, context) => {
  if (
    !object.name ||
    !object.contentType?.startsWith('image/') ||
    path.basename(object.name) !== 'poster'
  ) {
    return;
  }

  const tmpPath = path.join(os.tmpdir(), 'poster');
  const serverPath = object.name;
  const bucket = storage().bucket();
  await bucket.file(object.name).download({destination: tmpPath});
  const img = () => sharp(tmpPath);

  const promises: Promise<void>[] = [];
  promises.push(upload(bucket, img, tmpPath, serverPath, 'jpeg', false));

  for (const [size, pathExt] of SIZES) {
    const _img = resize(img, size);
    for (const type of FILE_TYPES) {
      promises.push(upload(bucket, _img, tmpPath + pathExt, serverPath + pathExt, type, true));
    }
  }

  await Promise.all(promises);
  fs.unlinkSync(tmpPath);
});


function resize(img: () => sharp.Sharp, size: {height?: number; width?: number; }): () => sharp.Sharp {
  return () => img().resize({...size, withoutEnlargement: true, fit: 'inside'});
}


async function upload(
  bucket: Bucket,
  img: () => sharp.Sharp,
  tmpPath: string,
  serverPath: string,
  type: FileType,
  cache: boolean
): Promise<void> {

  const _tmpPath = `${tmpPath}.${type}`;
  const _serverPath = `${serverPath}.${type}`;
  let image;
  if (type === 'webp') image = img().webp();
  else image = img().jpeg();
  await image.toFile(_tmpPath);
  await bucket.upload(_tmpPath, {destination: _serverPath, ...getMeta(type, cache)});
  fs.unlinkSync(_tmpPath);
}


function getMeta(type: FileType, cache: boolean): UploadOptions {
  return {
    contentType: `image/${type}`,
    metadata: {
      contentDisposition: 'inline',
      cacheControl: cache ? 'max-age=360' : undefined
    },
  };
}
