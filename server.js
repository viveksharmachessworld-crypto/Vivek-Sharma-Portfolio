import express from 'express';
import { MongoClient } from 'mongodb';
import certificates from './src/certificates.json' with { type: 'json' };
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
let mongoPromise;
async function getCertificates() {
  if (!process.env.MONGODB_URI) return certificates;
  try {
    if (!mongoPromise) mongoPromise = new MongoClient(process.env.MONGODB_URI, {serverSelectionTimeoutMS:2500}).connect();
    const client = await mongoPromise;
    const rows = await client.db(process.env.MONGODB_DB || 'vivek_portfolio').collection('certificates').find({}, {projection:{_id:0}}).sort({order:1}).toArray();
    if (rows.length) return rows;
    await client.db(process.env.MONGODB_DB || 'vivek_portfolio').collection('certificates').insertMany(certificates.map((certificate, order) => ({...certificate, order})));
    return certificates;
  } catch (error) { console.error('MongoDB unavailable; serving bundled certificate index:', error.message); mongoPromise = null; return certificates; }
}
app.get('/api/health', (_req,res) => res.json({ok:true, database:process.env.MONGODB_URI ? 'configured' : 'fallback'}));
app.get('/api/certificates', async (_req,res) => res.json(await getCertificates()));
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) app.use(express.static(path.join(here,'dist')));
if (!process.env.VERCEL) app.get(/.*/, (_req,res,next) => process.env.NODE_ENV === 'production' ? res.sendFile(path.join(here,'dist','index.html')) : next());
export default app;
if (process.env.NODE_ENV !== 'production') { const port=Number(process.env.PORT||3000); app.listen(port,()=>console.log(`Portfolio API listening on ${port}`)); }
