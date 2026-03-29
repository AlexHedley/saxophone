/**
 * Saxophone Fingering Chart — SVG diagram generator
 *
 * Generates an inline SVG showing which keys to press for a given note.
 * Keys are laid out top-to-bottom in two sections (left hand / right hand).
 */
(function (global) {
  "use strict";

  var SVG_W = 180;
  var SVG_H = 556;

  // ---------------------------------------------------------------------------
  // Key layout: position and shape of every key in the diagram
  // ---------------------------------------------------------------------------
  var KEY_DEFS = {
    // ── Left hand ──────────────────────────────────────────────────
    oct:         { shape: "circle", cx: 26,  cy: 52,  r: 13 },
    lh1:         { shape: "circle", cx: 90,  cy: 105, r: 25 },
    bis:         { shape: "circle", cx: 143, cy: 138, r: 10 },
    lh2:         { shape: "circle", cx: 90,  cy: 167, r: 25 },
    lh3:         { shape: "circle", cx: 90,  cy: 229, r: 25 },
    gSharp:      { shape: "circle", cx: 145, cy: 224, r: 12 },
    // Left pinky row
    lhPinky_Eb:  { shape: "rect",   x: 8,   y: 268,  w: 28, h: 32 },
    lhPinky_C:   { shape: "rect",   x: 41,  y: 268,  w: 28, h: 32 },
    lhPinky_B:   { shape: "rect",   x: 74,  y: 268,  w: 28, h: 32 },
    lhPinky_Bb:  { shape: "rect",   x: 107, y: 268,  w: 28, h: 32 },
    // ── Right hand ─────────────────────────────────────────────────
    rh1:         { shape: "circle", cx: 90,  cy: 360, r: 25 },
    rh2:         { shape: "circle", cx: 90,  cy: 422, r: 25 },
    rh3:         { shape: "circle", cx: 90,  cy: 484, r: 25 },
    rhSide_C:    { shape: "circle", cx: 145, cy: 402, r: 12 },
    // Right pinky row
    rhPinky_Bb:  { shape: "rect",   x: 22,  y: 514,  w: 28, h: 32 },
    rhPinky_C:   { shape: "rect",   x: 55,  y: 514,  w: 28, h: 32 },
    rhPinky_Eb:  { shape: "rect",   x: 88,  y: 514,  w: 28, h: 32 }
  };

  // Short label displayed inside each key shape
  var KEY_LABELS = {
    oct:        "Oct",
    lh1:        "1",
    bis:        "Bis",
    lh2:        "2",
    lh3:        "3",
    gSharp:     "G\u266f",
    lhPinky_Eb: "E\u266d",
    lhPinky_C:  "C",
    lhPinky_B:  "B",
    lhPinky_Bb: "B\u266d",
    rh1:        "1",
    rh2:        "2",
    rh3:        "3",
    rhSide_C:   "C",
    rhPinky_Bb: "B\u266d",
    rhPinky_C:  "C",
    rhPinky_Eb: "E\u266d"
  };

  // ---------------------------------------------------------------------------
  // Colour palette
  // ---------------------------------------------------------------------------
  var COLOR = {
    bg:           "#f8f9fa",
    pressed:      "#1a252f",
    open:         "#ffffff",
    stroke:       "#2c3e50",
    separator:    "#ced4da",
    sectionLabel: "#6c757d",
    labelPressed: "#ffffff",
    labelOpen:    "#495057"
  };

  // ---------------------------------------------------------------------------
  // SVG helpers
  // ---------------------------------------------------------------------------
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function circleEl(cx, cy, r, pressed) {
    var fill   = pressed ? COLOR.pressed : COLOR.open;
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r +
           '" fill="' + fill + '" stroke="' + COLOR.stroke + '" stroke-width="2"/>';
  }

  function rectEl(x, y, w, h, pressed) {
    var fill = pressed ? COLOR.pressed : COLOR.open;
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
           '" rx="4" fill="' + fill + '" stroke="' + COLOR.stroke + '" stroke-width="2"/>';
  }

  function textEl(x, y, label, fontSize, pressed, anchor) {
    var fill = pressed ? COLOR.labelPressed : COLOR.labelOpen;
    anchor = anchor || "middle";
    return '<text x="' + x + '" y="' + y +
           '" text-anchor="' + anchor + '"' +
           ' font-family="Arial,Helvetica,sans-serif"' +
           ' font-size="' + fontSize + '"' +
           ' font-weight="bold"' +
           ' fill="' + fill + '">' + esc(label) + "</text>";
  }

  // ---------------------------------------------------------------------------
  // Main generator
  // ---------------------------------------------------------------------------
  function generateSVG(keys, displayWidth) {
    var w = displayWidth || SVG_W;
    var h = displayWidth ? Math.round(SVG_H * displayWidth / SVG_W) : SVG_H;
    var parts = [];

    parts.push(
      '<svg xmlns="http://www.w3.org/2000/svg"' +
      ' viewBox="0 0 ' + SVG_W + " " + SVG_H + '"' +
      ' width="' + w + '" height="' + h + '"' +
      ' role="img" aria-label="Saxophone fingering diagram">'
    );

    // Background
    parts.push('<rect width="' + SVG_W + '" height="' + SVG_H +
               '" fill="' + COLOR.bg + '" rx="10"/>');

    // Section labels
    parts.push(
      '<text x="90" y="22" text-anchor="middle"' +
      ' font-family="Arial,Helvetica,sans-serif" font-size="10"' +
      ' font-weight="bold" fill="' + COLOR.sectionLabel + '">LEFT HAND</text>'
    );

    // Separator between left and right hand sections
    parts.push(
      '<line x1="10" y1="318" x2="170" y2="318"' +
      ' stroke="' + COLOR.separator + '" stroke-width="1.5" stroke-dasharray="4,3"/>'
    );
    parts.push(
      '<text x="90" y="337" text-anchor="middle"' +
      ' font-family="Arial,Helvetica,sans-serif" font-size="10"' +
      ' font-weight="bold" fill="' + COLOR.sectionLabel + '">RIGHT HAND</text>'
    );

    // Draw each key
    var keyIds = Object.keys(KEY_DEFS);
    for (var i = 0; i < keyIds.length; i++) {
      var id      = keyIds[i];
      var def     = KEY_DEFS[id];
      var pressed = keys[id] === true;
      var label   = KEY_LABELS[id] || "";

      if (def.shape === "circle") {
        parts.push(circleEl(def.cx, def.cy, def.r, pressed));
        // Font size: larger for main finger keys (r=25), smaller for aux keys
        var fs = def.r >= 22 ? 13 : 9;
        parts.push(textEl(def.cx, def.cy + 5, label, fs, pressed));
      } else {
        // rect
        parts.push(rectEl(def.x, def.y, def.w, def.h, pressed));
        var rx = def.x + def.w / 2;
        var ry = def.y + def.h / 2 + 5;
        parts.push(textEl(rx, ry, label, 9, pressed));
      }
    }

    parts.push("</svg>");
    return parts.join("\n");
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------
  global.FingeringChart = { generateSVG: generateSVG };

}(window));
