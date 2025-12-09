const Bookshelf = require("bookshelf")(require("../config/connection"));

const Calendar = Bookshelf.Model.extend({
  tableName: "institution",

  // Parse calendar data from JSON
  parse: function (attrs) {
    if (attrs.calendar_data && typeof attrs.calendar_data === "string") {
      attrs.calendar_data = JSON.parse(attrs.calendar_data);
    }
    return attrs;
  },

  // Stringify calendar data for storage
  format: function (attrs) {
    if (attrs.calendar_data && typeof attrs.calendar_data === "object") {
      attrs.calendar_data = JSON.stringify(attrs.calendar_data);
    }
    return attrs;
  },
});

module.exports = Calendar;
