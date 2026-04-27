import fs from 'fs';
import pathModule from 'path';
import { visit } from 'unist-util-visit';

function normalizeImportPath(filePath) {
  return filePath.split(pathModule.sep).join('/');
}

function inferLanguage(filePath) {
  const extension = pathModule.extname(filePath).replace(/^\./, '');
  return extension === '' ? undefined : extension.replace(/^[^a-z0-9]+/i, '');
}

function parsePositiveInteger(value, attributeName, file, node) {
  if (value === undefined || value === null || value === '') return undefined;

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    file.fail(`\`${attributeName}\` must be a positive integer on \`code-from\``, node);
  }

  return parsed;
}

function parseLinesSelection(rawValue, totalLines, file, node) {
  if (!rawValue) return undefined;

  const selected = [];
  for (const part of String(rawValue)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)) {
    const match = /^(\d+)(?:-(\d+)?)?$|^-(\d+)$/.exec(part);

    if (!match) {
      file.fail(`Invalid \`lines\` segment on \`code-from\`: ${part}`, node);
    }

    if (match[3]) {
      const end = Number.parseInt(match[3], 10);
      for (let lineNumber = 1; lineNumber <= Math.min(end, totalLines); lineNumber += 1) {
        selected.push(lineNumber);
      }
      continue;
    }

    const start = Number.parseInt(match[1], 10);
    const end = match[2] ? Number.parseInt(match[2], 10) : start;
    if (start > end) {
      file.fail(`Invalid \`lines\` range on \`code-from\`: ${part}`, node);
    }

    for (let lineNumber = start; lineNumber <= Math.min(end, totalLines); lineNumber += 1) {
      selected.push(lineNumber);
    }
  }

  return [...new Set(selected)].filter((lineNumber) => lineNumber >= 1 && lineNumber <= totalLines);
}

function sliceContent(value, attributes, file, node) {
  const newline = value.includes('\r\n') ? '\r\n' : '\n';
  const lines = value.split(/\r?\n/);
  const hasTrailingNewline = value.endsWith(newline);

  const explicitLines = parseLinesSelection(attributes.lines, lines.length, file, node);
  const from = parsePositiveInteger(attributes.from, 'from', file, node);
  const to = parsePositiveInteger(attributes.to, 'to', file, node);

  if (from !== undefined && to !== undefined && from > to) {
    file.fail('`from` must be less than or equal to `to` on `code-from`', node);
  }

  let selectedLineNumbers;
  let selectionLabel;

  if (explicitLines) {
    selectedLineNumbers = explicitLines;
    selectionLabel = `lines ${String(attributes.lines)}`;
  } else if (from !== undefined || to !== undefined) {
    const start = from || 1;
    const end = to || lines.length;
    selectedLineNumbers = [];
    for (let lineNumber = start; lineNumber <= Math.min(end, lines.length); lineNumber += 1) {
      selectedLineNumbers.push(lineNumber);
    }
    selectionLabel =
      start === end ? `line ${start}` : `lines ${start}-${Math.min(end, lines.length)}`;
  }

  if (!selectedLineNumbers || selectedLineNumbers.length === 0) {
    return {
      selectionLabel: undefined,
      value,
    };
  }

  const slicedLines = selectedLineNumbers.map((lineNumber) => lines[lineNumber - 1]);
  const slicedValue = slicedLines.join(newline);

  return {
    selectionLabel,
    value:
      hasTrailingNewline && selectedLineNumbers[selectedLineNumbers.length - 1] === lines.length
        ? `${slicedValue}${newline}`
        : slicedValue,
  };
}

function resolveFilePath(file, rawPath, node, contentBaseDir) {
  if (!file.path) {
    file.fail('Could not resolve the current MDX file path for `code-from`', node);
  }

  const baseDir = pathModule.dirname(file.path);
  if (pathModule.isAbsolute(rawPath)) {
    const contentDir = contentBaseDir || pathModule.resolve(process.cwd(), 'src/content');
    return pathModule.resolve(contentDir, `.${rawPath}`);
  }

  return pathModule.resolve(baseDir, rawPath);
}

