#!/bin/bash

# MongoDB Cleanup Script
# This script cleans up temporary files after initialization and import are complete

set -e

echo "Starting MongoDB cleanup..."

# Clean up temporary files
echo "Cleaning up temporary files..."

# Try to change ownership and remove files
for file in /tmp/mongodb.env; do
    if [ -f "$file" ]; then
        echo "Found file: $file"

        # Try to change ownership to current user first
        if chown $(whoami):$(whoami) "$file" 2>/dev/null; then
            echo "Changed ownership of $file to $(whoami)"
        else
            echo "Could not change ownership to $(whoami), trying root..."
            # Try to change ownership to root
            if chown root:root "$file" 2>/dev/null; then
                echo "Changed ownership of $file to root"
            else
                echo "Could not change ownership of $file (continuing anyway)"
            fi
        fi

        # Try to remove the file
        if rm -f "$file" 2>/dev/null; then
            echo "Successfully removed: $file"
        else
            echo "Warning: Could not remove $file (permission denied)"
            # Try with sudo if available
            if command -v sudo >/dev/null 2>&1; then
                echo "Attempting to remove with sudo..."
                if sudo rm -f "$file" 2>/dev/null; then
                    echo "Successfully removed with sudo: $file"
                else
                    echo "Failed to remove even with sudo: $file"
                    echo "Attempting to scrub file contents as fallback..."
                    # Try to scrub the file contents as fallback
                    if echo "" > "$file" 2>/dev/null; then
                        echo "Successfully scrubbed contents of $file"
                    elif sudo echo "" > "$file" 2>/dev/null; then
                        echo "Successfully scrubbed contents of $file with sudo"
                    else
                        echo "Could not scrub file contents - manual cleanup required"
                    fi
                fi
            else
                echo "sudo not available, attempting to scrub file contents..."
                # Try to scrub the file contents as fallback
                if echo "" > "$file" 2>/dev/null; then
                    echo "Successfully scrubbed contents of $file"
                else
                    echo "Could not scrub file contents - manual cleanup required"
                fi
            fi
        fi
    else
        echo "File not found: $file"
    fi
done

echo "Cleanup completed!"
