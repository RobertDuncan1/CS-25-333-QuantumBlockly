export const toolboxConfig = {
  kind: "categoryToolbox",
  contents: [
    // Core Programming Categories
    {
      kind: "category",
      name: "Logic",
      categorystyle: "logic_category",
      contents: [
        { kind: "block", type: "controls_if" },
        { kind: "block", type: "logic_compare" },
        { kind: "block", type: "logic_operation" },
        { kind: "block", type: "logic_negate" },
        { kind: "block", type: "logic_boolean" },
        { kind: "block", type: "logic_null" },
        { kind: "block", type: "logic_ternary" }
      ]
    },
    {
      kind: "category",
      name: "Loops",
      categorystyle: "loop_category",
      contents: [
        {
          kind: "block",
          type: "controls_repeat_ext",
          inputs: {
            TIMES: {
              shadow: { type: "math_number", fields: { NUM: 10 } }
            }
          }
        },
        { kind: "block", type: "controls_whileUntil" },
        { kind: "block", type: "controls_for" },
        { kind: "block", type: "controls_forEach" },
        { kind: "block", type: "controls_flow_statements" },
        { kind: "block", type: "for_loop" }
      ]
    },
    {
      kind: "category",
      name: "Math",
      categorystyle: "math_category",
      contents: [
        { kind: "block", type: "math_number", fields: { NUM: 123 } },
        { kind: "block", type: "math_arithmetic" },
        { kind: "block", type: "math_single" },
        { kind: "block", type: "math_trig" },
        { kind: "block", type: "math_constant" },
        { kind: "block", type: "math_number_property" },
        { kind: "block", type: "math_round" },
        { kind: "block", type: "math_on_list" },
        { kind: "block", type: "math_modulo" },
        { kind: "block", type: "math_constrain" },
        { kind: "block", type: "math_random_int" },
        { kind: "block", type: "math_random_float" },
        { kind: "block", type: "math_atan2" }
      ]
    },
    {
      kind: "category",
      name: "Text",
      categorystyle: "text_category",
      contents: [
        { kind: "block", type: "text" },
        { kind: "block", type: "text_multiline" },
        { 
          kind: "block", 
          type: "raw_text",
          fields: { 
            TEXT: "" // Empty by default
          }
        },
        { kind: "block", type: "text_join" },
        { kind: "block", type: "text_append" },
        { kind: "block", type: "text_length" },
        { kind: "block", type: "text_isEmpty" },
        { kind: "block", type: "text_indexOf" },
        { kind: "block", type: "text_charAt" },
        { kind: "block", type: "text_getSubstring" },
        { kind: "block", type: "text_changeCase" },
        { kind: "block", type: "text_trim" },
        { kind: "block", type: "text_count" },
        { kind: "block", type: "text_replace" },
        { kind: "block", type: "text_reverse" },
        { kind: "block", type: "text_print" },
        { kind: "block", type: "text_prompt_ext" }
      ]
    },
    {
      kind: "category",
      name: "Lists",
      categorystyle: "list_category",
      contents: [
        { kind: "block", type: "lists_create_with" },
        { kind: "block", type: "lists_repeat" },
        { kind: "block", type: "lists_length" },
        { kind: "block", type: "lists_isEmpty" },
        { kind: "block", type: "lists_indexOf" },
        { kind: "block", type: "lists_getIndex" },
        { kind: "block", type: "lists_setIndex" },
        { kind: "block", type: "lists_getSublist" },
        { kind: "block", type: "lists_split" },
        { kind: "block", type: "lists_sort" },
        { kind: "block", type: "lists_reverse" }
      ]
    },
    {
      kind: "category",
      name: "Color",
      categorystyle: "colour_category",
      contents: [
        { kind: "block", type: "colour_picker" },
        { kind: "block", type: "colour_random" },
        { kind: "block", type: "colour_rgb" },
        { kind: "block", type: "colour_blend" }
      ]
    },
    { kind: "sep" },
    
    // Variable and Function Categories
    {
      kind: "category",
      name: "Variables",
      categorystyle: "variable_category",
      custom: "VARIABLE"
    },
    {
      kind: "category",
      name: "Functions",
      categorystyle: "procedure_category",
      custom: "PROCEDURE"
    },
    
    // PyQUBO Category - Organized by subcategories
    {
      kind: "category",
      name: "PyQUBO",
      colour: "#4169E1", // Royal Blue
      contents: [
        // --- Model Structure ---
        {
          kind: "label",
          text: "Model Structure"
        },
        // Main model container
        { kind: "block", type: "pyqubo_model" },
        // Result display block
        { 
          kind: "block", 
          type: "pyqubo_result_display" 
        },
        
        // --- Variable Definitions ---
        {
          kind: "label",
          text: "Variable Definitions"
        },
        // Single variable
        { 
          kind: "block", 
          type: "pyqubo_variable",
          inputs: {
            PROPERTIES: {
              block: {
                type: "pyqubo_var_property",
                fields: { PROPERTY: "lower_bound" },
                inputs: {
                  VALUE: {
                    shadow: { type: "math_number", fields: { NUM: 0 } }
                  }
                }
              }
            }
          }
        },
        // Array variable
        { 
          kind: "block", 
          type: "pyqubo_array_variable",
          fields: { 
            NAME: "x",
            VARTYPE: "Binary"
          },
          inputs: {
            SHAPE: {
              shadow: { 
                type: "math_number", 
                fields: { NUM: 9 }  // Default to 9 for TicTacToe
              }
            }
          }
        },
        // 2D Array shape input block - NEW ADDITION
        { 
          kind: "block", 
          type: "array_shape_input",
          fields: {
            ROWS: 3,
            COLS: 3
          }
        },
        // Array shape definition block
        { 
          kind: "block", 
          type: "pyqubo_array_shape",
          fields: { DIMENSION: "1D" },
          inputs: {
            DIMENSIONS: {
              block: {
                type: "pyqubo_array_dimension",
                inputs: {
                  SIZE: {
                    shadow: { type: "math_number", fields: { NUM: 9 } }
                  }
                }
              }
            }
          }
        },
        // Array dimension block
        { 
          kind: "block", 
          type: "pyqubo_array_dimension",
          inputs: {
            SIZE: {
              shadow: { type: "math_number", fields: { NUM: 9 } }
            }
          }
        },
        // Variable property block
        { 
          kind: "block", 
          type: "pyqubo_var_property",
          inputs: {
            VALUE: {
              shadow: { type: "math_number", fields: { NUM: 0 } }
            }
          }
        },
        
        // --- Constraints and Objective ---
        {
          kind: "label",
          text: "Constraints & Objective"
        },
        // Constraints
        { 
          kind: "block", 
          type: "pyqubo_constraint",
          inputs: {
            LHS: {
              shadow: { type: "pyqubo_var_reference", fields: { NAME: "x" } }
            },
            RHS: {
              shadow: { type: "math_number", fields: { NUM: 0 } }
            }
          }
        },
        // Objective
        { 
          kind: "block", 
          type: "pyqubo_objective",
          inputs: {
            EXPRESSION: {
              shadow: { type: "raw_text", fields: { TEXT: "x0 + x1" } }
            }
          }
        },
        
        // --- Variable References ---
        {
          kind: "label",
          text: "Variable References"
        },
        // Variable references
        { kind: "block", type: "pyqubo_var_reference" },
        // Bridge block for standard variables
        { kind: "block", type: "variable_to_expression" },
        // Array reference blocks
        { 
          kind: "block", 
          type: "pyqubo_array_reference",
          inputs: {
            INDEX: {
              shadow: { type: "math_number", fields: { NUM: 0 } }
            }
          }
        },
        { 
          kind: "block", 
          type: "pyqubo_2d_array_reference",
          inputs: {
            ROW: {
              shadow: { type: "math_number", fields: { NUM: 0 } }
            },
            COL: {
              shadow: { type: "math_number", fields: { NUM: 0 } }
            }
          }
        },
        
        // --- Array Operations ---
        {
          kind: "label",
          text: "Array Operations"
        },
        // Array sum
        { 
          kind: "block", 
          type: "pyqubo_array_sum",
          inputs: {
            FROM: {
              shadow: { type: "math_number", fields: { NUM: 0 } }
            },
            TO: {
              shadow: { type: "math_number", fields: { NUM: 8 } }
            }
          }
        },
        
        // --- Expressions ---
        {
          kind: "label",
          text: "Expression Building"
        },
        // Expression building
        { 
          kind: "block", 
          type: "pyqubo_expression",
          inputs: {
            LEFT: {
              shadow: { type: "pyqubo_var_reference", fields: { NAME: "x" } }
            },
            RIGHT: {
              shadow: { type: "math_number", fields: { NUM: 1 } }
            }
          }
        }
      ]
    },
    
    // Saved Blocks Category
    {
      kind: "category",
      name: "Saved Blocks",
      colour: "#FFAB19",
      contents: []
    }
  ]
};  

export default toolboxConfig;