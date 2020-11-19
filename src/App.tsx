import './App.css'
import React from 'react'
import { constant, flow, identity, pipe, E, Eq, O, A, D } from './fp-ts-exports'

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

function makeGroupedFailuresList(
  data: ESLintResult,
): Array<{ rule: string; filePaths: Array<string> }> {
  return pipe(
    data,
    A.filter((r) => r.errorCount !== 0 || r.warningCount !== 0),
    (result) =>
      pipe(
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
        A.map((rule) => ({
          rule,
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

function ESLintFailureCollapsibleItem({
  rule,
  filePaths,
}: {
  rule: string
  filePaths: Array<string>
}) {
  return (
    <details key={rule}>
      <summary>{rule}</summary>
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

function ESLintFailuresList(result: ESLintResult) {
  return pipe(
    result,
    makeGroupedFailuresList,
    A.map(ESLintFailureCollapsibleItem),
  )
}

export function App() {
  return (
    <div className="App">
      {pipe(
        eslintOutput,
        eslintResultD.decode,
        E.map(ESLintFailuresList),
        E.getOrElse((decodeErrors) =>
          pipe(decodeErrors, D.draw, (e) => [
            <p>{e.split('}]').reverse()[0]}</p>,
          ]),
        ),
      )}
    </div>
  )
}

export default App
