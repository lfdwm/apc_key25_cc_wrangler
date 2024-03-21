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
import * as fs from 'node:fs';
import assert from 'node:assert';

//////// Main method: ////////

const main = async (input, cc_output, color_output, key_map_name) => {

  // Dynamic reloading of keymap:
  const reload_keymap = async () => {
    try {
      const new_key_map = (
        await import(`./keymaps.js?${new Date().getTime()}`)  // Append time as parameter to force cache invalidation
      ).key_maps[key_map_name];
      assert(new_key_map);
      return new_key_map;
    } catch (e) {
      console.log(`\n/!\\ Failed to reload keymap.js: ${e.message}\n`);
      return null;
    }
  };

  let key_map = await reload_keymap();
  if (key_map === null) {
    console.log("Couldn't load key_map!");
    process.exit(1);
  }

  fs.watchFile("./keymaps.js", { interval: 1000 }, async () => {
    console.log("(reloading keymap)")
    let new_key_map = await reload_keymap();
    if (new_key_map !== null) {
      key_map = new_key_map;
      console.log("(done)\n");
    } else {
      console.log("(skipped)\n");
    }
  });

  // On CC: output modified value.
  // Input is distance knob has rotated: right = dist, left = 127-dist
  const controller_values = [0,0,0,0,0,0,0,0]; // APC key 25 has 8 CC knobs
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
    key_map[msg.note]?.call(cc_output, color_output, msg.note);
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
    choices: Object.keys((await import("./keymaps.js")).key_maps)
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

  main(input, cc_output, color_output, answers.key_map);
});
