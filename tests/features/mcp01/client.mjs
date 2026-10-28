/* SPDX-License-Identifier: Apache-2.0 */
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import assert from 'node:assert/strict';
export function stdio(server, root, allow = 'read,edit,save') {
  const process = spawn(globalThis.process.execPath, [server, '--root', root, '--allow', allow], { stdio: ['pipe', 'pipe', 'pipe'] });
  let seq = 0, stderr = '';
  const pending = new Map();
  process.stderr.on('data', b => { stderr += b; });
  readline.createInterface({ input: process.stdout }).on('line', line => {
    const response = JSON.parse(line), p = pending.get(response.id);
    if (p) { pending.delete(response.id); clearTimeout(p.timer); p.resolve(response); }
  });
  process.on('exit', code => { for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error('MCP exited ' + code + ': ' + stderr.slice(-2000))); } pending.clear(); });
  return {
    request(method, params = {}) {
      const id = ++seq;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { pending.delete(id); reject(new Error('MCP timed out: ' + method + ' ' + stderr.slice(-1000))); }, 60000);
        pending.set(id, { resolve, reject, timer }); process.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
      });
    },
    async close() { process.stdin.end(); if (process.exitCode === null) await new Promise(resolve => process.once('exit', resolve)); },
    get stderr() { return stderr; },
  };
}
export const initialized = async client => {
  const result = await client.request('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'mcp01-acceptance', version: '1' } });
  assert.ok(!result.error, JSON.stringify(result)); return result.result;
};
export async function tool(client, name, args, fails = false) {
  const response = await client.request('tools/call', { name, arguments: args });
  assert.ok(!response.error, JSON.stringify(response));
  const result = response.result;
  if (fails) { assert.equal(result.isError, true, 'expected refusal: ' + name + ' ' + JSON.stringify(result)); return result; }
  assert.ok(!result.isError, name + ': ' + JSON.stringify(result)); return result.structuredContent;
}
