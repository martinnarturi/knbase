<script setup lang="ts">

import { useRouter } from 'vue-router'
import axios from 'axios'
axios.defaults.withCredentials = true;
import { ref, onMounted } from 'vue'

const router = useRouter();

const content = ref('');
const tags = ref('');
const searchText = ref('');
const searchResult = ref(Array());
const id = ref('');
const theme = ref('');
const newKbName = ref('');
const newKbCreated = ref({});
const kbCode = ref('');
const kbPass = ref('');
const userName = ref('');
const userPass = ref('');
const loggedInUser = ref({});
const connectedToKb = ref({});
const apiUrl = import.meta.env.VITE_API_PROTOCOL + "://" + import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PORT ? ":" + import.meta.env.VITE_API_PORT : "")
const kbListConnectedTo = ref([])

// function navigate() {
//   router.push({name: 'main', path: '/main'})
// }

function add() {
  axios.get(apiUrl + '/create', { params: { content: content.value, tags: tags.value }})
  .then(function() {
    content.value = ''
    tags.value = ''
  })
}

function search() {
  if(searchText.value == '') {
    searchResult.value = []
    return
  }
  axios.get(apiUrl + '/search', { params: { q: searchText.value }})
  .then(function(result) {
    searchResult.value = result.data.result
  })
  .catch(function(err) {
    alert(err.response.data)
  })
}

function update() {
  axios.get(apiUrl + '/update', { params: { content: content.value, tags: tags.value, id: id.value }})
  .then(function() {
    cleanForm()
    setTimeout(function() {
      search()
    }, 1000)
  })
}

function remove(id: string) {
  if (!confirm("Remove this content?")) {
    return
  }
  axios.get(apiUrl + '/delete', { params: { ids: id }})
  .then(function() {
    setTimeout(function() {
      search()
    }, 1000)
  })
}

function load(item: {content: string; tags: Array<string>, _id: string}) {
  content.value = item.content
  tags.value = item.tags.join(';')
  id.value = item._id
  setTimeout(function(){
    let element = document.getElementById('kncontent')
    element.style.height = element.scrollHeight + "px"
  }, 0)
}

function cleanForm() {
  content.value = ''
  tags.value = ''
  id.value = ''
}

function showNewKbDialog() {
  document.getElementById('createNewKbDialog').showModal()
}

function closeKbDialog() {
  newKbCreated.value = {}
  document.getElementById('createNewKbDialog').close()
}

function createNewKb() {
  if(newKbName.value == '') {
    alert('Please enter a name for the kb')
    return
  }

  axios.post(apiUrl + '/kb/create', { name: newKbName.value })
  .then(function(response) {
    newKbCreated.value = response.data.knBase
    newKbName.value = ''
  })
  .catch(function(err) {
    alert(err.response.data)
  })
}

function showConnectDialog() {
  if(connectedToKb.value && 'name' in connectedToKb.value && !confirm('You will get disconnected from current kb. Proceed?')) {
    return;
  }
  axios.post(apiUrl + '/kb/disconnect')
  .then(function(response){
    connectedToKb.value = {}
    document.getElementById('connectDialog').showModal()
  })
}

function closeConnectDialog() {
  document.getElementById('connectDialog').close()
}

function connectToKb() {
  if(!kbCode.value || !kbPass.value) {
    alert("Please input kb code and pass to connect")
    return
  }

  axios.post(apiUrl + '/kb/connect', { code: kbCode.value, pass: kbPass.value })
  .then(function(response) {
    connectedToKb.value = response.data.knBase ?? {}

    if("name" in connectedToKb.value) {
      let valueToSave = JSON.parse(JSON.stringify(connectedToKb.value))
      valueToSave.code = kbCode.value
      addKbToConnectedKbList(valueToSave)
    }

    kbCode.value = ''
    kbPass.value = ''

    closeConnectDialog()
  })
  .catch(function(err) {
    alert(err.response.data)
  })
}

function getConnectedKbList() {
  let connectedKbsListCookie = getCookie("connectedKbsList")
  let connectedKbsList = []

  if(connectedKbsListCookie) {
    connectedKbsList = JSON.parse(connectedKbsListCookie)
  }

  return connectedKbsList;
}

function addKbToConnectedKbList(kbObj: Object) {
  let connectedKbsList = getConnectedKbList()

  connectedKbsList.push(kbObj)

  let unique: any = {}
  connectedKbsList.forEach(function(el: any) {
    unique[el.code] = el
  })
  connectedKbsList = Object.values(unique)

  setCookie('connectedKbsList', JSON.stringify(connectedKbsList), 365)

  kbListConnectedTo.value = getConnectedKbList()
}

