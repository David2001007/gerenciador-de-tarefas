const { spawn } = require('child_process');
const path = require('path');

const mode = process.argv[2] || 'run';
const cypressBin = process.platform === 'win32'
    ? path.join('node_modules', '.bin', 'cypress.cmd')
    : path.join('node_modules', '.bin', 'cypress');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(cypressBin, [mode], {
    env,
    shell: process.platform === 'win32',
    stdio: 'inherit',
});

child.on('exit', (code) => {
    process.exit(code ?? 1);
});
