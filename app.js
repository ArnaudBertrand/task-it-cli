'use strict';

/** State **/
var TodoState = require('./TodoState');
var todos = new TodoState();

/** Handler **/
const Handlers = {
  add: function (args) {
    todos.add(args[0]);
  },
  delete: function (args) {
    todos.delete(args[0]);
  },
  edit: function (args) {
    todos.edit(args[0], 'text', args[1]);
  },
  help: function () {
    console.info('Not implemented yet :(');
  },
  list: function (args) {
    // Handle contains
    const textFilterPos = args.indexOf('--contains');
    const textFilter = textFilterPos > -1 ? args[textFilterPos+1] : null;

    const doneFilter = args.indexOf('--done') > -1 ? true : args.indexOf('--undone') > -1 ? false : null;

    todos.list(textFilter, doneFilter);
  },
  setDone: function (args) {
    todos.edit(args[0], 'done', true);
  },
  unsetDone: function (args) {
    todos.edit(args[0], 'done', false);
  }
};

/** Process command **/
if(process.argv[2]){
  switch(process.argv[2]){
    case '--help':
      Handlers.help();
      break;
    case 'add':
      Handlers.add(process.argv.slice(3));
      break;
    case 'del':
      Handlers.delete(process.argv.slice(3));
      break;
    case 'edit':
      Handlers.edit(process.argv.slice(3));
      break;
    case 'list':
      Handlers.list(process.argv.slice(3));
      break;
    case 'set-done':
      Handlers.setDone(process.argv.slice(3));
      break;
    case 'unset-done':
      Handlers.unsetDone(process.argv.slice(3));
      break;
    default:
      console.error('Missing arguments, see list of commands with --help');
  }
} else {
  console.error('Missing arguments, see list of commands with --help');
}
