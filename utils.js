//////// Util functions: ////////

const note_states = {};
export const toggle_note_state = (key) => {
  note_states[key] = !note_states[key];
};

export const toggle_color = (color_out, key, color) => {
  const velocity = note_states[key] ? color : 0;
  console.log(`← Forwarding noteon: Note=${key}, Velocity=${velocity}, Channel=0`);
  color_out.send('noteon', {note: key, velocity: velocity, channel: 0});
};

export const toggle_cc = (cc_out, key, cc, channel = 0) => {
  const value = note_states[key] * 127;
  console.log(`← Forwarding CC: Controller=${cc}, Value=${value}, Channel=${channel}`);
  cc_out.send('cc', {controller: cc, value: value, channel: channel});
};

export const color_toggler = (color) =>
  (cc_out, color_out, key) => {
    toggle_note_state(key);
    toggle_color(color_out, key, color);
  };

export const cc_toggler = (color, cc, channel=0) =>
  (cc_out, color_out, key) => {
    toggle_note_state(key);
    toggle_color(color_out, key, color);
    toggle_cc(cc_out, key, cc, channel);
  };

export const colors = {
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
