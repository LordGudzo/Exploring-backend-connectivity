/**
 * Object with basic information for the table.
 * In this assignment, I used the "parent" element to access the HTML element with the future table
 * and "apiUrl" which I used as a link to the backend
 */
const config1 = {
  parent: '#usersTable',
  columns: [
    {title: 'Name', value: 'name'},
    {title: 'Surname', value: 'surname'},
    {title: 'Bithday', value: 'birthday'},
    {title: 'Avatar', value: 'avatar'}   
  ],
  apiUrl: "http://mock-api.shpp.me/ahudzovskyi/users"
};

/* Main function creates table according to values from config and data variables */
function DataTable(config) {    
  let userTable = document.querySelector(config.parent);
  let dataFromBackEnd = getUrlValue(config.apiUrl);
  userTable.innerHTML = ' ';
  let table = document.createElement('table'); 
  
  dataFromBackEnd.then(e => { 
    let keysArray = getKeysArray(e.data) 
    let thead = createHeaderForTable(keysArray);  
    let tBody = createBodyForTable(e.data, keysArray, config.apiUrl);
    table.append(thead);
    table.append(tBody);
    userTable.appendChild(table);
    let addUserBtn = createAddUserBtn(keysArray, config.apiUrl);
    userTable.appendChild(addUserBtn);
  })
}

/**
 * Gets value from backend and return ones in JSON format.
 * @param {url} link to the backend server 
 * @returns data from server in the JSON format
 */
async function getUrlValue(url){
  let response = await fetch(url); // ends with response headers
  let result = await response.json(); // read the body of resonse in JSON format
  return result;  
}

/**
 * Gets first object from backEnd and returns array from keys.
 * @param {valueFromBack} Object with information of the table. 
 * @returns array with keys from first object.
 */
function getKeysArray(valueFromBack) {
  let result = new Array();
  let firstObject = valueFromBack[Object.keys(valueFromBack)[0]]; //after delete we can have different id 

  Object.keys(firstObject).map(key => {    
    result.push(key);
  })
  
  return result;
}

/**
 * In this function I amn't used columns from the config because I'm data driven from backend.
 * @param {keysArray} Array from keys.
 * @returns hearder of the table
 */
function createHeaderForTable(keysArray) {    
  let thead = document.createElement('thead');  
  let trForThead = document.createElement('tr');
  thead.append(trForThead);

  for (let i = 0; i < keysArray.length; i++){
    let th = document.createElement('th');
    th.innerHTML = keysArray[i];
    trForThead.append(th);
  }

  // for delete button
  let th = document.createElement('th');
  th.innerHTML = '';
  trForThead.append(th); 
  return thead;
}

/**
 * Creates the body of the table accoring to value from the backend server
 * @param {valueFromBack} Object with information of the table. 
 * @param {keysArray} Array from keys.
 * @param {url} link to the backend server needs to the delete button
 * @returns body of the table
 */
 function createBodyForTable(valueFromBack, keysArray, url) {  
  let tBody = document.createElement('tbody');
  /* Scroll object with users objects */
  for (nextObjectKey in valueFromBack){  
    let tr = document.createElement('tr');
    
    for (let i = 0; i < keysArray.length; i++){
      let td = document.createElement('td');
      if (valueFromBack[nextObjectKey].hasOwnProperty(keysArray[i])){
        td.innerHTML = valueFromBack[nextObjectKey][keysArray[i]];  
      } else {
        td.innerHTML = ' ';
      }
      tr.append(td)
    }

    //Also creates delete button and adds eventListener
    let td = document.createElement('td');
    let deleteBtn = document.createElement('button');
    deleteBtn.classList.add('deleteBtn');
    deleteBtn.innerHTML = 'delete';
    deleteBtn.setAttribute('data-id', nextObjectKey);
   
    deleteBtn.addEventListener('click', function() {
     let objectDeleted = deleteUser(deleteBtn, url);
      if (objectDeleted){
        tr.remove();
        console.log('object was removed')
      } else {
        throw new Error("object cann't removed")
      }      
    })
    td.append(deleteBtn);
    tr.append(td);

    tBody.append(tr); 
  } 
  
  return tBody;
}

/**
 * Deletes user from backend server
 * @param {deleteBtn} button that was pressed. Needed to get id.
 * @param {url} link to the backend server.
 * @returns true if object was deleted from the server, false otherwise
 */
async function deleteUser(deleteBtn, url) {  
  let dataId = deleteBtn.dataset.id;
  let response = await fetch (url + "/" + dataId, {
      method : 'DELETE'
    }) 
  if (!response.ok){
    return false;   
  }
  return true;
}

/**
 * Creates button for adds user.
 * @param {keysArray} Array from keys.
 * @param {url} link to the backend server. 
 * @returns addsUser button.
 */
function createAddUserBtn(keysArray, url) {
  let addUserBtn = document.createElement('button');
  addUserBtn.innerHTML = "Add new user";
  addUserBtn.classList.add('addNewUserBtn');
  addUserBtn.addEventListener('click', () => getLogicalForBtn(keysArray, url));
  return addUserBtn;
}

/**
 * Creates line with inputs and after pressed enter check this ones and post they to server.
 * @param {keysArray} Array from keys.
 * @param {url} link to the backend server. 
 */
function getLogicalForBtn(keysArray, url) {  
  let tBody = document.querySelector('tbody');
  let tr = document.createElement('tr');  
  
  for (let i = 0; i < keysArray.length; i++){    
    let td = document.createElement('td');
    let input = document.createElement('input');
    input.setAttribute('type','text');
    input.setAttribute('placeholder', keysArray[i]);
    input.setAttribute('name', keysArray[i]);
    input.classList.add('input');

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter'){        
        let inputWithValue = checkInputs();        
        if (inputWithValue){
          sendFormToServer(url);
        }        
      }
    })
    td.append(input);
    tr.append(td);
  }
  tBody.append(tr);
}

/**
 * If field isn't filled add class empty and return false.
 * @returns true if all fields are filled
 */
function checkInputs() { 
  let inputs = document.querySelectorAll('input');
  let check = 0;
  for (let i = 0; i < inputs.length; i++){    
    if (inputs[i].value.length === 0){
      inputs[i].classList.add('empty');
      check++;
    } else {
      inputs[i].classList.remove('empty')
    }
  }

  if (check !== 0) {
    return false;
  } else {
    return true;
  }
}

/**
 * Sends the value from inputs to the backend server.
 * @param {url} link to the backend server.
 */
async function sendFormToServer(url){
  let user = {};
  const inputs = document.querySelectorAll('.input');
  inputs.forEach(e => {
    user[e.name] = e.value
  })
  let response = await fetch( url, {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  DataTable(config1)
}



DataTable(config1);