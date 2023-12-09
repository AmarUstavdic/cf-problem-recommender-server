const { Client } = require('ssh2');
require('dotenv').config();

const sshConfig = {
    host: process.env.SCHOOL_SERVER,
    port: process.env.SSH_PORT,
    username: process.env.STUDENT_ID,
    password: process.env.SSH_PASSWORD
};

function setupTunnel() {
    return new Promise((resolve, reject) => {
        const sshClient = new Client();

        sshClient.on('ready', () => {
            console.log('SSH connection established.');

            sshClient.forwardOut('127.0.0.1', 3306, '127.0.0.1', 3306, (err, stream) => {
                    if (err) {
                        console.error('Error establishing tunnel:', err);
                        sshClient.end();
                        reject(err);
                    }

                    resolve(stream);
                }
            );
        });

        sshClient.on('error', (err) => {
            console.error('SSH connection error:', err);
            reject(err);
        });

        sshClient.connect(sshConfig);
    });
}

module.exports = {
    setupTunnel
};
