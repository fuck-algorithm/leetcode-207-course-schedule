import { useMemo } from 'react';
import { codeLines } from '../data/algorithmCode';
import { VariableState } from '../algorithm/types';
import './CodePanel.css';

interface CodePanelProps {
  highlightedLine: number;
  variables: VariableState[];
}

/**
 * Simple Java syntax highlighter
 */
function highlightJavaSyntax(code: string): string {
  const keywords = /\b(public|private|class|int|boolean|void|new|return|if|for|while|null)\b/g;
  const types = /\b(Map|List|Queue|Integer|HashMap|ArrayList|LinkedList|Arrays|String)\b/g;
  const comments = /(\/\/.*$)/gm;
  const strings = /(".*?")/g;
  const numbers = /\b(\d+)\b/g;

  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  result = result
    .replace(comments, '<span class="comment">$1</span>')
    .replace(strings, '<span class="string">$1</span>')
    .replace(keywords, '<span class="keyword">$1</span>')
    .replace(types, '<span class="type">$1</span>')
    .replace(numbers, '<span class="number">$1</span>');

  return result;
}

export default function CodePanel({
  highlightedLine,
  variables,
}: CodePanelProps) {
  const highlightedCode = useMemo(() => {
    return codeLines.map((line) => highlightJavaSyntax(line));
  }, []);

  // Group variables by line
  const variablesByLine = useMemo(() => {
    const map = new Map<number, VariableState[]>();
    for (const v of variables) {
      if (!map.has(v.line)) {
        map.set(v.line, []);
      }
      map.get(v.line)!.push(v);
    }
    return map;
  }, [variables]);

  return (
    <div className="code-panel">
      <div className="code-container">
        {highlightedCode.map((lineHtml, index) => {
          const lineNumber = index + 1;
          const isHighlighted = lineNumber === highlightedLine;
          const lineVariables = variablesByLine.get(lineNumber) || [];

          return (
            <div
              key={lineNumber}
              className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
            >
              <span className="line-number">{lineNumber}</span>
              <span
                className="line-content"
                dangerouslySetInnerHTML={{ __html: lineHtml }}
              />
              {lineVariables.length > 0 && (
                <span className="variable-values">
                  {lineVariables.map((v) => `${v.name}=${v.value}`).join(', ')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
