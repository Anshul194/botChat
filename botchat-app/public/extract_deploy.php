<?php
// extract_deploy.php — called by GitHub Actions after ZIP upload
// ⚠️ Keep this file permanently but protect it with a secret token

$secret = $_GET['secret'] ?? '';
$expectedSecret = getenv('DEPLOY_SECRET') ?: 'divyang123';

if ($secret !== $expectedSecret) {
    http_response_code(403);
    die('Forbidden');
}

$zipFile   = '/home/megasfuh/botchat_next_deploy/deploy.zip';
$targetDir = '/home/megasfuh/botchat_next';
$logFile   = '/home/megasfuh/deploy-log.txt';

function logMsg($msg) {
    global $logFile;
    file_put_contents($logFile, date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
    echo $msg . "\n";
}

header('Content-Type: text/plain');
logMsg("=== Deploy triggered at " . date('Y-m-d H:i:s') . " ===");

// Check zip exists
if (!file_exists($zipFile)) {
    logMsg("ERROR: deploy.zip not found at $zipFile");
    http_response_code(500);
    exit;
}

logMsg("ZIP found: " . number_format(filesize($zipFile)) . " bytes");

// Extract zip
$zip = new ZipArchive();
$result = $zip->open($zipFile);
if ($result !== TRUE) {
    logMsg("ERROR: Cannot open zip (code: $result)");
    http_response_code(500);
    exit;
}

logMsg("Extracting to $targetDir ...");

// Extract standalone/* directly into targetDir
for ($i = 0; $i < $zip->numFiles; $i++) {
    $name = $zip->getNameIndex($i);
    // Strip leading "standalone/" from path
    $destRelative = preg_replace('#^standalone/#', '', $name);
    if ($destRelative === '' || $destRelative === $name) continue; // skip root entry

    $destPath = $targetDir . '/' . $destRelative;

    if (substr($name, -1) === '/') {
        // Directory
        if (!is_dir($destPath)) mkdir($destPath, 0755, true);
    } else {
        // File
        $dir = dirname($destPath);
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        file_put_contents($destPath, $zip->getFromIndex($i));
    }
}

$zip->close();
logMsg("Extraction complete. " . $zip->numFiles . " entries processed.");

// Touch restart file to restart the Node.js app
$restartFile = $targetDir . '/tmp/restart.txt';
if (!is_dir(dirname($restartFile))) mkdir(dirname($restartFile), 0755, true);
touch($restartFile);
logMsg("Restart file touched: $restartFile");

// Clean up zip
unlink($zipFile);
logMsg("ZIP deleted.");

logMsg("=== Deploy complete ===");
http_response_code(200);
echo "OK";
?>
