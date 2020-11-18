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
3. Run the ESLint Output Explorer app locally to explore the ESLint output
   grouped by failed rule:
   ```bash
   # Run this command from the eslint-output-explorer project you cloned to your machine.
   yarn start
   ```
