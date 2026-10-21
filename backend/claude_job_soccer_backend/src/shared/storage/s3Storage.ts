import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import os from "os";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { contentTypeFor, FileStorage, StoredObject } from "./fileStorage";

export interface S3StorageOptions {
  endpoint?: string;
  publicEndpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
  signedUrlTtlSeconds: number;
}

/** S3-compatible bucket (MinIO or AWS S3). The bucket is private; reads use signed links. */
export class S3Storage implements FileStorage {
  readonly name = "s3";
  private readonly client: S3Client;
  /** Client whose host is reachable by browsers; only used to sign links. */
  private readonly publicClient: S3Client;
  private bucketChecked = false;

  constructor(private readonly options: S3StorageOptions) {
    const base = {
      region: options.region,
      forcePathStyle: options.forcePathStyle,
      credentials: { accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey },
    };
    this.client = new S3Client({ ...base, endpoint: options.endpoint });
    this.publicClient = new S3Client({ ...base, endpoint: options.publicEndpoint ?? options.endpoint });
  }

  /** Create the bucket when it does not exist yet (local MinIO). */
  async ensureBucket(): Promise<void> {
    if (this.bucketChecked) return;
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.options.bucket }));
    } catch (error: any) {
      if (error?.$metadata?.httpStatusCode !== 404 && error?.name !== "NotFound") throw error;
      await this.client.send(new CreateBucketCommand({ Bucket: this.options.bucket }));
    }
    this.bucketChecked = true;
  }

  async put(key: string, localPath: string, contentType?: string): Promise<void> {
    await this.ensureBucket();
    // Multipart upload: large videos are streamed in parts, not loaded into memory.
    await new Upload({
      client: this.client,
      params: {
        Bucket: this.options.bucket,
        Key: key,
        Body: fs.createReadStream(localPath),
        ContentType: contentType ?? contentTypeFor(key),
      },
    }).done();
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.options.bucket, Key: key }));
      return true;
    } catch (error: any) {
      if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NotFound") return false;
      throw error;
    }
  }

  async toLocalFile(key: string): Promise<{ path: string; release: () => void }> {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.options.bucket, Key: key }));
    const tempPath = path.join(
      os.tmpdir(),
      `storage_${Date.now()}_${Math.random().toString(36).slice(2)}${path.extname(key)}`
    );
    await pipeline(response.Body as Readable, fs.createWriteStream(tempPath));
    return {
      path: tempPath,
      release: () => {
        try {
          fs.unlinkSync(tempPath);
        } catch {
          // already removed
        }
      },
    };
  }

  async signedUrl(key: string): Promise<string | null> {
    return getSignedUrl(this.publicClient, new GetObjectCommand({ Bucket: this.options.bucket, Key: key }), {
      expiresIn: this.options.signedUrlTtlSeconds,
    });
  }

  async *list(prefix = ""): AsyncIterable<StoredObject> {
    await this.ensureBucket();
    let token: string | undefined;
    do {
      const page = await this.client.send(
        new ListObjectsV2Command({ Bucket: this.options.bucket, Prefix: prefix || undefined, ContinuationToken: token })
      );
      for (const item of page.Contents ?? []) {
        if (item.Key) yield { key: item.Key, size: item.Size ?? 0 };
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
  }
}
