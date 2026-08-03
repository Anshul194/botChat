<?php
// ⚠️ DELETE THIS FILE IMMEDIATELY AFTER USE — SECURITY RISK
$appDir = '/home/megasfuh/botchat_next';

echo "<h2>📜 Node.js Startup Logs</h2>";
echo "<p>Checking logs in: <code>$appDir</code></p>";

$filesToCheck = [
    'startup-error.txt',
    'startup-success.txt',
    'stderr.log',
    'deploy-log.txt'
];

foreach ($filesToCheck as $file) {
    $path = "$appDir/$file";
    echo "<h3>📄 $file</h3>";
    if (file_exists($path)) {
        echo "<pre style='background:#111;color:#0f0;padding:15px;font-size:13px;max-height:400px;overflow:auto;'>";
        echo htmlspecialchars(file_get_contents($path));
        echo "</pre>";
        echo "<small>Last modified: " . date("F d Y H:i:s.", filemtime($path)) . "</small>";
    } else {
        echo "<p style='color:red;'>File does not exist.</p>";
    }
}
echo "<hr><p style='color:red;font-weight:bold;'>⚠️ DELETE this file from cPanel File Manager when done!</p>";
?>
