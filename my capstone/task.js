// Common Elements
const taskTableBody = document.querySelector('#task-table tbody');
const reminderAudio = document.getElementById('reminder-audio');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('task-form');
const taskNameInput = document.getElementById('taskName');
const taskDescInput = document.getElementById('taskDesc');
const taskDateInput = document.getElementById('taskDate');
const taskTimeInput = document.getElementById('taskTime');
const taskCategoryInput = document.getElementById('taskCategory');
const taskReminderInput = document.getElementById('taskReminder');
const saveButton = document.getElementById('saveButton');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editIndex = -1;

// Open task modal
if (document.getElementById('show-add-task-form')) {
    document.getElementById('show-add-task-form').addEventListener('click', () => {
        taskForm.reset();
        editIndex = -1;
        taskModal.style.display = 'flex';
    });
}

// Save Task
function saveTask(event) {
    event.preventDefault();
    const taskName = taskNameInput.value.trim();
    const taskDesc = taskDescInput.value.trim();
    const taskDate = taskDateInput.value.trim();
    const taskTime = taskTimeInput.value.trim();
    const taskCategory = taskCategoryInput.value.trim();
    const taskReminder = taskReminderInput.value;

    if (!taskName || !taskDesc || !taskDate || !taskTime || !taskCategory || !taskReminder) {
        alert('Please fill out all fields.');
        return;
    }

    const taskDueDate = new Date(`${taskDate} ${taskTime}`);
    const reminderTime = new Date(taskDueDate.getTime() - taskReminder * 60000); // Reminder time

    const newTask = {
        name: taskName,
        description: taskDesc,
        dueDate: taskDueDate.toISOString(),
        category: taskCategory,
        reminder: `${taskReminder} minutes before`,
        status: 'Pending',
        reminderTime: reminderTime.toISOString()
    };

    if (editIndex >= 0) {
        tasks[editIndex] = newTask;
        editIndex = -1;
    } else {
        tasks.push(newTask);
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    closeAddTaskModal();
    renderTasks();
}

// Render Tasks in the table
function renderTasks() {
    taskTableBody.innerHTML = '';
    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        const taskDueDate = new Date(task.dueDate);
        const now = new Date();
        
        const isCompleted = task.status === 'Completed' || taskDueDate < now;

        row.innerHTML = `
            <td>${task.name}</td>
            <td>${task.description}</td>
            <td>${task.dueDate}</td>
            <td>${task.category}</td>
            <td>${task.reminder}</td>
            <td>${taskDueDate.toLocaleTimeString()}</td>
            <td>
                <input type="checkbox" ${isCompleted ? 'checked' : ''} onclick="toggleStatus(${index})">
                ${task.status}
            </td>
            <td>
                <button onclick="editTask(${index})">Edit</button>
                <button onclick="deleteTask(${index})">Delete</button>
            </td>
        `;
        taskTableBody.appendChild(row);
    });
}

// Toggle task status (Pending / Completed)
function toggleStatus(index) {
    const task = tasks[index];
    const taskDueDate = new Date(task.dueDate);
    const now = new Date();
    if (task.status === 'Pending' && taskDueDate <= now) {
        task.status = 'Completed';
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }
}

// Edit a task
function editTask(index) {
    const task = tasks[index];
    taskNameInput.value = task.name;
    taskDescInput.value = task.description;
    const [date, time] = task.dueDate.split(' ');
    taskDateInput.value = date;
    taskTimeInput.value = time;
    taskCategoryInput.value = task.category;
    taskReminderInput.value = parseInt(task.reminder);
    taskModal.style.display = 'flex';
    editIndex = index;
}

// Delete a task
function deleteTask(index) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }
}

// Close task modal
function closeAddTaskModal() {
    taskModal.style.display = 'none';
}

