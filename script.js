// =========================================================
// EMPLOYEE MANAGEMENT DASHBOARD
// =========================================================

let apiLink = "https://dummyjson.com/users";

let employees = [];      // main array (all employees)
let currentView = [];    // array currently displayed (after search/filter)

// =========================================================
// 1. DATE & TIME
// =========================================================

function updateDateTime() {
    let now = new Date();

    let monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    let date = now.getDate();
    let month = monthNames[now.getMonth()];
    let year = now.getFullYear();

    let hour = now.getHours();
    let minutes = now.getMinutes();
    let ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    hour = hour ? hour : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    let dateElement = document.querySelector("#todayDate");
    let timeElement = document.querySelector("#currentTime");

    dateElement.innerHTML = `Today: ${date} ${month} ${year}`;
    timeElement.innerHTML = `Time: ${hour}:${minutes} ${ampm}`;
}

updateDateTime();
setInterval(updateDateTime, 1000);


// =========================================================
// 2. LOADING MESSAGE
// =========================================================

function showLoading(message) {
    let loadingBox = document.querySelector("#loadingMessage");
    loadingBox.innerHTML = message;
}


// =========================================================
// 3. FETCH EMPLOYEES (fetch, Promise, .then, .catch, .finally)
// =========================================================

function fetchEmployees() {

    showLoading("Loading employees...");

    fetch(apiLink)
        .then((data) => {
            return data.json();
        })
        .then((jsData) => {

            let apiEmployees = [];

            jsData.users.forEach((c, i, t) => {

                let salaryList = [35000, 42000, 55000, 61000, 47000, 72000, 39000, 58000];

                let employeeObj = {
                    id: c.id,
                    name: `${c.firstName} ${c.lastName}`,
                    age: c.age,
                    email: c.email,
                    phone: c.phone,
                    department: c.company.department,
                    image: c.image,
                    salary: salaryList[i % salaryList.length]
                };

                apiEmployees.push(employeeObj);
            });

            employees = apiEmployees;
            currentView = employees;

            displayEmployees(currentView);
            updateEmployeeCount(currentView);
            calculateSalary();

            showLoading("Employee data loaded successfully.");
        })
        .catch((error) => {
            console.warn(error.message);
            showLoading("Unable to load employee data. Please try again.");
        })
        .finally(() => {
            console.log("Fetch attempt finished.");
        });
}

fetchEmployees();


// =========================================================
// 4. DISPLAY EMPLOYEES (createElement, innerHTML, DOM manipulation)
// =========================================================

function displayEmployees(list) {

    let container = document.querySelector("#employeeContainer");

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `<p class="noData">No employees found.</p>`;
        return;
    }

    list.forEach((emp, i, t) => {

        let card = document.createElement("div");
        card.classList.add("employeeCard");

        card.innerHTML = `
            <img src="${emp.image}" alt="${emp.name}">
            <h2>${emp.name}</h2>
            <p><b>Age:</b> ${emp.age}</p>
            <p><b>Email:</b> ${emp.email}</p>
            <p><b>Phone:</b> ${emp.phone ? emp.phone : "N/A"}</p>
            <p><b>Salary:</b> ₹${emp.salary.toLocaleString("en-IN")}</p>
            <span class="deptTag">${emp.department}</span>
            <button class="deleteBtn" data-id="${emp.id}">Delete</button>
        `;

        container.append(card);
    });

    // attach delete event to every delete button
    let deleteButtons = document.querySelectorAll(".deleteBtn");

    deleteButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            let empId = Number(btn.getAttribute("data-id"));
            deleteEmployee(empId);
        });
    });
}


// =========================================================
// 5. SEARCH EMPLOYEE (filter + includes)
// =========================================================

function searchEmployees() {

    let searchValue = document.querySelector("#searchInput").value.toLowerCase();

    let searchResult = employees.filter((emp) => {
        return emp.name.toLowerCase().includes(searchValue);
    });

    currentView = searchResult;

    displayEmployees(currentView);
    updateEmployeeCount(currentView);
}


// =========================================================
// 6. DEPARTMENT FILTER (filter + if + event listeners)
// =========================================================

function filterDepartment(dept) {

    let filterResult;

    if (dept === "All Employees") {
        filterResult = employees;
    } else {
        filterResult = employees.filter((emp) => {
            return emp.department.toLowerCase() === dept.toLowerCase();
        });
    }

    currentView = filterResult;

    displayEmployees(currentView);
    updateEmployeeCount(currentView);
}

let filterButtons = document.querySelectorAll(".filterBtn");

filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {

        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        filterDepartment(btn.textContent);
    });
});


// =========================================================
// 7. EMPLOYEE COUNT
// =========================================================

