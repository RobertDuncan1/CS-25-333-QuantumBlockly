import Blockly from 'blockly';

// PyQUBO Variable Block - Enhanced with all variable types
Blockly.Blocks['pyqubo_variable'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_variable",
      "message0": "Create %1 variable %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TYPE",
          "options": [
            ["Binary", "Binary"],
            ["Spin", "Spin"],
            ["Integer", "Integer"]
          ]
        },
        {
          "type": "field_input",
          "name": "NAME",
          "text": "x"
        }
      ],
      "message1": "Properties %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "PROPERTIES",
          "check": "VariableProperty"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Define a PyQUBO variable",
      "helpUrl": ""
    });
  }
};

// Modified Array Variable Block to properly handle complex shapes
Blockly.Blocks['pyqubo_array_variable'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_array_variable",
      "message0": "Create Array %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "x"
        }
      ],
      "message1": "shape: %1 vartype: %2",
      "args1": [
        {
          "type": "input_value",
          "name": "SHAPE",
          "check": ["Array", "Number", "String"]
        },
        {
          "type": "field_dropdown",
          "name": "VARTYPE",
          "options": [
            ["Binary", "Binary"],
            ["Spin", "Spin"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Create an array variable for PyQUBO with 1D or 2D shape"
    });
  }
};

// New Array Shape Input Block for 2D arrays
Blockly.Blocks['array_shape_input'] = {
  init: function() {
    this.jsonInit({
      "type": "array_shape_input",
      "message0": "[%1, %2]",
      "args0": [
        {
          "type": "field_number",
          "name": "ROWS",
          "value": 3,
          "min": 1
        },
        {
          "type": "field_number",
          "name": "COLS",
          "value": 3,
          "min": 1
        }
      ],
      "output": "Array",
      "colour": 230,
      "tooltip": "Define a 2D array shape with rows and columns"
    });
  }
};

// Array Shape Block
Blockly.Blocks['pyqubo_array_shape'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_array_shape",
      "message0": "%1 shape: %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DIMENSION",
          "options": [
            ["1D", "1D"],
            ["2D", "2D"]
          ]
        },
        {
          "type": "input_statement",
          "name": "DIMENSIONS",
          "check": "ArrayDimension"
        }
      ],
      "output": "Array",
      "colour": 230,
      "tooltip": "Define the shape of an array"
    });
  }
};

// Dimension block for array shapes
Blockly.Blocks['pyqubo_array_dimension'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_array_dimension",
      "message0": "size: %1",
      "args0": [
        {
          "type": "input_value",
          "name": "SIZE",
          "check": "Number"
        }
      ],
      "previousStatement": "ArrayDimension",
      "nextStatement": "ArrayDimension",
      "colour": 230,
      "tooltip": "Define a dimension size for an array"
    });
  }
};

// Variable Property Block - for Integer bounds and Array size
Blockly.Blocks['pyqubo_var_property'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_var_property",
      "message0": "%1 %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "PROPERTY",
          "options": [
            ["lower bound", "lower_bound"],
            ["upper bound", "upper_bound"]
          ]
        },
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Number"
        }
      ],
      "previousStatement": "VariableProperty",
      "nextStatement": "VariableProperty",
      "colour": 230,
      "tooltip": "Set a property for a variable",
      "helpUrl": ""
    });
  }
};

// PyQUBO Constraint Block
Blockly.Blocks['pyqubo_constraint'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_constraint",
      "message0": "Add constraint: %1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "LHS",
          "check": ["String", "Number", "Boolean"]
        },
        {
          "type": "field_dropdown",
          "name": "OPERATOR",
          "options": [
            ["=", "="],
            ["<=", "<="],
            [">=", ">="],
            ["!=", "!="]
          ]
        },
        {
          "type": "input_value",
          "name": "RHS",
          "check": ["String", "Number", "Boolean"]
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Add a constraint to the QUBO model",
      "helpUrl": ""
    });
  }
};

// PyQUBO Objective Block
Blockly.Blocks['pyqubo_objective'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_objective",
      "message0": "Set objective to %1 %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "GOAL",
          "options": [
            ["maximize", "maximize"],
            ["minimize", "minimize"]
          ]
        },
        {
          "type": "input_value",
          "name": "EXPRESSION",
          "check": ["String", "Number", "Boolean"]
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Define the objective function to optimize",
      "helpUrl": ""
    });
  }
};

