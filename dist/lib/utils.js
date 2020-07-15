"use strict";

/**
 * * Created by lee on 2018/12/11
 */
var dataFilter = function dataFilter(data) {
  return data;
};

var validator = function validator(_ref) {
  var id = _ref.id;
  // this bind imServer
  this.status.load(id);
  return true;
};

exports.dataFilter = dataFilter;
exports.validator = validator;