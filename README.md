# ESLint Output Explorer

> Explore ESLint failures with a very basic GUI.

## Getting Started

### Prerequisites

1. [Node](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/) are
   installed
2. [ESLint](https://eslint.org/) is installed and configured in your JavaScript
   or TypeScript project.

### Generate and Explore ESLint Output

1. Clone this repo:
    ```bash
    git clone git@github.com:jakierice/eslint-output-explorer.git
    ```
2. Install dependencies for ESLint Output Explorer:
    ```bash
    cd eslint-output-explorer

    yarn
    ```
2. Add the following command to your project's `scripts` in the `package.json`
   file. This will be used to generate a JSON formatted ESLint output file in to the proper file path of
   `eslint-output-explorer/src/data/eslint-output.json`:

   **NOTE:** Replace `{path/to/eslint-output-explorer/src/data/eslint-output.json}`
   with the appropriate path where you cloned the `eslint-output-explorer` directory on your local
   machine.

    ```json
    "scripts": {
      "eslint-output": "eslint --format json --output-file {path/to/eslint-output-explorer/src/data/eslint-output.json}",
    },
    ```
3. Run the new `eslint-output` script from your JavaScript or TypeScript
   project:
   ```bash
   yarn run eslint-output
   ```
   OR if your project is using [NPM](https://www.npmjs.com/), run this command:
   ```bash
   npm run eslint-output
   ```
4. Run the ESLint Output Explorer app locally to explore the ESLint output
   grouped by failed rule:
   ```bash
   # Run this command from the eslint-output-explorer project you cloned to your machine.
   yarn start
   ```
5. View all files that have failed a specific rule by clicking on the rule name
   and expanding the list of files. Clicking on a file name will open the file
   in [VS Code](https://code.visualstudio.com/) if you have it installed.
6. Fix some errors, run the `eslint-ouput` command from your project again, and
   then refresh your locally running ESLint Output Explorer app to see the new
   results.
