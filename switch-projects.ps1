# Quick Project Switching Script
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("tg-ai-campus", "eis-system")]
    [string]$Project
)

$workspaces = @{
    "tg-ai-campus" = "c:\Users\USER\Desktop\work\aicampus\TG-AI-CAMPUS-dev\TG-AI-CAMPUS-dev.code-workspace"
    "eis-system" = "C:\Users\USER\Desktop\work\EIS\EIS-System\EIS-System.code-workspace"
}

$workspacePath = $workspaces[$Project]

if (Test-Path $workspacePath) {
    Write-Host "Switching to $Project..."
    Write-Host "Opening workspace: $workspacePath"
    
    # Close existing VS Code instances (optional)
    # Get-Process code | Stop-Process -Force
    
    # Open new workspace
    Start-Process code -ArgumentList $workspacePath
    
    Write-Host "Switched to $Project successfully!"
    Write-Host "Remember to say '$Project project' to activate context"
} else {
    Write-Host "Workspace not found: $workspacePath"
}
