/* 이벤트를 관리 해줌. emit과 on으로 데이터 통신관리 */
const EventEmitter = require('events');
const serialEmitter = new EventEmitter();

module.exports = serialEmitter;
