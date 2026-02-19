// AV Calculator – JavaScript logic

// ── Tab navigation ──────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── Amplifier mode toggle ────────────────────────────────────────────────────
document.getElementById('amp-mode').addEventListener('change', function () {
  var isVI = this.value === 'vi';
  document.getElementById('amp-inputs-vi').style.display = isVI ? '' : 'none';
  document.getElementById('amp-inputs-pi').style.display = isVI ? 'none' : '';
  document.getElementById('amplifier-result').classList.remove('visible');
  document.getElementById('amplifier-result').innerHTML = '';
});

// ── Projector mode toggle ────────────────────────────────────────────────────
document.getElementById('proj-mode').addEventListener('change', function () {
  var label = document.getElementById('proj-input-a-label');
  var input = document.getElementById('proj-input-a');
  if (this.value === 'distance') {
    label.textContent = 'Screen Width (m)';
    input.placeholder = 'e.g. 3';
  } else {
    label.textContent = 'Throw Distance (m)';
    input.placeholder = 'e.g. 4.5';
  }
  document.getElementById('projector-result').classList.remove('visible');
  document.getElementById('projector-result').innerHTML = '';
});

// ── Dynamic speaker inputs ───────────────────────────────────────────────────
var speakerCount = 2;

document.getElementById('add-speaker').addEventListener('click', function () {
  speakerCount += 1;
  var container = document.getElementById('speaker-inputs');
  var group = document.createElement('div');
  group.className = 'form-group';
  group.id = 'speaker-group-' + speakerCount;
  group.innerHTML =
    '<label for="speaker-ohms-' + speakerCount + '">Speaker ' + speakerCount + ' Impedance (Ω)</label>' +
    '<input type="number" id="speaker-ohms-' + speakerCount + '" min="0.1" step="0.1" placeholder="e.g. 8" />';
  container.appendChild(group);
  document.getElementById('speaker-result').classList.remove('visible');
  document.getElementById('speaker-result').innerHTML = '';
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function showResult(id, html) {
  var el = document.getElementById(id);
  el.innerHTML = html;
  el.classList.add('visible');
}

function errorResult(id, msg) {
  showResult(id, '<span class="error">' + msg + '</span>');
}

function round(val, decimals) {
  var factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

// ── Speaker Impedance ────────────────────────────────────────────────────────
function calcSpeaker() {
  var wiring = document.getElementById('speaker-wiring').value;
  var impedances = [];

  for (var i = 1; i <= speakerCount; i++) {
    var input = document.getElementById('speaker-ohms-' + i);
    if (!input) continue;
    var val = parseFloat(input.value);
    if (isNaN(val) || val <= 0) {
      errorResult('speaker-result', 'Please enter valid positive impedance values for all speakers.');
      return;
    }
    impedances.push(val);
  }

  if (impedances.length < 2) {
    errorResult('speaker-result', 'Please add at least two speakers.');
    return;
  }

  var result;
  if (wiring === 'series') {
    result = impedances.reduce(function (sum, z) { return sum + z; }, 0);
  } else {
    // Parallel: 1 / (1/z1 + 1/z2 + ...)
    var reciprocalSum = impedances.reduce(function (sum, z) { return sum + 1 / z; }, 0);
    result = 1 / reciprocalSum;
  }

  var warning = '';
  if (wiring === 'parallel' && result < 2) {
    warning = '<p class="warning">⚠ Total impedance below 2Ω – check amplifier minimum impedance rating.</p>';
  }

  showResult('speaker-result',
    '<span class="label">Total ' + (wiring === 'series' ? 'Series' : 'Parallel') + ' Impedance</span><br>' +
    '<span class="value">' + round(result, 2) + ' Ω</span>' +
    warning
  );
}

// ── SPL Calculator ───────────────────────────────────────────────────────────
function calcSPL() {
  var sensitivity = parseFloat(document.getElementById('spl-sensitivity').value);
  var power = parseFloat(document.getElementById('spl-power').value);
  var distance = parseFloat(document.getElementById('spl-distance').value);

  if (isNaN(sensitivity) || isNaN(power) || isNaN(distance)) {
    errorResult('spl-result', 'Please fill in all fields.');
    return;
  }
  if (power <= 0 || distance <= 0) {
    errorResult('spl-result', 'Power and distance must be greater than zero.');
    return;
  }

  // SPL = sensitivity + 10*log10(power) - 20*log10(distance)
  var spl = sensitivity + 10 * Math.log10(power) - 20 * Math.log10(distance);

  var comfort = '';
  if (spl > 120) {
    comfort = '<p class="warning">⚠ Above 120 dB – risk of hearing damage with prolonged exposure.</p>';
  } else if (spl > 85) {
    comfort = '<p class="warning">⚠ Above 85 dB – OSHA recommends hearing protection for extended exposure.</p>';
  }

  showResult('spl-result',
    '<span class="label">Estimated SPL at ' + distance + ' m</span><br>' +
    '<span class="value">' + round(spl, 1) + ' dB</span>' +
    comfort
  );
}

// ── Projector Throw ───────────────────────────────────────────────────────────
function calcProjector() {
  var mode = document.getElementById('proj-mode').value;
  var inputA = parseFloat(document.getElementById('proj-input-a').value);
  var ratio = parseFloat(document.getElementById('proj-ratio').value);

  if (isNaN(inputA) || isNaN(ratio) || inputA <= 0 || ratio <= 0) {
    errorResult('projector-result', 'Please enter valid positive values.');
    return;
  }

  if (mode === 'distance') {
    // throw distance = throw ratio × screen width
    var throwDist = ratio * inputA;
    showResult('projector-result',
      '<span class="label">Throw Distance</span><br>' +
      '<span class="value">' + round(throwDist, 2) + ' m</span><br>' +
      '<span class="label">(Screen Width: ' + inputA + ' m, Throw Ratio: ' + ratio + ':1)</span>'
    );
  } else {
    // screen width = throw distance / throw ratio
    var screenW = inputA / ratio;
    showResult('projector-result',
      '<span class="label">Screen Width</span><br>' +
      '<span class="value">' + round(screenW, 2) + ' m</span><br>' +
      '<span class="label">(Throw Distance: ' + inputA + ' m, Throw Ratio: ' + ratio + ':1)</span>'
    );
  }
}

// ── Amplifier Power ──────────────────────────────────────────────────────────
function calcAmplifier() {
  var mode = document.getElementById('amp-mode').value;

  if (mode === 'vi') {
    var voltage = parseFloat(document.getElementById('amp-voltage').value);
    var impedance = parseFloat(document.getElementById('amp-impedance').value);

    if (isNaN(voltage) || isNaN(impedance) || impedance <= 0) {
      errorResult('amplifier-result', 'Please enter valid values.');
      return;
    }

    var power = (voltage * voltage) / impedance;
    showResult('amplifier-result',
      '<span class="label">Output Power</span><br>' +
      '<span class="value">' + round(power, 2) + ' W</span><br>' +
      '<span class="label">(V = ' + voltage + ' V RMS, Z = ' + impedance + ' Ω)</span>'
    );
  } else {
    var pw = parseFloat(document.getElementById('amp-power').value);
    var imp = parseFloat(document.getElementById('amp-impedance-pi').value);

    if (isNaN(pw) || isNaN(imp) || pw < 0 || imp <= 0) {
      errorResult('amplifier-result', 'Please enter valid values.');
      return;
    }

    var v = Math.sqrt(pw * imp);
    showResult('amplifier-result',
      '<span class="label">Required RMS Voltage</span><br>' +
      '<span class="value">' + round(v, 2) + ' V</span><br>' +
      '<span class="label">(P = ' + pw + ' W, Z = ' + imp + ' Ω)</span>'
    );
  }
}

// ── Cable Loss ───────────────────────────────────────────────────────────────
function calcCableLoss() {
  // Resistance per 100 m (Ω) from AWG selector (one conductor)
  var resistancePerHundredM = parseFloat(document.getElementById('cable-gauge').value);
  var length = parseFloat(document.getElementById('cable-length').value);
  var speakerImpedance = parseFloat(document.getElementById('cable-impedance').value);

  if (isNaN(length) || isNaN(speakerImpedance) || length <= 0 || speakerImpedance <= 0) {
    errorResult('cable-result', 'Please enter valid positive values.');
    return;
  }

  // Total round-trip resistance
  var cableResistance = 2 * (resistancePerHundredM / 100) * length;
  // Damping factor contribution
  var dampingFactor = speakerImpedance / cableResistance;
  // Power loss as percentage
  var powerLossPct = (cableResistance / (cableResistance + speakerImpedance)) * 100;
  // Loss in dB (positive value representing the magnitude of the loss)
  var lossDB = -10 * Math.log10(1 - powerLossPct / 100);

  var warning = '';
  if (powerLossPct > 5) {
    warning = '<p class="warning">⚠ Loss exceeds 5% – consider using a thicker gauge cable or shorter run.</p>';
  }

  showResult('cable-result',
    '<span class="label">Cable Resistance (round trip)</span><br>' +
    '<span class="value">' + round(cableResistance, 3) + ' Ω</span><br><br>' +
    '<span class="label">Power Loss</span><br>' +
    '<span class="value">' + round(powerLossPct, 2) + '% (' + round(lossDB, 2) + ' dB)</span><br><br>' +
    '<span class="label">Damping Factor (cable only)</span><br>' +
    '<span class="value">' + round(dampingFactor, 1) + '</span>' +
    warning
  );
}
