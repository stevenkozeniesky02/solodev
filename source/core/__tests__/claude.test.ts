// source/core/__tests__/claude.test.ts
import { describe, it, expect } from '@jest/globals';

describe('claude', () => {
  it('should build correct args for a new session', async () => {
    const { buildClaudeArgs } = await import('../claude.js');
    const args = buildClaudeArgs({
      prompt: '/spark "AI tool"',
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      isNewSession: true,
      pluginDirs: ['/path/to/plugins/idea-spark', '/path/to/plugins/stack-pick'],
      permissionMode: 'acceptEdits',
    });
    expect(args).toContain('-p');
    expect(args).toContain('/spark "AI tool"');
    expect(args).toContain('--session-id');
    expect(args).toContain('550e8400-e29b-41d4-a716-446655440000');
    expect(args).toContain('--plugin-dir');
    expect(args).toContain('/path/to/plugins/idea-spark');
    expect(args).toContain('/path/to/plugins/stack-pick');
    expect(args).toContain('--output-format');
    expect(args).toContain('stream-json');
    expect(args).toContain('--verbose');
    expect(args).toContain('--permission-mode');
    expect(args).toContain('acceptEdits');
    expect(args).not.toContain('--resume');
  });

  it('should build correct args for resuming a session', async () => {
    const { buildClaudeArgs } = await import('../claude.js');
    const args = buildClaudeArgs({
      prompt: '/stack',
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      isNewSession: false,
      pluginDirs: ['/path/to/plugins/idea-spark', '/path/to/plugins/stack-pick'],
      permissionMode: 'default',
    });
    expect(args).toContain('--resume');
    expect(args).toContain('550e8400-e29b-41d4-a716-446655440000');
    expect(args).not.toContain('--session-id');
  });

  it('should check auth status', async () => {
    const { checkAuth } = await import('../claude.js');
    // This calls the real claude CLI — will pass if claude is installed
    const status = await checkAuth();
    expect(status).toHaveProperty('loggedIn');
    expect(status).toHaveProperty('email');
  });
});
