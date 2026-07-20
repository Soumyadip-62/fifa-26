import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config({ path: join(process.cwd(), '.env') });
const key = process.env.YT_V3_API_KEY;
fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=test&key=' + key)
  .then(r => r.json())
  .then(data => { console.log(data); });