// PyQUBO Expression Block
Blockly.Blocks['pyqubo_expression'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_expression",
      "message0": "%1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "LEFT",
          "check": ["String", "Number", "Boolean", "Variable"]
        },
        {
          "type": "field_dropdown",
          "name": "OPERATOR",
          "options": [
            ["+", "+"],
            ["-", "-"],
            ["*", "*"],
            ["/", "/"],
            ["^", "**"]
          ]
        },
        {
          "type": "input_value",
          "name": "RIGHT",
          "check": ["String", "Number", "Boolean", "Variable"]
        }
      ],
      "output": ["String", "Number"],
      "colour": 230,
      "tooltip": "Create a mathematical expression",
      "helpUrl": ""
    });
  }
};

// Variable Reference Block
Blockly.Blocks['pyqubo_var_reference'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_var_reference",
      "message0": "variable %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "x"
        }
      ],
      "output": ["String", "Number"],
      "colour": 230,
      "tooltip": "Reference a variable in an expression",
      "helpUrl": ""
    });
  }
};

// Updated Array Reference Block
Blockly.Blocks['pyqubo_array_reference'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_array_reference",
      "message0": "array %1 [ %2 ]",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "x"
        },
        {
          "type": "input_value",
          "name": "INDEX",
          "check": "Number"
        }
      ],
      "output": ["String", "Number"],
      "colour": 230,
      "tooltip": "Reference an array element in an expression",
      "helpUrl": ""
    });
  }
};

// 2D Array Reference Block
Blockly.Blocks['pyqubo_2d_array_reference'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_2d_array_reference",
      "message0": "array %1 [ %2 ] [ %3 ]",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "x"
        },
        {
          "type": "input_value",
          "name": "ROW",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "COL",
          "check": "Number"
        }
      ],
      "output": ["String", "Number"],
      "colour": 230,
      "tooltip": "Reference a 2D array element in an expression",
      "helpUrl": ""
    });
  }
};

// Bridge block for standard Blockly variables
Blockly.Blocks['variable_to_expression'] = {
  init: function() {
    this.jsonInit({
      "type": "variable_to_expression",
      "message0": "use variable %1 in expression",
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": "item"
        }
      ],
      "output": ["String", "Number"],
      "colour": 230,
      "tooltip": "Use a standard variable in quantum expressions",
      "helpUrl": ""
    });
  }
};

// Sum of Array Elements Block
Blockly.Blocks['pyqubo_array_sum'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_array_sum",
      "message0": "sum of array %1 from %2 to %3",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "x"
        },
        {
          "type": "input_value",
          "name": "FROM",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "TO",
          "check": "Number"
        }
      ],
      "output": ["String", "Number"],
      "colour": 230,
      "tooltip": "Calculate the sum of array elements",
      "helpUrl": ""
    });
  }
};

// PyQUBO Model Function - The main container for a QUBO model
Blockly.Blocks['pyqubo_model'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_model",
      "message0": "QUBO Model %1 For function: %2",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "field_input",
          "name": "NAME",
          "text": "createQuboForSingleMove"
        }
      ],
      "message1": "Variables %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "VARIABLES",
          "check": null
        }
      ],
      "message2": "Constraints %1",
      "args2": [
        {
          "type": "input_statement",
          "name": "CONSTRAINTS",
          "check": null
        }
      ],
      "message3": "Objective %1",
      "args3": [
        {
          "type": "input_statement",
          "name": "OBJECTIVE",
          "check": null
        }
      ],
      "colour": 230,
      "tooltip": "Create a complete QUBO model",
      "helpUrl": ""
    });
  }
};

// This keeps backward compatibility with the original PyQUBO function block
Blockly.Blocks['pyqubo_function'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_function",
      "message0": "Define function %1 with parameter %2",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "createQuboForSingleMove"
        },
        {
          "type": "input_value",
          "name": "PARAM"
        }
      ],
      "message1": "Variables, Constraints, and Objective %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "BODY"
        }
      ],
      "colour": 230,
      "tooltip": "Define a function that returns a PyQUBO model",
      "helpUrl": ""
    });
  }
};

// QUBO Result Display Block
Blockly.Blocks['pyqubo_result_display'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_result_display",
      "message0": "Display QUBO results",
      "colour": 230,
      "tooltip": "Display the results of the QUBO computation showing the optimal solution",
      "helpUrl": "",
      "previousStatement": null,
      "nextStatement": null
    });
  }
};

export default {
  blocks: [
    'pyqubo_variable',
    'pyqubo_array_variable',
    'array_shape_input',    // Added new block
    'pyqubo_array_shape',
    'pyqubo_array_dimension',
    'pyqubo_var_property',
    'pyqubo_constraint',
    'pyqubo_objective',
    'pyqubo_expression',
    'pyqubo_var_reference',
    'pyqubo_array_reference',
    'pyqubo_2d_array_reference',
    'pyqubo_array_sum',
    'pyqubo_model',
    'pyqubo_function',
    'variable_to_expression',
    'pyqubo_result_display'
  ]
};