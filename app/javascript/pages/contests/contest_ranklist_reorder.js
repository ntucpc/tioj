Array.prototype.compare = function (arr){
  for (var ind = 0; ind < Math.min(this.length, arr.length); ind++) {
    if (arr[ind] !== this[ind]) {
      return this[ind] < arr[ind] ? -1 : 1;
    }
  }
  if (this.length != arr.length) {
    this.length < arr.length ? -1 : 1;
  }
  return 0;
}

function ioicampCellText(current, user_state, first_ac) {
  // state: app/helpers/contests_helper.rb
  let text = '-';
  if (current) {
    const score = new Decimal(current.state[0]);
    const penalty = Math.floor(current.state[3] / 60000000);
    user_state.score = user_state.score.add(score);
    user_state.tot_penalty += penalty + 20 * current.state[2];
    user_state.last_updated = Math.max(user_state.last_updated, current.state[3]);

    function getScore() {
      let ret = score.toString();
      if (current.state[3] !== null) { // at least one successful attempt
        if (!first_ac) {
          ret = '<span class="text-success"><strong>' + ret + '</strong></span>'
        }
        else {
          ret = '<span style="color:#008000"><strong>' + ret + '</strong></span>'
        }

      } else if (current.state[4]) { // at least one attempts but no successful one
          ret = '<span class="text-danger"><strong>' + ret + '</strong></span>';
      }

      const attempts = current.state[2] + current.state[4];
      ret += '<small>/' + attempts + '</small>';
      ret = '<span class="display-switch-score">' + ret + '</span>';
      return ret;
    }
    function getPenalty() {
      let ret = '-';
      if (current.state[3] !== null) { // at least one successful attempt
        ret = '<span class="text-success">' + penalty + '</span>';
        if (current.state[2] > 0) { // has penalty submissions
          ret += '<small class="text-danger">/<strong>' + current.state[2] + '</strong></small>'
        }
        else {
          ret += '<small>/' + current.state[2] + '</small>';
        }
      }
      ret = '<span class="display-switch-penalty">' + ret + '</span>';
      return ret;
    }
    text = getScore() + getPenalty();
    if (current.state[1]) { // has waiting submissions
      text += '+<span style="color:#888;"><strong>' + current.state[1] + '</strong></span>';
    }
  }
  return text;
}

function ioicampRowSummary(user_id, user_state) {
  $('#cell_score_' + user_id).text(user_state.score);
  $('#cell_penalty_' + user_id).text(user_state.tot_penalty);
  return [-user_state.score, user_state.tot_penalty, user_state.last_updated];
}

function acmCellText(current, user_state, first_ac) {
  let text = '-';
  if (current) {
    text = current.state[0];
    if (current.state[1] !== null) {
      if (!first_ac) {
        text = '<span class="text-success"><strong>' + text + '</strong></span>'
      }
      let penalty = Math.floor(current.state[1] / 60000000);
      text += '<small>/' + penalty + '</small>';
      if (first_ac) {
        text = '<span style="color:#008000"><strong>' + text + '</strong></span>'
      }

      user_state.solved += 1;
      user_state.tot_penalty += penalty + 20 * (current.state[0] - 1);
      if (current.state[1] > user_state.last_solved) user_state.last_solved = current.state[1];
    } else {
      if (current.state[0]) {
        text = '<span class="text-danger"><strong>' + text + '</strong></span>';
      }
      if (current.state[2]) {
        text += '+<span style="color:#888;"><strong>' + current.state[2] + '</strong></span>';
      }
    }
  }
  return text;
}

function acmRowSummary(user_id, user_state) {
  $('#cell_solved_' + user_id).text(user_state.solved);
  $('#cell_penalty_' + user_id).text(user_state.tot_penalty);
  return [-user_state.solved, user_state.tot_penalty, user_state.last_solved];
}

function ioiCellText(current, user_state, first_ac) {
  let text = '0';
  if (current) {
    let value = new Decimal(current.state[0]);
    text = value.toString();
    user_state.score = user_state.score.add(value);
    if (current.state[2]) {
      text += ' <small><span style="color:#888;">+' + current.state[2] + '</span></small>';
    }
  }
  return text;
}

function ioiRowSummary(user_id, user_state) {
  $('#cell_score_' + user_id).text(user_state.score.toString());
  return [-user_state.score];
}

import * as bounds from 'binary-search-bounds';
import Decimal from 'decimal.js/decimal';

function reorderTableInternal(data, timestamp, initUserState, cellText, rowSummary) {
  function rowUserID(row) {
    return parseInt(row.id.slice(9));
  }
  if (!data.participants) return;
  let compare_keys = {};
  let getValue = timestamp === -1 ? (
    (value) => value ? value[value.length - 1] : value
  ) : (
    (value) => value ? value[bounds.le(value, null, (x, y) => x.timestamp > timestamp ? 1 : -1)] : value
  );
  for (const user_id of data.participants) {
    let user_state = {...initUserState};
    for (const prob_id of data.tasks) {
      let key = user_id + '_' + prob_id;
      let value = data.result[key];
      let current = getValue(value);
      let first_ac = data.first_ac[String(prob_id)] === user_id;
      $('#cell_item_' + key).html(cellText(current, user_state, first_ac));
    }
    compare_keys['row_user_' + user_id] = rowSummary(user_id, user_state);
  }
  let tbody = $('#dashboard_table_body');
  tbody.append(tbody.children().detach().sort((a, b) => {
    let key_a = compare_keys[a.id].concat([rowUserID(a)]);
    let key_b = compare_keys[b.id].concat([rowUserID(b)]);
    return key_a.compare(key_b);
  }));
  let children = tbody.children();
  if (children.length === 0) return;
  let rank = 0;
  let color = 0;
  let color_map = ['warning', 'success', 'info'];
  let prev_value = compare_keys[children[0].id][0];
  for (let i = 0; i < children.length; i++) {
    const cur_value = compare_keys[children[i].id];
    const row = $(children[i]);
    if (i === 0 || cur_value.compare(compare_keys[children[i-1].id]) !== 0) {
      rank = i;
    }
    if (cur_value[0] !== prev_value) {
      prev_value = cur_value[0];
      color += 1;
    }
    row.removeClass();
    if (rowUserID(children[i]) === data.user_id) {
      row.addClass('ole');
    } else if (color < 3) {
      row.addClass(color_map[color]);
    }
    row.children()[0].innerText = rank + 1;
  }
}

export function contestRanklistReorder(data, timestamp) {
  if (data.contest_type === 'ioicamp') {
    reorderTableInternal(
      data,
      timestamp,
      {score: new Decimal(0), tot_penalty: 0, last_updated: 0},
      ioicampCellText,
      ioicampRowSummary
    )
  }
  else if (data.contest_type === 'acm') {
    reorderTableInternal(
      data,
      timestamp,
      {solved: 0, tot_penalty: 0, last_solved: -1},
      acmCellText,
      acmRowSummary
    );
  } else {
    reorderTableInternal(
      data,
      timestamp,
      {score: new Decimal(0)},
      ioiCellText,
      ioiRowSummary
    );
  }
}