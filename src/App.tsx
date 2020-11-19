import React from 'react'
import './App.css'
import * as E from 'fp-ts/lib/Either'
import * as Eq from 'fp-ts/lib/Eq'
import * as O from 'fp-ts/lib/Option'
import * as A from 'fp-ts/lib/Array'
import * as D from 'io-ts/lib/Decoder'
import { constant, flow, identity, pipe } from 'fp-ts/lib/function'

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

function renderGroupedFailuresList(data: ESLintResult) {
  return pipe(
    data,
    A.filter((r) => r.errorCount !== 0 || r.warningCount !== 0),
    (result) => (
      <>
        {pipe(
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
          A.map((rule) => (
            <details key={rule}>
              <summary>{rule}</summary>
              <ul>
                {pipe(
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
                  A.map((filePath) => (
                    <a href={'vscode://file' + filePath} key={filePath}>
                      <li>{filePath}</li>
                    </a>
                  )),
                )}
              </ul>
            </details>
          )),
        )}
      </>
    ),
  )
}

function App() {
  return (
    <div className="App">
      {pipe(
        eslintOutput,
        eslintResultD.decode,
        E.map(renderGroupedFailuresList),
        E.getOrElse((decodeErrors) =>
          pipe(decodeErrors, D.draw, (e) => (
            <p>{e.split('}]').reverse()[0]}</p>
          )),
        ),
      )}
    </div>
  )
}

export default App
