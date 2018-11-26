const VALID_TAG_TYPES = ["input", "textarea"];

const INPUT_TYPES = {
  BUTTON: "button",
  CHECKBOX: "checkbox",
  COLOR: "color",
  DATE: "date",
  DATETIME: "datetime",
  DATETIME_LOCAL: "datetime-local",
  EMAIL: "email",
  FILE: "file",
  HIDDEN: "hidden",
  IMAGE: "image",
  MONTH: "month",
  NUMBER: "number",
  PASSWORD: "password",
  RADIO: "radio",
  RANGE: "range",
  RESET: "reset",
  SEARCH: "search",
  SUBMIT: "submit",
  TEL: "tel",
  TEXT: "text",
  TIME: "time",
  URL: "url",
  WEEK: "week"
};

const VALID_TYPES = [
  INPUT_TYPES.CHECKBOX,
  INPUT_TYPES.COLOR,
  INPUT_TYPES.DATE,
  INPUT_TYPES.DATETIME,
  INPUT_TYPES.DATETIME_LOCAL,
  INPUT_TYPES.EMAIL,
  INPUT_TYPES.MONTH,
  INPUT_TYPES.NUMBER,
  INPUT_TYPES.PASSWORD,
  INPUT_TYPES.RADIO,
  INPUT_TYPES.RANGE,
  INPUT_TYPES.SEARCH,
  INPUT_TYPES.TEL,
  INPUT_TYPES.TEXT,
  INPUT_TYPES.URL,
  INPUT_TYPES.WEEK
];

const NO_MODEL_TYPES = [
  INPUT_TYPES.BUTTON,
  INPUT_TYPES.FILE,
  INPUT_TYPES.HIDDEN,
  INPUT_TYPES.IMAGE,
  INPUT_TYPES.RESET,
  INPUT_TYPES.SUBMIT
];

module.exports = {
  VALID_TAG_TYPES,
  INPUT_TYPES,
  VALID_TYPES,
  NO_MODEL_TYPES
};
