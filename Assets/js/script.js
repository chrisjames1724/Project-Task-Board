//This is declaring global variables of "taskList" & "nextID" which will be stored in local storage to then be pulled at a later time
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

//creating the fucntion of generating a task ID card, if there is none then show nothing 
function generateTaskId() {
  //
  if (nextId === null) {
    nextId = 1;
  } else {
    nextId++;
  }

  //This is putting the input info of the task cards into local storage
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return nextId;
}

//This is identifying and creating the task cards which will be able to be moved from the "todo," "inprogress," and "done" task sections
function createTaskCard(task) {
  //declaring the constant "taskCard" as a div
  const taskCard = $("<div>")
    //Adding class declaring width with the ability to be draggable
    .addClass("card w-75 task-card draggable my-3")
    .attr("data-task-id", task.id);
  //Adding a "div" and "class" using the text input into the tast title an h4 header
  const cardHeader = $("<div>").addClass("card-header h4").text(task.title);
  //adding a "div" and "class" to the card body which will contain the tast description, due date & delete button
  const cardBody = $("<div>").addClass("card-body");
  //adding Paragraph element and class card text for the task description
  const cardDescription = $("<p>").addClass("card-text").text(task.description);
  //adding Paragraph element and class card text for the due date
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  //declaring the delete button as button
  const cardDeleteBtn = $("<button>")
  //adding a class to make the delete button red
    .addClass("btn btn-danger delete")
    //putting the text in the button as delete
    .text("Delete")
    //
    .attr("data-task-id", task.id);
  //Deleting the task card upon the click of the delete button
  cardDeleteBtn.on("click", handleDeleteTask);

  //
  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");
    if (now.isSame(taskDueDate, "day")) {
      //White text yellow background if the task is not done on the same day as task is due
      taskCard.addClass("bg-warning text-white");
      
    } else if (now.isAfter(taskDueDate)) {
      //White text red background if the task is not done and the due date has passed
      taskCard.addClass("bg-danger text-white");
      //mkaing a light border for all the cards to lay within in each section of "to-do" "in-progress" and "done"
      cardDeleteBtn.addClass("border-light");
    }
  }

  //appending the "cardBody" info of Task description (cadDescription) Task Due Date (cardDueDate) & Task Delete Button (cardDeleteBtn) along with the "taskCard" infor which contains all of the "cardBody" and the "cardHeader("taskTitle")
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);
  //Returning back after making a card so that you can create another
  return taskCard;
}

function renderTaskList() {
  if (!taskList) {
    //Putting the objects of the task list into an array [todo, inprogress, donelist]
    taskList = [];
  }
  //Declaring that the "todoList" will be whichever "taskCards" are in the "todoList"
  const todoList = $("#todo-cards");
  todoList.empty();
  //Declaring that the "tinProgressList" will be whichever "taskCards" are in the "inProgressList"
  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();
  //Declaring that the "doneList" will be whichever "taskCards" are in the "doneList"
  const doneList = $("#done-cards");
  doneList.empty();
  //this is declaring where to append each of the task cards depending on where each card has been dragged/dropped
  for (let task of taskList) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }

  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,

    helper: function (e) {
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      return original.clone().css({
        maxWidth: original.outerWidth(),
      });
    },
  });
}

//declaring a function on how to what to do once a task is added
function handleAddTask(event) {
  event.preventDefault();

  //Declaring that a task shall include a title, description and due date and will populate in the "to-do" list
  const task = {
    id: generateTaskId(),
    title: $("#taskTitle").val(),
    description: $("#taskDescription").val(),
    dueDate: $("#taskDueDate").val(),
    status: "to-do",
  };

  //Explains how when a task is added to the task list it will be placed into local storage using JSON strignify with the array including (TASK)title, description & due date
  taskList.push(task);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
  $("#taskTitle").val("");
  $("#taskDescription").val("");
  $("#taskDueDate").val("");
}

//this is the function of the delete task event which removes the task data from local storage
function handleDeleteTask(event) {
  event.preventDefault();

  const taskId = $(this).attr("data-task-id");

  //putting the tasklist into an arrary in local storage
  taskList = taskList.filter((task) => task.id !== parseInt(taskId));
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

//the function which declares what happens within the UI when a task is dragged from one section to the next and gives it a new status depending on the section dropped in
function handleDrop(event, ui) {
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;

  for (let task of taskList) {
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;
    }
  }

  //Updates the local storage to include the new status of the dragged task card
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}


$(document).ready(function () {
  renderTaskList();

  //add take on "AddTask" click
  $("#taskForm").on("submit", handleAddTask);

  //
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });

  $("#taskDueDate").datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
