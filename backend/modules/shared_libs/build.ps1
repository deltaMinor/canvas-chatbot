<#
This PowerShell script is a build script for a Python package
located in a virtual environment (venv). Here's a detailed breakdown:

1. **Setting the package name**: The script sets the `package` variable
to "shared_libs".

2. **Getting the current package version**: The script changes the
current location to the directory where the script is located
(`$PSScriptRoot`) and runs a Python command to import the package and
print its version. The version is then split into major, minor, and patch
versions.

3. **Updating the package version**: The script changes the current
location to the directory where the script is located (`$PSScriptRoot`)
and runs the `update_package_version.ps1` script with the current major,
minor, and patch versions as arguments. This script updates the
version of the package.

4. **Setting the new package version**: The script sets the
`new_package_version` variable to the updated version of the package. It
then changes the current location to the directory where the script is
located (`$PSScriptRoot`) and updates the version in the `__init__.py`
file of the package.

5. **Printing the package name and versions**: The script prints the
package name, current version, and new version.

6. **Building the wheel**: The script changes the current location to
the directory where the script is located (`$PSScriptRoot`) and runs a
Python command to build the wheel for the package. The command is
commented out, so it won't actually run. Instead, the `setup` command is
run with the `bdist_wheel` argument, which also builds the wheel for the
package.
#>

$package = "shared_libs"
$venv_name = "venv"
Set-Location -Path $PSScriptRoot
$package_version = & "./$venv_name/Scripts/python" -c "from src.$package import __version__; print(__version__)"

$splitVersions = $package_version -split "\."
$major_version = $splitVersions[0]
$minor_version = $splitVersions[1]
$patch_version = $splitVersions[2]

##################################################

Set-Location -Path $PSScriptRoot
& ./scripts/update_package_version.ps1 -major_version $major_version -minor_version $minor_version -patch_version $patch_version

$new_package_version = "$env:next_major_version.$env:next_minor_version.$env:next_patch_version"
Set-Location -Path $PSScriptRoot
Set-Content -Path "./src/$package/__init__.py" -Value "__version__ = `"$new_package_version`""

##################################################
""
"Package: $package"
"Current Version: $package_version"
"New Version: $new_package_version"
""
##################################################

"Removing existing whl if exists ..."
Remove-Item -Path "./dist/$package-$new_package_version-py3-none-any.whl" -ErrorAction SilentlyContinue

##################################################

"Building wheel ..."
Set-Location -Path $PSScriptRoot
& "./$venv_name/Scripts/python" -m Setup bdist_wheel
