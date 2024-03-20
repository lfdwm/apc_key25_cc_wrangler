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

// Color map layout corresponds to the physical layout on the APC key25!
// The key is the MIDI note ID triggered by each button.
// The "soft keys" to the right are green regardless of chosen color.
const color_map = {
  32: "pink",   33: "red",    34: "red",    35: "red",    36: "red",    37: "red",    38: "red",    39: "red",         82: "red",
  24: "dblue",  25: "dblue",  26: "red",    27: "red",    28: "red",    29: "red",    30: "red",    31: "red",         83: "red",
  16: "lblue",  17: "red",    18: "red",    19: "red",    20: "red",    21: "red",    22: "red",    23: "red",         84: "red",
  8:  "red",    9:  "red",    10: "red",    11: "red",    12: "red",    13: "red",    14: "red",    15: "red",         85: "red",
  0:  "orange", 1:  "orange", 2:  "red",    3:  "red",    4:  "red",    5:  "red",    6:  "red",    7:  "red",         86: "red",

  64: "red",    65: "red",    66: "red",    67: "red",    68: "red",    69: "red",    70: "red",    71: "red",
};

// Function may layout corresponds to the physical layout on the APC key25!
// Each key can have a different function: CC toggle 127/0, or just MIDI toggle.
// CC: { cc: <controller index> }
// Key: { key: <key number or -1 for same as the one the button already maps to> } TODO: key number currently ignored cuz' i dun' use it
const func_map = {
  32: {key:-1}, 33: {key:-1}, 34: {key:-1}, 35: {key:-1}, 36: {key:-1}, 37: {key:-1}, 38: {key:-1}, 39: {key:-1},      82: {key:-1},
  24: {key:-1}, 25: {key:-1}, 26: {cc: 56}, 27: {cc: 57}, 28: {cc: 58}, 29: {key:-1}, 30: {key:-1}, 31: {key:-1},      83: {key:-1},
  16: {key:-1}, 17: {key:-1}, 18: {key:-1}, 19: {key:-1}, 20: {key:-1}, 21: {key:-1}, 22: {key:-1}, 23: {key:-1},      84: {key:-1},
  8:  {key:-1}, 9:  {key:-1}, 10: {key:-1}, 11: {key:-1}, 12: {key:-1}, 13: {key:-1}, 14: {key:-1}, 15: {key:-1},      85: {key:-1},
  0:  {key:-1}, 1:  {key:-1}, 2:  {key:-1}, 3:  {key:-1}, 4:  {key:-1}, 5:  {key:-1}, 6:  {key:-1}, 7:  {key:-1},      86: {key:-1},

  64: {key:-1}, 65: {key:-1}, 66: {key:-1}, 67: {key:-1}, 68: {key:-1}, 69: {key:-1}, 70: {key:-1}, 71: {key:-1},
};

//////// Main method: ////////

const main = (input, cc_output, color_output) => {

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

    note_states[msg.note] = !note_states[msg.note];

    // Toggle color:
    let options;
    if (note_states[msg.note]) {
      options = {
        note: msg.note,
        velocity: colors[color_map[msg.note] || "red"],
        channel: 0
      };
    } else {
      options = {
        note: msg.note,
        velocity: 0,
        channel: 0
      };
    }
    console.log(`← Forwarding noteon: Note=${options.note}, Velocity=${options.velocity}, Channel=${options.channel}`);
    color_output.send('noteon', options);

    // Toggle CC:
    if (func_map[msg.note].cc) {
      console.log(`← Forwarding CC: Controller=${func_map[msg.note].cc}, Value=${note_states[msg.note] * 127}, Channel=${0}`);
      cc_output.send('cc', {
        controller: func_map[msg.note].cc,
        value: note_states[msg.note] * 127,
        channel: 0  // TODO: should prob. be configurable
      });
    }

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

  main(input, cc_output, color_output);
});
