// Copies the two built artefacts from `dist/` to the repository root, where
// they are committed as part of the version commit.
//
// Committing build output is not something to do lightly, and it is here for
// one reason: Greasy Fork does not fetch the code from the sync URL. The URL
// only tells it which script a change belongs to; the content it publishes
// comes out of `git show <tag>:<file>` against a clone of the repository (see
// Git.get_contents in their webhooks concern). A file that exists only as a
// release asset is invisible to that, and the sync fails with "Could not pull
// contents from git".
//
// The root rather than `dist/`: for a `releases/latest/download/...` sync URL,
// their file_from_root_for_url strips the URL down to the bare filename, so
// the path they look for has no directory in it at all.
//
// Run from npm's `version` lifecycle hook, which fires after the bump and
// before the commit, so the artefacts land in the version commit itself and
// the tag therefore points at a tree that contains them.

import { copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const artefacts = [
	'pack-ship-extended.user.js',
	'pack-ship-extended.user.css',
];

await Promise.all(
	artefacts.map((name) =>
		copyFile(resolve(root, 'dist', name), resolve(root, name))),
);

console.log(`staged ${artefacts.join(', ')} at the repository root`);
