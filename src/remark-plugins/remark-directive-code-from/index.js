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

function createClassAttribute(value) {
  return {
    type: 'mdxJsxAttribute',
    name: 'class',
    value,
  };
}

function normalizeCssSize(value) {
  if (!value) return undefined;

  const trimmed = String(value).trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'none') return 'none';

  if (/^\d+(?:\.\d+)?$/.test(trimmed)) return `${trimmed}px`;

  return trimmed;
}

function createTextElement(name, className, value) {
  return {
    type: 'mdxJsxTextElement',
    name,
    attributes: className ? [createClassAttribute(className)] : [],
    children: [{ type: 'text', value }],
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

      const maxHeight = attributes.maxHeight ?? attributes.maxheight ?? attributes.height;
      const downloadLabel = attributes.downloadLabel || attributes['download-label'];
      const heading = attributes.title ? String(attributes.title) : pathModule.basename(filePath);
      const toolbarChildren = [
        {
          type: 'mdxJsxFlowElement',
          name: 'div',
          attributes: [createClassAttribute('code-from-meta')],
          children: [createTextElement('span', 'code-from-title', heading)],
        },
        {
          type: 'mdxJsxFlowElement',
          name: 'a',
          attributes: [
            createClassAttribute('code-from-download'),
            createExpressionAttribute('href', importName),
            { type: 'mdxJsxAttribute', name: 'download', value: pathModule.basename(filePath) },
          ],
          children: [{ type: 'text', value: String(downloadLabel || 'Download original') }],
        },
      ];

      if (selectionLabel) {
        toolbarChildren[0].children.push(
          createTextElement('span', 'code-from-selection', selectionLabel)
        );
      }

      const wrapperAttributes = [createClassAttribute('code-from')];
      const normalizedMaxHeight = normalizeCssSize(maxHeight);
      if (normalizedMaxHeight) {
        wrapperAttributes.push({
          type: 'mdxJsxAttribute',
          name: 'style',
          value: `--code-from-max-h: ${normalizedMaxHeight};`,
        });
      }

      node.type = 'mdxJsxFlowElement';
      node.name = 'div';
      node.attributes = wrapperAttributes;
      node.children = [
        {
          type: 'mdxJsxFlowElement',
          name: 'div',
          attributes: [createClassAttribute('code-from-toolbar')],
          children: toolbarChildren,
        },
        {
          type: 'code',
          lang: attributes.lang || inferLanguage(filePath),
          meta: attributes.meta ? String(attributes.meta) : null,
          value: slicedValue,
        },
      ];
      node.data = undefined;
    });
  };
}