function showLoginDialog() {
  if("name" in loggedInUser.value && !confirm('You will be logged out from current user. Proceed?')) {
    return;
  }
  axios.post(apiUrl + '/user/logout')
  .then(function(response){
    loggedInUser.value = {}
    document.getElementById('loginDialog').showModal()
  })
}

function closeLoginDialog() {
  document.getElementById('loginDialog').close()
}

function login() {
  if(userName.value == '' || userPass.value == '') {
    alert('Please enter user name and pass')
    return
  }
  axios.post(apiUrl + '/user/login', { name: userName.value, pass: userPass.value })
  .then(function(response) {
    userName.value = ''
    userPass.value = ''
    loggedInUser.value = response.data.user
    closeLoginDialog()
  })
  .catch(function(err) {
    alert(err.response.data)
  })
}

function register() {
  if(userName.value == '' || userPass.value == '') {
    alert('Please enter user name and pass')
    return
  }
  axios.post(apiUrl + '/user/create', { name: userName.value, pass: userPass.value })
  .then(function(response) {
    alert("User created: " + userName.value)
    userName.value = ''
    userPass.value = ''
  })
  .catch(function(err) {
    alert(err.response.data)
  })
}

function getUserData() {
  axios.get(apiUrl + '/user/info')
  .then(function(response) {
    if(response.data.user) {
      loggedInUser.value = response.data.user
    }
  })
  .catch(function(err) {
    alert(err.response.data)
  })
}

function getKbData() {
  axios.get(apiUrl + '/kb/info')
  .then(function(response) {
    if(response.data.knBase) {
      connectedToKb.value = response.data.knBase
    }
  })
  .catch(function(err) {
    alert(err.response.data)
  })
}

function darkModeToggle() {
  if(document.body.classList.contains('dark')) {
    darkModeEnable(false)
  } else {
    darkModeEnable(true)
  }
  setCookie('theme', theme.value, 365)
}

function darkModeEnable(enable: boolean) {
  if(enable) {
    document.body.classList.add('dark')
    theme.value = 'dark'
  } else {
    document.body.classList.remove('dark')
    theme.value = 'light'
  }
}

function setCookie(cname: string, cvalue: string, exdays: number) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname: string) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function showInfo() {
  document.getElementById("infoDialog").showModal()
}

function closeInfo() {
  document.getElementById("infoDialog").close()
}

onMounted(function() {
  getUserData()
  getKbData()
  let darkModeSetup = getCookie('theme')
  theme.value = darkModeSetup != '' ? darkModeSetup : 'light'
  darkModeEnable(darkModeSetup == 'dark')
  kbListConnectedTo.value = getConnectedKbList()
});

</script>

