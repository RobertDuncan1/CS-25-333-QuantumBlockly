import { javascriptGenerator } from 'blockly/javascript';
import * as javascript from 'blockly/javascript';
import './blocks/minimax_blocks'; // Ensure blocks are registered before generating code
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

javascriptGenerator.forBlock['function'] = function (block, generator) {
    var name = block.getFieldValue('NAME').replace(/\s/g, '_');
    var param = generator.valueToCode(block, 'PARAM', javascript.Order.ATOMIC);
    var body = generator.statementToCode(block, 'BODY');
    var linear = generator.valueToCode(block, 'LINEAR', javascript.Order.ATOMIC);
    var quadratic = generator.valueToCode(block, 'QUADRATIC', javascript.Order.ATOMIC);
    // TODO: Assemble javascript into code variable.
    var code = `${name} = (${param}) => {\n${body} return {'linear': ${linear}, 'quadratic': ${quadratic}};\n}`
    return code;
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

//New functions for qubo_blocks blockly side libraries

// Linear Term Block Generator
javascriptGenerator['linear_term_block'] = function (block) {
    const key = block.getFieldValue('KEY');
    const value = javascriptGenerator.valueToCode(block, 'VALUE', javascript.ORDER_ATOMIC) || 0;
    return `{ key: "${key}", value: ${value} }`;
  };
  
  // QUBO Main Block Generator
  javascriptGenerator['qubo_main_block'] = function (block) {
    const terms = [];
    for (let i = 1; i <= 9; i++) {
      const key = `x${i}`;
      const weight = javascriptGenerator.valueToCode(block, `WEIGHT${i}`, javascript.ORDER_ATOMIC) || 0;

      terms.push(`${key}: ${weight}`);
    }
    return `const linearTerms = { ${terms.join(', ')} };\n`;
  };
  
  //New functions for qubo_blocks blockly side libraries

// Linear Term Block Generator
javascriptGenerator['linear_term_block'] = function (block) {
    const key = block.getFieldValue('KEY');
    const value = javascriptGenerator.valueToCode(block, 'VALUE', javascript.ORDER_ATOMIC) || 0;
    return `{ key: "${key}", value: ${value} }`;
  };
  
  // QUBO Main Block Generator
  javascriptGenerator['qubo_main_block'] = function (block) {
    const terms = [];
    for (let i = 1; i <= 9; i++) {
      const key = `x${i}`;
      const weight = javascriptGenerator.valueToCode(block, `WEIGHT${i}`, javascript.ORDER_ATOMIC) || 0;

      terms.push(`${key}: ${weight}`);
    }
    return `const linearTerms = { ${terms.join(', ')} };\n`;
  };

  // generate minimax code and it will return a JSON object with linear and quadratic values.
  javascriptGenerator.forBlock['minimax'] = function(block) {
    var depth = javascriptGenerator.valueToCode(block, 'DEPTH', javascriptGenerator.ORDER_ATOMIC) || '0';
    var boardState = javascriptGenerator.valueToCode(block, 'BOARD_STATE', javascriptGenerator.ORDER_ATOMIC) || '[]';
  
    var code = `
    (function generateQUBO() {
      let linear = {};
      let quadratic = {};
  
      let moves = getAvailableMoves(${boardState});
      for (let i = 0; i < moves.length; i++) {
        linear[i] = Math.random(); // Assign random linear weights for now
  
        for (let j = i + 1; j < moves.length; j++) {
          quadratic[\`\${i},\${j}\`] = Math.random() * -1; // Random quadratic interaction
        }
      }
  
      return { linear, quadratic };
    })()`;
  
    return [code, javascriptGenerator.ORDER_FUNCTION_CALL];
  };
  
  // Define JavaScript code generation for the Minimax block
  javascriptGenerator.forBlock['minimax'] = function(block) {
    var depth = javascriptGenerator.valueToCode(block, 'DEPTH', javascriptGenerator.ORDER_ATOMIC) || '0';
    var boardState = javascriptGenerator.valueToCode(block, 'BOARD_STATE', javascriptGenerator.ORDER_ATOMIC) || '[]';
  
    var code = `
    (function minimax(board, depth, isMaximizing) {
      if (depth === 0 || isGameOver(board)) {
        return evaluateBoard(board);
      }
  
      if (isMaximizing) {
        let bestScore = -Infinity;
        let bestMove = null;
        for (let move of getAvailableMoves(board)) {
          let newBoard = makeMove(board, move, 'X');
          let score = minimax(newBoard, depth - 1, false);
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        }
        return bestMove;
      } else {
        let bestScore = Infinity;
        for (let move of getAvailableMoves(board)) {
          let newBoard = makeMove(board, move, 'O');
          let score = minimax(newBoard, depth - 1, true);
          bestScore = Math.min(score, bestScore);
        }
        return bestScore;
      }
    })(${boardState}, ${depth}, true)`;
  
    return [code, javascriptGenerator.ORDER_FUNCTION_CALL];
  };  

  // Updated function block to support PyQUBO format
javascriptGenerator.forBlock['function'] = function (block, generator) {
  var name = block.getFieldValue('NAME').replace(/\s/g, '_');
  var param = generator.valueToCode(block, 'PARAM', javascript.Order.ATOMIC);
  var body = generator.statementToCode(block, 'BODY');
  var linear = generator.valueToCode(block, 'LINEAR', javascript.Order.ATOMIC);
  var quadratic = generator.valueToCode(block, 'QUADRATIC', javascript.Order.ATOMIC);
  
  // Changed to return PyQUBO compatible format
  var code = `${name} = (${param}) => {
      const variables = {};
      const constraints = [];
      let objective = "";
      
      ${body}
      
      // For backward compatibility, we'll convert linear and quadratic dictionaries
      // to PyQUBO format if they're provided
      if (Object.keys(${linear}).length > 0) {
          // Convert each linear term to a Binary variable
          Object.keys(${linear}).forEach(key => {
              variables['x_' + key] = { "type": "Binary" };
              // Append to objective
              if (objective.length > 0) {
                  objective += " + ";
              }
              objective += \`(\${${linear}[key] * x_\${key})\`;
          });
      }
      
      if (Object.keys(${quadratic}).length > 0) {
          // Add quadratic terms to objective
          Object.keys(${quadratic}).forEach(keyPair => {
              const [key1, key2] = keyPair.split(',');
              // Ensure variables exist
              if (!variables['x_' + key1]) {
                  variables['x_' + key1] = { "type": "Binary" };
              }
              if (!variables['x_' + key2]) {
                  variables['x_' + key2] = { "type": "Binary" };
              }
              
              // Append to objective
              if (objective.length > 0) {
                  objective += " + ";
              }
              objective += \`(\${${quadratic}[keyPair] * x_\${key1} * x_\${key2})\`;
          });
      }
      
      return {
          "variables": variables,
          "Constraints": constraints,
          "Objective": objective
      };
  }`;
  
  return code;
};

// New block for PyQUBO variable definition
javascriptGenerator.forBlock['pyqubo_variable'] = function (block, generator) {
  var type = block.getFieldValue('TYPE');
  var name = block.getFieldValue('NAME');
  
  var code = `variables['${name}'] = { "type": "${type}" };\n`;
  if (type === 'Array') {
      code += `variables['${name}']['size'] = 10;\n`; // Default size
  }
  
  return code;
};

// New block for PyQUBO constraint
javascriptGenerator.forBlock['pyqubo_constraint'] = function (block, generator) {
  var lhs = generator.valueToCode(block, 'LHS', javascript.Order.ATOMIC);
  var operator = block.getFieldValue('OPERATOR');
  var rhs = generator.valueToCode(block, 'RHS', javascript.Order.ATOMIC);
  
  var code = `constraints.push({
      "lhs": "${lhs}",
      "comparison": "${operator}",
      "rhs": ${rhs}
  });\n`;
  
  return code;
};

// New block for PyQUBO objective
javascriptGenerator.forBlock['pyqubo_objective'] = function (block, generator) {
  var expr = generator.valueToCode(block, 'EXPRESSION', javascript.Order.ATOMIC);
  
  var code = `objective = "${expr}";\n`;
  
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