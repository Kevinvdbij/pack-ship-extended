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

import { execFileSync } from 'node:child_process';
import { copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// The artefact about to be staged has to be the one CI gets when it rebuilds
// from the tag, and that is not a given: Vue derives each component's
// scoped-style id from the file's contents, so a working copy that differs from
// what the repository stores by nothing but its line endings still hashes to
// different `data-v-` ids. The bundle then cannot be reproduced from the commit
// it ships in, and the release fails its own check -- after the bump, after the
// tag, which is the expensive place to find out.
//
// `.gitattributes` already says LF everywhere. This is the check that it held:
// git only normalises on checkout, so anything that rewrites a file in place --
// an editor set the other way, a script using the platform's default newline --
// leaves CRLF behind that no later checkout corrects.
function assertNoCrlf() {
	const listed = execFileSync('git', ['ls-files', '--eol'], { cwd: root, encoding: 'utf8' });

	const offenders = listed.split('\n')
		.filter((line) => line.includes('w/crlf'))
		.map((line) => line.split('\t')[1]);

	if (offenders.length == 0) {
		return;
	}

	console.error('These files have CRLF line endings in the working tree, which the build bakes'
		+ ' into the artefact and CI cannot reproduce:\n'
		+ offenders.map((name) => `  ${name}`).join('\n')
		+ '\n\nNormalise them to LF and build again.');

	process.exit(1);
}

assertNoCrlf();

const artefacts = [
	'pack-ship-extended.user.js',
	'pack-ship-extended.user.css',
];

await Promise.all(
	artefacts.map((name) =>
		copyFile(resolve(root, 'dist', name), resolve(root, name))),
);

console.log(`staged ${artefacts.join(', ')} at the repository root`);