<template>
  <main>
    <div style="padding-bottom:10px; vertical-align: top">
      <div style="width:20%; display: inline-block">
        <h5 style="font-weight:700">Knowledge base</h5>
      </div>
      <div style="width:80%; display: inline-block; text-align: right">
        <a href="#" @click="showInfo" style="margin-right:5px">
          <span>&#9432;</span>
        </a>
        <dialog id="infoDialog" style="text-align:left; overflow-y:auto">
          <h5 style="font-weight:700">How to use</h5>
          <div style="font-size: 12px">
            <ul style="padding-inline-start: 20px">
              <li>Create a user/login:
                <ol>
                  <li>Click on "Log in"</li>
                  <li>Enter user-name and user-pass</li>
                  <li>Click on "Create new user" or "Login"</li>
                </ol>
              </li>
              <li>Create a database:
                <ol>
                  <li>Click on "Connect to kb"</li>
                  <li>Click on "Create new kb"</li>
                  <li>Enter kb name and hit "Create"</li>
                  <li>Save kb passwords in a safe place</li>
                  <li>To share the kb with someone else, just share the kb-code and kb-pass</li>
                </ol>
              </li>
              <li>Connect to a database:
                <ol>
                  <li>Click on "Connect to kb"</li>
                  <li>Enter kb-code and kb-pass</li>
                  <li>Click on connect</li>
                </ol>
              </li>
              <li>Create documents
                <ol>
                  <li>Enter content</li>
                  <li>Enter tags (separated by ";")</li>
                  <li>Hit "Add"</li>
                </ol>
              </li>
              <li>Search documents
                <ul>
                  <li>Search is done by tag</li>
                  <li>Use ; as "or" and ^ as "and" operator between tags</li>
                </ul>
              </li>
              <li>Update documents
                <ul>
                  <li>On a searched document, hit "load"</li>
                  <li>Update as needed and hit "Update"</li>
                  <li>To abort update, hit "Back to add" next to document id</li>
                </ul>
              </li>
              <li>Delete documents
                <ul>
                  <li>On a searched document, hit "delete"</li>
                </ul>
              </li>
            </ul>
          </div>
          <button @click="closeInfo()">Close</button>
        </dialog>
        <a href="#" @click="darkModeToggle" style="margin-right: 10px">
          <span v-if="theme == 'light'">&#127769;</span>
          <span v-else>🔆</span>
        </a>
        <div style="display: inline-block; font-size: 12px; margin-inline: 5px;">
          <span v-if="!loggedInUser.name">
            <a href="#" @click="showLoginDialog">Log in</a>
          </span>
          <span v-else>
            Logged in as: <a href="#" @click="showLoginDialog" style="font-weight: 700">{{ loggedInUser.name }}</a>
          </span>
        </div>
        <dialog id="loginDialog" style="text-align:left">
          <h5 style="font-weight:700">Login as new user</h5>
          <input type="text" style="text" placeholder="user-name" v-model="userName" />
          <input type="password" style="text" placeholder="user-pass" v-model="userPass" />
          <button @click="login" style="margin-right: 10px">Login</button>
          <button @click="closeLoginDialog">Cancel</button>
          <br/>
          <button @click="register" style="margin-right: 10px">Create new user</button>
        </dialog>

        <div style="display: inline-block; font-size: 12px; margin-inline: 5px;">
          <span v-if="!connectedToKb || !('name' in connectedToKb)"><a href="#" @click="showConnectDialog()">Connect to kb</a></span>
          <span v-else>Connected to: <a href="#" @click="showConnectDialog()" style="font-weight: 700">{{ connectedToKb.name }}</a></span>
        </div>
        <dialog id="connectDialog" style="text-align:left;">
          <h5 style="font-weight:700">Connect to new kb</h5>
          <input type="text" placeholder="kb-code" list="kb-code" v-model="kbCode"/>
          <datalist v-if="kbListConnectedTo.length > 0" id="kb-code">
            <option v-for="kbListItem in kbListConnectedTo" :value="kbListItem.code" :key="kbListItem.code">{{ kbListItem.name }}</option>
          </datalist>
          <input type="password" placeholder="kb-pass" v-model="kbPass"/>
          <button style="margin-right: 10px" @click="connectToKb">Connect</button>
          <button @click="closeConnectDialog">Cancel</button>
          <br/>
          <button @click="closeConnectDialog(); showNewKbDialog()">Create new kb</button>
        </dialog>
        <dialog id="createNewKbDialog" style="text-align:left">
          <div>
            <h5 style="font-weight:700">Create new kb</h5>
            <input type="text" v-model="newKbName" placeholder="New kb name"/>
            <button @click="createNewKb" style="margin-right: 10px">Create</button>
            <button @click="closeKbDialog">Close</button>
          </div>
          <div style="margin-top: 10px; font-size:12px" v-if="newKbCreated && 'name' in newKbCreated && 'code' in newKbCreated && 'pass' in newKbCreated && 'masterpass' in newKbCreated">
            <hr/>
            <div style="font-weight:700">New kb data:</div>
            <div>name: {{ newKbCreated.name }}</div>
            <div>code: {{ newKbCreated.code }}</div>
            <div>pass: {{ newKbCreated.pass }}</div>
            <div>masterpass: {{ newKbCreated.masterpass }}</div>
          </div>
        </dialog>
      </div>
    </div>
    <textarea style="width:100%" placeholder="content" type="text" v-model="content" id="kncontent"></textarea><br/>
    <input @keyup.enter="id == '' ? add() : update()" style="width:100%" placeholder="tags ( ; separated)" type="text" v-model="tags" /><br/>
    <button v-if="id == ''" class="btn" @click="add">Add</button>
    <template v-else>
      <button style="margin-right:5px" class="btn" @click="update">Update</button><small style="margin-right:5px">Id: {{ id }}</small><a @click="cleanForm" href="#">Back to add</a>
    </template>
    <br/><br/>
    <input @keyup.enter="search" style="width:100%" placeholder="search text" type="text" v-model="searchText" /><br/>
    <button class="btn" @click="search">Search</button> <small>or=; and=^</small><br/>
    <br/>
    <h5 style="font-weight:700">Search Results:</h5>
    <div>
      <template v-for="result in searchResult" :key="result._id">
        <pre>{{result.content}}</pre>
        <small>Tags: {{ result.tags.join(';') }}</small><br/>
        <small style="color:grey">Id: {{ result._id }} <a @click="load(result)" href="#">load</a> <a @click="remove(result._id)" href="#">delete</a></small><hr/>
      </template>
    </div>
  </main>
</template>