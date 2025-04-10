import { javascriptGenerator } from 'blockly/javascript';
import * as javascript from 'blockly/javascript';
import './javascriptGenerators';  // Ensures JavaScript generator is included


javascriptGenerator.scrub_ = function (block, code, thisOnly) {
    // Check if the block is of type 'key_pair' or 'dictionary'
    if (block.type === 'key_pair' || block.type === 'dictionary' || block.type === 'key_block' || block.type === 'value_block') {
        var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
        if (nextBlock && !thisOnly) {
            return code + ',\n' + javascriptGenerator.blockToCode(nextBlock);
        }
        return code;
    }
    // For other blocks, apply default scrubbing logic
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    var codeNext = nextBlock ? javascriptGenerator.blockToCode(nextBlock) : '';
    if (!thisOnly) {
        if (codeNext) {
            codeNext = '\n' + codeNext;
        }
    }
    return code + codeNext;
};

javascriptGenerator.forBlock['key_pair'] = function (block, generator) {
    var key1 = generator.valueToCode(block, 'KEY1', javascript.Order.ATOMIC);
    var key2 = generator.valueToCode(block, 'KEY2', javascript.Order.ATOMIC);
    var code = "`${" + key1 + "},${" + key2 + "}`";
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['for_loop'] = function (block, generator) {
    var variable_var = block.getField('VAR').getText();
    var value_from = generator.valueToCode(block, 'FROM', javascript.Order.ATOMIC) || '0';
    var value_to = generator.valueToCode(block, 'TO', javascript.Order.ATOMIC) || '10';
    var value_step = generator.valueToCode(block, 'STEP', javascript.Order.ATOMIC) || '1';
    var statements_do = generator.statementToCode(block, 'DO');

    // Change the conditional operator from <= to <
    var code = 'for (' + variable_var + ' = ' + value_from + '; ' + variable_var +
        ' < ' + value_to + '; ' + variable_var + ' += ' + value_step + ') {\n' +
        statements_do + '\n}\n';
    return code;
};

javascriptGenerator.forBlock['check_index'] = function (block, generator) {
    var index = generator.valueToCode(block, 'INDEX', javascript.Order.ATOMIC);
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // Generate JavaScript code
    var code = 'board[' + index + '] === ' + value;
    return [code, javascript.Order.NONE];
};

javascriptGenerator.forBlock['board_length'] = function (block) {
    var code = 'board.length';
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['board'] = function (block) {
    var code = 'board';
    return [code, javascript.Order.ATOMIC];
};

javascript.javascriptGenerator.forBlock['update_dict'] = function (block, generator) {
    var name = block.getField('NAME').getText();
    var key = generator.valueToCode(block, 'KEY', javascript.Order.ATOMIC);
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // TODO: Assemble javascript into code variable.
    var code = name + '[' + key + '] = ' + value + ';\n';
    return code;
};

javascriptGenerator.forBlock['key_block'] = function (block, generator) {
    var key = block.getFieldValue('KEY');
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // Assemble JavaScript code.
    var code = '"' + key + '": ' + value;
    return code;
};

javascriptGenerator.forBlock['const_block'] = function (block, generator) {
    var name = block.getFieldValue('NAME');
    var value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC);
    // Assemble JavaScript code.
    var code = 'const ' + name + ' = ' + value + ';\n';
    return code;
};

javascriptGenerator.forBlock['value_block'] = function (block) {
    var value = block.getFieldValue('VALUE');
    var code = 'board[' + value + ']';
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['quad_pair'] = function (block) {
    var var1 = block.getFieldValue('VAR_1');
    var var2 = block.getFieldValue('VAR_2');
    var value = block.getFieldValue('MEMBER_VALUE');
    var name = var1 + ',' + var2;
    var code = '"' + name + '": ' + value;
    return code;
};

javascriptGenerator.forBlock['key_value'] = function (block) {
    var name = block.getFieldValue('MEMBER_NAME');
    var value = block.getFieldValue('MEMBER_VALUE');
    var code = '"' + name + '": ' + value;
    return code;
};

javascriptGenerator.forBlock['dictionary'] = function (block, generator) {
    var name = block.getFieldValue('NAME');
    var statementMembers =
        generator.statementToCode(block, 'MEMBERS');
    var code = `${name} = {\n${statementMembers}\n} `;
    return code;
};

javascriptGenerator.forBlock['dictionary_block'] = function (block, generator) {
    var code = '{}';
    return [code, javascript.Order.ATOMIC];
};

javascriptGenerator.forBlock['merge_dict'] = function (block, generator) {
    var statementMembers =
        generator.statementToCode(block, 'MEMBERS');
    var code = '"{\n' + statementMembers + '\n}"';
    return code;
};

javascriptGenerator.forBlock['quad_dictionary'] = function (block, generator) {
    var name = block.getFieldValue('NAME');
    var key1_p1 = block.getFieldValue('KEY1_P1');
    var key1_p2 = block.getFieldValue('KEY1_P2');
    var val1 = block.getFieldValue('VAL1');
    var key2_p1 = block.getFieldValue('KEY2_P1');
    var key2_p2 = block.getFieldValue('KEY2_P2');
    var val2 = block.getFieldValue('VAL2');
    var key3_p1 = block.getFieldValue('KEY3_P1');
    var key3_p2 = block.getFieldValue('KEY3_P2');
    var val3 = block.getFieldValue('VAL3');
    // TODO: Assemble javascript into code variable.
    var code = name + ' = {"' + key1_p1 + ',' + key1_p2 + '": ' + val1 + ', "' + key2_p1 + ',' + key2_p2 + '": ' + val2 + ', "' + key3_p1 + ',' + key3_p2 + '": ' + val3 + '}\n';
    return code;
};

javascriptGenerator.forBlock['update_quad_dict'] = function (block) {
    var name = block.getFieldValue('NAME');
    var key = block.getFieldValue('KEY');
    var key2 = block.getFieldValue('KEY2');
    var val = block.getFieldValue('VALUE');
    // TODO: Assemble javascript into code variable.
    var code = name + '.update({"' + key + ',' + key2 + '": ' + val + '})\n'
    return code;
};

// New block for PyQUBO variable definition
javascriptGenerator.forBlock['pyqubo_variable'] = function (block, generator) {
  var type = block.getFieldValue('TYPE');
  var name = block.getFieldValue('NAME');
  
  var code = `variables["${name}"] = { "type": "${type}" };\n`;
  if (type === 'Array') {
      code += `variables["${name}"]["size"] = 10;\n`; // Default size
  }
  
  return code;
};

// New block for PyQUBO constraint
javascriptGenerator.forBlock['pyqubo_constraint'] = function(block, generator) {
  var lhs = generator.valueToCode(block, 'LHS', javascriptGenerator.ORDER_ATOMIC);
  var operator = block.getFieldValue('OPERATOR');
  var rhs = generator.valueToCode(block, 'RHS', javascriptGenerator.ORDER_ATOMIC);
  
  // Remove any quotes from the LHS to ensure it's properly formatted
  lhs = lhs.replace(/^["'](.*)["']$/, '$1');
  
  // Format the constraint correctly
  var code = `constraints.push({
    "lhs": "${lhs}",
    "comparison": "${operator}",
    "rhs": ${rhs}
  });\n`;
  
  return code;
};

// Updated PyQUBO Objective Block Generator to work with raw text
javascriptGenerator.forBlock['pyqubo_objective'] = function(block) {
  var goal = block.getFieldValue('GOAL');
  // Get expression without quotes
  var expression = javascriptGenerator.valueToCode(block, 'EXPRESSION', javascriptGenerator.ORDER_ATOMIC);
  
  // Remove any quotes around the expression
  expression = expression.replace(/^["'](.*)["']$/, '$1');
  
  // Fix missing multiplication operators between numbers and variables
  // This regex will find numbers directly followed by variable names and insert a '*' between them
  expression = expression.replace(/(\d+)([a-zA-Z_]+)/g, '$1*$2');
  
  // For maximize, we negate the objective since PyQUBO minimizes by default
  const prefix = goal === 'maximize' ? '-(' : '';
  const suffix = goal === 'maximize' ? ')' : '';
  
  // Do not add extra quotes around the expression
  var code = `objective = "${prefix}${expression}${suffix}";\n`;
  
  return code;
};

// Improved function block generator
javascriptGenerator.forBlock['function'] = function (block, generator) {
  var name = block.getFieldValue('NAME').replace(/\s/g, '_');
  var param = generator.valueToCode(block, 'PARAM', javascript.Order.ATOMIC) || '{}';
  var body = generator.statementToCode(block, 'BODY') || '';
  var linear = generator.valueToCode(block, 'LINEAR', javascript.Order.ATOMIC) || '{}';
  var quadratic = generator.valueToCode(block, 'QUADRATIC', javascript.Order.ATOMIC) || '{}';
  
  // Ensure linear and quadratic are valid objects
  linear = linear.trim() === '' ? '{}' : linear;
  quadratic = quadratic.trim() === '' ? '{}' : quadratic;
  
  var code = `function ${name}(${param}) {\n${body}  return {\n    'linear': ${linear},\n    'quadratic': ${quadratic}\n  };\n}`;
  return code;
};

// Add these generators to your javascriptGenerators.js file

javascriptGenerator.forBlock['init_dictionaries'] = function(block) {
  return 'const linear = {};\nconst quadratic = {};\n';
};

javascriptGenerator.forBlock['set_linear_weight'] = function(block) {
  const variable = javascriptGenerator.valueToCode(block, 'VARIABLE', javascriptGenerator.ORDER_ATOMIC) || '"x0"';
  const weight = javascriptGenerator.valueToCode(block, 'WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '0';
  return `linear[${variable}] = ${weight};\n`;
};

javascriptGenerator.forBlock['set_quadratic_weight'] = function(block) {
  const variable1 = javascriptGenerator.valueToCode(block, 'VARIABLE1', javascriptGenerator.ORDER_ATOMIC) || '"x0"';
  const variable2 = javascriptGenerator.valueToCode(block, 'VARIABLE2', javascriptGenerator.ORDER_ATOMIC) || '"x0"';
  const weight = javascriptGenerator.valueToCode(block, 'WEIGHT', javascriptGenerator.ORDER_ATOMIC) || '0';
  return `quadratic[\`\${${variable1}},\${${variable2}}\`] = ${weight};\n`;
};

javascriptGenerator.forBlock['return_dictionaries'] = function(block) {
  return 'return { "linear": linear, "quadratic": quadratic };\n';
};

// NEW ENHANCED PYQUBO GENERATORS

// Variable Property Block Generator
javascriptGenerator.forBlock['pyqubo_var_property'] = function(block) {
  const property = block.getFieldValue('PROPERTY');
  const value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC) || '0';
  const varName = block.getSurroundParent() ? block.getSurroundParent().getFieldValue('NAME') : 'unknown';
  
  return `variables["${varName}"]["${property}"] = ${value};\n`;
};

// Expression Block Generator
javascriptGenerator.forBlock['pyqubo_expression'] = function(block) {
  const left = javascriptGenerator.valueToCode(block, 'LEFT', javascriptGenerator.ORDER_ATOMIC);
  const operator = block.getFieldValue('OPERATOR');
  const right = javascriptGenerator.valueToCode(block, 'RIGHT', javascriptGenerator.ORDER_ATOMIC);
  
  const code = `(${left} ${operator} ${right})`;
  return [code, javascriptGenerator.ORDER_ATOMIC];
};

// Variable Reference Block Generator
javascriptGenerator.forBlock['pyqubo_var_reference'] = function(block) {
  const name = block.getFieldValue('NAME');
  return [name, javascriptGenerator.ORDER_ATOMIC];
};

// Array Reference Block Generator
javascriptGenerator.forBlock['pyqubo_array_reference'] = function(block) {
  const name = block.getFieldValue('NAME');
  const index = javascriptGenerator.valueToCode(block, 'INDEX', javascriptGenerator.ORDER_ATOMIC);
  
  return [`${name}[${index}]`, javascriptGenerator.ORDER_MEMBER];
};

// 2D Array Reference Block Generator
javascriptGenerator.forBlock['pyqubo_2d_array_reference'] = function(block) {
  const name = block.getFieldValue('NAME');
  const row = javascriptGenerator.valueToCode(block, 'ROW', javascriptGenerator.ORDER_ATOMIC);
  const col = javascriptGenerator.valueToCode(block, 'COL', javascriptGenerator.ORDER_ATOMIC);
  
  // For static values, calculate the index directly
  if (!isNaN(parseInt(row)) && !isNaN(parseInt(col))) {
    const rowNum = parseInt(row);
    const colNum = parseInt(col);
    const index = rowNum * 3 + colNum; // Assuming 3x3 grid for TicTacToe
    return [`${name}${index}`, javascriptGenerator.ORDER_ATOMIC];
  }
  
  // For dynamic values, generate a calculation
  return [`${name} + ((${row} * 3) + ${col})`, javascriptGenerator.ORDER_ADDITION];
};

// Modify the array_shape_input generator to return a special format that indicates this is a 2D array
javascriptGenerator.forBlock['array_shape_input'] = function(block) {
  const rows = block.getFieldValue('ROWS');
  const cols = block.getFieldValue('COLS');
  
  // Return a special format to indicate this is a 2D array
  return [`[${rows}, ${cols}]`, javascriptGenerator.ORDER_ATOMIC];
};

// Array Sum Block Generator
javascriptGenerator.forBlock['pyqubo_array_sum'] = function(block) {
  const name = block.getFieldValue('NAME');
  const from = javascriptGenerator.valueToCode(block, 'FROM', javascriptGenerator.ORDER_ATOMIC) || '0';
  const to = javascriptGenerator.valueToCode(block, 'TO', javascriptGenerator.ORDER_ATOMIC) || '0';
  
  // Create a string representation of the sum
  let sumExpr = '(';
  sumExpr += `${name}[${from}]`;
  sumExpr += ` + ... + ${name}[${to}]`;
  sumExpr += ')';
  
  return [sumExpr, javascriptGenerator.ORDER_ATOMIC];
};

// QUBO Model Block Generator
javascriptGenerator.forBlock['pyqubo_model'] = function(block) {
  const functionName = block.getFieldValue('NAME');
  const variables = javascriptGenerator.statementToCode(block, 'VARIABLES');
  const constraints = javascriptGenerator.statementToCode(block, 'CONSTRAINTS');
  const objective = javascriptGenerator.statementToCode(block, 'OBJECTIVE');
  
  const code = `
function ${functionName}(board) {
  // Initialize collections for PyQUBO model
  const variables = {};
  const constraints = [];
  let objective = "0";
  
  // Define variables
  ${variables}
  
  // Add constraints
  ${constraints}
  
  // Set objective function
  ${objective}
  
  // Return the complete QUBO model
  return {
    "variables": variables,
    "Constraints": constraints,
    "Objective": objective
  };
}`;
  
  return code;
};

  // Add the corresponding JavaScript generator
javascriptGenerator.forBlock['variable_to_expression'] = function(block) {
  const variable = block.getField('VAR').getText();
  return [variable, javascriptGenerator.ORDER_ATOMIC];
};

// Update the raw_text generator to be more compatible
javascriptGenerator.forBlock['raw_text'] = function(block) {
  const text = block.getFieldValue('TEXT');
  // Return as either a string or number based on content
  if (!isNaN(Number(text))) {
    return [text, javascriptGenerator.ORDER_ATOMIC];
  }
  return [text, javascriptGenerator.ORDER_ATOMIC];
};

// Generator for pyqubo_array_variable
javascriptGenerator.forBlock['pyqubo_array_variable'] = function(block) {
  const name = block.getFieldValue('NAME');
  const vartype = block.getFieldValue('VARTYPE');
  const shape = javascriptGenerator.valueToCode(block, 'SHAPE', javascriptGenerator.ORDER_ATOMIC) || '9';
  
  // Check if the shape is a 2D array format [rows, cols]
  const is2DArray = shape.startsWith('[') && shape.includes(',');
  
  let code = '';
  
  if (is2DArray) {
    // Parse the 2D array parameters
    const match = shape.match(/\[(\d+),\s*(\d+)\]/);
    if (match) {
      const rows = parseInt(match[1]);
      const cols = parseInt(match[2]);
      
      // Generate variables for a 2D grid with sequential numbering
      let counter = 0;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          code += `variables["${name}${counter}"] = { "type": "${vartype}" };\n`;
          counter++;
        }
      }
    } else {
      // Fallback to 9 variables for TicTacToe
      for (let i = 0; i < 9; i++) {
        code += `variables["${name}${i}"] = { "type": "${vartype}" };\n`;
      }
    }
  } else {
    // This is a 1D array with numeric size
    const count = parseInt(shape);
    if (!isNaN(count)) {
      for (let i = 0; i < count; i++) {
        code += `variables["${name}${i}"] = { "type": "${vartype}" };\n`;
      }
    } else {
      // Fallback to 9 variables for TicTacToe
      for (let i = 0; i < 9; i++) {
        code += `variables["${name}${i}"] = { "type": "${vartype}" };\n`;
      }
    }
  }
  
  return code;
};

// Generator for pyqubo_array_shape
javascriptGenerator.forBlock['pyqubo_array_shape'] = function(block) {
  const dimension = block.getFieldValue('DIMENSION');
  const dimensionsCode = javascriptGenerator.statementToCode(block, 'DIMENSIONS');
  
  // Parse the dimensions from the statement code
  const dimensions = dimensionsCode.split('\n')
    .filter(line => line.trim())
    .map(line => {
      // Extract numbers from the dimension statement
      const match = line.match(/(\d+)/);
      return match ? parseInt(match[1]) : 10;
    });
  
  if (dimension === '1D') {
    return [`[${dimensions[0] || 10}]`, javascriptGenerator.ORDER_ATOMIC];
  } else { // 2D
    return [`[${dimensions[0] || 3}, ${dimensions[1] || 3}]`, javascriptGenerator.ORDER_ATOMIC];
  }
};

// Add this code to your javascriptGenerators.js file

// Generator for the new array_shape_input block
javascriptGenerator.forBlock['array_shape_input'] = function(block) {
  const rows = block.getFieldValue('ROWS');
  const cols = block.getFieldValue('COLS');
  
  // Return a string representation of the array
  return [`[${rows}, ${cols}]`, javascriptGenerator.ORDER_ATOMIC];
};

// Update the pyqubo_array_variable generator to handle both 1D and 2D arrays
javascriptGenerator.forBlock['pyqubo_array_variable'] = function(block) {
  const name = block.getFieldValue('NAME');
  const vartype = block.getFieldValue('VARTYPE');
  const shape = javascriptGenerator.valueToCode(block, 'SHAPE', javascriptGenerator.ORDER_ATOMIC) || '9';
  
  // Check if the shape is a 2D array format [rows, cols]
  const is2DArray = shape.startsWith('[') && shape.includes(',');
  
  let code = '';
  
  if (is2DArray) {
    // Parse the 2D array parameters
    const match = shape.match(/\[(\d+),\s*(\d+)\]/);
    if (match) {
      const rows = parseInt(match[1]);
      const cols = parseInt(match[2]);
      
      // Generate variables for a 2D grid
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          code += `variables["${name}_${i}_${j}"] = { "type": "${vartype}" };\n`;
        }
      }
    } else {
      // Fallback to 3x3 grid if parsing fails
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          code += `variables["${name}_${i}_${j}"] = { "type": "${vartype}" };\n`;
        }
      }
    }
  } else {
    // This is a 1D array with numeric size
    const count = parseInt(shape);
    if (!isNaN(count)) {
      for (let i = 0; i < count; i++) {
        code += `variables["${name}${i}"] = { "type": "${vartype}" };\n`;
      }
    } else {
      // Fallback to 9 variables for TicTacToe
      for (let i = 0; i < 9; i++) {
        code += `variables["${name}${i}"] = { "type": "${vartype}" };\n`;
      }
    }
  }
  
  return code;
};

