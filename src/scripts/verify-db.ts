import { existsSync, writeFileSync } from 'node:fs';
import { cwd } from 'node:process';

const path = cwd() + '/.dbs/sqlite.db';

if (!existsSync(path)) writeFileSync(path, '');
