/**
 * Copyright Microsoft Corporation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'fs';
import path from 'path';
import type { TestStore } from '../types/test';
import { currentTestInfo } from './globals';
import { sanitizeForFilePath, trimLongString } from './util';

class JsonStore implements TestStore {
  private _toFilePath(name: string) {
    const testInfo = currentTestInfo();
    if (!testInfo)
      throw new Error('store can only be called while test is running');
    const fileName = sanitizeForFilePath(trimLongString(name)) + '.json';
    return path.join(testInfo.config._storeDir, testInfo.project._id, fileName);
  }

  async get<T>(name: string) {
    const file = this._toFilePath(name);
    try {
      const data = (await fs.promises.readFile(file)).toString('utf-8');
      return JSON.parse(data) as T;
    } catch (e) {
      return undefined;
    }
  }

  async set<T>(name: string, value: T | undefined) {
    const file = this._toFilePath(name);
    if (value === undefined) {
      await fs.promises.rm(file, { force: true });
      return;
    }
    const data = JSON.stringify(value, undefined, 2);
    await fs.promises.mkdir(path.dirname(file), { recursive: true });
    await fs.promises.writeFile(file, data);
  }
}

export const store = new JsonStore();
