# Fix orphaned console.log object remnants left by the line-removal script.
# Pattern: lines that are object property assignments or `});` not inside any real object context.

function Remove-OrphanedLogBlocks {
    param([string]$FilePath)

    $lines = Get-Content $FilePath
    $result = [System.Collections.Generic.List[string]]::new()
    $i = 0

    while ($i -lt $lines.Count) {
        $line = $lines[$i]
        $trimmed = $line.TrimStart()

        # Detect start of an orphaned block:
        # A line that looks like `key: value,` or `key: value` that is NOT
        # inside an obvious JSX/object assignment (preceded by `{`, `(`, `=`, etc.)
        # Heuristic: the previous non-empty line ends in `;` or `}` or is a comment,
        # AND this line matches /^\s+\w+: .+[,]?$/ without an opening `{` or `[`

        $isOrphanedProp = $trimmed -match '^[\w"]+: .+' -and
                          $trimmed -notmatch '^(const|let|var|return|if|else|try|catch|for|while|export|import|interface|type|function|class|async|await)' -and
                          $trimmed -notmatch '[{(\[]$'

        if ($isOrphanedProp) {
            # Look back at previous meaningful line
            $prevIdx = $result.Count - 1
            while ($prevIdx -ge 0 -and $result[$prevIdx].Trim() -eq '') { $prevIdx-- }
            $prevLine = if ($prevIdx -ge 0) { $result[$prevIdx].TrimEnd() } else { '' }

            # Previous line ends with ; or { or } or is a comment — it's orphaned
            $prevEndsWithStatement = $prevLine -match '[;{}]$' -or $prevLine -match '^\s*//'

            if ($prevEndsWithStatement) {
                # Skip forward until we find `});` or `});` or `})`
                $skip = $i
                while ($skip -lt $lines.Count) {
                    $sl = $lines[$skip].Trim()
                    if ($sl -match '^\}\);?$' -or $sl -match '^\);$') {
                        $skip++
                        break
                    }
                    $skip++
                }
                Write-Host "  Removed orphaned block at lines $($i+1)-$($skip) in $([System.IO.Path]::GetFileName($FilePath))"
                $i = $skip
                continue
            }
        }

        $result.Add($line)
        $i++
    }

    $result | Set-Content $FilePath
    Write-Host "Done: $FilePath"
}

Write-Host "Fixing product-card.tsx..."
Remove-OrphanedLogBlocks "src\components\shared\card\product-card.tsx"

Write-Host "Fixing checkout/page.tsx..."
Remove-OrphanedLogBlocks "src\app\(public)\checkout\page.tsx"

Write-Host ""
Write-Host "Verifying remaining TS errors..."
