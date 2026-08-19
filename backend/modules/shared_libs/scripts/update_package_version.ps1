<#
This PowerShell script is used to update the version of a package. It 
takes three parameters: `major_version`, `minor_version`, and 
`patch_version`. Here's a detailed breakdown:

1. **Prompting for major version update**: The script prompts the user 
with a choice to advance the major version or keep the current major 
version. If the user chooses to advance, the script increments the major 
version, resets the minor and patch versions to 0, and exits.

2. **Prompting for minor version update**: If the user chose not to 
advance the major version, the script prompts the user with a choice to 
advance the minor version or keep the current minor version. If the user 
chooses to advance, the script increments the minor version, resets the 
patch version to 0, and exits.

3. **Prompting for patch version update**: If the user chose not to 
advance the minor version, the script prompts the user with a choice to 
advance the patch version or keep the current patch version. If the user 
chooses to advance, the script increments the patch version and exits.

4. **Keeping the current version**: If the user chose not to advance the 
patch version, the script keeps the current major, minor, and patch 
versions.

The updated versions are stored in the `next_major_version`, 
`next_minor_version`, and `next_patch_version` environment variables.
#>

param(
  [string]$major_version,
  [string]$minor_version,
  [string]$patch_version
)

##################################################

$options = @(
  [System.Management.Automation.Host.ChoiceDescription]::new("&Yes","Select to advance major version")
  [System.Management.Automation.Host.ChoiceDescription]::new("&No","Select to keep current major version")
)
$next_major_version = [int]$major_version + 1
$title = "Do you wish to advance major version? ($major_version > $next_major_version)"
$choice = $host.ui.PromptForChoice($title,'',$options,1)
if ($choice -eq 0) {
  $env:next_major_version = "$next_major_version"
  $env:next_minor_version = 0
  $env:next_patch_version = 0
  exit
}

##################################################

$options = @(
  [System.Management.Automation.Host.ChoiceDescription]::new("&Yes","Select to advance minor version")
  [System.Management.Automation.Host.ChoiceDescription]::new("&No","Select to keep current minor version")
)
$next_minor_version = [int]$minor_version + 1
$title = "Do you wish to advance minor version? ($minor_version > $next_minor_version)"
$choice = $host.ui.PromptForChoice($title,'',$options,1)
if ($choice -eq 0) {
  $env:next_major_version = "$major_version"
  $env:next_minor_version = "$next_minor_version"
  $env:next_patch_version = 0
  exit
}

##################################################

$options = @(
  [System.Management.Automation.Host.ChoiceDescription]::new("&Yes","Select to advance patch version")
  [System.Management.Automation.Host.ChoiceDescription]::new("&No","Select to keep current patch version")
)
$next_patch_version = [int]$patch_version + 1
$title = "Do you wish to advance patch version? ($patch_version > $next_patch_version)"
$choice = $host.ui.PromptForChoice($title,'',$options,0)
if ($choice -eq 0) {
  $env:next_major_version = "$major_version"
  $env:next_minor_version = "$minor_version"
  $env:next_patch_version = "$next_patch_version"
  exit
}

##################################################

$env:next_major_version = "$major_version"
$env:next_minor_version = "$minor_version"
$env:next_patch_version = "$patch_version"