function updateEmployeeCount(list) {
    let countBox = document.querySelector("#employeeCount");
    countBox.innerHTML = `Employee Count: ${list.length}`;
}


// =========================================================
// 8. VALIDATION (if/else, comparison & logical operators)
// =========================================================

function validateEmployee(name, age, email, department) {

    let errors = [];

    if (name === "") {
        errors.push("❌ Please enter employee name");
    }

    if (age === "" || age <= 18) {
        errors.push("❌ Age must be greater than 18");
    }

    if (email === "") {
        errors.push("❌ Please enter employee email");
    }

    if (department === "") {
        errors.push("❌ Please select a department");
    }

    return errors;
}


// =========================================================
// 9. ADD EMPLOYEE
// =========================================================

function addEmployee() {

    let name = document.querySelector("#nameInput").value.trim();
    let age = Number(document.querySelector("#ageInput").value);
    let email = document.querySelector("#emailInput").value.trim();
    let department = document.querySelector("#departmentInput").value;
    let salary = Number(document.querySelector("#salaryInput").value) || 30000;

    let errors = validateEmployee(name, age, email, department);

    let errorBox = document.querySelector("#errorBox");

    if (errors.length > 0) {
        errorBox.innerHTML = errors.join("<br>");
        return;
    }

    errorBox.innerHTML = "";

    let newEmployee = {
        id: Date.now(),
        name: name,
        age: age,
        email: email,
        department: department,
        salary: salary,
        image: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    };

    employees = [...employees, newEmployee];
    currentView = employees;

    displayEmployees(currentView);
    updateEmployeeCount(currentView);
    calculateSalary();
    clearForm();
}

document.querySelector("#addEmployeeBtn").addEventListener("click", addEmployee);


// =========================================================
// 10. CLEAR FORM
// =========================================================

function clearForm() {
    document.querySelector("#nameInput").value = "";
    document.querySelector("#ageInput").value = "";
    document.querySelector("#emailInput").value = "";
    document.querySelector("#departmentInput").value = "";
    document.querySelector("#salaryInput").value = "";
}


// =========================================================
// 11. DELETE EMPLOYEE (filter + event handling)
// =========================================================

function deleteEmployee(id) {

    employees = employees.filter((emp) => {
        return emp.id !== id;
    });

    currentView = currentView.filter((emp) => {
        return emp.id !== id;
    });

    displayEmployees(currentView);
    updateEmployeeCount(currentView);
    calculateSalary();
}


// =========================================================
// 12. SALARY CALCULATION (reduce) + HIGHEST PAID (reduce)
// =========================================================

function calculateSalary() {

    let totalSalary = employees.reduce((acc, emp) => {
        return acc + emp.salary;
    }, 0);

    let averageSalary = employees.length > 0 ? Math.round(totalSalary / employees.length) : 0;

    document.querySelector("#statTotalEmployees").innerHTML = employees.length;
    document.querySelector("#statTotalSalary").innerHTML = `₹${totalSalary.toLocaleString("en-IN")}`;
    document.querySelector("#statAverageSalary").innerHTML = `₹${averageSalary.toLocaleString("en-IN")}`;

    findHighestPaid();
}

function findHighestPaid() {

    if (employees.length === 0) {
        document.querySelector("#highestPaid").innerHTML = "No employee available";
        document.querySelector("#statHighestSalary").innerHTML = "₹0";
        return;
    }

    let highest = employees.reduce((acc, emp) => {
        return emp.salary > acc.salary ? emp : acc;
    }, employees[0]);

    document.querySelector("#statHighestSalary").innerHTML = `₹${highest.salary.toLocaleString("en-IN")}`;

    document.querySelector("#highestPaid").innerHTML = `
        <b>Name:</b> ${highest.name} <br>
        <b>Salary:</b> ₹${highest.salary.toLocaleString("en-IN")}
    `;
}


// =========================================================
// 13. SORT EMPLOYEES (sort with callback)
// =========================================================

function sortEmployees(type) {

    let sorted = [...currentView];

    if (type === "nameAsc") {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === "nameDesc") {
        sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (type === "ageAsc") {
        sorted.sort((a, b) => a.age - b.age);
    } else if (type === "ageDesc") {
        sorted.sort((a, b) => b.age - a.age);
    } else if (type === "salaryAsc") {
        sorted.sort((a, b) => a.salary - b.salary);
    } else if (type === "salaryDesc") {
        sorted.sort((a, b) => b.salary - a.salary);
    }

    currentView = sorted;
    displayEmployees(currentView);
}

document.querySelector("#sortSelect").addEventListener("change", (e) => {
    sortEmployees(e.target.value);
});


// =========================================================
// 14. SEARCH BUTTON EVENT
// =========================================================

document.querySelector("#searchBtn").addEventListener("click", searchEmployees);