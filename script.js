;document.addEventListener("DOMContentLoaded", function()
{
    const SEND_TO_URL = "function.php";

    const SELECTIVE_DELETE_SELECT = document.getElementById('selective-delete-select');
    const SELECTIVE_DELETE_INPUT = document.getElementById('selective-delete-input');
    const SELECTIVE_DELETE_BUTTON = document.getElementById('selective-delete-button');
    SELECTIVE_DELETE_BUTTON.addEventListener("click", selectiveDeleteButtonHandler.bind(null, 
        SELECTIVE_DELETE_BUTTON, SELECTIVE_DELETE_SELECT, SELECTIVE_DELETE_INPUT));

    const TABLE = document.getElementById("users-table");

    const ADD_USER_BUTTON = document.getElementById("add-user-button");
    ADD_USER_BUTTON.addEventListener("click", addUserButtonHandler.bind(null, ADD_USER_BUTTON));


    const PRELOADER = document.createElement("div");
    PRELOADER.classList.add("preloader");
    document.body.appendChild(PRELOADER);

    let startQuery = new FormData();
    startQuery.set("action", "get");
    startQuery.set("get", "*");

    sendForm(startQuery, SEND_TO_URL)
    .then((response) => {
        try
        {
            response = JSON.parse(response);
        }
        catch(error)
        {
            console.log('Parse Error: ' + response);
        }
        
        if (response && (response.forEach != null))
        {
            addUsers(TABLE, response);
        }
        PRELOADER.hidden = true;
    })
    .catch(console.error);

    
    function sendForm(form, url, progress)
    {
        return new Promise((resolve, reject) => 
        {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener("readystatechange", function()
            {
                switch(xhr.readyState)
                {
                    case XMLHttpRequest.OPENED:
                        let toSend = form instanceof FormData ? form : new FormData(form);
                        xhr.send(toSend);
                        break;
                    case XMLHttpRequest.DONE:
                        resolve(xhr.response);
                        break;
                }
            });
            if (progress)
            {
                xhr.upload.addEventListener("progress", (event) =>
                {
                    progress(event.loaded, event.total);
                });
            }
            xhr.addEventListener("error", reject);
            xhr.open("POST", url);
        });
    }

    function addUsers(table, response)
    {
        response.forEach((value) => {
            if (value['id'] == null) throw new Error('ID field is required for correct working!');

            let fieldsOrder = ['id', 'name', 'last_name', 'login', 'password'];

            let row = document.createElement("tr");

            fieldsOrder.forEach((key) => {
                let cell = document.createElement("td");
                cell.innerHTML = value[key];
                cell.dataset.key = key;
                row.append(cell);
            });

            let cellActions = document.createElement("td");

            let editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = editUserButtonHandler.bind(null, editButton);
            editButton.classList.add("control-button");
            editButton.classList.add("edit-button");
            cellActions.append(editButton);

            let deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("control-button");
            deleteButton.classList.add("delete-button");
            deleteButton.onclick = deleteUserButtonHandler.bind(null, deleteButton);
            deleteButton.dataset.id = value['id'];
            cellActions.append(deleteButton);

            row.append(cellActions);

            table.insertBefore(row, table.firstElementChild.nextElementSibling);
        });
    }

    function confirmChangesButtonHandler(button)
    {
        let row = button.closest("tr");

        let cells = row.querySelectorAll("td");
        
        let output = {};
        for (let i = 0; i < cells.length - 1; i++)
        {
            let value = cells[i].firstElementChild.value;
            let key = cells[i].dataset.key;
            cells[i].innerHTML = value;

            output[key] = value;
        }

        button.innerHTML = "Edit";
        button.classList.remove("confirm-button");
        button.classList.add("edit-button");
        button.onclick = editUserButtonHandler.bind(null, button);
        button.hidden = true;

        let opPreloader = document.createElement("div");
        opPreloader.classList.add("preloader");
        opPreloader.classList.add("preloader-small");
        opPreloader.style.display = "inline-block";
        button.parentElement.insertBefore(opPreloader, button);

        let outputForm = new FormData();
        outputForm.set("action", "update");
        outputForm.set("update", JSON.stringify([output]));
        sendForm(outputForm, SEND_TO_URL)
        .then((response) => {
            try
            {
                let parsed = JSON.parse(response);
                if (!parsed)
                {
                    for (let i = 0; i < cells.length - 1; i++)
                    {
                        cells[i].innerHTML = cells[i].dataset.backupValue;
                    }
                    alert("Failed to edit! Please try again later...");
                }
                button.hidden = false;
                opPreloader.remove();
            }
            catch(error)
            {
                console.error('Parse failed: ' + response);
            }
            
        })
        .catch(console.error);
    }

    function editUserButtonHandler(button)
    {
        let row = button.closest("tr");

        let cells = row.querySelectorAll("td");

        for (let i = 0; i < cells.length - 1; i++)
        {
            // For input width and height correction
            let cellStyles = getComputedStyle(cells[i]);
            let cellWidth = cells[i].clientWidth 
                - parseInt(cellStyles.getPropertyValue("padding-left"), 10) 
                - parseInt(cellStyles.getPropertyValue("padding-right"), 10);
            let cellHeight = cells[i].clientHeight 
                - parseInt(cellStyles.getPropertyValue("padding-top"), 10) 
                - parseInt(cellStyles.getPropertyValue("padding-bottom"), 10);
            let input = document.createElement("input");
            input.classList.add("edit-field");
            input.value = cells[i].textContent;
            input.style.width = cellWidth + "px";
            input.style.height = cellHeight + "px";

            cells[i].dataset.backupValue = cells[i].innerHTML;
            cells[i].innerHTML = "";
            cells[i].append(input);
        }

        button.innerHTML = "Confirm";
        button.classList.remove("edit-button");
        button.classList.add("confirm-button");
        button.onclick = confirmChangesButtonHandler.bind(null, button);
    }

    function addUserButtonHandler(button)
    {

        let tdAddUser = document.createElement("th");
        tdAddUser.colSpan = 6;
        let input = document.createElement("input");
        input.id = "add-user-name";
        input.placeholder = "Name";
        input.classList.add("edit-field");
        input.classList.add("add-button-field");
        tdAddUser.append(input);
        input = document.createElement("input");
        input.id = "add-user-last";
        input.placeholder = "Last Name";
        input.classList.add("edit-field");
        input.classList.add("add-button-field");
        tdAddUser.append(input);
        input = document.createElement("input");
        input.id = "add-user-login";
        input.placeholder = "Login";
        input.classList.add("edit-field");
        input.classList.add("add-button-field");
        tdAddUser.append(input);
        input = document.createElement("input");
        input.id = "add-user-password";
        input.placeholder = "Password";
        input.classList.add("edit-field");
        input.classList.add("add-button-field");
        tdAddUser.append(input);
        
        let buttonAddUser = document.createElement("button");
        buttonAddUser.classList.add("control-button");
        buttonAddUser.classList.add("add-user-button");
        buttonAddUser.textContent = "Add user";
        buttonAddUser.onclick = confirmAddUserButtonHandler.bind(null, button, tdAddUser);
        tdAddUser.append(buttonAddUser);

        button.replaceWith(tdAddUser);
    }

    function deleteUserButtonHandler(button)
    {
        let opPreloader = document.createElement("div");
        opPreloader.classList.add("preloader");
        opPreloader.classList.add("preloader-small");
        opPreloader.style.display = "inline-block";
        button.parentElement.insertBefore(opPreloader, button);

        button.hidden = true;
        let output = {'id' : button.dataset.id};

        let outputForm = new FormData();
        outputForm.set("action", "delete");
        outputForm.set("delete", JSON.stringify([output]));

        sendForm(outputForm, SEND_TO_URL)
        .then((success) => {
            try
            {
                let parsed = JSON.parse(success);
                success = parsed;
            }
            catch(error)
            {
                console.info("JSON parse failed! Data: " + success);
            }

            // success now contain there proper data

            if (success)
            {
                button.closest("tr").remove();
            }
            else
            {
                alert("Delete failed! Please try again later...");
                opPreloader.remove();
                button.hidden = false;
            }
        })
        .catch(console.error);
    }

    function confirmAddUserButtonHandler(oldTDButton, currentTDInputs)
    {
        currentTDInputs.replaceWith(oldTDButton);

        let opPreloader = document.createElement("div");
        opPreloader.classList.add("preloader");
        opPreloader.classList.add("preloader-small");
        opPreloader.style.display = "inline-block";
        const OLD_CONTENT = oldTDButton.innerHTML;
        oldTDButton.innerHTML = "";
        oldTDButton.append(opPreloader);
        oldTDButton.classList.add("loading");

        let user = {};
        user['name'] = currentTDInputs.querySelector('#add-user-name').value;
        user['last_name'] = currentTDInputs.querySelector('#add-user-last').value;
        user['login'] = currentTDInputs.querySelector('#add-user-login').value;
        user['password'] = currentTDInputs.querySelector('#add-user-password').value;

        let outputForm = new FormData();
        outputForm.set("action", "add");
        outputForm.set("add", JSON.stringify([user]));
        sendForm(outputForm, SEND_TO_URL)
        .then((success) => {
            try
            {
                let parsed = JSON.parse(success);
                success = parsed;
            }
            catch(error)
            {
                console.log("Inplicit JSON non-convertion! Data: " + success);
            }

            // succes is proper here

            if (success)
            {
                user['id'] = success;
                addUsers(TABLE, [user]);
            }
            else
            {
                alert("Failed to add a new user! Please try again later...");
            }
            opPreloader.remove();
            oldTDButton.innerHTML = OLD_CONTENT;
            oldTDButton.classList.remove("loading");
        })

    }

    function selectiveDeleteButtonHandler(button, select, input)
    {
        let opPreloader = document.createElement("div");
        opPreloader.classList.add("preloader");
        opPreloader.classList.add("preloader-small");
        opPreloader.style.display = "inline-block";
        button.replaceWith(opPreloader);

        let fieldName = select.value;
        let fieldValue = input.value;

        let output = {};
        output[fieldName] = fieldValue;
        
        let outputForm = new FormData();
        outputForm.set("action", "delete");
        outputForm.set("delete", JSON.stringify([output]));

        sendForm(outputForm, SEND_TO_URL)
        .then((success) => {
            try
            {
                let parsed = JSON.parse(success);
                success = parsed;
            }
            catch(error)
            {
                console.log("Inplicit JSON non-convertion. Data: " + success);
            }

            // success is proper here

            if (success)
            {
                // Update table view
                let allEntries =  TABLE.querySelectorAll("td[data-key=\'" + fieldName + "\']");
                for (let i = 0; i < allEntries.length; i++)
                {
                    if (allEntries[i].textContent != fieldValue) continue;

                    allEntries[i].parentElement.remove();
                }

                opPreloader.replaceWith(button);
            }
            else
            {
                alert("Failed to delete { " + fieldName + " : " +  fieldValue + " }! Please try again later...");
            }
        })
        .catch(console.error);
    }
});