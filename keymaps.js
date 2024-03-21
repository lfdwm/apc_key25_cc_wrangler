import { cc_toggler, color_toggler, colors } from "./utils.js"

export const key_maps = {
  example: {
    // This key map is rotated clockwise 90° to fit better on screen... Top right corner (32) corresponds to the top *left* corner on the device.
    // Eack key position takes a function of the form (cc_out, color_out, key) => ... Note, cc controller index should prob. not overlap with knobs, i.e. 48 - 55.
    //  ↓ Arrow-key row                   ↓ bottom row                                                                                                                   ↓ top row

    64: color_toggler(colors.red),    0:  color_toggler(colors.red), 8:  color_toggler(colors.red), 16: color_toggler(colors.red),   24: color_toggler(colors.red),  32: cc_toggler(colors.pink, 56),
    65: color_toggler(colors.red),    1:  color_toggler(colors.red), 9:  color_toggler(colors.red), 17: color_toggler(colors.red),   25: color_toggler(colors.red),  33: color_toggler(colors.red),
    66: color_toggler(colors.red),    2:  color_toggler(colors.red), 10: color_toggler(colors.red), 18: color_toggler(colors.red),   26: color_toggler(colors.red),  34: color_toggler(colors.red),
    67: color_toggler(colors.red),    3:  color_toggler(colors.red), 11: color_toggler(colors.red), 19: color_toggler(colors.red),   27: color_toggler(colors.red),  35: color_toggler(colors.red),
    68: color_toggler(colors.red),    4:  color_toggler(colors.red), 12: color_toggler(colors.red), 20: color_toggler(colors.red),   28: color_toggler(colors.red),  36: color_toggler(colors.red),
    69: color_toggler(colors.red),    5:  color_toggler(colors.red), 13: color_toggler(colors.red), 21: color_toggler(colors.red),   29: color_toggler(colors.red),  37: color_toggler(colors.red),
    70: color_toggler(colors.red),    6:  color_toggler(colors.red), 14: color_toggler(colors.red), 22: color_toggler(colors.red),   30: color_toggler(colors.red),  38: color_toggler(colors.red),
    71: color_toggler(colors.red),    7:  color_toggler(colors.red), 15: color_toggler(colors.red), 23: color_toggler(colors.red),   31: color_toggler(colors.red),  39: color_toggler(colors.red),
                                                                                                     
    /* Soft keys column → */          86: color_toggler(colors.red), 85: color_toggler(colors.red), 84: color_toggler(colors.red),   83: color_toggler(colors.red),  82: color_toggler(colors.red),
  },

  tracker1: {
    //  ↓ Arrow-key row                   ↓ bottom row                                                                                                                   ↓ top row
    64: color_toggler(colors.red),    0:  color_toggler(colors.orange), 8:  color_toggler(colors.green), 16: color_toggler(colors.lblue), 24: color_toggler(colors.dblue),   32: color_toggler(colors.yellow),
    65: color_toggler(colors.red),    1:  color_toggler(colors.orange), 9:  color_toggler(colors.red),   17: color_toggler(colors.red),   25: color_toggler(colors.dblue),   33: color_toggler(colors.red),
    66: color_toggler(colors.red),    2:  color_toggler(colors.red),    10: color_toggler(colors.red),   18: color_toggler(colors.red),   26: cc_toggler(colors.dblue, 56),  34: color_toggler(colors.red),
    67: color_toggler(colors.red),    3:  color_toggler(colors.red),    11: color_toggler(colors.red),   19: color_toggler(colors.red),   27: cc_toggler(colors.dblue, 57),  35: color_toggler(colors.red),
    68: color_toggler(colors.red),    4:  color_toggler(colors.red),    12: color_toggler(colors.red),   20: color_toggler(colors.red),   28: cc_toggler(colors.dblue, 58),  36: color_toggler(colors.red),
    69: color_toggler(colors.red),    5:  color_toggler(colors.red),    13: color_toggler(colors.red),   21: color_toggler(colors.red),   29: color_toggler(colors.red),     37: color_toggler(colors.red),
    70: color_toggler(colors.red),    6:  color_toggler(colors.red),    14: color_toggler(colors.red),   22: color_toggler(colors.red),   30: color_toggler(colors.red),     38: color_toggler(colors.red),
    71: color_toggler(colors.red),    7:  color_toggler(colors.red),    15: color_toggler(colors.red),   23: color_toggler(colors.red),   31: color_toggler(colors.red),     39: color_toggler(colors.red),
                                                                                                          
    /* Soft keys column → */          86: color_toggler(colors.red),    85: color_toggler(colors.red),   84: color_toggler(colors.red),   83: color_toggler(colors.red),     82: color_toggler(colors.red),
  }
}