// Check for reminders and play sound
function checkReminders() {
    const now = new Date();
    tasks.forEach(task => {
        const taskReminderTime = new Date(task.reminderTime);
        if (now >= taskReminderTime && task.status === 'Pending') {
            // Play the reminder sound
            playReminderSound();

            // Update task status to "Reminder Triggered"
            task.status = 'Reminder Triggered';
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    });
}


function checkReminders() {
    const now = new Date();
    tasks.forEach(task => {
        const taskReminderTime = new Date(task.reminderTime);
        if (now >= taskReminderTime && task.status === 'Pending') {
            // Play the reminder sound
            playReminderSound();

            // Show a desktop notification
            if (Notification.permission === 'granted') {
                new Notification(`Reminder: ${task.name}`, {
                    body: `Your task "${task.name}" is due soon!`,
                    icon: 'path/to/icon.png'  // Optional: add an icon
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(`Reminder: ${task.name}`, {
                            body: `Your task "${task.name}" is due soon!`,
                            icon: 'path/to/icon.png'
                        });
                    }
                });
            }

            // Update task status to "Reminder Triggered"
            task.status = 'Reminder Triggered';
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    });
}



document.addEventListener('DOMContentLoaded', function() {
    const reminderTableBody = document.querySelector('#reminder-table tbody');
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];  // Get tasks from localStorage

    function renderReminders() {
        reminderTableBody.innerHTML = '';
        tasks.forEach(task => {
            const taskDueDate = new Date(task.dueDate);
            const taskReminderTime = new Date(task.reminderTime);
            const now = new Date();

            // Show tasks where reminder time is in the future
            if (taskReminderTime > now) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${task.name}</td>
                    <td>${task.description}</td>
                    <td>${taskReminderTime.toLocaleString()}</td>
                    <td>${task.status}</td>
                `;
                reminderTableBody.appendChild(row);
            }
        });
    }

    renderReminders(); // Call the function to render reminders
});


// Play reminder sound
function playReminderSound() {
    reminderAudio.play().catch(error => console.log("Error playing sound:", error));
}

// Run the reminder check every minute on any page
setInterval(checkReminders, 60000); // Check every minute
checkReminders(); // Initial check when page loads

// Initialize task rendering if on task.html
if (document.getElementById('task-table')) {
    renderTasks();
}


//calender

document.addEventListener('DOMContentLoaded', function() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];  // Get tasks from localStorage

    const events = tasks.map(task => {
        const taskDueDate = new Date(task.dueDate);
        const taskReminderDate = new Date(task.reminderTime);

        return {
            title: task.name,
            start: taskDueDate,  // Task due date
            description: task.description,
            color: '#007bff',  // Customize the color of the event
            extendedProps: {
                category: task.category,
                reminder: task.reminder,
                status: task.status
            }
        };
    });

    const calendarEl = document.getElementById('calendar');

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',  // Set the initial view to month
        events: events,  // Sync tasks with the calendar
        eventClick: function(info) {
            const event = info.event;
            alert(`Task: ${event.title}\nDescription: ${event.extendedProps.description}\nStatus: ${event.extendedProps.status}`);
        },
        eventColor: '#4CAF50',  // Customize event color
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        editable: true, // Allow dragging and editing events
        droppable: true, // Allow dropping events onto different days
        eventDrop: function(info) {
            // Update task due date when event is dragged
            const taskName = info.event.title;
            const newDate = info.event.start;

            // Find and update the task in localStorage
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            tasks = tasks.map(task => {
                if (task.name === taskName) {
                    task.dueDate = newDate.toISOString();
                    task.reminderTime = new Date(newDate.getTime() - (parseInt(task.reminder) * 60000)).toISOString();  // Update reminder time
                }
                return task;
            });

            localStorage.setItem('tasks', JSON.stringify(tasks));
        },
        eventResize: function(info) {
            // Handle resizing events (if necessary)
            const taskName = info.event.title;
            const newEndDate = info.event.end;

            // Find and update the task in localStorage
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            tasks = tasks.map(task => {
                if (task.name === taskName) {
                    task.dueDate = newEndDate.toISOString();  // Update task end date
                    task.reminderTime = new Date(newEndDate.getTime() - (parseInt(task.reminder) * 60000)).toISOString();  // Update reminder time
                }
                return task;
            });

            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    });

    // Render the calendar
    calendar.render();
});

const events = tasks.map(task => {
    const taskDueDate = new Date(task.dueDate);
    const taskReminderDate = new Date(task.reminderTime);

    return {
        title: task.name,
        start: taskDueDate,  // Task due date
        description: task.description,
        color: task.status === 'Reminder Triggered' ? '#ff0000' : '#007bff',  // Change color if reminder triggered
        extendedProps: {
            category: task.category,
            reminder: task.reminder,
            status: task.status
        }
    };
});





// Retrieve user data from localStorage
let user = JSON.parse(localStorage.getItem('user')) || {};
let theme = localStorage.getItem('theme') || 'light';

// Apply the saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    // Populate user fields for profile edit
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    if (user.fullName) fullNameInput.value = user.fullName;
    if (user.email) emailInput.value = user.email;

    // Set the theme dropdown and apply the theme
    const themeDropdown = document.getElementById('theme');
    themeDropdown.value = theme;
    applyTheme(theme);
});

// Handle profile updates
document.getElementById('edit-profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!fullName || !email) {
        alert('Please fill out all required fields.');
        return;
    }

    // Update user object and save to localStorage
    user.fullName = fullName;
    user.email = email;
    if (password) user.password = password;
    localStorage.setItem('user', JSON.stringify(user));
    alert('Profile updated successfully!');
});

// Handle theme changes
document.getElementById('theme-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedTheme = document.getElementById('theme').value;
    localStorage.setItem('theme', selectedTheme);
    applyTheme(selectedTheme);
    alert('Theme applied successfully!');
});

// Function to apply the selected theme
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.style.setProperty('--bg-color', 'var(--bg-color-dark)');
        document.body.style.setProperty('--text-color', 'var(--text-color-dark)');
        document.body.style.setProperty('--button-bg', 'var(--button-bg-dark)');
        document.body.style.setProperty('--button-hover', 'var(--button-hover-dark)');
    } else {
        document.body.style.setProperty('--bg-color', '#f4f4f9');
        document.body.style.setProperty('--text-color', '#152238');
        document.body.style.setProperty('--button-bg', '#152238');
        document.body.style.setProperty('--button-hover', '#ff5a5f');
    }
}

// User Registration
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!fullName || !email || !password) {
        alert('All fields are required.');
        return;
    }

    const newUser = { fullName, email, password };
    localStorage.setItem('user', JSON.stringify(newUser));

    alert('Registration successful! Redirecting to login page...');
    window.location.href = 'login.html';
});

// User Login
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email === email && user.password === password) {
        alert('Login successful!');
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid email or password!');
    }
});

// Customer Care Widget
(function(){
    var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
    var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/673bfc7d2480f5b4f5a0331c/1id154iro';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
})();


//report

    document.addEventListener('DOMContentLoaded', function() {
        // Simulated example task data (replace with actual data from your backend or database)
        var tasks = [
            { name: "Task 1", progress: 75 },
            { name: "Task 2", progress: 50 },
            { name: "Task 3", progress: 25 },
            { name: "Task 4", progress: 90 }
        ];

        // Extract task names and progress values
        var taskNames = tasks.map(function(task) { return task.name; });
        var taskProgress = tasks.map(function(task) { return task.progress; });

        // Task progress chart data
        var taskProgressCtx = document.getElementById('taskProgressChart').getContext('2d');
        var taskProgressChart = new Chart(taskProgressCtx, {
            type: 'bar',
            data: {
                labels: taskNames, // Dynamically populate with task names
                datasets: [{
                    label: 'Progress (%)',
                    data: taskProgress, // Dynamically populate with task progress
                    backgroundColor: '#4caf50',
                    borderColor: '#388e3c',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Simulated example for task status (completed vs. pending)
        var completedTasks = 8; // Replace with dynamic completed task count
        var pendingTasks = 4;  // Replace with dynamic pending task count

        // Completed vs Pending Tasks chart
        var taskStatusCtx = document.getElementById('taskStatusChart').getContext('2d');
        var taskStatusChart = new Chart(taskStatusCtx, {
            type: 'pie',
            data: {
                labels: ['Completed Tasks', 'Pending Tasks'],
                datasets: [{
                    label: 'Task Status',
                    data: [completedTasks, pendingTasks], // Replace with dynamic counts
                    backgroundColor: ['#4caf50', '#ff5a5f'],
                    borderColor: ['#388e3c', '#d32f2f'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });
    });

    function addTask(taskName, taskProgress) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
        // Create a new task object
        const newTask = {
            name: taskName,
            progress: taskProgress
        };
    
        // Add the new task to the task list
        tasks.push(newTask);
    
        // Save updated tasks back to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
    
        // After adding a task, update the report
        updateTaskReport();
    }
    document.addEventListener('DOMContentLoaded', function() {
        // Function to update the task report chart
        function updateTaskReport() {
            // Get tasks from localStorage
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
            // Prepare data for the chart based on task progress
            const taskData = tasks.map(task => {
                return {
                    name: task.name,
                    progress: task.progress
                };
            });
    
            // If there are no tasks, display a message
            if (taskData.length === 0) {
                document.getElementById('chart-container').innerHTML = "<p>No tasks available to display progress.</p>";
                return;
            }
    
            // Create the chart using Chart.js
            var chart = new Chart(document.getElementById('myChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: taskData.map(task => task.name), // Task names as labels
                    datasets: [{
                        label: 'Task Progress',
                        data: taskData.map(task => task.progress), // Task progress
                        backgroundColor: 'rgba(54, 162, 235, 0.5)', // Blue color for the bars
                        borderColor: 'rgba(54, 162, 235, 1)', // Blue border color
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true, // Start the y-axis at 0
                            max: 100 // Set max value for the y-axis to 100 (percentage)
                        }
                    }
                }
            });
        }
    
        // Initial update when page loads
        updateTaskReport();
    });
        

      // Add Task function
      function addTask() {
        const taskName = document.getElementById('taskName').value;
        const taskProgress = parseInt(document.getElementById('taskProgress').value);

        if (taskName && !isNaN(taskProgress) && taskProgress >= 0 && taskProgress <= 100) {
            // Save the task to localStorage
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const newTask = { name: taskName, progress: taskProgress };
            tasks.push(newTask);
            localStorage.setItem('tasks', JSON.stringify(tasks));

            // Clear input fields
            document.getElementById('taskName').value = '';
            document.getElementById('taskProgress').value = '';

            // Update the task report
            updateTaskReport();
        } else {
            alert("Please enter valid task name and progress (0-100).");
        }
    }

    // Update the task report chart
    function updateTaskReport() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskData = tasks.map(task => ({ name: task.name, progress: task.progress }));

        if (taskData.length === 0) {
            document.getElementById('chart-container').innerHTML = "<p>No tasks available to display progress.</p>";
            return;
        }

        // Create the chart using Chart.js
        var chart = new Chart(document.getElementById('myChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: taskData.map(task => task.name), // Task names as labels
                datasets: [{
                    label: 'Task Progress',
                    data: taskData.map(task => task.progress), // Task progress
                    backgroundColor: 'rgba(54, 162, 235, 0.5)', // Blue color for the bars
                    borderColor: 'rgba(54, 162, 235, 1)', // Blue border color
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true, // Start the y-axis at 0
                        max: 100 // Set max value for the y-axis to 100 (percentage)
                    }
                }
            }
        });
    }

    // Initial update when page loads
    document.addEventListener('DOMContentLoaded', function() {
        updateTaskReport();
    });




    //theme
    // Theme definitions
    const themes = {
        light: {
            '--background-color': '#ffffff',
            '--text-color': '#000000',
            '--header-background': '#f4f4f9',
            '--button-background': '#152238',
            '--button-color': '#ffffff',
            '--link-color': '#007bff',
        },
        dark: {
            '--background-color': '#121212',
            '--text-color': '#ffffff',
            '--header-background': '#1a1a1a',
            '--button-background': '#333333',
            '--button-color': '#ffffff',
            '--link-color': '#66b2ff',
        }
    };

    // Function to apply a theme
    function applyTheme() {
        const selectedTheme = document.getElementById('theme').value;
        const theme = themes[selectedTheme];
        for (const [key, value] of Object.entries(theme)) {
            document.documentElement.style.setProperty(key, value);
        }
        // Save the selected theme in localStorage
        localStorage.setItem('selectedTheme', selectedTheme);
    }

    // Function to load the stored theme
    function loadTheme() {
        const storedTheme = localStorage.getItem('selectedTheme') || 'light';
        document.getElementById('theme').value = storedTheme;
        applyTheme();
    }

    // Initialize theme on page load
    document.addEventListener('DOMContentLoaded', loadTheme);




    const mediaQuery = window.matchMedia("(max-width: 768px)");

function applyResponsiveClass(e) {
  if (e.matches) {
    document.body.classList.add("mobile");
    document.body.classList.remove("desktop");
  } else {
    document.body.classList.add("desktop");
    document.body.classList.remove("mobile");
  }
}

// Initial check
applyResponsiveClass(mediaQuery);

// Add event listener
mediaQuery.addEventListener("change", applyResponsiveClass);

