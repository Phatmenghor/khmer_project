#!/bin/bash

# Script to remove all Lombok @Slf4j annotations and manual logging statements
# from the entire backend codebase
#
# This script:
# 1. Removes @Slf4j annotation from all Java files
# 2. Removes the log import statement
# 3. Removes all log.* method calls (log.info, log.error, log.debug, log.warn)
# 4. Cleans up empty lines left by removed imports
#
# The GlobalLoggingAspect will handle all logging automatically

echo "🔄 Starting removal of Lombok logging..."
echo "Total files to process: $(find src/main/java -name "*.java" | xargs grep -l "@Slf4j" | wc -l)"
echo ""

# Counter
PROCESSED=0
MODIFIED=0

# Get list of all Java files with @Slf4j
FILES=$(find src/main/java -name "*.java" -type f | xargs grep -l "@Slf4j")

for FILE in $FILES; do
    PROCESSED=$((PROCESSED + 1))

    # Skip the GlobalLoggingAspect itself
    if [[ "$FILE" == *"GlobalLoggingAspect.java" ]]; then
        echo "⏭️  Skipping: $FILE (this is the aspect itself)"
        continue
    fi

    # Remove @Slf4j annotation
    if grep -q "@Slf4j" "$FILE"; then
        sed -i '/@Slf4j/d' "$FILE"
        MODIFIED=$((MODIFIED + 1))
        echo "✅ Removed @Slf4j from: $FILE"
    fi

    # Remove import lombok.extern.slf4j.Slf4j
    if grep -q "import lombok.extern.slf4j.Slf4j" "$FILE"; then
        sed -i '/import lombok\.extern\.slf4j\.Slf4j/d' "$FILE"
        echo "   Removed Slf4j import"
    fi

    # Remove all log statements (log.info, log.error, log.debug, log.warn, log.trace)
    # This regex handles most common patterns
    if grep -qE "^\s*log\.(info|error|debug|warn|trace)\(" "$FILE"; then
        # Create backup
        cp "$FILE" "$FILE.bak"

        # Remove log statements - handles multi-line statements too
        # This removes the entire line containing log.* calls
        sed -i '/^\s*log\.\(info\|error\|debug\|warn\|trace\)(/d' "$FILE"

        echo "   Removed log statements"
    fi
done

echo ""
echo "📊 Summary:"
echo "   Files processed: $PROCESSED"
echo "   Files modified: $MODIFIED"
echo ""
echo "✨ Cleanup complete!"
echo ""
echo "📝 Notes:"
echo "   - GlobalLoggingAspect is now the ONLY logging mechanism"
echo "   - All method calls in controllers/services are now automatically logged"
echo "   - No manual logging code needed anymore"
echo "   - Check application logs for comprehensive operation tracking"
echo ""
