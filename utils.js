//////// Util functions: ////////

const note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
/**
 * Converts a MIDI note number (0–127) to a note string like "C3".
 * @param {number} midi_note - MIDI note number (0–127)
 * @returns {string} Note name with octave
 */
const midi_to_note_name = (midi_note) => {
  if (midi_note < 0 || midi_note > 127) throw new RangeError('MIDI note must be between 0 and 127');
  const note = note_names[midi_note % 12];
  const octave = Math.floor(midi_note / 12) - 1;
  return `${note}${octave}`;
};

/**
 * Converts a note string like "C3" or "F#5" to a MIDI note number.
 * @param {string} note_str - Note name with octave
 * @returns {number} MIDI note number
 */
const note_name_to_midi = (note_str) => {
  const match = note_str.match(/^([A-Ga-g])(#|b)?(-?\d+)$/);
  if (!match) throw new Error(`Invalid note format: ${note_str}`);

  let [ , note, accidental, octave ] = match;
  note = note.toUpperCase();
  octave = parseInt(octave, 10);

  let semitone = note_names.findIndex(n => n === note || n.startsWith(note));
  if (accidental === '#') {
    semitone = (semitone + 1) % 12;
  } else if (accidental === 'b') {
    semitone = (semitone + 11) % 12;
  }

  return (octave + 1) * 12 + semitone;
};

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

//////// Button types: ////////

export const color_toggler = (color) =>
  (event, cc_out, color_out, msg) => {
    console.log(event);
    if (event != "noteon") return;

    toggle_note_state(msg.note);
    toggle_color(color_out, msg.note, color);
  };

export const color_trigger = (color) =>
  (event, cc_out, color_out, msg) => {
    toggle_note_state(msg.note);
    toggle_color(color_out, msg.note, color);
  };

export const color_key_trigger = (color, key) => {
  const key_num = note_name_to_midi(key);
  return (event, cc_out, color_out, msg) => {
    toggle_note_state(msg.note);
    toggle_color(color_out, msg.note, color);
    cc_out.send(event, {note: key, velocity: msg.velocity, channel: 0});
  };
}

export const cc_toggler = (color, cc, channel=0) =>
  (event, cc_out, color_out, msg) => {
    if (event != "noteon") return;

    toggle_note_state(msg.note);
    toggle_color(color_out, msg.note, color);
    toggle_cc(cc_out, msg.note, cc, channel);
  };

//////// Util vars: ////////

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
