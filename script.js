document.getElementById('runButton').addEventListener('click', () => {
  const code = document.getElementById('codeInput').value.split('\n');
  const consoleOutput = document.getElementById('console');
  consoleOutput.innerHTML = ''; // Clear previous output

  const jsCode = convertToJS(code);
  console.log(jsCode); // Print the generated JS code to the console for verification
  try {
    eval(jsCode);
  } catch (error) {
    const lineNumber = error.lineNumber || error.line || 'unknown';
    consoleOutput.innerHTML += `Error on line ${lineNumber}: ${error.message}<br>`;
  }
});

function convertToJS(code) {
  let jsLines = [];
  jsLines.push('let acc = 0;'); // Initialize the accumulator
  const variables = {};

  code.forEach((line, index) => {
    line = line.trim();

    // Ignore comments
    if (line.startsWith('#')) {
      return; // Skip this line
    }

    // Remove comments from the line
    const commentIndex = line.indexOf('#');
    if (commentIndex !== -1) {
      line = line.substring(0, commentIndex).trim(); // Remove comment part
    }

    if (line) {
      const tokens = line.split(' ');
      const command = tokens[0];

      try {
        switch (command) {
          case 'def':
            const varName = tokens[1];
            const value = parseInt(tokens[2]);
            variables[varName] = value;
            jsLines.push(`let ${varName} = ${value};`);
            break;
          case 'set':
            const setVarName = tokens[1];
            const setValue = parseInt(tokens[2]);
            variables[setVarName] = setValue;
            jsLines.push(`${setVarName} = ${setValue};`);
            break;
          case 'mov':
            const srcVar = tokens[1];
            const dstVar = tokens[2];
            variables[dstVar] = variables[srcVar];
            jsLines.push(`${dstVar} = ${srcVar};`);
            break;
          case 'inc':
            const incVar = tokens[1];
            variables[incVar]++;
            jsLines.push(`${incVar}++;`);
            break;
          case 'dec':
            const decVar = tokens[1];
            variables[decVar]--;
            jsLines.push(`${decVar}--;`);
            break;
          case 'add':
            if (tokens[1] === 'acc') {
              jsLines.push(`acc += ${variables[tokens[2]] || 0};`);
            } else if (tokens[2] === 'acc') {
              jsLines.push(`acc += ${variables[tokens[1]] || 0};`);
            } else {
              jsLines.push(`acc = ${variables[tokens[1]] || 0} + ${variables[tokens[2]] || 0};`);
            }
            break;
          case 'sub':
            if (tokens[1] === 'acc') {
              jsLines.push(`acc -= ${variables[tokens[2]] || 0};`);
            } else if (tokens[2] === 'acc') {
              jsLines.push(`acc = ${variables[tokens[1]] || 0} - acc;`);
            } else {
              jsLines.push(`acc = ${variables[tokens[1]] || 0} - ${variables[tokens[2]] || 0};`);
            }
            break;
          case 'mul':
            if (tokens[1] === 'acc') {
              jsLines.push(`acc *= ${variables[tokens[2]] || 0};`);
            } else if (tokens[2] === 'acc') {
              jsLines.push(`acc *= ${variables[tokens[1]] || 0};`);
            } else {
              jsLines.push(`acc = ${variables[tokens[1]] || 0} * ${variables[tokens[2]] || 0};`);
            }
            break;
          case 'div':
            if (tokens[1] === 'acc') {
              jsLines.push(`acc /= (${variables[tokens[2]] || 1});`);
            } else if (tokens[2] === 'acc') {
              jsLines.push(`acc = ${variables[tokens[1]] || 0} / (acc || 1);`);
            } else {
              jsLines.push(`acc = ${variables[tokens[1]] || 0} / (${variables[tokens[2]] || 1});`);
            }
            break;
          case 'mod':
            if (tokens[1] === 'acc') {
              jsLines.push(`acc %= (${variables[tokens[2]] || 1});`);
            } else if (tokens[2] === 'acc') {
              jsLines.push(`acc = ${variables[tokens[1]] || 0} % (acc || 1);`);
            } else {
              jsLines.push(`acc = ${variables[tokens[1]] || 0} % (${variables[tokens[2]] || 1});`);
            }
            break;
          case 'print':
            jsLines.push(`document.getElementById('console').innerHTML += ${tokens[1]} + '<br>';`);
            break;
          case 'printstr':
            const str = line.substring(8); // Extract the string without quotes
            jsLines.push(`document.getElementById('console').innerHTML += '${str}' + '<br>';`);
            break;
          case 'loop':
            const loopCount = parseInt(tokens[1]);
            jsLines.push(`for (let index = 0; index < ${loopCount}; index++) {`);
            break;
          case 'endloop':
            jsLines.push(`}`);
            break;
          case 'if':
            const condition = tokens[1];
            const left = variables[tokens[2]] || tokens[2]; // Allow for direct variable access
            const right = variables[tokens[3]] || tokens[3]; // Allow for direct variable access
            let jsCondition = '';

            switch (condition) {
              case 'eq':
                jsCondition = `${left} === ${right}`;
                break;
              case 'neq':
                jsCondition = `${left} !== ${right}`;
                break;
              case 'gt':
                jsCondition = `${left} > ${right}`;
                break;
              case 'lt':
                jsCondition = `${left} < ${right}`;
                break;
            }
            jsLines.push(`if (${jsCondition}) {`);
            break;
          case 'elseif':
            if (tokens.length < 4) {
              jsLines.push(`} else {`); // Handle the case where no condition is provided
            } else {
              const elseifCondition = tokens[1];
              const elseifLeft = variables[tokens[2]] || tokens[2]; // Allow for direct variable access
              const elseifRight = variables[tokens[3]] || tokens[3]; // Allow for direct variable access
              let elseifJsCondition = '';

              switch (elseifCondition) {
                case 'eq':
                  elseifJsCondition = `${elseifLeft} === ${elseifRight}`;
                  break;
                case 'neq':
                  elseifJsCondition = `${elseifLeft} !== ${elseifRight}`;
                  break;
                case 'gt':
                  elseifJsCondition = `${elseifLeft} > ${elseifRight}`;
                  break;
                case 'lt':
                  elseifJsCondition = `${elseifLeft} < ${elseifRight}`;
                  break;
              }
              jsLines.push(`} else if (${elseifJsCondition}) {`);
            }
            break;
          case 'else':
            jsLines.push(`} else {`);
            break;
          case 'endif':
            jsLines.push(`}`);
            break;
          default:
            document.getElementById('console').innerHTML += `Unknown command on line ${index + 1}: ${line}<br>`;
        }
      } catch (innerError) {
        document.getElementById('console').innerHTML += `Error processing line ${index + 1}: ${innerError.message}<br>`;
      }
    }
  });

  return jsLines.join('\n');
}