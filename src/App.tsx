import './App.css'
import React from 'react'
import {
  constant,
  flow,
  identity,
  pipe,
  E,
  Eq,
  O,
  A,
  D,
  M,
  R,
} from './fp-ts-exports'

import eslintOutput from './data/eslint-output.json'

/* Note: the following types are based on the ESLint dev docs for working with
 * custom formatters found at: https://eslint.org/docs/developer-guide/working-with-custom-formatters
 */
const esLintResultMessageD = D.partial({
  ruleId: D.string,
  severity: D.union(D.literal(1), D.literal(2)),
  message: D.string,
  line: D.number,
  column: D.number,
  nodeType: D.nullable(D.string),
  messageId: D.string,
  endLine: D.number,
  endColumn: D.number,
})

type ESLintResultMessage = D.TypeOf<typeof esLintResultMessageD>

const eslintResultD = D.array(
  pipe(
    D.type({
      filePath: D.string,
      errorCount: D.number,
      warningCount: D.number,
      fixableErrorCount: D.number,
      fixableWarningCount: D.number,
    }),
    D.intersect(D.partial({ messages: D.array(esLintResultMessageD) })),
  ),
)

type ESLintResult = D.TypeOf<typeof eslintResultD>

function getRuleIdsFromResult(result: ESLintResult) {
  return pipe(
    result,
    A.map(
      flow(
        ({ messages }) => O.fromNullable(messages),
        O.map(A.filterMap(({ ruleId }) => O.fromNullable(ruleId))),
        O.fold(constant(A.empty), identity),
      ),
    ),
    A.flatten,
    A.uniq(Eq.eqString),
  )
}

const ruleCountsSumMonoid = M.getStructMonoid({
  errors: M.monoidSum,
  warnings: M.monoidSum,
})

function makeGroupedFailuresList(
  data: ESLintResult,
): Array<{
  rule: string
  counts: { errors: number; warnings: number }
  filePaths: Array<string>
}> {
  return pipe(
    data,
    A.filter((r) => r.errorCount !== 0 || r.warningCount !== 0),
    (result) =>
      pipe(
        result,
        getRuleIdsFromResult,
        A.map((rule) => ({
          rule,
          counts: pipe(
            result,
            A.map((r) =>
              pipe(
                r,
                ({ messages }) => O.fromNullable(messages),
                O.fold(
                  constant(A.empty),
                  A.map((failure) => ({
                    errors:
                      failure.ruleId === rule && failure.severity === 2 ? 1 : 0,
                    warnings:
                      failure.ruleId === rule && failure.severity === 1 ? 1 : 0,
                  })),
                ),
              ),
            ),
            A.flatten,
            A.foldMap(ruleCountsSumMonoid)(({ errors, warnings }) => ({
              errors,
              warnings,
            })),
          ),
          filePaths: pipe(
            result,
            A.map((r) =>
              pipe(
                r,
                ({ messages }) => O.fromNullable(messages),
                O.fold(
                  constant(A.empty),
                  A.filterMap(
                    flow(
                      ({ ruleId }) => O.fromNullable(ruleId),
                      O.chain(O.fromPredicate((id) => id === rule)),
                      O.map((_id) => r.filePath),
                    ),
                  ),
                ),
              ),
            ),
            A.flatten,
            A.uniq(Eq.eqString),
            A.map((filePath) => filePath),
          ),
        })),
      ),
  )
}

function renderESLintFailureCollapsibleItem({
  rule,
  filePaths,
  counts,
}: {
  rule: string
  filePaths: Array<string>
  counts: { errors: number; warnings: number }
}) {
  return (
    <details key={rule}>
      <summary>
        {rule}:{' '}
        {counts.errors !== 0 && (
          <span className="HighlightedText ErrorText">
            {counts.errors} Errors
          </span>
        )}
        {counts.warnings !== 0 && (
          <span className="HighlightedText WarningText">
            {counts.warnings} Warnings
          </span>
        )}
        throughout {filePaths.length} files
      </summary>
      <ul>
        {pipe(
          filePaths,
          A.map((path) => (
            <a href={'vscode://file' + path}>
              <li>{path}</li>
            </a>
          )),
        )}
      </ul>
    </details>
  )
}

function renderESLintFailuresList(result: ESLintResult) {
  return pipe(
    result,
    makeGroupedFailuresList,
    A.map(renderESLintFailureCollapsibleItem),
  )
}

function renderESLintResultDecodeErrorMessage(decodeErrors: D.DecodeError) {
  return pipe(decodeErrors, D.draw, (e) => [
    <p>{e.split('}]').reverse()[0]}</p>,
  ])
}

export function App() {
  return (
    <div className="App">
      {pipe(
        eslintOutput,
        eslintResultD.decode,
        E.map(renderESLintFailuresList),
        E.getOrElse(renderESLintResultDecodeErrorMessage),
      )}
    </div>
  )
}
