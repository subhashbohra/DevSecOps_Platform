jq '[.runs[].results[] | select(((.properties["security-severity"] // "0") | tonumber) >= 7.0)]' file.sarif


jq '[.runs[].results[] | select(((.properties["security-severity"] // "0") | tonumber) >= 7.0)] | length' file.sarif
