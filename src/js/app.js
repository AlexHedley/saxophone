var myApp = angular.module("myApp", []);

myApp.controller("myController", function ($scope, $http, $timeout) {
  $scope.notes = [];
  $scope.selectedNote = null;
  $scope.register1 = [];
  $scope.register2 = [];

  $scope.init = function () {
    $http.get("data/fingerings.json").then(
      function (response) {
        $scope.notes = response.data.notes;
        $scope.register1 = $scope.notes.filter(function (n) { return n.register === 1; });
        $scope.register2 = $scope.notes.filter(function (n) { return n.register === 2; });
        // Default: select the first note
        if ($scope.notes.length > 0) {
          $scope.selectNote($scope.notes[0]);
        }
      },
      function () {
        console.error("Could not load data/fingerings.json");
      }
    );
  };

  $scope.selectNote = function (note) {
    $scope.selectedNote = note;
    // Defer DOM updates until after AngularJS finishes its digest/render cycle
    $timeout(function () {
      // Render fingering diagram (inline SVG)
      var diagramEl = document.getElementById("fingering-diagram");
      if (diagramEl && window.FingeringChart) {
        diagramEl.innerHTML = FingeringChart.generateSVG(note.keys);
      }
      // Render VexFlow notation
      renderNotation(note.vexNote);
    }, 0);
  };

  $scope.init();
});

// ---------------------------------------------------------------------------
// VexFlow notation renderer (VexFlow 3.x)
// ---------------------------------------------------------------------------
function renderNotation(vexNote) {
  var container = document.getElementById("notation");
  if (!container) { return; }
  // Clear previous render
  container.innerHTML = "";

  try {
    var VF = Vex.Flow;
    var renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    renderer.resize(320, 140);
    var context = renderer.getContext();

    var stave = new VF.Stave(10, 20, 280);
    stave.addClef("treble");
    stave.setContext(context).draw();

    // Parse the vexNote string (e.g. "Bb3/w") into a StaveNote
    var parts = vexNote.split("/");
    var noteStr = parts[0];   // e.g. "Bb3"
    var dur    = parts[1] || "w";

    // Extract pitch letter, accidental, and octave
    var match = noteStr.match(/^([A-Ga-g])(#{1,2}|b{1,2}|n)?(\d)$/);
    if (!match) { return; }

    var keys = [noteStr.toLowerCase().replace("b", "b").replace("#", "#")];
    // VexFlow key format: "bb/3", "c#/4", "g/4" etc.
    var pitch  = match[1].toLowerCase();
    var acc    = match[2] || "";
    var octave = match[3];
    var vfKey  = pitch + acc + "/" + octave;

    var staveNote = new VF.StaveNote({
      clef: "treble",
      keys: [vfKey],
      duration: dur
    });

    // Add accidental annotation if needed
    if (acc === "b" || acc === "bb") {
      staveNote.addAccidental(0, new VF.Accidental("b"));
    } else if (acc === "#" || acc === "##") {
      staveNote.addAccidental(0, new VF.Accidental("#"));
    }

    var voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables([staveNote]);

    var formatter = new VF.Formatter();
    formatter.joinVoices([voice]).format([voice], 240);
    voice.draw(context, stave);

  } catch (e) {
    console.error("VexFlow render error:", e);
  }
}

// FILTERS
myApp.filter("toDate", function () {
  return function (items) {
    return new Date(items);
  };
});
