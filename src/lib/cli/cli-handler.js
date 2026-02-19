import readline from 'readline';
import { spawn } from 'child_process';
import CLICommands from './cli-commands.js';

/**
 * CLI Interface Handler
 * Manages readline interface and command execution
 */
class CLIHandler {
    constructor(logger, deviceMonitor, systemMonitor) {
        this.logger = logger;
        this.deviceMonitor = deviceMonitor;
        this.systemMonitor = systemMonitor;
        this.commands = new CLICommands(logger, deviceMonitor, systemMonitor);
        this.rl = null;
        this.isRunning = false;
        this.prompt_prefix = '> ';
    }

    /**
     * Start the CLI interface
     */
    start() {
        if (this.isRunning) {
            this.logger.warn('CLI is already running', 'CLI');
            return;
        }

        this.isRunning = true;
        // Notify logger that CLI is active to avoid debug log interference with prompt
        this.logger.setCliActive(true);

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: this.prompt_prefix,
            historySize: 100,
            removeHistoryDuplicates: true,
        });

        // Show welcome banner
        this.commands.showBanner();

        // Start prompt
        this.rl.prompt();

        // Handle line input
        this.rl.on('line', async (input) => {
            const result = await this.commands.executeCommand(input);

            if (result === 'exit') {
                console.log('\n👋 Goodbye! Stopping server...\n');
                this.stop();
                process.exit(0);
            } else if (result === 'restart') {
                console.log(this.commands.showRestart());
                this.stop();
                setTimeout(() => {
                    const child = spawn(process.execPath, process.argv.slice(1), {
                        detached: true,
                        stdio: 'inherit',
                        env: process.env,
                    });
                    child.unref();
                    process.exit(0);
                }, 1000);
            } else if (result !== '') {
                console.log(result);
            }

            if (this.isRunning) this.rl.prompt();
        });

        // Handle close
        this.rl.on('close', () => {
            this.isRunning = false;
            process.exit(0);
        });

        // Handle errors
        this.rl.on('error', (err) => {
            if (err.code !== 'ERR_USE_AFTER_CLOSE') {
                this.logger.error(`CLI Error: ${err.message}`, 'CLI');
            }
        });
    }

    /**
     * Show prompt
     */
    prompt() {
        if (this.rl && this.isRunning) {
            this.rl.prompt();
        }
    }

    /**
     * Stop the CLI interface
     */
    stop() {
        if (this.rl) {
            this.rl.close();
        }
        this.isRunning = false;
        // Notify logger that CLI is no longer active
        this.logger.setCliActive(false);
    }

    /**
     * Write output to CLI without disrupting input
     * Pauses readline, writes output, resumes readline with new prompt
     */
    writeOutput(text) {
        if (this.rl && this.isRunning) {
            // Pause input
            this.rl.pause();
            
            // Move to new line and output text
            process.stdout.write('\n');
            console.log(text);
            
            // Resume and show prompt on new line
            process.stdout.write(this.prompt_prefix);
            this.rl.resume();
        } else {
            console.log(text);
        }
    }
}

export default CLIHandler;