// Generator for pyqubo_array_dimension
javascriptGenerator.forBlock['pyqubo_array_dimension'] = function(block) {
  const size = javascriptGenerator.valueToCode(block, 'SIZE', javascriptGenerator.ORDER_ATOMIC) || '10';
  return `${size}\n`;
};

// Updated generator for pyqubo_array_reference to work with new array format
javascriptGenerator.forBlock['pyqubo_array_reference'] = function(block) {
  const name = block.getFieldValue('NAME');
  const index = javascriptGenerator.valueToCode(block, 'INDEX', javascriptGenerator.ORDER_ATOMIC);
  
  return [`${name}[${index}]`, javascriptGenerator.ORDER_MEMBER];
};

// Updated generator for pyqubo_2d_array_reference to work with new array format
javascriptGenerator.forBlock['pyqubo_2d_array_reference'] = function(block) {
  const name = block.getFieldValue('NAME');
  const row = javascriptGenerator.valueToCode(block, 'ROW', javascriptGenerator.ORDER_ATOMIC);
  const col = javascriptGenerator.valueToCode(block, 'COL', javascriptGenerator.ORDER_ATOMIC);
  
  return [`${name}[${row}][${col}]`, javascriptGenerator.ORDER_MEMBER];
};

// Update the array sum generator to work with the new array format
javascriptGenerator.forBlock['pyqubo_array_sum'] = function(block) {
  const name = block.getFieldValue('NAME');
  const from = javascriptGenerator.valueToCode(block, 'FROM', javascriptGenerator.ORDER_ATOMIC) || '0';
  const to = javascriptGenerator.valueToCode(block, 'TO', javascriptGenerator.ORDER_ATOMIC) || '0';
  
  // Create a string representing the sum for PyQUBO processing
  let sumTerms = [];
  // We can't generate the actual loop here since we don't know the values,
  // so we'll create a representation that can be parsed on the server
  sumTerms.push(`${name}[${from}]`);
  if (from !== to) {
    sumTerms.push('...');
    sumTerms.push(`${name}[${to}]`);
  }
  
  return [sumTerms.join(' + '), javascriptGenerator.ORDER_ATOMIC];
};

// Generator for the QUBO result display block
javascriptGenerator.forBlock['pyqubo_result_display'] = function(block) {
  // This block now only adds a marker comment in the generated code
  // The actual display logic will be handled in BlocklyComponent.js
  const code = `
  // Display QUBO results placeholder
  // Actual display is handled in the BlocklyComponent
  `;
  
  return code;
};