function buildImportPath(file, targetFilePath, node) {
  if (!file.path) {
    file.fail('Could not resolve the current MDX file path for `code-from`', node);
  }

  const baseDir = pathModule.dirname(file.path);
  const relativePath = normalizeImportPath(pathModule.relative(baseDir, targetFilePath));
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

function createImportNode(importName, importPath) {
  return {
    type: 'mdxjsEsm',
    value: '',
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ImportDeclaration',
            attributes: [],
            source: {
              type: 'Literal',
              value: `${importPath}?url`,
              raw: JSON.stringify(`${importPath}?url`),
            },
            specifiers: [
              {
                type: 'ImportDefaultSpecifier',
                local: { type: 'Identifier', name: importName },
              },
            ],
          },
        ],
      },
    },
  };
}

function createExpressionAttribute(name, identifier) {
  return {
    type: 'mdxJsxAttribute',
    name,
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: identifier,
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          comments: [],
          body: [
            {
              type: 'ExpressionStatement',
              expression: { type: 'Identifier', name: identifier },
            },
          ],
        },
      },
    },
  };
}

export function remarkDirectiveCodeFrom(options = {}) {
  return (tree, file) => {
    const importedFiles = new Map();

    visit(tree, ['textDirective', 'leafDirective'], (node, index, parent) => {
      if (!['code-from', 'codefrom'].includes(node.name)) return;

      if (node.type === 'textDirective') {
        file.fail(
          'Unexpected `:code-from` text directive, use two colons for a leaf directive',
          node
        );
      }

      if (!parent || index === undefined) {
        file.fail('Could not replace `code-from` directive in the markdown tree', node);
      }

      const attributes = node.attributes || {};
      const rawPath = attributes.path;

      if (!rawPath) {
        file.fail('Missing `path` attribute on `code-from` directive', node);
      }

      const filePath = resolveFilePath(file, String(rawPath), node, options.contentBaseDir);

      if (!fs.existsSync(filePath)) {
        file.fail(`Could not find file for \`code-from\`: ${rawPath}`, node);
      }

      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        file.fail(`\`code-from\` path must point to a file, got directory: ${rawPath}`, node);
      }

      let value;
      try {
        value = fs.readFileSync(filePath, attributes.encoding || 'utf8');
      } catch (error) {
        file.fail(`Could not read file for \`code-from\`: ${error.message}`, node);
      }

      const fileContents = typeof value === 'string' ? value : String(value);
      const { selectionLabel, value: slicedValue } = sliceContent(
        fileContents,
        attributes,
        file,
        node
      );
      const importPath = buildImportPath(file, filePath, node);

      let importName = importedFiles.get(importPath);
      if (!importName) {
        importName = `__code_from_${importedFiles.size}_${pathModule.basename(filePath).replace(/\W/g, '_')}__`;
        importedFiles.set(importPath, importName);
        tree.children.unshift(createImportNode(importName, importPath));
      }

      const componentNode = {
        type: 'mdxJsxFlowElement',
        name: 'CodeFromBlock',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'fileName', value: pathModule.basename(filePath) },
          createExpressionAttribute('downloadUrl', importName),
        ],
        children: [
          {
            type: 'code',
            lang: attributes.lang || inferLanguage(filePath),
            meta: attributes.meta ? String(attributes.meta) : null,
            value: slicedValue,
          },
        ],
      };

      if (selectionLabel) {
        componentNode.attributes.push({
          type: 'mdxJsxAttribute',
          name: 'selectionLabel',
          value: selectionLabel,
        });
      }

      if (attributes.title) {
        componentNode.attributes.push({
          type: 'mdxJsxAttribute',
          name: 'title',
          value: String(attributes.title),
        });
      }

      const downloadLabel = attributes.downloadLabel || attributes['download-label'];

      if (downloadLabel) {
        componentNode.attributes.push({
          type: 'mdxJsxAttribute',
          name: 'downloadLabel',
          value: String(downloadLabel),
        });
      }

      parent.children.splice(index, 1, componentNode);
    });
  };
}
