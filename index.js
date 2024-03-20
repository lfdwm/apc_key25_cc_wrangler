const logo = `
////////////////////////////////////////////////////////////////////////

  → → → → → → → →~:CC and Button Matrix wrangler for:~→ → → → → → → → →
                      _____ _____  _____  
                     / __ ||  _  \\/  __ \\  K  E  Y
                    / /_| || |_) || |  ''  
                   / ____ ||  __/ | |__..   2  5
                  /_/   |_||_|    \\_____/   

  → → → → → → → → → → → → → → → → → → → → → → → → → → → → → LWM 2024 → →

////////////////////////////////////////////////////////////////////////`;
console.log(logo);
    
import easymidi from 'easymidi';
import inquirer from 'inquirer';

//////// Controller Constants: ////////

const controller_values = [0,0,0,0,0,0,0,0]; // APC key 25 has 8 CC knobs
const note_states = {};
const colors = {
  lblue:  3,
  dblue:  45,
  pink:   53,
  dpink:  57,
  red:    5, 
  orange: 96,
  yellow: 9,
  lgreen: 12,
  green:  75,
};

//////// Util functions: ////////

const toggle_note_state = (key) => {
  note_states[key] = !note_states[key];
};

const toggle_color = (color_out, key, color) => {
  const velocity = note_states[key] ? color : 0;
  console.log(`← Forwarding noteon: Note=${key}, Velocity=${velocity}, Channel=0`);
  color_out.send('noteon', {note: key, velocity: velocity, channel: 0});
};

const toggle_cc = (cc_out, key, cc, channel = 0) => {
  const value = note_states[key] * 127;
  console.log(`← Forwarding CC: Controller=${cc}, Value=${value}, Channel=${channel}`);
  cc_out.send('cc', {controller: cc, value: value, channel: channel});
};

const color_toggler = (color) =>
  (cc_out, color_out, key) => {
    toggle_note_state(key);
    toggle_color(color_out, key, color);
  };

const cc_toggler = (color, cc, channel=0) =>
  (cc_out, color_out, key) => {
    toggle_note_state(key);
    toggle_color(color_out, key, color);
    toggle_cc(cc_out, key, cc, channel);
  };

//////// Key map: ////////

const key_maps = {
  
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
    64: color_toggler(colors.red),    0:  color_toggler(colors.orange), 8:  color_toggler(colors.green), 16: color_toggler(colors.lblue), 24: color_toggler(colors.dblue),   32: color_toggler(colors.pink),
    65: color_toggler(colors.red),    1:  color_toggler(colors.orange), 9:  color_toggler(colors.red),   17: color_toggler(colors.red),   25: color_toggler(colors.dblue),   33: color_toggler(colors.red),
    66: color_toggler(colors.red),    2:  color_toggler(colors.red),    10: color_toggler(colors.red),   18: color_toggler(colors.red),   26: cc_toggler(colors.dblue, 56),  34: color_toggler(colors.red),
    67: color_toggler(colors.red),    3:  color_toggler(colors.red),    11: color_toggler(colors.red),   19: color_toggler(colors.red),   27: color_toggler(colors.red),     35: color_toggler(colors.red),
    68: color_toggler(colors.red),    4:  color_toggler(colors.red),    12: color_toggler(colors.red),   20: color_toggler(colors.red),   28: color_toggler(colors.red),     36: color_toggler(colors.red),
    69: color_toggler(colors.red),    5:  color_toggler(colors.red),    13: color_toggler(colors.red),   21: color_toggler(colors.red),   29: color_toggler(colors.red),     37: color_toggler(colors.red),
    70: color_toggler(colors.red),    6:  color_toggler(colors.red),    14: color_toggler(colors.red),   22: color_toggler(colors.red),   30: color_toggler(colors.red),     38: color_toggler(colors.red),
    71: color_toggler(colors.red),    7:  color_toggler(colors.red),    15: color_toggler(colors.red),   23: color_toggler(colors.red),   31: color_toggler(colors.red),     39: color_toggler(colors.red),
                                                                                                          
    /* Soft keys column → */          86: color_toggler(colors.red),    85: color_toggler(colors.red),   84: color_toggler(colors.red),   83: color_toggler(colors.red),     82: color_toggler(colors.red),
  }
}

//////// Main method: ////////

const main = (input, cc_output, color_output, key_map) => {

  // On CC: output modified value.
  // Input is distance knob has rotated: right = dist, left = 127-dist
  input.on('cc', (msg) => {
    console.log(`→ Incoming CC: Controller=${msg.controller}, Value=${msg.value}, Channel=${msg.channel}`);

    const controller_index = msg.controller - 48  // APC key 25 knobs start at 48 and end at 55
    controller_values[controller_index] += msg.value > 64 ? msg.value - 128 : msg.value
    controller_values[controller_index] = Math.max(0, Math.min(controller_values[controller_index],127))

    console.log(`← Forwarding CC: Controller=${msg.controller}, Value=${controller_values[controller_index]}, Channel=${msg.channel}\n`);

    cc_output.send('cc', {
      controller: msg.controller,
      value: controller_values[controller_index],
      channel: msg.channel
    });
  });

  // On noteon: toggle color, optionally trigger CC value on CC output
  input.on('noteon', (msg) => {
    console.log(`→ Incoming noteon: Note=${msg.note}, Velocity=${msg.velocity}, Channel=${msg.channel}`);
    key_map[msg.note](cc_output, color_output, msg.note);
    console.log();
  });

  console.log("Forwarding events. Press Ctrl+C to stop.");

  process.on('SIGINT', () => {
    console.log("Exiting.");

    input.close();
    cc_output.close();
    color_output.close();

    process.exit();
  });
}

//////// Set up MIDI connections and start: ////////

const inputs  = easymidi.getInputs();
const outputs = easymidi.getOutputs();

inquirer.prompt([
  {
    type: 'list',
    name: 'input',
    message: 'Pick the "C" input device of your APC Key 25:',
    choices: inputs.concat({name: "Make virtual device instead", value: "vdev"})
  },
  {
    type: 'list',
    name: 'color_output',
    message: 'Pick the "C" output device of your APC Key 25:',
    choices: outputs.concat({name: "Make virtual device instead", value: "vdev"})
  },
  {
    type: 'list',
    name: 'key_map',
    message: 'Pick a key map:',
    choices: Object.keys(key_maps)
  }
]).then((answers) => {
  let input, color_output;

  if (answers.input == "vdev") {
    input = new easymidi.Input('APC Key25 Wrangler Input', true);
  } else {
    input = new easymidi.Input(answers.input);
  }

  if (answers.color_output == "vdev") {
    color_output = new easymidi.Output('APC Key25 Wrangler Color Output', true);
  } else {
    color_output = new easymidi.Output(answers.color_output);
  }

  let cc_output = new easymidi.Output('APC Key25 Wrangler CC Output', true);

  main(input, cc_output, color_output, key_maps[answers.key_map]);
});
