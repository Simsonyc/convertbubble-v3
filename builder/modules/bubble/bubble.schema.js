// /builder/modules/bubble/bubble.schema.js
export const bubbleUISchema = {
  presets: ["circle", "rounded", "badge"],
  animations: ["none", "pulse", "bounce"],
  ratios: [
  {
    value: 0.25,
    label: "1/4",
    textRatio: 0.25,
    mediaRatio: 0.75
  },
  {
    value: 0.33,
    label: "1/3",
    textRatio: 0.33,
    mediaRatio: 0.67
  },
  {
    value: 0.5,
    label: "1/2",
    textRatio: 0.5,
    mediaRatio: 0.5
  }
],

  mediaTypes: ["video", "image", "logo"],
     bubbleSizes: [
    { id: "S", px: 72 },
    { id: "M", px: 88 },
    { id: "L", px: 104 }
  ],

  // ✅ Sliders contractuels (utilisés par bubble-ui.js)
  minSize: 72,
  maxSize: 220,     // <-- augmente ici (ex: 160, 200, 240…)
  sizeStep: 2,

  minFontSize: 9
};

Object.freeze(bubbleUISchema);

