import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import type {Data} from './model';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const cloud:SupabaseClient|null=url&&key?createClient(url,key):null;
export async function loadCloud(userId:string):Promise<Data|null>{if(!cloud)return null;const {data,error}=await cloud.from('price_workspaces').select('content').eq('owner_id',userId).maybeSingle();if(error)throw error;return data?.content??null}
export async function saveCloud(userId:string,content:Data){if(!cloud)return;const {error}=await cloud.from('price_workspaces').upsert({owner_id:userId,content,updated_at:new Date().toISOString()},{onConflict:'owner_id'});if(error)throw error}
