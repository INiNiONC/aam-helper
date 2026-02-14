# aam-helper

Support for the AAML format in Visual Studio Code. This extension provides syntax highlighting, real-time validation, and quick fixes for `.aam` configuration files.

## Features

### Syntax Highlighting
Automatically highlights syntax for `.aam` files.
- **Keys**: Alphanumeric keys are color-coded.
- **Values**: Supports both quoted and unquoted values.
- **Comments**: Highlights lines starting with `#` as comments.

### Diagnostics (Linting)
The extension validates your document in real-time and reports errors for:
- **Missing Assignment**: Lines missing the `=` operator.
- **Missing Key/Value**: Lines where the key or value is empty.
- **Invalid Characters**:
  - Keys can only contain alphanumerics, underscores, and spaces.
  - Values can only contain alphanumerics, underscores, spaces, quotes, and hashes.

### Quick Fixes
Code Actions are provided to automatically fix detected issues:
- **Add '='**: Inserts a missing assignment operator after the first word.
- **Clean Key**: Removes invalid characters from keys.
- **Clean Value**: Removes invalid characters from values.

## Extension Settings

This extension currently does not contribute any specific settings.

## Release Notes

### 0.0.1

Initial release with basic support:
- AAML language support (`.aam`).
- Syntax highlighting via TextMate grammar.
- Diagnostic collection for format validation.
- Quick Fix providers for common syntax errors.
