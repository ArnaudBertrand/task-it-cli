'use strict';

var request = require("request");
var path = require("path");
var nconf = require("nconf");
var _ = require("lodash");

const FILE_DATA = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local');
nconf.use('file', {file: path.join(FILE_DATA, 'config.json')});
nconf.load();

const BASE_URL = 'https://blazing-heat-4370.firebaseio.com/default';

class TodoState {
  /**
   * Create a new task to add
   * @param text: description of the task
   */
  add(text) {
    // Task template
    const todo = {
      date: Date.now(),
      text,
      done: false
    };

    // Add task
    request.post(`${BASE_URL}/todos.json`,
      {form: JSON.stringify(todo)}, function(error, response, body) {
        if (error) {
          return console.error('Sorry, the task could not have been added');
        }
        console.info('Your task has been succesfully added');
      });
  }

  /**
   * Remove a task from its local ID
   * @param id: local id generated when doing list()
   */
  delete(id) {
    // Get the task to delete
    const todos = nconf.get('todos');
    const todo = todos[id-1];

    // Delete the task
    request.del(`${BASE_URL}/todos/${todo.fid}.json`);
    console.info('Deletion of: ');
    this.displayTodo(todo);
  }


  /**
   * Edit a task from local id with provided text
   * @param id: local id generated when doing list()
   * @param arg: attribute to edit
   * @param val: value to set
   */
  edit(id, attr, val){
    // Get task to edit
    const todos = nconf.get('todos');
    const todo = todos[id-1];

    // Edit the task
    request.put(`${BASE_URL}/todos/${todo.fid}/${attr}.json`,
        {form: JSON.stringify(val)},
        (error, response, body) => {
          if (error) {
            return console.error('Sorry, the task could not have been edited');
          }
          console.info(`Task ${id} has been edited`);
        });
  }

  /**
   * List all
   * @param text: filter on text string (no filter = null | undefined)
   * @param done: filter on tasks done (no filter = null | undefined)
   * @param undone: filter on tasks undone (no filter = null | undefined)
   */
  list(text, done) {
    //TODO: Filter from Firebase within the request instead of JS
    // Get entire list
    request(`${BASE_URL}/todos.json`,
        (error, response, body) => {
          // Transform object to array and keep ID
          let i = 0;
          let todos = _.transform(JSON.parse(body), (res, value, key) => {
            value.fid = key;
            value.id = ++i;
            res.push(value);
          }, []);

          // Save in configs
          nconf.set('todos', todos);
          nconf.save(() => {});

          // Apply text filter
          if(typeof text === 'string'){
            todos = todos.filter((todo) => todo.text.includes(text))
          }

          // Apply task done/undone filter
          if(typeof done === 'boolean'){
            todos = todos.filter((todo) => todo.done === done)
          }

          // Print tasks on screen
          let todoId;
          for(todoId of Object.keys(todos)){
            this.displayTodo(todos[todoId]);
          }
        });
  }

  /**
   * Display a task
   * @param todo: task to display
   */
  displayTodo(todo){
    console.info(`${todo.id} - ${todo.text}`);
  }
}

module.exports = TodoState;
