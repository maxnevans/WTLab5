<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Lab 5</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="preloader.css">
</head>
<body>
    <div class="panel">
        Delete with 
        <select name="field_name" id="selective-delete-select">
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="last_name">Last Name</option>
            <option value="login">Login</option>
            <option value="Password">Password</option>
        </select>
        <input type="text" id="selective-delete-input">
        <button id="selective-delete-button">Delete</button>
    </div>
    <table id="users-table">
        <tr>
            <th>id</th>
            <th>name</th>
            <th>last name</th>
            <th>login</th>
            <th>password</th>
            <th>actions</th>
        </tr>
        <tr>
            <td colspan="6" class="add-button" id="add-user-button">Add user</td>
        </tr>
    </table>
    <script src="script.js" defer></script>
</body>
</html>