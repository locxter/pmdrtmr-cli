'use strict';

import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import {
    retrieveAccessToken,
    signUp,
    revokeAccessToken,
    getAllTimersOfUser,
    createTimer,
    deleteTimer,
    getUser,
    updateUser,
    getCaldavDescriptions,
    deleteUser,
} from './lib/api-controller.js';

// Variables for global stuff
let globalAccessToken;
let globalServerAddress;
let timers;
let timer;
let countdownTimeLeft;
let countdownInterval;
let countdownMenu;
let countdownMinutes;
let countdownSeconds;
let isPaused = false;

// Function to sign up or log in a user
function signUpOrLogIn() {
    console.clear();
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'username',
                message: 'Username:',
                validate: (value) => {
                    if (value) {
                        return true;
                    } else {
                        return 'Enter a username';
                    }
                },
            },
            {
                type: 'password',
                name: 'password',
                message: 'Password:',
                validate: (value) => {
                    if (value) {
                        return true;
                    } else {
                        return 'Enter a password';
                    }
                },
            },
            {
                type: 'input',
                name: 'serverAddress',
                message: 'Server address:',
                default: 'http://localhost:8080',
                validate: (value) => {
                    if (value) {
                        return true;
                    } else {
                        return 'Enter a server address';
                    }
                },
            },
        ])
        .then((data) => {
            let user = {
                username: data.username,
                password: data.password,
            };
            let serverAddress = data.serverAddress;
            retrieveAccessToken(serverAddress, user)
                .then((data) => {
                    globalAccessToken = data;
                    globalServerAddress = serverAddress;
                    menu();
                })
                .catch((error) => {
                    console.error(error);
                    signUp(serverAddress, user)
                        .then(() => {
                            return retrieveAccessToken(serverAddress, user);
                        })
                        .then((data) => {
                            globalAccessToken = data;
                            globalServerAddress = serverAddress;
                            menu();
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
        })
        .catch((error) => {
            console.error(error);
        });
}

// Function to display a menu for navigation
function menu() {
    console.clear();
    inquirer
        .prompt({
            type: 'list',
            name: 'option',
            message: 'Choose an option:',
            choices: [
                {
                    name: 'Show timers',
                    value: 0,
                },
                {
                    name: 'Add CalDAV task',
                    value: 1,
                },
                {
                    name: 'Add task',
                    value: 2,
                },
                {
                    name: 'Delete task',
                    value: 3,
                },
                {
                    name: 'Start working',
                    value: 4,
                },
                {
                    name: 'Settings',
                    value: 5,
                },
                {
                    name: 'Log out',
                    value: 6,
                },
            ],
        })
        .then((data) => {
            switch (data.option) {
                case 0:
                    showTimers();
                    break;
                case 1:
                    addCaldavTask();
                    break;
                case 2:
                    addTask();
                    break;
                case 3:
                    deleteTask();
                    break;
                case 4:
                    runTimer(0);
                    break;
                case 5:
                    settings();
                    break;
                case 6:
                    logOut();
                    break;
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

// Function to show the timer list
function showTimers() {
    console.clear();
    getAllTimersOfUser(globalServerAddress, globalAccessToken)
        .then((data) => {
            if (data.length < 2) {
                console.log(chalk.bold('No timers found'));
            } else {
                console.log(chalk.bold('Timers:'));
                for (let i = 0; i < data.length; i++) {
                    let timer = data[i];
                    if (timer.isBreak) {
                        console.log(chalk.bold(i + 1 + '. Break: ' + timer.description));
                    } else {
                        console.log(chalk.bold(i + 1 + '. Work: ' + timer.description));
                    }
                }
            }
            return inquirer.prompt({
                type: 'list',
                name: 'option',
                message: 'Choose an option:',
                choices: [
                    {
                        name: 'Menu',
                        value: 0,
                    },
                    {
                        name: 'Settings',
                        value: 1,
                    },
                    {
                        name: 'Log out',
                        value: 2,
                    },
                ],
            });
        })
        .then((data) => {
            switch (data.option) {
                case 0:
                    menu();
                    break;
                case 1:
                    settings();
                    break;
                case 2:
                    logOut();
                    break;
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

// Function to add a CalDAV task to the timer list
function addCaldavTask() {
    console.clear();
    getCaldavDescriptions(globalServerAddress, globalAccessToken)
        .then((data) => {
            if (data.length < 1) {
                console.log(chalk.bold('No CalDAV tasks found'));
                inquirer
                    .prompt({
                        type: 'list',
                        name: 'option',
                        message: 'Choose an option:',
                        choices: [
                            {
                                name: 'Menu',
                                value: 0,
                            },
                            {
                                name: 'Settings',
                                value: 1,
                            },
                            {
                                name: 'Log out',
                                value: 2,
                            },
                        ],
                    })
                    .then((data) => {
                        switch (data.option) {
                            case 0:
                                menu();
                                break;
                            case 1:
                                settings();
                                break;
                            case 2:
                                logOut();
                                break;
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                inquirer
                    .prompt({
                        type: 'list',
                        name: 'caldavTask',
                        message: 'Choose a CalDAV task to add:',
                        choices: data,
                    })
                    .then((data) => {
                        let timer = {
                            description: data.caldavTask,
                        };
                        return createTimer(globalServerAddress, globalAccessToken, timer);
                    })
                    .then(() => {
                        return inquirer.prompt({
                            type: 'list',
                            name: 'option',
                            message: 'Choose an option:',
                            choices: [
                                {
                                    name: 'Add another CalDAV task',
                                    value: 0,
                                },
                                {
                                    name: 'Menu',
                                    value: 1,
                                },
                                {
                                    name: 'Settings',
                                    value: 2,
                                },
                                {
                                    name: 'Log out',
                                    value: 3,
                                },
                            ],
                        });
                    })
                    .then((data) => {
                        switch (data.option) {
                            case 0:
                                addCaldavTask();
                                break;
                            case 1:
                                menu();
                                break;
                            case 2:
                                settings();
                                break;
                            case 3:
                                logOut();
                                break;
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        })
        .catch((error) => {
            console.error(error);
            setTimeout(() => {
                menu();
            }, 1000);
        });
}

// Function to add a task to the timer list
function addTask() {
    console.clear();
    inquirer
        .prompt({
            type: 'input',
            name: 'task',
            message: 'Task:',
            validate: (value) => {
                if (value) {
                    return true;
                } else {
                    return 'Enter a task';
                }
            },
        })
        .then((data) => {
            let timer = {
                description: data.task,
            };
            return createTimer(globalServerAddress, globalAccessToken, timer);
        })
        .then(() => {
            return inquirer.prompt({
                type: 'list',
                name: 'option',
                message: 'Choose an option:',
                choices: [
                    {
                        name: 'Add another task',
                        value: 0,
                    },
                    {
                        name: 'Menu',
                        value: 1,
                    },
                    {
                        name: 'Settings',
                        value: 2,
                    },
                    {
                        name: 'Log out',
                        value: 3,
                    },
                ],
            });
        })
        .then((data) => {
            switch (data.option) {
                case 0:
                    addTask();
                    break;
                case 1:
                    menu();
                    break;
                case 2:
                    settings();
                    break;
                case 3:
                    logOut();
                    break;
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

// Function to delete a task from the timer list
function deleteTask() {
    console.clear();
    getAllTimersOfUser(globalServerAddress, globalAccessToken)
        .then((data) => {
            let tasksAvailable = [];
            for (let timer of data) {
                if (!timer.isBreak) {
                    tasksAvailable.push({
                        name: timer.description,
                        value: timer.id,
                    });
                }
            }
            if (tasksAvailable.length < 1) {
                console.log(chalk.bold('No timers found'));
                inquirer
                    .prompt({
                        type: 'list',
                        name: 'option',
                        message: 'Choose an option:',
                        choices: [
                            {
                                name: 'Menu',
                                value: 0,
                            },
                            {
                                name: 'Settings',
                                value: 1,
                            },
                            {
                                name: 'Log out',
                                value: 2,
                            },
                        ],
                    })
                    .then((data) => {
                        switch (data.option) {
                            case 0:
                                menu();
                                break;
                            case 1:
                                settings();
                                break;
                            case 2:
                                logOut();
                                break;
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                inquirer
                    .prompt({
                        type: 'list',
                        name: 'taskToDelete',
                        message: 'Choose a task to delete:',
                        choices: tasksAvailable,
                    })
                    .then((data) => {
                        return deleteTimer(globalServerAddress, globalAccessToken, data.taskToDelete);
                    })
                    .then(() => {
                        return inquirer.prompt({
                            type: 'list',
                            name: 'option',
                            message: 'Choose an option:',
                            choices: [
                                {
                                    name: 'Delete another task',
                                    value: 0,
                                },
                                {
                                    name: 'Menu',
                                    value: 1,
                                },
                                {
                                    name: 'Settings',
                                    value: 2,
                                },
                                {
                                    name: 'Log out',
                                    value: 3,
                                },
                            ],
                        });
                    })
                    .then((data) => {
                        switch (data.option) {
                            case 0:
                                deleteTask();
                                break;
                            case 1:
                                menu();
                                break;
                            case 2:
                                settings();
                                break;
                            case 3:
                                logOut();
                                break;
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

// Function for running a timer
function runTimer(index) {
    console.clear();
    getAllTimersOfUser(globalServerAddress, globalAccessToken)
        .then((data) => {
            if (data.length < 2) {
                console.log(chalk.bold('No timers found'));
                inquirer
                    .prompt({
                        type: 'list',
                        name: 'option',
                        message: 'Choose an option:',
                        choices: [
                            {
                                name: 'Menu',
                                value: 0,
                            },
                            {
                                name: 'Settings',
                                value: 1,
                            },
                            {
                                name: 'Log out',
                                value: 2,
                            },
                        ],
                    })
                    .then((data) => {
                        switch (data.option) {
                            case 0:
                                menu();
                                break;
                            case 1:
                                settings();
                                break;
                            case 2:
                                logOut();
                                break;
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                timers = data;
                timer = timers[index];
                countdownTimeLeft = timer.duration * 60 - 2;
                if (timer.isBreak) {
                    console.log(chalk.bold(figlet.textSync('Break', { font: 'Small' })));
                } else {
                    console.log(chalk.bold(figlet.textSync('Work', { font: 'Small' })));
                }
                console.log(chalk.bold(timer.description));
                console.log(chalk.bold(figlet.textSync(timer.duration + ':00')));
                if (countdownMenu) {
                    countdownMenu.ui.close();
                }
                countdownMenu = inquirer.prompt({
                    type: 'list',
                    name: 'option',
                    message: 'Choose an option:',
                    choices: [
                        {
                            name: 'Pause',
                            value: 0,
                        },
                        {
                            name: 'Stop working',
                            value: 1,
                        },
                        {
                            name: 'Settings',
                            value: 2,
                        },
                        {
                            name: 'Log out',
                            value: 3,
                        },
                    ],
                });
                countdownMenu
                    .then((data) => {
                        switch (data.option) {
                            case 0:
                                toggleIsPaused();
                                break;
                            case 1:
                                clearInterval(countdownInterval);
                                menu();
                                break;
                            case 2:
                                clearInterval(countdownInterval);
                                settings();
                                break;
                            case 3:
                                clearInterval(countdownInterval);
                                logOut();
                                break;
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
                countdownInterval = setInterval(() => {
                    countdownMinutes = Math.floor(countdownTimeLeft / 60);
                    countdownSeconds = countdownTimeLeft % 60;
                    if (countdownMinutes < 10) {
                        countdownMinutes = '0' + countdownMinutes;
                    }
                    if (countdownSeconds < 10) {
                        countdownSeconds = '0' + countdownSeconds;
                    }
                    countdownMenu.ui.close();
                    console.clear();
                    if (timer.isBreak) {
                        console.log(chalk.bold(figlet.textSync('Break', { font: 'Small' })));
                    } else {
                        console.log(chalk.bold(figlet.textSync('Work', { font: 'Small' })));
                    }
                    console.log(chalk.bold(timer.description));
                    console.log(chalk.bold(figlet.textSync(countdownMinutes + ':' + countdownSeconds)));
                    countdownMenu = inquirer.prompt({
                        type: 'list',
                        name: 'option',
                        message: 'Choose an option:',
                        choices: [
                            {
                                name: 'Pause',
                                value: 0,
                            },
                            {
                                name: 'Stop working',
                                value: 1,
                            },
                            {
                                name: 'Settings',
                                value: 2,
                            },
                            {
                                name: 'Log out',
                                value: 3,
                            },
                        ],
                    });
                    countdownMenu
                        .then((data) => {
                            switch (data.option) {
                                case 0:
                                    toggleIsPaused();
                                    break;
                                case 1:
                                    clearInterval(countdownInterval);
                                    menu();
                                    break;
                                case 2:
                                    clearInterval(countdownInterval);
                                    settings();
                                    break;
                                case 3:
                                    clearInterval(countdownInterval);
                                    logOut();
                                    break;
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                    countdownTimeLeft -= 2;
                    if (countdownTimeLeft === 0) {
                        clearInterval(countdownInterval);
                        if (timer.isBreak) {
                            deleteTimer(globalServerAddress, globalAccessToken, timers[0].id)
                                .then(() => {
                                    runTimer(0);
                                })
                                .catch((error) => {
                                    console.error(error);
                                });
                        } else {
                            runTimer(1);
                        }
                    }
                }, 2000);
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

// Function to toggle the state of a timer
function toggleIsPaused() {
    console.clear();
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(countdownInterval);
        if (timer.isBreak) {
            console.log(chalk.bold(figlet.textSync('Break', { font: 'Small' })));
        } else {
            console.log(chalk.bold(figlet.textSync('Work', { font: 'Small' })));
        }
        console.log(chalk.bold(timer.description));
        console.log(chalk.bold(figlet.textSync(countdownMinutes + ':' + countdownSeconds)));
        inquirer
            .prompt({
                type: 'list',
                name: 'option',
                message: 'Choose an option:',
                choices: [
                    {
                        name: 'Resume',
                        value: 0,
                    },
                    {
                        name: 'Stop working',
                        value: 1,
                    },
                    {
                        name: 'Settings',
                        value: 2,
                    },
                    {
                        name: 'Log out',
                        value: 3,
                    },
                ],
            })
            .then((data) => {
                switch (data.option) {
                    case 0:
                        toggleIsPaused();
                        break;
                    case 1:
                        menu();
                        break;
                    case 2:
                        settings();
                        break;
                    case 3:
                        logOut();
                        break;
                }
            })
            .catch((error) => {
                console.error(error);
            });
    } else {
        if (timer.isBreak) {
            console.log(chalk.bold(figlet.textSync('Break', { font: 'Small' })));
        } else {
            console.log(chalk.bold(figlet.textSync('Work', { font: 'Small' })));
        }
        console.log(chalk.bold(timer.description));
        console.log(chalk.bold(figlet.textSync(countdownMinutes + ':' + countdownSeconds)));
        if (countdownMenu) {
            countdownMenu.ui.close();
        }
        countdownMenu = inquirer.prompt({
            type: 'list',
            name: 'option',
            message: 'Choose an option:',
            choices: [
                {
                    name: 'Pause',
                    value: 0,
                },
                {
                    name: 'Stop working',
                    value: 1,
                },
                {
                    name: 'Settings',
                    value: 2,
                },
                {
                    name: 'Log out',
                    value: 3,
                },
            ],
        });
        countdownMenu
            .then((data) => {
                switch (data.option) {
                    case 0:
                        toggleIsPaused();
                        break;
                    case 1:
                        clearInterval(countdownInterval);
                        menu();
                        break;
                    case 2:
                        clearInterval(countdownInterval);
                        settings();
                        break;
                    case 3:
                        clearInterval(countdownInterval);
                        logOut();
                        break;
                }
            })
            .catch((error) => {
                console.error(error);
            });
        countdownInterval = setInterval(() => {
            countdownMinutes = Math.floor(countdownTimeLeft / 60);
            countdownSeconds = countdownTimeLeft % 60;
            if (countdownMinutes < 10) {
                countdownMinutes = '0' + countdownMinutes;
            }
            if (countdownSeconds < 10) {
                countdownSeconds = '0' + countdownSeconds;
            }
            countdownMenu.ui.close();
            console.clear();
            if (timer.isBreak) {
                console.log(chalk.bold(figlet.textSync('Break', { font: 'Small' })));
            } else {
                console.log(chalk.bold(figlet.textSync('Work', { font: 'Small' })));
            }
            console.log(chalk.bold(timer.description));
            console.log(chalk.bold(figlet.textSync(countdownMinutes + ':' + countdownSeconds)));
            countdownMenu = inquirer.prompt({
                type: 'list',
                name: 'option',
                message: 'Choose an option:',
                choices: [
                    {
                        name: 'Pause',
                        value: 0,
                    },
                    {
                        name: 'Stop working',
                        value: 1,
                    },
                    {
                        name: 'Settings',
                        value: 2,
                    },
                    {
                        name: 'Log out',
                        value: 3,
                    },
                ],
            });
            countdownMenu
                .then((data) => {
                    switch (data.option) {
                        case 0:
                            toggleIsPaused();
                            break;
                        case 1:
                            clearInterval(countdownInterval);
                            menu();
                            break;
                        case 2:
                            clearInterval(countdownInterval);
                            settings();
                            break;
                        case 3:
                            clearInterval(countdownInterval);
                            logOut();
                            break;
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
            countdownTimeLeft -= 2;
            if (countdownTimeLeft === 0) {
                clearInterval(countdownInterval);
                if (timer.isBreak) {
                    deleteTimer(globalServerAddress, globalAccessToken, timers[0].id)
                        .then(() => {
                            runTimer(0);
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    runTimer(1);
                }
            }
        }, 2000);
    }
}

// Function to change user settings and delete an account
function settings() {
    console.clear();
    getUser(globalServerAddress, globalAccessToken)
        .then((data) => {
            console.log(
                chalk.bold(
                    'Remember to always enter a password even though you may not want to change it, as the settings '
                ) +
                    chalk.bold.inverse('will not be saved') +
                    chalk.bold(' otherwise!')
            );
            return inquirer.prompt([
                {
                    type: 'input',
                    name: 'username',
                    message: 'Username:',
                    default: data.username,
                    validate: (value) => {
                        if (value) {
                            return true;
                        } else {
                            return 'Enter a username';
                        }
                    },
                },
                {
                    type: 'password',
                    name: 'password',
                    message: 'Password:',
                    validate: (value) => {
                        if (value) {
                            return true;
                        } else {
                            return 'Enter a password';
                        }
                    },
                },
                {
                    type: 'number',
                    name: 'workDuration',
                    message: 'Work duration:',
                    default: data.workDuration,
                    validate: (value) => {
                        if (value > 0 && value < 61) {
                            return true;
                        } else {
                            return 'Enter a work duration between 1 and 60';
                        }
                    },
                },
                {
                    type: 'number',
                    name: 'shortBreakDuration',
                    message: 'Short break duration:',
                    default: data.shortBreakDuration,
                    validate: (value) => {
                        if (value > 0 && value < 61) {
                            return true;
                        } else {
                            return 'Enter a short break duration between 1 and 60';
                        }
                    },
                },
                {
                    type: 'number',
                    name: 'longBreakDuration',
                    message: 'Long break duration:',
                    default: data.longBreakDuration,
                    validate: (value) => {
                        if (value > 0 && value < 61) {
                            return true;
                        } else {
                            return 'Enter a long break duration between 1 and 60';
                        }
                    },
                },
                {
                    type: 'number',
                    name: 'longBreakRatio',
                    message: 'Long break ratio:',
                    default: data.longBreakRatio,
                    validate: (value) => {
                        if (value > 0 && value < 61) {
                            return true;
                        } else {
                            return 'Enter a long break ratio between 1 and 10';
                        }
                    },
                },
                {
                    type: 'input',
                    name: 'caldavAddress',
                    message: 'CalDAV address:',
                    default: data.caldavAddress,
                },
                {
                    type: 'confirm',
                    name: 'delete',
                    message: 'Do you want to delete this account?',
                    default: false,
                },
                {
                    type: 'confirm',
                    name: 'deleteConfirmation',
                    message: 'Do you really want to delete this account?',
                    default: false,
                },
            ]);
        })
        .then((data) => {
            if (data.delete && data.deleteConfirmation) {
                deleteUser(globalServerAddress, globalAccessToken)
                    .then(() => {
                        console.clear();
                        globalAccessToken = null;
                        globalServerAddress = null;
                    })
                    .catch((error) => {
                        alert(error);
                    });
            } else {
                updateUser(globalServerAddress, globalAccessToken, data)
                    .then(() => {
                        return inquirer.prompt({
                            type: 'list',
                            name: 'option',
                            message: 'Choose an option:',
                            choices: [
                                {
                                    name: 'Menu',
                                    value: 0,
                                },
                                {
                                    name: 'Log out',
                                    value: 1,
                                },
                            ],
                        });
                    })
                    .then((data) => {
                        switch (data.option) {
                            case 0:
                                menu();
                                break;
                            case 1:
                                logOut();
                                break;
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

// Function to log out of the current session
function logOut() {
    console.clear();
    revokeAccessToken(globalServerAddress, globalAccessToken)
        .then(() => {
            globalAccessToken = null;
            globalServerAddress = null;
        })
        .catch((error) => {
            console.error(error);
        });
}

signUpOrLogIn();
