import type { MatterDraft } from "./schema";
export type Matter=MatterDraft&{id:string;createdAt:string};
export interface MatterRepository{save(draft:MatterDraft):Promise<Matter>}
export class LocalMatterRepository implements MatterRepository{
 async save(draft:MatterDraft):Promise<Matter>{return Object.freeze({...structuredClone(draft),id:crypto.randomUUID(),createdAt:new Date().toISOString()});}
}
