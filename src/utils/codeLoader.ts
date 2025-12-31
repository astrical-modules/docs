import fs from 'node:fs/promises';
import path from 'node:path';

const SNIPPET_DIR = path.resolve('content/snippets');

/**
 * Loads a code snippet from a file in the snippets directory.
 * safely prevents directory traversal and supports region extraction.
 */
export async function loadSnippet(filePath: string, region?: string): Promise<string> {
    // 1. Sanitize Path (Prevent Directory Traversal)
    // Ensure the path is relative and doesn't try to go up
    const safePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(SNIPPET_DIR, safePath);

    // 2. Read File
    let content = '';
    try {
        content = await fs.readFile(fullPath, 'utf-8');
    } catch (e) {
        // Return a comment so it renders in the code block instead of crashing
        return `// Error: Snippet not found at ${safePath}`;
    }

    // 3. Extract Region (if requested)
    if (region) {
        const startMarker = `// @snippet:start ${region}`;
        const endMarker = `// @snippet:end ${region}`;

        const lines = content.split('\n');
        const start = lines.findIndex(l => l.includes(startMarker));
        const end = lines.findIndex(l => l.includes(endMarker));

        if (start !== -1 && end !== -1) {
            // Return only the lines between markers
            // Logic: start + 1 to skip start marker, end to exclude end marker
            // Also dedent common whitespace if possible (optional enhancement)
            return lines.slice(start + 1, end).join('\n').trim();
        }
    }

    return content;
}
