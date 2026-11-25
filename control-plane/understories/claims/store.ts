import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ClaimStore, ConflictError } from './router';
import { Claim, ClaimStatus } from './workflow';

export class DynamoClaimStore implements ClaimStore {
  private readonly doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  constructor(private readonly table: string) {}

  async list(): Promise<Claim[]> {
    const out: Claim[] = [];
    let key: Record<string, unknown> | undefined;
    do {
      const page = await this.doc.send(new ScanCommand({ TableName: this.table, ExclusiveStartKey: key, ConsistentRead: true }));
      out.push(...((page.Items ?? []) as Claim[]));
      key = page.LastEvaluatedKey;
    } while (key);
    return out;
  }

  async get(id: string): Promise<Claim | undefined> {
    const r = await this.doc.send(new GetCommand({ TableName: this.table, Key: { claim_id: id }, ConsistentRead: true }));
    return r.Item as Claim | undefined;
  }

  /** Conditional write (ADR 0010 §6): a create never overwrites, an update never clobbers a concurrent change. */
  async put(claim: Claim, expect: ClaimStatus | null): Promise<void> {
    try {
      await this.doc.send(new PutCommand({
        TableName: this.table,
        Item: claim,
        ...(expect === null
          ? { ConditionExpression: 'attribute_not_exists(claim_id)' }
          : { ConditionExpression: '#s = :s', ExpressionAttributeNames: { '#s': 'status' }, ExpressionAttributeValues: { ':s': expect } }),
      }));
    } catch (e) {
      if ((e as { name?: string }).name === 'ConditionalCheckFailedException') throw new ConflictError();
      throw e;
    }
  }
}
