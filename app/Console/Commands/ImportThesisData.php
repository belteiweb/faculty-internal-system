<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class ImportThesisData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'thesis:import';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import bachelor thesis records from official Excel documents into database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting thesis data extraction and import...');
        
        $scriptPath = base_path('database/seeders/import_thesis_data.py');
        if (!file_exists($scriptPath)) {
            $this->error("Script not found at: {$scriptPath}");
            return 1;
        }

        $process = new Process(['python', $scriptPath]);
        $process->setTimeout(180);
        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        if (!$process->isSuccessful()) {
            $this->error('Failed to import thesis data.');
            return 1;
        }

        $this->info('Thesis data imported successfully!');
        return 0;
    }
}
