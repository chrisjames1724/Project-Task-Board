let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

function generateTaskId() {
  if (nextId === null) {
    nextId = 1;
  } else {
    nextId++;
  }

  localStorage.setItem("nextId", JSON.stringify(nextId));
  return nextId;
}

function createTaskCard(task) {
  const taskCard = $("<div>")
    .addClass("card w-75 task-card draggable my-3")
    .attr("data-task-id", task.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(task.title);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(task.description);
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-task-id", task.id);
  cardDeleteBtn.on("click", handleDeleteTask);

  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

function renderTaskList() {
  if (!taskList) {
    taskList = [];
  }

  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

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

function handleAddTask(event) {
  event.preventDefault();

  const task = {
    id: generateTaskId(),
    title: $("#taskTitle").val(),
    description: $("#taskDescription").val(),
    dueDate: $("#taskDueDate").val(),
    status: "to-do",
  };

  taskList.push(task);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
  $("#taskTitle").val("");
  $("#taskDescription").val("");
  $("#taskDueDate").val("");
}

function handleDeleteTask(event) {
  event.preventDefault();

  const taskId = $(this).attr("data-task-id");

  taskList = taskList.filter((task) => task.id !== parseInt(taskId));
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

function handleDrop(event, ui) {
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;

  for (let task of taskList) {
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;
    }
  }

  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

$(document).ready(function () {
  renderTaskList();

  $("#taskForm").on("submit", handleAddTask);

  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });

  $("#taskDueDate").datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
